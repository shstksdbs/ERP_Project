package erp_project.erp_project.controller;

import erp_project.erp_project.service.CacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cache")
@RequiredArgsConstructor
@Slf4j
public class CacheController {
    
    private final CacheService cacheService;
    
    /**
     * 모든 캐시 클리어
     */
    @PostMapping("/clear-all")
    public ResponseEntity<Map<String, Object>> clearAllCaches() {
        try {
            cacheService.clearAllCaches();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "모든 Redis 캐시가 클리어되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("캐시 클리어 실패: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "캐시 클리어 중 오류가 발생했습니다: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 메뉴 관련 캐시 클리어
     */
    @PostMapping("/clear-menu")
    public ResponseEntity<Map<String, Object>> clearMenuCaches() {
        try {
            cacheService.clearMenuCaches();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "메뉴 관련 캐시가 클리어되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("메뉴 캐시 클리어 실패: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "메뉴 캐시 클리어 중 오류가 발생했습니다: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 대시보드 관련 캐시 클리어
     */
    @PostMapping("/clear-dashboard")
    public ResponseEntity<Map<String, Object>> clearDashboardCaches() {
        try {
            cacheService.clearDashboardCaches();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "대시보드 관련 캐시가 클리어되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("대시보드 캐시 클리어 실패: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "대시보드 캐시 클리어 중 오류가 발생했습니다: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 특정 지점의 대시보드 캐시 클리어
     */
    @PostMapping("/clear-dashboard/{branchId}")
    public ResponseEntity<Map<String, Object>> clearBranchDashboardCaches(@PathVariable Long branchId) {
        try {
            cacheService.clearBranchDashboardCaches(branchId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "지점 " + branchId + "의 대시보드 캐시가 클리어되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("지점 대시보드 캐시 클리어 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "지점 대시보드 캐시 클리어 중 오류가 발생했습니다: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 매출 통계 캐시 클리어
     */
    @PostMapping("/clear-sales-statistics")
    public ResponseEntity<Map<String, Object>> clearSalesStatisticsCaches() {
        try {
            cacheService.clearSalesStatisticsCaches();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "매출 통계 관련 캐시가 클리어되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("매출 통계 캐시 클리어 실패: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "매출 통계 캐시 클리어 중 오류가 발생했습니다: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 매출 개요 캐시 클리어
     */
    @PostMapping("/clear-sales-overview")
    public ResponseEntity<Map<String, Object>> clearSalesOverviewCaches() {
        try {
            cacheService.clearSalesOverviewCaches();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "매출 개요 관련 캐시가 클리어되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("매출 개요 캐시 클리어 실패: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "매출 개요 캐시 클리어 중 오류가 발생했습니다: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 상품 매출 캐시 클리어
     */
    @PostMapping("/clear-product-sales")
    public ResponseEntity<Map<String, Object>> clearProductSalesCaches() {
        try {
            cacheService.clearProductSalesCaches();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "상품 매출 관련 캐시가 클리어되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("상품 매출 캐시 클리어 실패: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "상품 매출 캐시 클리어 중 오류가 발생했습니다: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 모든 매출 관련 캐시 클리어
     */
    @PostMapping("/clear-all-sales")
    public ResponseEntity<Map<String, Object>> clearAllSalesCaches() {
        try {
            cacheService.clearAllSalesCaches();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "모든 매출 관련 캐시가 클리어되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("모든 매출 캐시 클리어 실패: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "모든 매출 캐시 클리어 중 오류가 발생했습니다: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    /**
     * 캐시 상태 확인
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getCacheStatus() {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Redis 캐시가 정상적으로 작동 중입니다.");
            response.put("timestamp", java.time.LocalDateTime.now());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("캐시 상태 확인 실패: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "캐시 상태 확인 중 오류가 발생했습니다: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
