package erp_project.erp_project.service;

import erp_project.erp_project.entity.*;
import erp_project.erp_project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {
    
    private final SalesStatisticsRepository salesStatisticsRepository;
    private final OrderRepository orderRepository;
    private final SupplyRequestRepository supplyRequestRepository;
    private final MaterialStockRepository materialStockRepository;
    private final NotificationRepository notificationRepository;
    private final MenuSalesStatisticsRepository menuSalesStatisticsRepository;
    
    /**
     * 대시보드 KPI 데이터 조회
     */
    public Map<String, Object> getDashboardKpis(Long branchId) {
        Map<String, Object> kpis = new HashMap<>();
        
        // 오늘 매출
        kpis.put("todaySales", getTodaySales(branchId));
        
        // 오늘 주문 수
        kpis.put("todayOrders", getTodayOrders(branchId));
        
        // 발주 대기 수
        kpis.put("pendingSupplyRequests", getPendingSupplyRequests(branchId));
        
        // 재고 부족 수
        kpis.put("lowStockItems", getLowStockItems(branchId));
        
        // 읽지 않은 알림 수
        kpis.put("unreadNotifications", getUnreadNotifications(branchId));
        
        return kpis;
    }
    
    /**
     * 오늘 매출 조회
     */
    public Map<String, Object> getTodaySales(Long branchId) {
        try {
            LocalDate today = LocalDate.now();
            
            // 오늘 매출 통계 조회
            SalesStatistics todayStats = salesStatisticsRepository
                .findByBranchIdAndStatisticDateAndStatisticHourIsNull(branchId, today)
                .orElse(null);
            
            BigDecimal todaySales = BigDecimal.ZERO;
            if (todayStats != null) {
                todaySales = todayStats.getNetSales();
            }
            
            // 전일 대비 증감률 계산 (현재는 사용하지 않음)
            // LocalDate yesterday = today.minusDays(1);
            // SalesStatistics yesterdayStats = salesStatisticsRepository
            //     .findByBranchIdAndStatisticDateAndStatisticHourIsNull(branchId, yesterday)
            //     .orElse(null);
            
            Map<String, Object> result = new HashMap<>();
            result.put("value", todaySales);
            result.put("label", "오늘 매출");
            
            return result;
        } catch (Exception e) {
            log.error("오늘 매출 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return Map.of("value", BigDecimal.ZERO, "label", "오늘 매출");
        }
    }
    
    /**
     * 오늘 주문 수 조회
     */
    public Map<String, Object> getTodayOrders(Long branchId) {
        try {
            LocalDate today = LocalDate.now();
            LocalDateTime startOfDay = today.atStartOfDay();
            LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();
            
            // 오늘 완료된 주문 수 조회
            long todayOrderCount = orderRepository.countByBranchIdAndOrderStatusAndOrderTimeBetween(
                branchId, Orders.OrderStatus.completed, startOfDay, endOfDay);
            
            // 전일 주문 수 조회 (현재는 사용하지 않음)
            // LocalDate yesterday = today.minusDays(1);
            // LocalDateTime yesterdayStart = yesterday.atStartOfDay();
            // LocalDateTime yesterdayEnd = yesterday.plusDays(1).atStartOfDay();
            // 
            // long yesterdayOrderCount = orderRepository.countByBranchIdAndOrderStatusAndOrderTimeBetween(
            //     branchId, Orders.OrderStatus.completed, yesterdayStart, yesterdayEnd);
            
            Map<String, Object> result = new HashMap<>();
            result.put("value", todayOrderCount);
            result.put("label", "오늘 주문 수");
            
            return result;
        } catch (Exception e) {
            log.error("오늘 주문 수 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return Map.of("value", 0L, "label", "오늘 주문 수");
        }
    }
    
    /**
     * 발주 대기 수 조회
     */
    public Map<String, Object> getPendingSupplyRequests(Long branchId) {
        try {
            long pendingCount = supplyRequestRepository.countByRequestingBranchIdAndStatus(
                branchId, SupplyRequest.SupplyRequestStatus.PENDING);
            
            Map<String, Object> result = new HashMap<>();
            result.put("value", pendingCount);
            result.put("label", "발주 대기");
            
            return result;
        } catch (Exception e) {
            log.error("발주 대기 수 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return Map.of("value", 0L, "label", "발주 대기");
        }
    }
    
    /**
     * 재고 부족 수 조회
     */
    public Map<String, Object> getLowStockItems(Long branchId) {
        try {
            // 현재 재고가 최소 재고 이하인 항목 수 조회
            long lowStockCount = materialStockRepository.countByBranchIdAndCurrentStockLessThanEqualMinStock(branchId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("value", lowStockCount);
            result.put("label", "재고 부족");
            
            return result;
        } catch (Exception e) {
            log.error("재고 부족 수 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return Map.of("value", 0L, "label", "재고 부족");
        }
    }
    
    /**
     * 읽지 않은 알림 수 조회
     */
    public Map<String, Object> getUnreadNotifications(Long branchId) {
        try {
            log.info("읽지 않은 알림 수 조회 시작: branchId={}", branchId);
            
            // 해당 지점에 대한 읽지 않은 알림 수 조회
            // Notification에서 recipientType = "BRANCH"이고 recipientId = branchId인 읽지 않은 알림 수
            long unreadCount = notificationRepository.countByRecipientTypeAndRecipientIdAndIsReadFalse("BRANCH", branchId);
            
            log.info("읽지 않은 알림 수 조회 결과: branchId={}, count={}", branchId, unreadCount);
            
            Map<String, Object> result = new HashMap<>();
            result.put("value", unreadCount);
            result.put("label", "읽지 않은 알림");
            
            return result;
        } catch (Exception e) {
            log.error("읽지 않은 알림 수 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return Map.of("value", 0L, "label", "읽지 않은 알림");
        }
    }
    
    /**
     * 주간 매출 추이 조회 (오늘 제외, 최근 7일)
     */
    public Map<String, Object> getWeeklySalesTrend(Long branchId) {
        try {
            log.info("주간 매출 추이 조회 시작: branchId={}", branchId);
            
            LocalDate today = LocalDate.now();
            LocalDate weekAgo = today.minusDays(7);
            
            // 오늘을 제외한 최근 7일간의 매출 통계 조회
            List<SalesStatistics> weeklyStats = salesStatisticsRepository
                .findByBranchIdAndStatisticDateBetweenAndStatisticHourIsNullOrderByStatisticDate(
                    branchId, weekAgo, today.minusDays(1));
            
            // 날짜별 매출 데이터 구성
            List<Map<String, Object>> chartData = new ArrayList<>();
            List<String> labels = new ArrayList<>();
            List<BigDecimal> salesData = new ArrayList<>();
            
            // 7일간의 데이터를 순서대로 구성
            for (int i = 6; i >= 1; i--) { // 오늘을 제외한 7일
                LocalDate date = today.minusDays(i);
                String dateLabel = String.format("%d/%d", date.getMonthValue(), date.getDayOfMonth());
                
                // 해당 날짜의 매출 데이터 찾기
                BigDecimal dailySales = BigDecimal.ZERO;
                for (SalesStatistics stat : weeklyStats) {
                    if (stat.getStatisticDate().equals(date)) {
                        dailySales = stat.getNetSales();
                        break;
                    }
                }
                
                labels.add(dateLabel);
                salesData.add(dailySales);
                
                Map<String, Object> dayData = new HashMap<>();
                dayData.put("date", dateLabel);
                dayData.put("sales", dailySales);
                chartData.add(dayData);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("labels", labels);
            result.put("data", salesData);
            result.put("chartData", chartData);
            
            log.info("주간 매출 추이 조회 결과: branchId={}, dataCount={}", branchId, chartData.size());
            
            return result;
        } catch (Exception e) {
            log.error("주간 매출 추이 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return Map.of("labels", new ArrayList<>(), "data", new ArrayList<>(), "chartData", new ArrayList<>());
        }
    }
    
    /**
     * 인기 상품 5개 조회 (오늘 제외, 최근 7일)
     */
    public Map<String, Object> getTopProducts(Long branchId) {
        try {
            log.info("인기 상품 조회 시작: branchId={}", branchId);
            
            LocalDate today = LocalDate.now();
            LocalDate weekAgo = today.minusDays(7);
            LocalDate yesterday = today.minusDays(1);
            
            // 최근 7일간의 상품별 매출 통계 조회 (상위 5개)
            List<Object[]> topProductsData = menuSalesStatisticsRepository
                .findTopSellingMenusBySalesWithName(branchId, weekAgo, yesterday);
            
            List<Map<String, Object>> products = new ArrayList<>();
            
            // 상위 5개만 처리
            int limit = Math.min(5, topProductsData.size());
            for (int i = 0; i < limit; i++) {
                Object[] row = topProductsData.get(i);
                Long menuId = (Long) row[0];
                String menuName = (String) row[1];
                Long totalQuantity = ((Number) row[2]).longValue();
                BigDecimal totalSales = (BigDecimal) row[3];
                
                Map<String, Object> product = new HashMap<>();
                product.put("rank", i + 1);
                product.put("menuId", menuId);
                product.put("menuName", menuName);
                product.put("totalSales", totalSales);
                product.put("totalQuantity", totalQuantity);
                products.add(product);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("products", products);
            result.put("period", "최근 7일 (오늘 제외)");
            
            log.info("인기 상품 조회 결과: branchId={}, productCount={}", branchId, products.size());
            
            return result;
        } catch (Exception e) {
            log.error("인기 상품 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return Map.of("products", new ArrayList<>(), "period", "최근 7일 (오늘 제외)");
        }
    }
}
