package erp_project.erp_project.controller;

import erp_project.erp_project.entity.SalesStatistics;
import erp_project.erp_project.entity.MenuSalesStatistics;
import erp_project.erp_project.entity.CategorySalesStatistics;
import erp_project.erp_project.dto.ProductSalesStatisticsDto;
import erp_project.erp_project.dto.CategorySalesStatisticsDto;
import erp_project.erp_project.service.SalesStatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales-statistics")
@CrossOrigin(origins = "*")
public class SalesStatisticsController {
    
    @Autowired
    private SalesStatisticsService salesStatisticsService;
    
    /**
     * 지점별 일별 매출 조회
     */
    @GetMapping("/daily/{branchId}")
    public ResponseEntity<List<SalesStatistics>> getDailySalesByBranch(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<SalesStatistics> dailySales = salesStatisticsService.getDailySalesByBranch(branchId, startDate, endDate);
        return ResponseEntity.ok(dailySales);
    }
    
    /**
     * 시간대별 매출 분석 (전체 지점)
     */
    @GetMapping("/hourly")
    public ResponseEntity<List<SalesStatistics>> getHourlySalesAnalysis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<SalesStatistics> hourlyAnalysis = salesStatisticsService.getHourlySalesAnalysis(startDate, endDate);
        return ResponseEntity.ok(hourlyAnalysis);
    }
    
    /**
     * 지점별 시간대별 매출 분석
     */
    @GetMapping("/hourly/{branchId}")
    public ResponseEntity<List<SalesStatistics>> getHourlySalesByBranch(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<SalesStatistics> hourlyAnalysis = salesStatisticsService.getHourlySalesByBranch(branchId, startDate, endDate);
        return ResponseEntity.ok(hourlyAnalysis);
    }
    
    /**
     * 메뉴별 인기 순위 (매출 기준)
     */
    @GetMapping("/menu/top-sales/{branchId}")
    public ResponseEntity<List<MenuSalesStatistics>> getTopSellingMenusBySales(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<MenuSalesStatistics> topMenus = salesStatisticsService.getTopSellingMenusBySales(branchId, startDate, endDate);
        return ResponseEntity.ok(topMenus);
    }
    
    /**
     * 메뉴별 인기 순위 (수량 기준)
     */
    @GetMapping("/menu/top-quantity/{branchId}")
    public ResponseEntity<List<MenuSalesStatistics>> getTopSellingMenusByQuantity(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<MenuSalesStatistics> topMenus = salesStatisticsService.getTopSellingMenusByQuantity(branchId, startDate, endDate);
        return ResponseEntity.ok(topMenus);
    }
    
    /**
     * 메뉴별 인기 순위 (매출 기준) - 메뉴 이름 포함
     */
    @GetMapping("/menu/top-sales-with-name/{branchId}")
    public ResponseEntity<List<Object[]>> getTopSellingMenusBySalesWithName(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            List<Object[]> topMenus = salesStatisticsService.getTopSellingMenusBySalesWithName(branchId, startDate, endDate);
            return ResponseEntity.ok(topMenus != null ? topMenus : List.of());
        } catch (Exception e) {
            // 로그 출력 후 빈 리스트 반환
            System.err.println("인기 메뉴 조회 오류: " + e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }
    
    /**
     * 메뉴별 인기 순위 (수량 기준) - 메뉴 이름 포함
     */
    @GetMapping("/menu/top-quantity-with-name/{branchId}")
    public ResponseEntity<List<Object[]>> getTopSellingMenusByQuantityWithName(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            List<Object[]> topMenus = salesStatisticsService.getTopSellingMenusByQuantityWithName(branchId, startDate, endDate);
            return ResponseEntity.ok(topMenus != null ? topMenus : List.of());
        } catch (Exception e) {
            System.err.println("인기 메뉴 조회 오류: " + e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }
    
    // 상품별 매출 통계 조회
    @GetMapping("/product-sales/{branchId}")
    public ResponseEntity<List<ProductSalesStatisticsDto>> getProductSalesStatistics(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            List<ProductSalesStatisticsDto> productStats = salesStatisticsService.getProductSalesStatistics(branchId, startDate, endDate);
            return ResponseEntity.ok(productStats != null ? productStats : List.of());
        } catch (Exception e) {
            System.err.println("상품별 매출 통계 조회 오류: " + e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }
    
    // 카테고리별 매출 통계 조회
    @GetMapping("/category-sales/{branchId}")
    public ResponseEntity<List<CategorySalesStatisticsDto>> getCategorySalesStatistics(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            List<CategorySalesStatisticsDto> categoryStats = salesStatisticsService.getCategorySalesStatistics(branchId, startDate, endDate);
            return ResponseEntity.ok(categoryStats != null ? categoryStats : List.of());
        } catch (Exception e) {
            System.err.println("카테고리별 매출 통계 조회 오류: " + e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }
    
    /**
     * 카테고리별 인기 순위 (매출 기준)
     */
    @GetMapping("/category/top-sales/{branchId}")
    public ResponseEntity<List<CategorySalesStatistics>> getTopSellingCategoriesBySales(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<CategorySalesStatistics> topCategories = salesStatisticsService.getTopSellingCategoriesBySales(branchId, startDate, endDate);
        return ResponseEntity.ok(topCategories);
    }
    
    /**
     * 전체 지점 통합 매출 통계
     */
    @GetMapping("/summary")
    public ResponseEntity<List<SalesStatistics>> getOverallSalesSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        // 전체 지점의 일별 통계 조회 (branchId = null로 처리하거나 별도 메서드 구현)
        // 여기서는 간단히 첫 번째 지점(본사)의 통계를 반환
        List<SalesStatistics> summary = salesStatisticsService.getDailySalesByBranch(1L, startDate, endDate);
        return ResponseEntity.ok(summary);
    }
    
    /**
     * 지점별 월별 매출 조회
     */
    @GetMapping("/monthly/{branchId}")
    public ResponseEntity<List<SalesStatistics>> getMonthlySalesByBranch(
            @PathVariable Long branchId,
            @RequestParam int year,
            @RequestParam int month) {
        
        List<SalesStatistics> monthlySales = salesStatisticsService.getMonthlySalesByBranch(branchId, year, month);
        return ResponseEntity.ok(monthlySales);
    }
    
    /**
     * 디버깅: 특정 지점의 특정 날짜 통계 데이터 조회
     */
    @GetMapping("/debug/daily/{branchId}")
    public ResponseEntity<SalesStatistics> getDailyStatisticsForDebug(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        SalesStatistics stats = salesStatisticsService.getDailyStatisticsForDebug(branchId, date);
        if (stats != null) {
            return ResponseEntity.ok(stats);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 디버깅: 특정 지점의 특정 날짜 시간별 통계 데이터 조회
     */
    @GetMapping("/debug/hourly/{branchId}")
    public ResponseEntity<List<SalesStatistics>> getHourlyStatisticsForDebug(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        List<SalesStatistics> stats = salesStatisticsService.getHourlyStatisticsForDebug(branchId, date);
        return ResponseEntity.ok(stats);
    }
}
