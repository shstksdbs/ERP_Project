package erp_project.erp_project.service;

import erp_project.erp_project.entity.*;
import erp_project.erp_project.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SalesStatisticsService {
    
    @Autowired
    private SalesStatisticsRepository salesStatisticsRepository;
    
    @Autowired
    private MenuSalesStatisticsRepository menuSalesStatisticsRepository;
    
    @Autowired
    private CategorySalesStatisticsRepository categorySalesStatisticsRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    /**
     * 주문 완료 시 매출 통계 업데이트
     */
    public void updateSalesStatistics(Long orderId) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다: " + orderId));
        
            // 주문 완료 + 결제 완료일 때만 매출 통계 업데이트
    if (order.getOrderStatus() == Orders.OrderStatus.completed && 
        order.getPaymentStatus() == Orders.PaymentStatus.completed) {
        updateDailySalesStatistics(order);
        updateHourlySalesStatistics(order);
        updateMenuSalesStatistics(order);
        updateCategorySalesStatistics(order);
    }
    }
    
    /**
     * 일별 매출 통계 업데이트
     */
    private void updateDailySalesStatistics(Orders order) {
        LocalDate orderDate = order.getCreatedAt().toLocalDate();
        
        SalesStatistics dailyStats = salesStatisticsRepository
                .findByBranchIdAndStatisticDateAndStatisticHourIsNull(order.getBranchId(), orderDate)
                .orElse(new SalesStatistics());
        
        if (dailyStats.getStatisticId() == null) {
            dailyStats.setBranchId(order.getBranchId());
            dailyStats.setStatisticDate(orderDate);
            dailyStats.setStatisticHour(null);
        }
        
        dailyStats.incrementOrders();
        dailyStats.addSales(order.getTotalAmount());
        dailyStats.addDiscount(order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO);
        dailyStats.updateNetSales();
        
        // 평균주문금액 자동 계산
        if (dailyStats.getTotalOrders() > 0) {
            BigDecimal averageOrderValue = dailyStats.getTotalSales()
                    .divide(BigDecimal.valueOf(dailyStats.getTotalOrders()), 2, BigDecimal.ROUND_HALF_UP);
            dailyStats.setAverageOrderValue(averageOrderValue);
        }
        
        // 결제 방법별 매출 업데이트
        updatePaymentMethodSales(dailyStats, order);
        
        salesStatisticsRepository.save(dailyStats);
    }
    
    /**
     * 시간별 매출 통계 업데이트
     */
    private void updateHourlySalesStatistics(Orders order) {
        LocalDate orderDate = order.getCreatedAt().toLocalDate();
        int orderHour = order.getCreatedAt().getHour();
        
        List<SalesStatistics> hourlyStatsList = salesStatisticsRepository
                .findByBranchIdAndStatisticDateAndStatisticHourIsNotNullOrderByStatisticHour(order.getBranchId(), orderDate);
        
        SalesStatistics hourlyStats = hourlyStatsList.stream()
                .filter(stats -> stats.getStatisticHour() != null && stats.getStatisticHour().equals(orderHour))
                .findFirst()
                .orElse(new SalesStatistics());
        
        if (hourlyStats.getStatisticId() == null) {
            hourlyStats.setBranchId(order.getBranchId());
            hourlyStats.setStatisticDate(orderDate);
            hourlyStats.setStatisticHour(orderHour);
        }
        
        hourlyStats.incrementOrders();
        hourlyStats.addSales(order.getTotalAmount());
        hourlyStats.addDiscount(order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO);
        hourlyStats.updateNetSales();
        
        salesStatisticsRepository.save(hourlyStats);
    }
    
    /**
     * 메뉴별 매출 통계 업데이트
     */
    private void updateMenuSalesStatistics(Orders order) {
        LocalDate orderDate = order.getCreatedAt().toLocalDate();
        List<OrderItems> orderItems = orderItemRepository.findByOrderId(order.getOrderId());
        
        for (OrderItems item : orderItems) {
            MenuSalesStatistics menuStats = menuSalesStatisticsRepository
                    .findByBranchIdAndMenuIdAndStatisticDate(order.getBranchId(), item.getMenuId(), orderDate)
                    .orElse(new MenuSalesStatistics());
            
            if (menuStats.getMenuStatisticId() == null) {
                menuStats.setBranchId(order.getBranchId());
                menuStats.setMenuId(item.getMenuId());
                menuStats.setStatisticDate(orderDate);
            }
            
            // 할인 금액 비례 배분
            BigDecimal itemDiscount = BigDecimal.ZERO;
            if (order.getDiscountAmount() != null && order.getTotalAmount().compareTo(BigDecimal.ZERO) > 0) {
                itemDiscount = order.getDiscountAmount()
                        .multiply(item.getTotalPrice())
                        .divide(order.getTotalAmount(), 2, BigDecimal.ROUND_HALF_UP);
            }
            
            menuStats.addQuantity(item.getQuantity());
            menuStats.addSales(item.getTotalPrice());
            menuStats.addDiscount(itemDiscount);
            menuStats.updateNetSales();
            
            menuSalesStatisticsRepository.save(menuStats);
        }
    }
    
    /**
     * 카테고리별 매출 통계 업데이트
     */
    private void updateCategorySalesStatistics(Orders order) {
        LocalDate orderDate = order.getCreatedAt().toLocalDate();
        List<OrderItems> orderItems = orderItemRepository.findByOrderId(order.getOrderId());
        
        for (OrderItems item : orderItems) {
            // 메뉴의 카테고리 ID 조회 (Menu 엔티티에서 가져와야 함)
            // 여기서는 간단히 처리하거나 MenuService를 주입받아 사용
            // Long categoryId = getMenuCategoryId(item.getMenuId());
            
            // 임시로 건너뛰고, 실제 구현 시에는 카테고리 정보를 포함하여 처리
        }
    }
    
    /**
     * 결제 방법별 매출 업데이트
     */
    private void updatePaymentMethodSales(SalesStatistics dailyStats, Orders order) {
        Optional<Payment> payment = paymentRepository.findByOrderId(order.getOrderId());
        
        if (payment.isPresent()) {
            Payment.PaymentMethod method = payment.get().getPaymentMethod();
            BigDecimal netAmount = order.getFinalAmount();
            
            switch (method) {
                case cash:
                    dailyStats.setCashSales(dailyStats.getCashSales().add(netAmount));
                    break;
                case card:
                    dailyStats.setCardSales(dailyStats.getCardSales().add(netAmount));
                    break;
                case mobile:
                    dailyStats.setMobileSales(dailyStats.getMobileSales().add(netAmount));
                    break;
            }
        }
    }
    
    /**
     * 지점별 일별 매출 조회
     */
    public List<SalesStatistics> getDailySalesByBranch(Long branchId, LocalDate startDate, LocalDate endDate) {
        return salesStatisticsRepository.findDailySummaryByBranchAndDateRange(branchId, startDate, endDate);
    }
    
    /**
     * 시간대별 매출 분석 (전체 지점)
     */
    public List<SalesStatistics> getHourlySalesAnalysis(LocalDate startDate, LocalDate endDate) {
        return salesStatisticsRepository.findHourlyAnalysisByDateRange(startDate, endDate);
    }
    
    /**
     * 지점별 시간대별 매출 분석
     */
    public List<SalesStatistics> getHourlySalesByBranch(Long branchId, LocalDate startDate, LocalDate endDate) {
        return salesStatisticsRepository.findHourlyAnalysisByBranchAndDateRange(branchId, startDate, endDate);
    }
    
    /**
     * 메뉴별 인기 순위 (매출 기준)
     */
    public List<MenuSalesStatistics> getTopSellingMenusBySales(Long branchId, LocalDate startDate, LocalDate endDate) {
        return menuSalesStatisticsRepository.findTopSellingMenusBySales(branchId, startDate, endDate);
    }
    
    /**
     * 메뉴별 인기 순위 (수량 기준)
     */
    public List<MenuSalesStatistics> getTopSellingMenusByQuantity(Long branchId, LocalDate startDate, LocalDate endDate) {
        return menuSalesStatisticsRepository.findTopSellingMenusByQuantity(branchId, startDate, endDate);
    }
    
    /**
     * 메뉴별 인기 순위 (매출 기준) - 메뉴 이름 포함
     */
    public List<Object[]> getTopSellingMenusBySalesWithName(Long branchId, LocalDate startDate, LocalDate endDate) {
        return menuSalesStatisticsRepository.findTopSellingMenusBySalesWithName(branchId, startDate, endDate);
    }
    
    /**
     * 메뉴별 인기 순위 (수량 기준) - 메뉴 이름 포함
     */
    public List<Object[]> getTopSellingMenusByQuantityWithName(Long branchId, LocalDate startDate, LocalDate endDate) {
        return menuSalesStatisticsRepository.findTopSellingMenusByQuantityWithName(branchId, startDate, endDate);
    }
    
    // 상품별 매출 통계 조회
    public List<Object[]> getProductSalesStatistics(Long branchId, LocalDate startDate, LocalDate endDate) {
        return menuSalesStatisticsRepository.findProductSalesStatistics(branchId, startDate, endDate);
    }
    
    // 카테고리별 매출 통계 조회
    public List<Object[]> getCategorySalesStatistics(Long branchId, LocalDate startDate, LocalDate endDate) {
        return menuSalesStatisticsRepository.findCategorySalesStatistics(branchId, startDate, endDate);
    }
    
    /**
     * 카테고리별 인기 순위 (매출 기준)
     */
    public List<CategorySalesStatistics> getTopSellingCategoriesBySales(Long branchId, LocalDate startDate, LocalDate endDate) {
        return categorySalesStatisticsRepository.findTopSellingCategoriesBySales(branchId, startDate, endDate);
    }
    
    /**
     * 지점별 월별 매출 집계
     */
    public List<SalesStatistics> getMonthlySalesByBranch(Long branchId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        
        List<SalesStatistics> dailyStats = salesStatisticsRepository
                .findDailySummaryByBranchAndDateRange(branchId, startDate, endDate);
        
        // 월별 집계 데이터 생성
        SalesStatistics monthlyStats = new SalesStatistics();
        monthlyStats.setBranchId(branchId);
        monthlyStats.setStatisticDate(startDate);
        monthlyStats.setStatisticHour(null); // 월별 통계는 시간 정보 없음
        
        // 일별 데이터를 월별로 집계
        for (SalesStatistics daily : dailyStats) {
            monthlyStats.setTotalOrders(monthlyStats.getTotalOrders() + daily.getTotalOrders());
            monthlyStats.setTotalSales(monthlyStats.getTotalSales().add(daily.getTotalSales()));
            monthlyStats.setTotalDiscount(monthlyStats.getTotalDiscount().add(daily.getTotalDiscount()));
            monthlyStats.setCashSales(monthlyStats.getCashSales().add(daily.getCashSales()));
            monthlyStats.setCardSales(monthlyStats.getCardSales().add(daily.getCardSales()));
            monthlyStats.setMobileSales(monthlyStats.getMobileSales().add(daily.getMobileSales()));
        }
        
        // netSales는 totalSales - totalDiscount로 계산
        monthlyStats.setNetSales(monthlyStats.getTotalSales().subtract(monthlyStats.getTotalDiscount()));
        
        return List.of(monthlyStats);
    }
    
    /**
     * 디버깅: 특정 지점의 특정 날짜 통계 데이터 조회
     */
    public SalesStatistics getDailyStatisticsForDebug(Long branchId, LocalDate date) {
        return salesStatisticsRepository
                .findByBranchIdAndStatisticDateAndStatisticHourIsNull(branchId, date)
                .orElse(null);
    }
    
    /**
     * 디버깅: 특정 지점의 특정 날짜 시간별 통계 데이터 조회
     */
    public List<SalesStatistics> getHourlyStatisticsForDebug(Long branchId, LocalDate date) {
        return salesStatisticsRepository
                .findByBranchIdAndStatisticDateAndStatisticHourIsNotNullOrderByStatisticHour(branchId, date);
    }
}
