package erp_project.erp_project.controller;

import erp_project.erp_project.dto.ProductCostDTO;
import erp_project.erp_project.dto.CostHistoryDTO;
import erp_project.erp_project.dto.CostAnalysisDTO;
import erp_project.erp_project.service.ProductCostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-cost")
@CrossOrigin(origins = "*")
public class ProductCostController {

    @Autowired
    private ProductCostService productCostService;

    // 전체 상품 원가 목록 조회
    @GetMapping("/products")
    public ResponseEntity<List<ProductCostDTO>> getAllProductCosts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String searchTerm) {
        List<ProductCostDTO> products = productCostService.getProductCosts(category, searchTerm);
        return ResponseEntity.ok(products);
    }

    // 카테고리별 원가 분석
    @GetMapping("/analysis")
    public ResponseEntity<List<CostAnalysisDTO>> getCostAnalysis() {
        List<CostAnalysisDTO> analysis = productCostService.getCostAnalysis();
        return ResponseEntity.ok(analysis);
    }

    // 원가 변경 이력 조회
    @GetMapping("/history")
    public ResponseEntity<List<CostHistoryDTO>> getCostHistory() {
        List<CostHistoryDTO> history = productCostService.getCostHistory();
        return ResponseEntity.ok(history);
    }

    // 원가 수정
    @PutMapping("/{productId}/cost")
    public ResponseEntity<ProductCostDTO> updateProductCost(
            @PathVariable Long productId,
            @RequestBody ProductCostDTO costUpdate) {
        ProductCostDTO updatedProduct = productCostService.updateProductCost(productId, costUpdate);
        return ResponseEntity.ok(updatedProduct);
    }

    // 원가 데이터 내보내기
    @GetMapping("/export")
    public ResponseEntity<String> exportCostData() {
        String exportData = productCostService.exportCostData();
        return ResponseEntity.ok(exportData);
    }
}
