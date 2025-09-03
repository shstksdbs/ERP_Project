package erp_project.erp_project.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheService {
    
    private final CacheManager cacheManager;
    
    /**
     * 모든 캐시 클리어
     */
    public void clearAllCaches() {
        log.info("모든 Redis 캐시를 클리어합니다.");
        cacheManager.getCacheNames().forEach(cacheName -> {
            Objects.requireNonNull(cacheManager.getCache(cacheName)).clear();
            log.info("캐시 클리어 완료: {}", cacheName);
        });
    }
    
    /**
     * 특정 캐시 클리어
     */
    public void clearCache(String cacheName) {
        log.info("캐시 클리어: {}", cacheName);
        Objects.requireNonNull(cacheManager.getCache(cacheName)).clear();
    }
    
    /**
     * 메뉴 관련 캐시 클리어
     */
    @CacheEvict(value = {"menus", "menu"}, allEntries = true)
    public void clearMenuCaches() {
        log.info("메뉴 관련 캐시를 클리어합니다.");
    }
    
    /**
     * 대시보드 관련 캐시 클리어
     */
    @CacheEvict(value = {"dashboardKpis", "todaySales", "weeklySalesTrend", "topProducts"}, allEntries = true)
    public void clearDashboardCaches() {
        log.info("대시보드 관련 캐시를 클리어합니다.");
    }
    
    /**
     * 특정 지점의 대시보드 캐시 클리어
     */
    public void clearBranchDashboardCaches(Long branchId) {
        log.info("지점 {} 의 대시보드 캐시를 클리어합니다.", branchId);
        
        // 특정 지점의 캐시만 클리어
        String today = java.time.LocalDate.now().toString();
        String key1 = branchId + "_" + today;
        
        clearCacheByKey("dashboardKpis", key1);
        clearCacheByKey("todaySales", key1);
        clearCacheByKey("weeklySalesTrend", key1);
        clearCacheByKey("topProducts", key1);
    }
    
    /**
     * 특정 키로 캐시 클리어
     */
    private void clearCacheByKey(String cacheName, String key) {
        try {
            Objects.requireNonNull(cacheManager.getCache(cacheName)).evict(key);
            log.info("캐시 키 클리어 완료: {} - {}", cacheName, key);
        } catch (Exception e) {
            log.warn("캐시 키 클리어 실패: {} - {}, error: {}", cacheName, key, e.getMessage());
        }
    }
    
    /**
     * 매출 통계 캐시 클리어
     */
    @CacheEvict(value = "salesStatistics", allEntries = true)
    public void clearSalesStatisticsCaches() {
        log.info("매출 통계 관련 캐시를 클리어합니다.");
    }
    
    /**
     * 매출 개요 캐시 클리어
     */
    @CacheEvict(value = "salesOverview", allEntries = true)
    public void clearSalesOverviewCaches() {
        log.info("매출 개요 관련 캐시를 클리어합니다.");
    }
    
    /**
     * 상품 매출 캐시 클리어
     */
    @CacheEvict(value = "productSales", allEntries = true)
    public void clearProductSalesCaches() {
        log.info("상품 매출 관련 캐시를 클리어합니다.");
    }
    
    /**
     * 모든 매출 관련 캐시 클리어
     */
    public void clearAllSalesCaches() {
        log.info("모든 매출 관련 캐시를 클리어합니다.");
        clearSalesStatisticsCaches();
        clearSalesOverviewCaches();
        clearProductSalesCaches();
    }
}
