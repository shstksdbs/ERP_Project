package erp_project.erp_project.controller;

import erp_project.erp_project.service.StatisticsDataOptimizationService;
import erp_project.erp_project.service.StatisticsArchivingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/statistics-data")
@RequiredArgsConstructor
@Slf4j
public class StatisticsDataController {
    
    private final StatisticsDataOptimizationService statisticsDataOptimizationService;
    private final StatisticsArchivingService statisticsArchivingService;
    
    /**
     * 지점별 일별 매출 통계 조회
     */
    @GetMapping("/daily-sales/{branchId}")
    public ResponseEntity<Map<String, Object>> getDailySalesStatistics(
            @PathVariable Long branchId,
            @RequestParam(required = false) String date) {
        
        try {
            LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now();
            Map<String, Object> data = statisticsDataOptimizationService.getDailySalesStatistics(branchId, targetDate);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("일별 매출 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 지점별 메뉴별 매출 통계 조회
     */
    @GetMapping("/menu-sales/{branchId}")
    public ResponseEntity<Map<String, Object>> getMenuSalesStatistics(
            @PathVariable Long branchId,
            @RequestParam(required = false) String date) {
        
        try {
            LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now();
            Map<String, Object> data = Map.of("menuStatistics", 
                statisticsDataOptimizationService.getMenuSalesStatistics(branchId, targetDate));
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("메뉴별 매출 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 지점별 카테고리별 매출 통계 조회
     */
    @GetMapping("/category-sales/{branchId}")
    public ResponseEntity<Map<String, Object>> getCategorySalesStatistics(
            @PathVariable Long branchId,
            @RequestParam(required = false) String date) {
        
        try {
            LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now();
            Map<String, Object> data = Map.of("categoryStatistics", 
                statisticsDataOptimizationService.getCategorySalesStatistics(branchId, targetDate));
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("카테고리별 매출 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 지점별 월별 집계 통계 조회
     */
    @GetMapping("/monthly-aggregated/{branchId}")
    public ResponseEntity<Map<String, Object>> getMonthlyAggregatedStatistics(
            @PathVariable Long branchId,
            @RequestParam int year,
            @RequestParam int month) {
        
        try {
            Map<String, Object> data = statisticsDataOptimizationService
                .getMonthlyAggregatedStatistics(branchId, year, month);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("월별 집계 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 통계 데이터 성능 정보 조회
     */
    @GetMapping("/performance-info")
    public ResponseEntity<Map<String, Object>> getStatisticsPerformanceInfo() {
        try {
            Map<String, Object> performanceInfo = statisticsDataOptimizationService
                .getStatisticsPerformanceInfo();
            return ResponseEntity.ok(performanceInfo);
        } catch (Exception e) {
            log.error("통계 성능 정보 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 지점 통계 캐시 무효화
     */
    @PostMapping("/cache/invalidate/{branchId}")
    public ResponseEntity<String> invalidateBranchStatisticsCache(@PathVariable Long branchId) {
        try {
            statisticsDataOptimizationService.invalidateBranchStatisticsCache(branchId);
            return ResponseEntity.ok("지점 " + branchId + "의 통계 캐시가 무효화되었습니다.");
        } catch (Exception e) {
            log.error("통계 캐시 무효화 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 모든 통계 캐시 무효화
     */
    @PostMapping("/cache/invalidate-all")
    public ResponseEntity<String> invalidateAllStatisticsCache() {
        try {
            statisticsDataOptimizationService.invalidateStatisticsCaches();
            return ResponseEntity.ok("모든 통계 캐시가 무효화되었습니다.");
        } catch (Exception e) {
            log.error("전체 통계 캐시 무효화 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 수동 통계 배치 처리 실행
     */
    @PostMapping("/batch/process")
    public ResponseEntity<String> processStatisticsBatch() {
        try {
            statisticsDataOptimizationService.processStatisticsBatchAsync();
            return ResponseEntity.ok("통계 배치 처리가 시작되었습니다.");
        } catch (Exception e) {
            log.error("통계 배치 처리 실행 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 통계 아카이빙 정보 조회
     */
    @GetMapping("/archive/info")
    public ResponseEntity<StatisticsArchivingService.StatisticsArchiveInfo> getStatisticsArchiveInfo() {
        try {
            StatisticsArchivingService.StatisticsArchiveInfo info = 
                statisticsArchivingService.getStatisticsArchiveInfo();
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            log.error("통계 아카이빙 정보 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 수동 통계 아카이빙 실행
     */
    @PostMapping("/archive/manual")
    public ResponseEntity<String> manualStatisticsArchive(
            @RequestParam String fromDate,
            @RequestParam String toDate) {
        
        try {
            LocalDate from = LocalDate.parse(fromDate);
            LocalDate to = LocalDate.parse(toDate);
            
            statisticsArchivingService.manualStatisticsArchive(from, to);
            
            return ResponseEntity.ok("통계 아카이빙 작업이 시작되었습니다. 결과는 로그를 확인하세요.");
            
        } catch (Exception e) {
            log.error("수동 통계 아카이빙 실행 실패", e);
            return ResponseEntity.badRequest().body("통계 아카이빙 실행 실패: " + e.getMessage());
        }
    }
}
