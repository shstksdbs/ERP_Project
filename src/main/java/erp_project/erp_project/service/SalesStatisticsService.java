package erp_project.erp_project.service;

import erp_project.erp_project.entity.*;
import erp_project.erp_project.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.math.BigDecimal;
import java.time.LocalDate;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;
import erp_project.erp_project.dto.ProductSalesStatisticsDto;
import erp_project.erp_project.dto.CategorySalesStatisticsDto;

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
     * 주문 완료 시 매출 통계 업데이트 - 캐시 무효화
     */
    @CacheEvict(value = "salesStatistics", allEntries = true)
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
                    .divide(BigDecimal.valueOf(dailyStats.getTotalOrders()), 2, java.math.RoundingMode.HALF_UP);
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
                        .divide(order.getTotalAmount(), 2, java.math.RoundingMode.HALF_UP);
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
        // TODO: 카테고리별 매출 통계 업데이트 구현
        // 현재는 메뉴별 통계만 업데이트하고 있음
        // 카테고리별 통계는 별도로 구현 필요
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
     * 지점별 일별 매출 조회 - Redis 캐싱 적용
     */
    @Cacheable(value = "salesStatistics", key = "'daily:' + #branchId + ':' + #startDate + ':' + #endDate")
    public List<SalesStatistics> getDailySalesByBranch(Long branchId, LocalDate startDate, LocalDate endDate) {
        try {
            System.out.println("=== 일별 매출 조회 시작 ===");
            System.out.println("branchId: " + branchId);
            System.out.println("startDate: " + startDate);
            System.out.println("endDate: " + endDate);
            
            // 기존 메서드 사용하여 테스트
            List<SalesStatistics> result = salesStatisticsRepository.findByBranchIdAndStatisticDateBetweenAndStatisticHourIsNullOrderByStatisticDate(branchId, startDate, endDate);
            
            System.out.println("조회된 데이터 개수: " + (result != null ? result.size() : 0));
            if (result != null && !result.isEmpty()) {
                System.out.println("첫 번째 데이터: " + result.get(0));
            }
            
            System.out.println("=== 일별 매출 조회 완료 ===");
            return result;
        } catch (Exception e) {
            System.err.println("일별 매출 조회 오류: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * 시간대별 매출 분석 (전체 지점) - Redis 캐싱 적용
     */
    @Cacheable(value = "salesStatistics", key = "'hourly:all:' + #startDate + ':' + #endDate")
    public List<SalesStatistics> getHourlySalesAnalysis(LocalDate startDate, LocalDate endDate) {
        return salesStatisticsRepository.findHourlyAnalysisByDateRange(startDate, endDate);
    }
    
    /**
     * 지점별 시간대별 매출 분석 - Redis 캐싱 적용
     */
    @Cacheable(value = "salesStatistics", key = "'hourly:' + #branchId + ':' + #startDate + ':' + #endDate")
    public List<SalesStatistics> getHourlySalesByBranch(Long branchId, LocalDate startDate, LocalDate endDate) {
        return salesStatisticsRepository.findHourlyAnalysisByBranchAndDateRange(branchId, startDate, endDate);
    }
    
    /**
     * 메뉴별 인기 순위 (매출 기준) - Redis 캐싱 적용
     */
    @Cacheable(value = "salesStatistics", key = "'topMenus:sales:' + #branchId + ':' + #startDate + ':' + #endDate")
    public List<MenuSalesStatistics> getTopSellingMenusBySales(Long branchId, LocalDate startDate, LocalDate endDate) {
        return menuSalesStatisticsRepository.findTopSellingMenusBySales(branchId, startDate, endDate);
    }
    
    /**
     * 메뉴별 인기 순위 (수량 기준) - Redis 캐싱 적용
     */
    @Cacheable(value = "salesStatistics", key = "'topMenus:quantity:' + #branchId + ':' + #startDate + ':' + #endDate")
    public List<MenuSalesStatistics> getTopSellingMenusByQuantity(Long branchId, LocalDate startDate, LocalDate endDate) {
        return menuSalesStatisticsRepository.findTopSellingMenusByQuantity(branchId, startDate, endDate);
    }
    
    /**
     * 메뉴별 인기 순위 (매출 기준) - 메뉴 이름 포함 - Redis 캐싱 적용
     */
    @Cacheable(value = "salesStatistics", key = "'topMenus:sales:withName:' + #branchId + ':' + #startDate + ':' + #endDate")
    public List<Object[]> getTopSellingMenusBySalesWithName(Long branchId, LocalDate startDate, LocalDate endDate) {
        return menuSalesStatisticsRepository.findTopSellingMenusBySalesWithName(branchId, startDate, endDate);
    }
    
    /**
     * 메뉴별 인기 순위 (수량 기준) - 메뉴 이름 포함 - Redis 캐싱 적용
     */
    @Cacheable(value = "salesStatistics", key = "'topMenus:quantity:withName:' + #branchId + ':' + #startDate + ':' + #endDate")
    public List<Object[]> getTopSellingMenusByQuantityWithName(Long branchId, LocalDate startDate, LocalDate endDate) {
        return menuSalesStatisticsRepository.findTopSellingMenusByQuantityWithName(branchId, startDate, endDate);
    }
    
    // 상품별 매출 통계 조회 - Redis 캐싱 적용
    @Cacheable(value = "salesStatistics", key = "'productSales:' + #branchId + ':' + #startDate + ':' + #endDate")
    public List<ProductSalesStatisticsDto> getProductSalesStatistics(Long branchId, LocalDate startDate, LocalDate endDate) {
        try {
            System.out.println("상품별 매출 통계 조회 시작 - branchId: " + branchId + ", startDate: " + startDate + ", endDate: " + endDate);
            
            // 먼저 데이터 존재 여부 확인
            Long count = menuSalesStatisticsRepository.countByBranchId(branchId);
            System.out.println("해당 지점의 MenuSalesStatistics 데이터 개수: " + count);
            
            if (count == 0) {
                System.out.println("데이터가 없어서 빈 리스트 반환");
                return List.of();
            }
            
            List<Object[]> rawResult = menuSalesStatisticsRepository.findProductSalesStatistics(branchId, startDate, endDate);
            System.out.println("상품별 매출 통계 조회 성공 - 결과 개수: " + (rawResult != null ? rawResult.size() : 0));
            
            if (rawResult != null && !rawResult.isEmpty()) {
                System.out.println("첫 번째 rawResult: " + java.util.Arrays.toString(rawResult.get(0)));
            }
            
            // Object[]를 DTO로 변환 (안전한 변환)
            List<ProductSalesStatisticsDto> result = new ArrayList<>();
            for (Object[] row : rawResult) {
                try {
                    System.out.println("변환 중인 row: " + java.util.Arrays.toString(row));
                    
                    ProductSalesStatisticsDto dto = new ProductSalesStatisticsDto(
                        (Long) row[0],           // menuId
                        (String) row[1],         // menuName
                        (String) row[2],         // category
                        (BigDecimal) row[3],     // price
                        ((Number) row[4]).longValue(),        // totalQuantitySold
                        (BigDecimal) row[5],     // totalSales
                        (BigDecimal) row[6],     // totalDiscount
                        (BigDecimal) row[7]      // netSales
                    );
                    
                    result.add(dto);
                    System.out.println("DTO 변환 성공: " + dto.getMenuName());
                } catch (Exception e) {
                    System.err.println("DTO 변환 실패: " + e.getMessage());
                    System.err.println("문제가 된 row: " + java.util.Arrays.toString(row));
                    e.printStackTrace();
                }
            }
            
            return result;
        } catch (Exception e) {
            System.err.println("상품별 매출 통계 조회 오류: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    // 카테고리별 매출 통계 조회 - Redis 캐싱 적용
    @Cacheable(value = "salesStatistics", key = "'categorySales:' + #branchId + ':' + #startDate + ':' + #endDate")
    public List<CategorySalesStatisticsDto> getCategorySalesStatistics(Long branchId, LocalDate startDate, LocalDate endDate) {
        try {
            System.out.println("카테고리별 매출 통계 조회 시작 - branchId: " + branchId + ", startDate: " + startDate + ", endDate: " + endDate);
            
            List<Object[]> rawResult = menuSalesStatisticsRepository.findCategorySalesStatistics(branchId, startDate, endDate);
            System.out.println("카테고리별 매출 통계 조회 성공 - 결과 개수: " + (rawResult != null ? rawResult.size() : 0));
            
            // Object[]를 DTO로 변환
            List<CategorySalesStatisticsDto> result = rawResult.stream()
                .map(row -> new CategorySalesStatisticsDto(
                    (String) row[0],         // category
                    ((Number) row[1]).longValue(),        // totalQuantitySold
                    (BigDecimal) row[2]      // totalSales
                ))
                .collect(Collectors.toList());
            
            return result;
        } catch (Exception e) {
            System.err.println("카테고리별 매출 통계 조회 오류: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * 카테고리별 인기 순위 (매출 기준) - Redis 캐싱 적용
     */
    @Cacheable(value = "salesStatistics", key = "'topCategories:sales:' + #branchId + ':' + #startDate + ':' + #endDate")
    public List<CategorySalesStatistics> getTopSellingCategoriesBySales(Long branchId, LocalDate startDate, LocalDate endDate) {
        return categorySalesStatisticsRepository.findTopSellingCategoriesBySales(branchId, startDate, endDate);
    }
    
    /**
     * 지점별 월별 매출 집계 - Redis 캐싱 적용
     */
    @Cacheable(value = "salesStatistics", key = "'monthly:' + #branchId + ':' + #year + ':' + #month")
    public List<SalesStatistics> getMonthlySalesByBranch(Long branchId, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        
        // 일별 집계된 데이터 조회
        List<SalesStatistics> dailyStats = getDailySalesByBranch(branchId, startDate, endDate);
        
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
