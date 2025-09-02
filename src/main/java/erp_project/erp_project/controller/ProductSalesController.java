package erp_project.erp_project.controller;

import erp_project.erp_project.dto.ProductSalesResponseDto;
import erp_project.erp_project.dto.FranchiseSalesResponseDto;
import erp_project.erp_project.service.ProductSalesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/product-sales")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class ProductSalesController {

    private final ProductSalesService productSalesService;

    @GetMapping("/overview")
    public ResponseEntity<ProductSalesResponseDto> getProductSalesOverview(
            @RequestParam int year,
            @RequestParam int month) {
        
        log.info("상품별 매출 개요 조회 요청 - 년도: {}, 월: {}", year, month);
        
        try {
            ProductSalesResponseDto response = productSalesService.getProductSalesData(year, month);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("상품별 매출 개요 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/test-data")
    public ResponseEntity<Map<String, Object>> testData() {
        log.info("데이터베이스 테스트 요청");
        
        try {
            Map<String, Object> result = productSalesService.testDatabaseData();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("데이터베이스 테스트 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/franchise-analysis")
    public ResponseEntity<FranchiseSalesResponseDto> getFranchiseSalesAnalysis(
            @RequestParam int year,
            @RequestParam int month) {
        
        log.info("가맹점별 매출 분석 조회 요청 - 년도: {}, 월: {}", year, month);
        
        try {
            FranchiseSalesResponseDto response = productSalesService.getFranchiseSalesData(year, month);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("가맹점별 매출 분석 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/menu-data")
    public ResponseEntity<List<Map<String, Object>>> getMenuData() {
        log.info("메뉴 데이터 조회 요청");
        
        try {
            List<Map<String, Object>> result = productSalesService.getMenuData();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("메뉴 데이터 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
