package erp_project.erp_project.service;

import erp_project.erp_project.dto.OrderItemDetailDto;
import erp_project.erp_project.entity.OrderItemDetails;
import erp_project.erp_project.repository.OrderItemDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderAnalyticsService {
    
    @Autowired
    private OrderItemDetailsRepository orderItemDetailsRepository;
    
    // 세트 메뉴 구성 요소별 매출 분석
    public Map<String, Object> getSetMenuSalesAnalysis(Long orderId) {
        List<OrderItemDetails> setComponents = orderItemDetailsRepository.findSetComponentsByOrderId(orderId);
        
        Map<String, Object> analysis = new HashMap<>();
        Map<String, BigDecimal> categorySales = new HashMap<>();
        Map<String, Integer> categoryCount = new HashMap<>();
        
        for (OrderItemDetails component : setComponents) {
            String category = component.getItemType().name();
            BigDecimal price = component.getTotalPrice();
            Integer count = component.getQuantity();
            
            categorySales.merge(category, price, BigDecimal::add);
            categoryCount.merge(category, count, Integer::sum);
        }
        
        analysis.put("categorySales", categorySales);
        analysis.put("categoryCount", categoryCount);
        analysis.put("totalComponents", setComponents.size());
        
        return analysis;
    }
    
    // 변경된 메뉴 통계
    public Map<String, Object> getSubstitutionStatistics() {
        List<OrderItemDetails> substitutedItems = orderItemDetailsRepository.findByIsSubstitutedTrue();
        
        Map<String, Object> statistics = new HashMap<>();
        Map<String, Integer> substitutionReasons = new HashMap<>();
        Map<String, BigDecimal> priceDifferences = new HashMap<>();
        
        for (OrderItemDetails item : substitutedItems) {
            String reason = item.getSubstitutionReason();
            substitutionReasons.merge(reason, 1, Integer::sum);
            
            // 가격 차이 계산 (원본 메뉴와 변경된 메뉴의 가격 차이)
            if (item.getOriginalMenuId() != null) {
                // 실제 구현에서는 원본 메뉴 가격을 조회해야 함
                BigDecimal priceDiff = item.getTotalPrice(); // 임시로 현재 가격 사용
                priceDifferences.merge(reason, priceDiff, BigDecimal::add);
            }
        }
        
        statistics.put("totalSubstitutions", substitutedItems.size());
        statistics.put("substitutionReasons", substitutionReasons);
        statistics.put("priceDifferences", priceDifferences);
        
        return statistics;
    }
    
    // 재료 사용 통계
    public Map<String, Object> getIngredientUsageAnalysis() {
        List<Object[]> statistics = orderItemDetailsRepository.getIngredientUsageStatistics();
        
        Map<String, Object> analysis = new HashMap<>();
        Map<String, Integer> ingredientAdditions = new HashMap<>();
        Map<String, Integer> ingredientRemovals = new HashMap<>();
        
        for (Object[] stat : statistics) {
            String ingredientType = (String) stat[0];
            String action = (String) stat[1];
            Long count = (Long) stat[2];
            
            if ("ADD".equals(action)) {
                ingredientAdditions.put(ingredientType, count.intValue());
            } else if ("REMOVE".equals(action)) {
                ingredientRemovals.put(ingredientType, count.intValue());
            }
        }
        
        analysis.put("ingredientAdditions", ingredientAdditions);
        analysis.put("ingredientRemovals", ingredientRemovals);
        analysis.put("totalIngredients", ingredientAdditions.size() + ingredientRemovals.size());
        
        return analysis;
    }
    
    // 메뉴별 인기도 분석
    public Map<String, Object> getMenuPopularityAnalysis() {
        List<OrderItemDetails> allItems = orderItemDetailsRepository.findAll();
        
        Map<String, Object> analysis = new HashMap<>();
        Map<String, Integer> menuCount = new HashMap<>();
        Map<String, BigDecimal> menuRevenue = new HashMap<>();
        
        for (OrderItemDetails item : allItems) {
            if (item.getMenuName() != null) {
                String menuName = item.getMenuName();
                Integer count = item.getQuantity();
                BigDecimal revenue = item.getTotalPrice();
                
                menuCount.merge(menuName, count, Integer::sum);
                menuRevenue.merge(menuName, revenue, BigDecimal::add);
            }
        }
        
        // 인기도 순으로 정렬
        List<Map.Entry<String, Integer>> sortedByCount = menuCount.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .collect(Collectors.toList());
        
        List<Map.Entry<String, BigDecimal>> sortedByRevenue = menuRevenue.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .collect(Collectors.toList());
        
        analysis.put("menuCount", menuCount);
        analysis.put("menuRevenue", menuRevenue);
        analysis.put("topMenusByCount", sortedByCount.stream().limit(10).collect(Collectors.toList()));
        analysis.put("topMenusByRevenue", sortedByRevenue.stream().limit(10).collect(Collectors.toList()));
        
        return analysis;
    }
    
    // 재고 소모량 예측 (간단한 버전)
    public Map<String, Object> getInventoryConsumptionForecast() {
        List<OrderItemDetails> allItems = orderItemDetailsRepository.findAll();
        
        Map<String, Object> forecast = new HashMap<>();
        Map<String, Integer> ingredientConsumption = new HashMap<>();
        Map<String, Integer> menuConsumption = new HashMap<>();
        
        for (OrderItemDetails item : allItems) {
            if (item.getItemType() == OrderItemDetails.ItemType.INGREDIENT) {
                String ingredient = item.getIngredientType();
                Integer quantity = item.getQuantity();
                
                if ("ADD".equals(item.getIngredientAction().name())) {
                    ingredientConsumption.merge(ingredient, quantity, Integer::sum);
                }
            } else if (item.getMenuId() != null) {
                String menuName = item.getMenuName();
                Integer quantity = item.getQuantity();
                menuConsumption.merge(menuName, quantity, Integer::sum);
            }
        }
        
        forecast.put("ingredientConsumption", ingredientConsumption);
        forecast.put("menuConsumption", menuConsumption);
        forecast.put("totalIngredientsUsed", ingredientConsumption.values().stream().mapToInt(Integer::intValue).sum());
        forecast.put("totalMenusOrdered", menuConsumption.values().stream().mapToInt(Integer::intValue).sum());
        
        return forecast;
    }
    
    // 시간대별 주문 패턴 분석
    public Map<String, Object> getTimeBasedOrderPatterns() {
        // 실제 구현에서는 주문 시간 정보를 포함해야 함
        // 현재는 기본 구조만 제공
        
        Map<String, Object> patterns = new HashMap<>();
        patterns.put("peakHours", Arrays.asList("12:00-13:00", "18:00-19:00"));
        patterns.put("offPeakHours", Arrays.asList("15:00-17:00", "21:00-22:00"));
        patterns.put("weekendPeak", Arrays.asList("12:00-14:00", "18:00-20:00"));
        
        return patterns;
    }
}
