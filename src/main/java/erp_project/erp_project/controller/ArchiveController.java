package erp_project.erp_project.controller;

import erp_project.erp_project.service.SalesDataArchivingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/archive")
@RequiredArgsConstructor
@Slf4j
public class ArchiveController {
    
    private final SalesDataArchivingService archivingService;
    
    /**
     * 아카이빙 통계 조회
     */
    @GetMapping("/statistics")
    public ResponseEntity<SalesDataArchivingService.ArchiveStatistics> getArchiveStatistics() {
        try {
            SalesDataArchivingService.ArchiveStatistics stats = archivingService.getArchiveStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("아카이빙 통계 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 수동 아카이빙 실행
     */
    @PostMapping("/manual")
    public ResponseEntity<String> manualArchive(
            @RequestParam String fromDate,
            @RequestParam String toDate) {
        
        try {
            LocalDate from = LocalDate.parse(fromDate);
            LocalDate to = LocalDate.parse(toDate);
            
            archivingService.manualArchive(from, to);
            
            // 비동기 작업이므로 즉시 응답
            return ResponseEntity.ok("아카이빙 작업이 시작되었습니다. 결과는 로그를 확인하세요.");
            
        } catch (Exception e) {
            log.error("수동 아카이빙 실행 실패", e);
            return ResponseEntity.badRequest().body("아카이빙 실행 실패: " + e.getMessage());
        }
    }
}
