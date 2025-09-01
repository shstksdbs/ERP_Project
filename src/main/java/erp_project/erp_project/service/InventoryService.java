package erp_project.erp_project.service;

import erp_project.erp_project.entity.*;
import erp_project.erp_project.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
@Transactional
public class InventoryService {

    @Autowired
    private MaterialStockRepository materialStockRepository;
    
    @Autowired
    private RecipeRepository recipeRepository;
    
    @Autowired
    private RecipeIngredientRepository recipeIngredientRepository;
    
    @Autowired
    private OrderItemsRepository orderItemsRepository;
    
    @Autowired
    private OrdersRepository ordersRepository;

    /**
     * 주문 완료 시 재고 차감 및 주문 상태 변경
     */
    public void deductInventoryFromOrder(Long orderId) {
        // 주문 정보 조회
        Optional<Orders> orderOpt = ordersRepository.findById(orderId);
        if (!orderOpt.isPresent()) {
            throw new RuntimeException("주문을 찾을 수 없습니다: " + orderId);
        }
        
        Orders order = orderOpt.get();
        Long branchId = order.getBranchId();
        
        // 주문 아이템 조회
        List<OrderItems> orderItems = orderItemsRepository.findByOrderId(orderId);
        
        for (OrderItems orderItem : orderItems) {
            // 메뉴의 레시피 조회
            Optional<Recipe> recipeOpt = recipeRepository.findByMenuId(orderItem.getMenuId());
            
            if (recipeOpt.isPresent()) {
                Recipe recipe = recipeOpt.get();
                
                // 레시피의 재료들 조회
                List<RecipeIngredient> ingredients = recipeIngredientRepository.findByRecipeId(recipe.getId());
                
                // 각 재료별로 재고 차감
                for (RecipeIngredient ingredient : ingredients) {
                    // 주문 수량만큼 재료 사용량 계산
                    BigDecimal requiredQuantity = ingredient.getQuantity()
                        .multiply(BigDecimal.valueOf(orderItem.getQuantity()));
                    
                    // 재고 차감
                    deductMaterialStock(ingredient.getMaterial().getId(), 
                                     branchId, 
                                     requiredQuantity);
                }
            }
        }
        
        // 재고 차감 완료 후 주문 상태를 completed로 변경
        // 이렇게 하면 트리거가 실행되어 매출 데이터가 자동 생성됨
        order.setOrderStatus(Orders.OrderStatus.completed);
        order.setCompletedTime(LocalDateTime.now());
        ordersRepository.save(order);
    }

    /**
     * 특정 재료의 재고 차감
     */
    private void deductMaterialStock(Long materialId, Long branchId, BigDecimal quantity) {
        // 해당 지점의 재고 조회
        MaterialStock stock = materialStockRepository
            .findByBranchIdAndMaterialId(branchId, materialId);
        
        if (stock != null) {
            // 재고 부족 체크
            if (stock.getAvailableStock().compareTo(quantity) < 0) {
                throw new RuntimeException(
                    String.format("재고 부족: %s (필요: %s, 가용: %s)", 
                                stock.getMaterial().getName(), 
                                quantity, 
                                stock.getAvailableStock())
                );
            }
            
            // 현재 재고에서 차감
            stock.setCurrentStock(stock.getCurrentStock().subtract(quantity));
            
            // 재고 업데이트
            materialStockRepository.save(stock);
        } else {
            throw new RuntimeException(
                String.format("재고 정보를 찾을 수 없습니다: Material ID: %d, Branch ID: %d", 
                            materialId, branchId)
            );
        }
    }

    /**
     * 주문 전 재고 가용성 체크
     */
    public boolean checkInventoryAvailability(Long orderId) {
        // 주문 정보 조회
        Optional<Orders> orderOpt = ordersRepository.findById(orderId);
        if (!orderOpt.isPresent()) {
            return false;
        }
        
        Orders order = orderOpt.get();
        Long branchId = order.getBranchId();
        
        List<OrderItems> orderItems = orderItemsRepository.findByOrderId(orderId);
        
        for (OrderItems orderItem : orderItems) {
            Optional<Recipe> recipeOpt = recipeRepository.findByMenuId(orderItem.getMenuId());
            
            if (recipeOpt.isPresent()) {
                Recipe recipe = recipeOpt.get();
                List<RecipeIngredient> ingredients = recipeIngredientRepository.findByRecipeId(recipe.getId());
                
                for (RecipeIngredient ingredient : ingredients) {
                    BigDecimal requiredQuantity = ingredient.getQuantity()
                        .multiply(BigDecimal.valueOf(orderItem.getQuantity()));
                    
                    if (!isMaterialStockSufficient(ingredient.getMaterial().getId(), 
                                                 branchId, 
                                                 requiredQuantity)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * 특정 재료의 재고 충분성 체크
     */
    private boolean isMaterialStockSufficient(Long materialId, Long branchId, BigDecimal quantity) {
        MaterialStock stock = materialStockRepository
            .findByBranchIdAndMaterialId(branchId, materialId);
        
        if (stock != null) {
            return stock.getAvailableStock().compareTo(quantity) >= 0;
        }
        return false;
    }

    /**
     * 재고 부족 시 알림 (최소 재고 기준)
     */
    public List<MaterialStock> getLowStockMaterials(Long branchId) {
        return materialStockRepository.findByBranchIdAndCurrentStockLessThanMinStock(branchId);
    }

    /**
     * 특정 지점의 전체 재고 현황
     */
    public List<MaterialStock> getBranchInventoryStatus(Long branchId) {
        return materialStockRepository.findByBranchId(branchId);
    }

    /**
     * 재고 차감 문제 진단을 위한 테스트 메서드
     */
    public Map<String, Object> testInventoryDeduction(Long orderId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 주문 정보 조회
            Optional<Orders> orderOpt = ordersRepository.findById(orderId);
            if (!orderOpt.isPresent()) {
                result.put("error", "주문을 찾을 수 없습니다: " + orderId);
                return result;
            }
            
            Orders order = orderOpt.get();
            Long branchId = order.getBranchId();
            result.put("orderId", orderId);
            result.put("branchId", branchId);
            result.put("orderStatus", order.getOrderStatus());
            
            // 2. 주문 아이템 조회
            List<OrderItems> orderItems = orderItemsRepository.findByOrderId(orderId);
            result.put("orderItemsCount", orderItems.size());
            
            List<Map<String, Object>> itemDetails = new ArrayList<>();
            for (OrderItems orderItem : orderItems) {
                Map<String, Object> item = new HashMap<>();
                item.put("menuId", orderItem.getMenuId());
                item.put("quantity", orderItem.getQuantity());
                
                // 3. 메뉴의 레시피 조회
                Optional<Recipe> recipeOpt = recipeRepository.findByMenuId(orderItem.getMenuId());
                if (recipeOpt.isPresent()) {
                    Recipe recipe = recipeOpt.get();
                    item.put("recipeId", recipe.getId());
                    item.put("recipeName", recipe.getName());
                    
                    // 4. 레시피의 재료들 조회
                    List<RecipeIngredient> ingredients = recipeIngredientRepository.findByRecipeId(recipe.getId());
                    item.put("ingredientsCount", ingredients.size());
                    
                    List<Map<String, Object>> ingredientDetails = new ArrayList<>();
                    for (RecipeIngredient ingredient : ingredients) {
                        Map<String, Object> ing = new HashMap<>();
                        ing.put("materialId", ingredient.getMaterial().getId());
                        ing.put("materialName", ingredient.getMaterial().getName());
                        ing.put("quantity", ingredient.getQuantity());
                        ing.put("unit", ingredient.getUnit());
                        
                        // 5. 재고 확인
                        MaterialStock stock = materialStockRepository.findByBranchIdAndMaterialId(branchId, ingredient.getMaterial().getId());
                        if (stock != null) {
                            ing.put("currentStock", stock.getCurrentStock());
                            ing.put("minStock", stock.getMinStock());
                            ing.put("maxStock", stock.getMaxStock());
                            ing.put("availableStock", stock.getAvailableStock());
                        } else {
                            ing.put("stockError", "재고 정보를 찾을 수 없습니다");
                        }
                        
                        ingredientDetails.add(ing);
                    }
                    item.put("ingredients", ingredientDetails);
                } else {
                    item.put("recipeError", "레시피를 찾을 수 없습니다");
                }
                
                itemDetails.add(item);
            }
            result.put("itemDetails", itemDetails);
            
            // 6. 전체 재고 현황
            List<MaterialStock> allStock = materialStockRepository.findByBranchId(branchId);
            result.put("totalStockItems", allStock.size());
            
        } catch (Exception e) {
            result.put("error", "테스트 중 오류 발생: " + e.getMessage());
            result.put("stackTrace", e.getStackTrace());
        }
        
        return result;
    }
}
