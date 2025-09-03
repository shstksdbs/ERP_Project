package erp_project.erp_project.controller;

import erp_project.erp_project.dto.SalesOverviewRequestDto;
import erp_project.erp_project.dto.SalesOverviewResponseDto;
import erp_project.erp_project.dto.DailySalesTrendResponseDto;
import erp_project.erp_project.service.SalesOverviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SalesOverviewController {
    
    private final SalesOverviewService salesOverviewService;
    
    /**
     * 매출 개요 조회 API
     * 선택한 연월에 따른 가맹점별 매출 현황을 조회합니다.
     * 
     * @param year 조회할 연도
     * @param month 조회할 월
     * @return 매출 개요 데이터
     */
    @GetMapping("/overview")
    public ResponseEntity<SalesOverviewResponseDto> getSalesOverview(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        
        log.info("매출 개요 조회 요청 - 연도: {}, 월: {}", year, month);
        
        try {
            // 요청 데이터 검증
            SalesOverviewRequestDto request = SalesOverviewRequestDto.builder()
                    .year(year)
                    .month(month)
                    .build();
            
            SalesOverviewResponseDto response = salesOverviewService.getSalesOverview(request);
            
            log.info("매출 개요 조회 완료 - 가맹점 수: {}", response.getFranchises().size());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 요청 파라미터: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("매출 개요 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 매출 개요 조회 API (POST 방식)
     * Request Body로 연월 정보를 받아 매출 현황을 조회합니다.
     * 
     * @param request 매출 조회 요청 데이터
     * @return 매출 개요 데이터
     */
    @PostMapping("/overview")
    public ResponseEntity<SalesOverviewResponseDto> getSalesOverviewPost(
            @Valid @RequestBody SalesOverviewRequestDto request) {
        
        log.info("매출 개요 조회 요청 (POST) - 연도: {}, 월: {}", request.getYear(), request.getMonth());
        
        try {
            SalesOverviewResponseDto response = salesOverviewService.getSalesOverview(request);
            
            log.info("매출 개요 조회 완료 - 가맹점 수: {}", response.getFranchises().size());
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 요청 파라미터: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("매출 개요 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 매출 추이 조회 API
     * 특정 가맹점의 일별 매출 추이를 조회합니다.
     * 
     * @param year 조회할 연도
     * @param month 조회할 월
     * @param branchId 가맹점 ID (선택사항, 없으면 전체)
     * @return 매출 추이 데이터
     */
    @GetMapping("/trend")
    public ResponseEntity<DailySalesTrendResponseDto> getSalesTrend(
            @RequestParam Integer year,
            @RequestParam Integer month,
            @RequestParam(required = false) Long branchId) {
        
        log.info("매출 추이 조회 요청 - 연도: {}, 월: {}, 가맹점 ID: {}", year, month, branchId);
        
        try {
            SalesOverviewRequestDto request = SalesOverviewRequestDto.builder()
                    .year(year)
                    .month(month)
                    .build();
            
            DailySalesTrendResponseDto response = salesOverviewService.getDailySalesTrend(request, branchId);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("매출 추이 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 카테고리별 매출 조회 API
     * 선택한 연월의 카테고리별 매출 현황을 조회합니다.
     * 
     * @param year 조회할 연도
     * @param month 조회할 월
     * @return 카테고리별 매출 데이터
     */
    @GetMapping("/category")
    public ResponseEntity<?> getCategorySales(
            @RequestParam Integer year,
            @RequestParam Integer month) {
        
        log.info("카테고리별 매출 조회 요청 - 연도: {}, 월: {}", year, month);
        
        try {
            // TODO: 카테고리별 매출 조회 로직 구현
            return ResponseEntity.ok().body("카테고리별 매출 조회 기능은 추후 구현 예정입니다.");
            
        } catch (Exception e) {
            log.error("카테고리별 매출 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
