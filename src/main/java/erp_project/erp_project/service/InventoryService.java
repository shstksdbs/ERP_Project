package erp_project.erp_project.service;

import erp_project.erp_project.entity.*;
import erp_project.erp_project.repository.*;
import erp_project.erp_project.dto.NotificationDTO;

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
    private WebSocketNotificationService webSocketNotificationService;
    
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
            
            // 재고 변경 전 상태 저장
            BigDecimal previousStock = stock.getCurrentStock();
            String previousStatus = determineStockStatus(stock);
            
            // 현재 재고에서 차감
            stock.setCurrentStock(stock.getCurrentStock().subtract(quantity));
            stock.setLastUpdated(LocalDateTime.now());
            
            // 재고 업데이트
            MaterialStock updatedStock = materialStockRepository.save(stock);
            
            // 재고 차감 시 부족 상태가 된 경우에만 웹소켓 알림 전송
            String newStatus = determineStockStatus(updatedStock);
            System.out.println("재고 차감 완료 - 상태 확인 중");
            System.out.println("재고 차감 정보 - 이전: " + previousStock + ", 현재: " + updatedStock.getCurrentStock() + ", 차감량: " + quantity);
            System.out.println("재고 상태 - 이전: " + previousStatus + ", 현재: " + newStatus);
            
            // 부족 상태가 된 경우에만 알림 전송
            if ("low".equals(newStatus)) {
                System.out.println("재고가 부족 상태가 되어 알림 전송");
                sendStockStatusChangeNotification(updatedStock, previousStock, previousStatus, newStatus, quantity);
            } else {
                System.out.println("재고 상태가 정상이므로 알림 전송하지 않음");
            }
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
    
    // 재고 상태 판단 (부족, 정상, 과다)
    private String determineStockStatus(MaterialStock stock) {
        BigDecimal currentStock = stock.getCurrentStock();
        BigDecimal minStock = stock.getMinStock();
        BigDecimal maxStock = stock.getMaxStock();
        
        if (currentStock.compareTo(minStock) <= 0) {
            return "low"; // 부족
        } else if (currentStock.compareTo(maxStock.multiply(BigDecimal.valueOf(0.8))) >= 0) {
            return "excess"; // 과다
        } else {
            return "normal"; // 정상
        }
    }
    
    // 재고 상태 변경 시 웹소켓 알림 전송
    private void sendStockStatusChangeNotification(MaterialStock stock, BigDecimal previousStock, 
                                                  String previousStatus, String newStatus, BigDecimal deductedQuantity) {
        try {
            System.out.println("알림 생성 시작 - 지점 ID: " + stock.getBranch().getId());
            
            NotificationDTO notification = NotificationDTO.builder()
                    .id(System.currentTimeMillis()) // 임시 ID
                    .type(NotificationDTO.TYPE_INVENTORY)
                    .category(determineNotificationCategory(newStatus))
                    .title("재고 부족 알림")
                    .message(generateStockDeductionMessage(stock, previousStock, deductedQuantity, newStatus))
                    .targetType(NotificationDTO.TARGET_TYPE_MATERIAL)
                    .targetId(stock.getId())
                    .targetName(stock.getMaterial().getName())
                    .targetDetail(String.format("{\"currentStock\":%s,\"previousStock\":%s,\"deductedQuantity\":%s,\"minStock\":%s,\"maxStock\":%s,\"unit\":\"%s\",\"previousStatus\":\"%s\",\"newStatus\":\"%s\"}", 
                            stock.getCurrentStock(), previousStock, deductedQuantity, stock.getMinStock(), stock.getMaxStock(), 
                            stock.getMaterial().getUnit(), previousStatus, newStatus))
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .branchId(stock.getBranch().getId())
                    .userId(null)
                    .userName("시스템")
                    .build();
            
            System.out.println("알림 생성 완료 - 제목: " + notification.getTitle() + ", 메시지: " + notification.getMessage());
            
            // 해당 지점에 웹소켓 알림 전송
            webSocketNotificationService.sendNotificationToBranch(stock.getBranch().getId(), notification);
            System.out.println("웹소켓 알림 전송 완료 - 지점 ID: " + stock.getBranch().getId());
            
        } catch (Exception e) {
            // 알림 전송 실패는 로그만 남기고 재고 업데이트는 계속 진행
            System.err.println("재고 차감 알림 전송 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // 재고 상태에 따른 알림 카테고리 결정
    private String determineNotificationCategory(String status) {
        switch (status) {
            case "low":
                return NotificationDTO.CATEGORY_CRITICAL;
            case "excess":
                return NotificationDTO.CATEGORY_WARNING;
            default:
                return NotificationDTO.CATEGORY_INFO;
        }
    }
    
    // 재고 차감 메시지 생성
    private String generateStockDeductionMessage(MaterialStock stock, BigDecimal previousStock, 
                                               BigDecimal deductedQuantity, String newStatus) {
        return String.format("%s 재고가 부족합니다! (현재: %s, 최소 필요: %s, 차감량: %s)", 
                stock.getMaterial().getName(), stock.getCurrentStock(), stock.getMinStock(), deductedQuantity);
    }
    
    // 상태 텍스트 변환
    private String getStatusText(String status) {
        switch (status) {
            case "low":
                return "부족";
            case "excess":
                return "과다";
            case "normal":
                return "정상";
            default:
                return status;
        }
    }
}
