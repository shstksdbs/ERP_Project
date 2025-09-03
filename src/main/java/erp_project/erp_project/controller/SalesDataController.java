package erp_project.erp_project.controller;

import erp_project.erp_project.service.SalesDataOptimizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/sales-data")
@RequiredArgsConstructor
@Slf4j
public class SalesDataController {
    
    private final SalesDataOptimizationService salesDataOptimizationService;
    
    /**
     * 실시간 매출 데이터 조회
     */
    @GetMapping("/realtime/{branchId}")
    public ResponseEntity<Map<String, Object>> getRealtimeSalesData(
            @PathVariable Long branchId,
            @RequestParam(required = false) String date) {
        
        try {
            LocalDate targetDate = date != null ? LocalDate.parse(date) : LocalDate.now();
            Map<String, Object> data = salesDataOptimizationService.getRealtimeSalesData(branchId, targetDate);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("실시간 매출 데이터 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 집계된 매출 데이터 조회
     */
    @GetMapping("/aggregated/{branchId}")
    public ResponseEntity<Map<String, Object>> getAggregatedSalesData(
            @PathVariable Long branchId,
            @RequestParam int year,
            @RequestParam int month) {
        
        try {
            Map<String, Object> data = salesDataOptimizationService.getAggregatedSalesData(branchId, year, month);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("집계 매출 데이터 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Redis 메모리 사용량 조회
     */
    @GetMapping("/redis/memory")
    public ResponseEntity<Map<String, Object>> getRedisMemoryInfo() {
        try {
            Map<String, Object> memoryInfo = salesDataOptimizationService.getRedisMemoryInfo();
            return ResponseEntity.ok(memoryInfo);
        } catch (Exception e) {
            log.error("Redis 메모리 정보 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 지점 매출 캐시 무효화
     */
    @PostMapping("/cache/invalidate/{branchId}")
    public ResponseEntity<String> invalidateBranchCache(@PathVariable Long branchId) {
        try {
            salesDataOptimizationService.invalidateBranchSalesCache(branchId);
            return ResponseEntity.ok("지점 " + branchId + "의 매출 캐시가 무효화되었습니다.");
        } catch (Exception e) {
            log.error("캐시 무효화 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 모든 매출 캐시 무효화
     */
    @PostMapping("/cache/invalidate-all")
    public ResponseEntity<String> invalidateAllSalesCache() {
        try {
            salesDataOptimizationService.invalidateSalesCaches();
            return ResponseEntity.ok("모든 매출 캐시가 무효화되었습니다.");
        } catch (Exception e) {
            log.error("전체 캐시 무효화 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 수동 배치 처리 실행
     */
    @PostMapping("/batch/process")
    public ResponseEntity<String> processBatch() {
        try {
            salesDataOptimizationService.processDailySalesBatchAsync();
            return ResponseEntity.ok("배치 처리가 시작되었습니다.");
        } catch (Exception e) {
            log.error("배치 처리 실행 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
