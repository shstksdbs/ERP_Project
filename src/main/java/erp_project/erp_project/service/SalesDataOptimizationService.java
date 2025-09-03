package erp_project.erp_project.service;

import erp_project.erp_project.entity.Orders;
import erp_project.erp_project.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalesDataOptimizationService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final OrderRepository orderRepository;
    
    // Redis 키 패턴 상수
    private static final String REALTIME_SALES_KEY = "realtime:sales:";
    private static final String AGGREGATED_SALES_KEY = "aggregated:sales:";
    private static final String DAILY_SUMMARY_KEY = "daily:summary:";
    
    /**
     * 실시간 매출 데이터 캐싱 (5분 TTL)
     */
    @Cacheable(value = "realtimeSales", key = "'realtime:' + #branchId + ':' + #date")
    public Map<String, Object> getRealtimeSalesData(Long branchId, LocalDate date) {
        log.info("실시간 매출 데이터 조회: 지점={}, 날짜={}", branchId, date);
        
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
        
        List<Orders> todayOrders = orderRepository.findByBranchIdAndCreatedAtBetweenAndOrderStatusAndPaymentStatus(
            branchId, startOfDay, endOfDay, Orders.OrderStatus.completed, Orders.PaymentStatus.completed);
        
        Map<String, Object> realtimeData = new HashMap<>();
        realtimeData.put("totalSales", todayOrders.stream()
            .mapToDouble(order -> order.getTotalAmount().doubleValue())
            .sum());
        realtimeData.put("totalOrders", todayOrders.size());
        realtimeData.put("averageOrderValue", todayOrders.isEmpty() ? 0 : 
            todayOrders.stream().mapToDouble(order -> order.getTotalAmount().doubleValue()).average().orElse(0));
        
        // 시간별 매출 분포 (최근 24시간)
        Map<Integer, BigDecimal> hourlySales = new HashMap<>();
        for (int hour = 0; hour < 24; hour++) {
            final int currentHour = hour;
            BigDecimal hourSales = todayOrders.stream()
                .filter(order -> order.getCreatedAt().getHour() == currentHour)
                .map(Orders::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            hourlySales.put(hour, hourSales);
        }
        realtimeData.put("hourlySales", hourlySales);
        
        return realtimeData;
    }
    
    /**
     * 집계된 매출 데이터 캐싱 (6시간 TTL)
     */
    @Cacheable(value = "aggregatedSales", key = "'aggregated:' + #branchId + ':' + #year + ':' + #month")
    public Map<String, Object> getAggregatedSalesData(Long branchId, int year, int month) {
        log.info("집계 매출 데이터 조회: 지점={}, {}/{}", branchId, year, month);
        
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        List<Orders> monthlyOrders = orderRepository.findByBranchIdAndCreatedAtBetweenAndOrderStatusAndPaymentStatus(
            branchId, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay(),
            Orders.OrderStatus.completed, Orders.PaymentStatus.completed);
        
        Map<String, Object> aggregatedData = new HashMap<>();
        
        // 월별 총 매출
        BigDecimal totalSales = monthlyOrders.stream()
            .map(Orders::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        aggregatedData.put("totalSales", totalSales);
        aggregatedData.put("totalOrders", monthlyOrders.size());
        
        // 일별 매출 추이
        Map<String, BigDecimal> dailySales = monthlyOrders.stream()
            .collect(Collectors.groupingBy(
                order -> order.getCreatedAt().toLocalDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                Collectors.reducing(BigDecimal.ZERO, Orders::getTotalAmount, BigDecimal::add)
            ));
        aggregatedData.put("dailySales", dailySales);
        
        // 상위 판매 상품 (집계) - OrderItems가 없는 경우 빈 맵 반환
        Map<String, Long> topProducts = new HashMap<>();
        if (monthlyOrders != null && !monthlyOrders.isEmpty()) {
            topProducts = monthlyOrders.stream()
                .filter(order -> order.getOrderItems() != null)
                .flatMap(order -> order.getOrderItems().stream())
                .collect(Collectors.groupingBy(
                    item -> item.getMenu() != null ? item.getMenu().getName() : "Unknown",
                    Collectors.summingLong(item -> item.getQuantity() != null ? item.getQuantity().longValue() : 0L)
                ));
        }
        
        List<Map.Entry<String, Long>> sortedProducts = topProducts.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(10)
            .collect(Collectors.toList());
        
        aggregatedData.put("topProducts", sortedProducts);
        
        return aggregatedData;
    }
    
    /**
     * 대용량 데이터 처리를 위한 배치 작업
     */
    @Scheduled(cron = "0 0 1 * * ?") // 매일 새벽 1시 실행
    public void processDailySalesBatch() {
        log.info("일별 매출 데이터 배치 처리 시작");
        
        LocalDate yesterday = LocalDate.now().minusDays(1);
        
        try {
            // 1. 어제 데이터 집계
            processDailyAggregation(yesterday);
            
            // 2. 캐시 최적화
            optimizeCache();
            
            // 3. 오래된 데이터 정리
            cleanupOldData();
            
            log.info("일별 매출 데이터 배치 처리 완료");
        } catch (Exception e) {
            log.error("배치 처리 중 오류 발생", e);
        }
    }
    
    /**
     * 비동기 일별 매출 데이터 배치 처리 (수동 호출용)
     */
    @Async
    public CompletableFuture<Void> processDailySalesBatchAsync() {
        processDailySalesBatch();
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * 일별 데이터 집계 처리
     */
    private void processDailyAggregation(LocalDate date) {
        log.info("일별 집계 처리: {}", date);
        
        // 모든 지점의 일별 데이터 집계
        List<Long> branchIds = orderRepository.findDistinctBranchIds();
        
        for (Long branchId : branchIds) {
            try {
                // 일별 요약 데이터 생성
                Map<String, Object> dailySummary = createDailySummary(branchId, date);
                
                // Redis에 저장 (30일 TTL)
                String key = DAILY_SUMMARY_KEY + branchId + ":" + date;
                redisTemplate.opsForValue().set(key, dailySummary, java.time.Duration.ofDays(30));
                
            } catch (Exception e) {
                log.error("지점 {} 일별 집계 처리 실패", branchId, e);
            }
        }
    }
    
    /**
     * 일별 요약 데이터 생성
     */
    private Map<String, Object> createDailySummary(Long branchId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
        
        List<Orders> dailyOrders = orderRepository.findByBranchIdAndCreatedAtBetweenAndOrderStatusAndPaymentStatus(
            branchId, startOfDay, endOfDay, Orders.OrderStatus.completed, Orders.PaymentStatus.completed);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("date", date.toString());
        summary.put("branchId", branchId);
        summary.put("totalSales", dailyOrders.stream()
            .mapToDouble(order -> order.getTotalAmount().doubleValue()).sum());
        summary.put("totalOrders", dailyOrders.size());
        summary.put("averageOrderValue", dailyOrders.isEmpty() ? 0 :
            dailyOrders.stream().mapToDouble(order -> order.getTotalAmount().doubleValue()).average().orElse(0));
        
        return summary;
    }
    
    /**
     * 캐시 최적화
     */
    private void optimizeCache() {
        log.info("캐시 최적화 시작");
        
        // 자주 사용되지 않는 캐시 정리
        Set<String> keys = redisTemplate.keys("realtime:sales:*");
        if (keys != null && keys.size() > 1000) {
            // 오래된 실시간 데이터 정리
            keys.stream()
                .filter(key -> key.contains("realtime:sales:"))
                .limit(keys.size() - 500) // 최신 500개만 유지
                .forEach(key -> redisTemplate.delete(key));
        }
    }
    
    /**
     * 오래된 데이터 정리
     */
    private void cleanupOldData() {
        log.info("오래된 데이터 정리 시작");
        
        // 30일 이상 된 실시간 데이터 정리
        LocalDate cutoffDate = LocalDate.now().minusDays(30);
        Set<String> oldKeys = redisTemplate.keys("realtime:sales:*");
        
        if (oldKeys != null) {
            oldKeys.stream()
                .filter(key -> {
                    String dateStr = key.substring(key.lastIndexOf(":") + 1);
                    try {
                        LocalDate keyDate = LocalDate.parse(dateStr);
                        return keyDate.isBefore(cutoffDate);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .forEach(redisTemplate::delete);
        }
    }
    
    /**
     * 매출 데이터 업데이트 시 캐시 무효화
     */
    @CacheEvict(value = {"realtimeSales", "aggregatedSales"}, allEntries = true)
    public void invalidateSalesCaches() {
        log.info("매출 관련 캐시 무효화");
    }
    
    /**
     * 특정 지점의 매출 캐시만 무효화
     */
    public void invalidateBranchSalesCache(Long branchId) {
        log.info("지점 {} 매출 캐시 무효화", branchId);
        
        // 실시간 데이터 캐시 무효화
        Set<String> realtimeKeys = redisTemplate.keys(REALTIME_SALES_KEY + branchId + ":*");
        if (realtimeKeys != null) {
            redisTemplate.delete(realtimeKeys);
        }
        
        // 집계 데이터 캐시 무효화
        Set<String> aggregatedKeys = redisTemplate.keys(AGGREGATED_SALES_KEY + branchId + ":*");
        if (aggregatedKeys != null) {
            redisTemplate.delete(aggregatedKeys);
        }
    }
    
    /**
     * Redis 메모리 사용량 모니터링
     */
    public Map<String, Object> getRedisMemoryInfo() {
        Map<String, Object> memoryInfo = new HashMap<>();
        
        try {
            // Redis INFO 명령어로 메모리 정보 조회
            var connectionFactory = redisTemplate.getConnectionFactory();
            if (connectionFactory != null) {
                Properties info = connectionFactory
                    .getConnection().serverCommands().info("memory");
                
                if (info != null) {
                    memoryInfo.put("usedMemory", info.getProperty("used_memory_human"));
                    memoryInfo.put("maxMemory", info.getProperty("maxmemory_human"));
                    memoryInfo.put("memoryFragmentationRatio", info.getProperty("mem_fragmentation_ratio"));
                }
            }
            
            // 캐시 키 개수
            Set<String> allKeys = redisTemplate.keys("*");
            memoryInfo.put("totalKeys", allKeys != null ? allKeys.size() : 0);
            
        } catch (Exception e) {
            log.error("Redis 메모리 정보 조회 실패", e);
            memoryInfo.put("error", e.getMessage());
        }
        
        return memoryInfo;
    }
}
