package erp_project.erp_project.service;

import erp_project.erp_project.entity.*;
import erp_project.erp_project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticsDataOptimizationService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final SalesStatisticsRepository salesStatisticsRepository;
    private final MenuSalesStatisticsRepository menuSalesStatisticsRepository;
    private final CategorySalesStatisticsRepository categorySalesStatisticsRepository;
    private final OrderRepository orderRepository;
    
    // Redis 키 패턴 상수
    private static final String STATS_CACHE_KEY = "stats:";
    private static final String MENU_STATS_CACHE_KEY = "menu_stats:";
    private static final String CATEGORY_STATS_CACHE_KEY = "category_stats:";
    private static final String AGGREGATED_STATS_KEY = "aggregated_stats:";
    
    /**
     * 지점별 일별 매출 통계 캐싱 (2시간 TTL)
     */
    @Cacheable(value = "salesStatistics", key = "'daily:' + #branchId + ':' + #date")
    public Map<String, Object> getDailySalesStatistics(Long branchId, LocalDate date) {
        log.info("일별 매출 통계 조회: 지점={}, 날짜={}", branchId, date);
        
        Optional<SalesStatistics> dailyStats = salesStatisticsRepository
            .findByBranchIdAndStatisticDateAndStatisticHourIsNull(branchId, date);
        
        Map<String, Object> result = new HashMap<>();
        if (dailyStats.isPresent()) {
            SalesStatistics stats = dailyStats.get();
            result.put("totalOrders", stats.getTotalOrders());
            result.put("totalSales", stats.getTotalSales());
            result.put("netSales", stats.getNetSales());
            result.put("averageOrderValue", stats.getAverageOrderValue());
            result.put("cashSales", stats.getCashSales());
            result.put("cardSales", stats.getCardSales());
            result.put("mobileSales", stats.getMobileSales());
        } else {
            // 통계 데이터가 없으면 0으로 초기화
            result.put("totalOrders", 0);
            result.put("totalSales", BigDecimal.ZERO);
            result.put("netSales", BigDecimal.ZERO);
            result.put("averageOrderValue", BigDecimal.ZERO);
            result.put("cashSales", BigDecimal.ZERO);
            result.put("cardSales", BigDecimal.ZERO);
            result.put("mobileSales", BigDecimal.ZERO);
        }
        
        return result;
    }
    
    /**
     * 지점별 메뉴별 매출 통계 캐싱 (2시간 TTL)
     */
    @Cacheable(value = "salesStatistics", key = "'menu:' + #branchId + ':' + #date")
    public List<Map<String, Object>> getMenuSalesStatistics(Long branchId, LocalDate date) {
        log.info("메뉴별 매출 통계 조회: 지점={}, 날짜={}", branchId, date);
        
        List<MenuSalesStatistics> menuStats = menuSalesStatisticsRepository
            .findByBranchIdAndStatisticDate(branchId, date);
        
        return menuStats.stream()
            .map(stat -> {
                Map<String, Object> menuData = new HashMap<>();
                menuData.put("menuId", stat.getMenuId());
                menuData.put("quantitySold", stat.getQuantitySold());
                menuData.put("totalSales", stat.getTotalSales());
                menuData.put("netSales", stat.getNetSales());
                return menuData;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * 지점별 카테고리별 매출 통계 캐싱 (2시간 TTL)
     */
    @Cacheable(value = "salesStatistics", key = "'category:' + #branchId + ':' + #date")
    public List<Map<String, Object>> getCategorySalesStatistics(Long branchId, LocalDate date) {
        log.info("카테고리별 매출 통계 조회: 지점={}, 날짜={}", branchId, date);
        
        List<CategorySalesStatistics> categoryStats = categorySalesStatisticsRepository
            .findByBranchIdAndStatisticDate(branchId, date);
        
        return categoryStats.stream()
            .map(stat -> {
                Map<String, Object> categoryData = new HashMap<>();
                categoryData.put("categoryId", stat.getCategoryId());
                categoryData.put("quantitySold", stat.getQuantitySold());
                categoryData.put("totalSales", stat.getTotalSales());
                categoryData.put("netSales", stat.getNetSales());
                return categoryData;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * 월별 집계 통계 데이터 캐싱 (6시간 TTL)
     */
    @Cacheable(value = "aggregatedSales", key = "'monthly:' + #branchId + ':' + #year + ':' + #month")
    public Map<String, Object> getMonthlyAggregatedStatistics(Long branchId, int year, int month) {
        log.info("월별 집계 통계 조회: 지점={}, {}/{}", branchId, year, month);
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        // 월별 매출 통계 집계
        List<SalesStatistics> monthlyStats = salesStatisticsRepository
            .findByBranchIdAndStatisticDateBetweenAndStatisticHourIsNull(branchId, startDate, endDate);
        
        Map<String, Object> aggregatedData = new HashMap<>();
        
        // 총 매출 집계
        BigDecimal totalSales = monthlyStats.stream()
            .map(SalesStatistics::getTotalSales)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int totalOrders = monthlyStats.stream()
            .mapToInt(SalesStatistics::getTotalOrders)
            .sum();
        
        aggregatedData.put("totalSales", totalSales);
        aggregatedData.put("totalOrders", totalOrders);
        aggregatedData.put("averageOrderValue", totalOrders > 0 ? 
            totalSales.divide(BigDecimal.valueOf(totalOrders), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO);
        
        // 일별 매출 추이
        Map<String, BigDecimal> dailySales = monthlyStats.stream()
            .collect(Collectors.toMap(
                stat -> stat.getStatisticDate().toString(),
                SalesStatistics::getTotalSales,
                BigDecimal::add
            ));
        aggregatedData.put("dailySales", dailySales);
        
        // 메뉴별 월별 집계
        List<MenuSalesStatistics> monthlyMenuStats = menuSalesStatisticsRepository
            .findByBranchIdAndStatisticDateBetween(branchId, startDate, endDate);
        
        Map<Long, Map<String, Object>> menuAggregated = monthlyMenuStats.stream()
            .collect(Collectors.groupingBy(
                MenuSalesStatistics::getMenuId,
                Collectors.reducing(
                    new HashMap<String, Object>() {{
                        put("quantitySold", 0);
                        put("totalSales", BigDecimal.ZERO);
                        put("netSales", BigDecimal.ZERO);
                    }},
                    stat -> {
                        Map<String, Object> menuData = new HashMap<>();
                        menuData.put("menuId", stat.getMenuId());
                        menuData.put("quantitySold", stat.getQuantitySold());
                        menuData.put("totalSales", stat.getTotalSales());
                        menuData.put("netSales", stat.getNetSales());
                        return menuData;
                    },
                    (existing, newData) -> {
                        Map<String, Object> result = new HashMap<>(existing);
                        result.put("quantitySold", (Integer) result.get("quantitySold") + (Integer) newData.get("quantitySold"));
                        result.put("totalSales", ((BigDecimal) result.get("totalSales")).add((BigDecimal) newData.get("totalSales")));
                        result.put("netSales", ((BigDecimal) result.get("netSales")).add((BigDecimal) newData.get("netSales")));
                        return result;
                    }
                )
            ));
        
        aggregatedData.put("menuStatistics", menuAggregated);
        
        return aggregatedData;
    }
    
    /**
     * 통계 데이터 배치 처리 (매일 새벽 2시)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void processStatisticsBatch() {
        log.info("통계 데이터 배치 처리 시작");
        
        LocalDate yesterday = LocalDate.now().minusDays(1);
        
        try {
            // 1. 어제 데이터 검증 및 보정
            validateAndCorrectStatistics(yesterday);
            
            // 2. 집계 데이터 사전 계산
            preCalculateAggregatedData(yesterday);
            
            // 3. 오래된 통계 데이터 정리
            cleanupOldStatistics();
            
            log.info("통계 데이터 배치 처리 완료");
        } catch (Exception e) {
            log.error("통계 데이터 배치 처리 중 오류 발생", e);
        }
    }
    
    /**
     * 비동기 통계 데이터 배치 처리 (수동 호출용)
     */
    @Async
    public CompletableFuture<Void> processStatisticsBatchAsync() {
        processStatisticsBatch();
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * 통계 데이터 검증 및 보정
     */
    @Transactional
    private void validateAndCorrectStatistics(LocalDate date) {
        log.info("통계 데이터 검증 및 보정: {}", date);
        
        // 모든 지점의 통계 데이터 검증
        List<Long> branchIds = orderRepository.findDistinctBranchIds();
        
        for (Long branchId : branchIds) {
            try {
                // 실제 주문 데이터와 통계 데이터 비교
                validateSalesStatistics(branchId, date);
                validateMenuStatistics(branchId, date);
                validateCategoryStatistics(branchId, date);
                
            } catch (Exception e) {
                log.error("지점 {} 통계 데이터 검증 실패", branchId, e);
            }
        }
    }
    
    /**
     * 매출 통계 검증
     */
    private void validateSalesStatistics(Long branchId, LocalDate date) {
        // 실제 주문 데이터로부터 계산된 통계
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
        
        List<Orders> actualOrders = orderRepository
            .findByBranchIdAndCreatedAtBetweenAndOrderStatusAndPaymentStatus(
                branchId, startOfDay, endOfDay, 
                Orders.OrderStatus.completed, Orders.PaymentStatus.completed);
        
        // 실제 통계 계산
        int actualOrderCount = actualOrders.size();
        BigDecimal actualTotalSales = actualOrders.stream()
            .map(Orders::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // 저장된 통계와 비교
        Optional<SalesStatistics> storedStats = salesStatisticsRepository
            .findByBranchIdAndStatisticDateAndStatisticHourIsNull(branchId, date);
        
        if (storedStats.isPresent()) {
            SalesStatistics stats = storedStats.get();
            
            // 차이가 있으면 보정
            if (!stats.getTotalOrders().equals(actualOrderCount) || 
                !stats.getTotalSales().equals(actualTotalSales)) {
                
                log.warn("지점 {} 날짜 {} 통계 데이터 불일치 감지, 보정 중...", branchId, date);
                
                stats.setTotalOrders(actualOrderCount);
                stats.setTotalSales(actualTotalSales);
                stats.setAverageOrderValue(actualOrderCount > 0 ? 
                    actualTotalSales.divide(BigDecimal.valueOf(actualOrderCount), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO);
                stats.updateNetSales();
                
                salesStatisticsRepository.save(stats);
            }
        }
    }
    
    /**
     * 메뉴 통계 검증
     */
    private void validateMenuStatistics(Long branchId, LocalDate date) {
        // 실제 주문 아이템 데이터로부터 계산
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
        
        List<Orders> orders = orderRepository
            .findByBranchIdAndCreatedAtBetweenAndOrderStatusAndPaymentStatus(
                branchId, startOfDay, endOfDay, 
                Orders.OrderStatus.completed, Orders.PaymentStatus.completed);
        
        // 메뉴별 실제 판매량 계산
        Map<Long, Map<String, Object>> actualMenuStats = new HashMap<>();
        
        for (Orders order : orders) {
            if (order.getOrderItems() != null) {
                for (OrderItems item : order.getOrderItems()) {
                    Long menuId = item.getMenuId();
                    actualMenuStats.computeIfAbsent(menuId, k -> new HashMap<>())
                        .merge("quantitySold", item.getQuantity(), (existing, newVal) -> 
                            (Integer) existing + (Integer) newVal);
                    actualMenuStats.computeIfAbsent(menuId, k -> new HashMap<>())
                        .merge("totalSales", item.getTotalPrice(), (existing, newVal) -> 
                            ((BigDecimal) existing).add((BigDecimal) newVal));
                }
            }
        }
        
        // 저장된 통계와 비교 및 보정
        List<MenuSalesStatistics> storedStats = menuSalesStatisticsRepository
            .findByBranchIdAndStatisticDate(branchId, date);
        
        for (MenuSalesStatistics stat : storedStats) {
            Map<String, Object> actualData = actualMenuStats.get(stat.getMenuId());
            if (actualData != null) {
                Integer actualQuantity = (Integer) actualData.get("quantitySold");
                BigDecimal actualSales = (BigDecimal) actualData.get("totalSales");
                
                if (!stat.getQuantitySold().equals(actualQuantity) || 
                    !stat.getTotalSales().equals(actualSales)) {
                    
                    log.warn("지점 {} 메뉴 {} 날짜 {} 통계 데이터 불일치 감지, 보정 중...", 
                        branchId, stat.getMenuId(), date);
                    
                    stat.setQuantitySold(actualQuantity);
                    stat.setTotalSales(actualSales);
                    stat.updateNetSales();
                    
                    menuSalesStatisticsRepository.save(stat);
                }
            }
        }
    }
    
    /**
     * 카테고리 통계 검증
     */
    private void validateCategoryStatistics(Long branchId, LocalDate date) {
        // 카테고리별 통계 검증 로직
        // (메뉴 통계와 유사한 방식으로 구현)
        log.debug("카테고리 통계 검증: 지점={}, 날짜={}", branchId, date);
    }
    
    /**
     * 집계 데이터 사전 계산
     */
    private void preCalculateAggregatedData(LocalDate date) {
        log.info("집계 데이터 사전 계산: {}", date);
        
        List<Long> branchIds = orderRepository.findDistinctBranchIds();
        
        for (Long branchId : branchIds) {
            try {
                // 주간 집계 데이터 계산
                LocalDate weekStart = date.minusDays(6);
                calculateWeeklyAggregatedData(branchId, weekStart, date);
                
                // 월간 집계 데이터 계산
                if (date.getDayOfMonth() == 1) { // 매월 1일
                    LocalDate monthStart = date.minusMonths(1).withDayOfMonth(1);
                    LocalDate monthEnd = date.minusDays(1);
                    calculateMonthlyAggregatedData(branchId, monthStart, monthEnd);
                }
                
            } catch (Exception e) {
                log.error("지점 {} 집계 데이터 계산 실패", branchId, e);
            }
        }
    }
    
    /**
     * 주간 집계 데이터 계산
     */
    private void calculateWeeklyAggregatedData(Long branchId, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> weeklyData = new HashMap<>();
        
        // 주간 매출 통계
        List<SalesStatistics> weeklyStats = salesStatisticsRepository
            .findByBranchIdAndStatisticDateBetweenAndStatisticHourIsNull(branchId, startDate, endDate);
        
        BigDecimal weeklySales = weeklyStats.stream()
            .map(SalesStatistics::getTotalSales)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int weeklyOrders = weeklyStats.stream()
            .mapToInt(SalesStatistics::getTotalOrders)
            .sum();
        
        weeklyData.put("totalSales", weeklySales);
        weeklyData.put("totalOrders", weeklyOrders);
        weeklyData.put("averageOrderValue", weeklyOrders > 0 ? 
            weeklySales.divide(BigDecimal.valueOf(weeklyOrders), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO);
        
        // Redis에 저장 (7일 TTL)
        String key = AGGREGATED_STATS_KEY + "weekly:" + branchId + ":" + endDate;
        redisTemplate.opsForValue().set(key, weeklyData, java.time.Duration.ofDays(7));
    }
    
    /**
     * 월간 집계 데이터 계산
     */
    private void calculateMonthlyAggregatedData(Long branchId, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> monthlyData = new HashMap<>();
        
        // 월간 매출 통계
        List<SalesStatistics> monthlyStats = salesStatisticsRepository
            .findByBranchIdAndStatisticDateBetweenAndStatisticHourIsNull(branchId, startDate, endDate);
        
        BigDecimal monthlySales = monthlyStats.stream()
            .map(SalesStatistics::getTotalSales)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int monthlyOrders = monthlyStats.stream()
            .mapToInt(SalesStatistics::getTotalOrders)
            .sum();
        
        monthlyData.put("totalSales", monthlySales);
        monthlyData.put("totalOrders", monthlyOrders);
        monthlyData.put("averageOrderValue", monthlyOrders > 0 ? 
            monthlySales.divide(BigDecimal.valueOf(monthlyOrders), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO);
        
        // Redis에 저장 (30일 TTL)
        String key = AGGREGATED_STATS_KEY + "monthly:" + branchId + ":" + endDate;
        redisTemplate.opsForValue().set(key, monthlyData, java.time.Duration.ofDays(30));
    }
    
    /**
     * 오래된 통계 데이터 정리
     */
    private void cleanupOldStatistics() {
        log.info("오래된 통계 데이터 정리 시작");
        
        // 1년 이상 된 통계 데이터 정리
        LocalDate cutoffDate = LocalDate.now().minusYears(1);
        
        try {
            // 오래된 매출 통계 정리
            List<SalesStatistics> oldSalesStats = salesStatisticsRepository
                .findByStatisticDateBefore(cutoffDate);
            
            if (!oldSalesStats.isEmpty()) {
                log.info("오래된 매출 통계 {} 개 정리", oldSalesStats.size());
                // 실제 삭제는 아카이빙 후에 수행
                // salesStatisticsRepository.deleteAll(oldSalesStats);
            }
            
            // 오래된 메뉴 통계 정리
            List<MenuSalesStatistics> oldMenuStats = menuSalesStatisticsRepository
                .findByStatisticDateBefore(cutoffDate);
            
            if (!oldMenuStats.isEmpty()) {
                log.info("오래된 메뉴 통계 {} 개 정리", oldMenuStats.size());
                // menuSalesStatisticsRepository.deleteAll(oldMenuStats);
            }
            
            // 오래된 카테고리 통계 정리
            List<CategorySalesStatistics> oldCategoryStats = categorySalesStatisticsRepository
                .findByStatisticDateBefore(cutoffDate);
            
            if (!oldCategoryStats.isEmpty()) {
                log.info("오래된 카테고리 통계 {} 개 정리", oldCategoryStats.size());
                // categorySalesStatisticsRepository.deleteAll(oldCategoryStats);
            }
            
        } catch (Exception e) {
            log.error("오래된 통계 데이터 정리 실패", e);
        }
    }
    
    /**
     * 통계 데이터 캐시 무효화
     */
    @CacheEvict(value = {"salesStatistics", "aggregatedSales"}, allEntries = true)
    public void invalidateStatisticsCaches() {
        log.info("통계 관련 캐시 무효화");
    }
    
    /**
     * 특정 지점의 통계 캐시만 무효화
     */
    public void invalidateBranchStatisticsCache(Long branchId) {
        log.info("지점 {} 통계 캐시 무효화", branchId);
        
        // 통계 관련 캐시 키 패턴으로 삭제
        Set<String> statsKeys = redisTemplate.keys(STATS_CACHE_KEY + "*:" + branchId + ":*");
        Set<String> menuStatsKeys = redisTemplate.keys(MENU_STATS_CACHE_KEY + "*:" + branchId + ":*");
        Set<String> categoryStatsKeys = redisTemplate.keys(CATEGORY_STATS_CACHE_KEY + "*:" + branchId + ":*");
        Set<String> aggregatedKeys = redisTemplate.keys(AGGREGATED_STATS_KEY + "*:" + branchId + ":*");
        
        if (statsKeys != null) redisTemplate.delete(statsKeys);
        if (menuStatsKeys != null) redisTemplate.delete(menuStatsKeys);
        if (categoryStatsKeys != null) redisTemplate.delete(categoryStatsKeys);
        if (aggregatedKeys != null) redisTemplate.delete(aggregatedKeys);
    }
    
    /**
     * 통계 데이터 성능 모니터링
     */
    public Map<String, Object> getStatisticsPerformanceInfo() {
        Map<String, Object> performanceInfo = new HashMap<>();
        
        try {
            // 통계 테이블별 레코드 수
            long salesStatsCount = salesStatisticsRepository.count();
            long menuStatsCount = menuSalesStatisticsRepository.count();
            long categoryStatsCount = categorySalesStatisticsRepository.count();
            
            performanceInfo.put("salesStatisticsCount", salesStatsCount);
            performanceInfo.put("menuSalesStatisticsCount", menuStatsCount);
            performanceInfo.put("categorySalesStatisticsCount", categoryStatsCount);
            performanceInfo.put("totalStatisticsRecords", salesStatsCount + menuStatsCount + categoryStatsCount);
            
            // 최근 30일 데이터 수
            LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
            long recentSalesStats = salesStatisticsRepository.countByStatisticDateAfter(thirtyDaysAgo);
            long recentMenuStats = menuSalesStatisticsRepository.countByStatisticDateAfter(thirtyDaysAgo);
            long recentCategoryStats = categorySalesStatisticsRepository.countByStatisticDateAfter(thirtyDaysAgo);
            
            performanceInfo.put("recentSalesStatisticsCount", recentSalesStats);
            performanceInfo.put("recentMenuSalesStatisticsCount", recentMenuStats);
            performanceInfo.put("recentCategorySalesStatisticsCount", recentCategoryStats);
            
            // 캐시 키 개수
            Set<String> allStatsKeys = redisTemplate.keys(STATS_CACHE_KEY + "*");
            Set<String> allMenuStatsKeys = redisTemplate.keys(MENU_STATS_CACHE_KEY + "*");
            Set<String> allCategoryStatsKeys = redisTemplate.keys(CATEGORY_STATS_CACHE_KEY + "*");
            Set<String> allAggregatedKeys = redisTemplate.keys(AGGREGATED_STATS_KEY + "*");
            
            performanceInfo.put("cachedStatsKeys", allStatsKeys != null ? allStatsKeys.size() : 0);
            performanceInfo.put("cachedMenuStatsKeys", allMenuStatsKeys != null ? allMenuStatsKeys.size() : 0);
            performanceInfo.put("cachedCategoryStatsKeys", allCategoryStatsKeys != null ? allCategoryStatsKeys.size() : 0);
            performanceInfo.put("cachedAggregatedKeys", allAggregatedKeys != null ? allAggregatedKeys.size() : 0);
            
        } catch (Exception e) {
            log.error("통계 성능 정보 조회 실패", e);
            performanceInfo.put("error", e.getMessage());
        }
        
        return performanceInfo;
    }
}
