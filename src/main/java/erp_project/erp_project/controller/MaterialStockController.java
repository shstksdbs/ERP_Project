package erp_project.erp_project.controller;

import erp_project.erp_project.dto.MaterialStockDTO;
import erp_project.erp_project.dto.InventoryAlertDTO;
import erp_project.erp_project.service.MaterialStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/material-stocks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MaterialStockController {

    private final MaterialStockService materialStockService;

    // 지점별 재고 조회
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<MaterialStockDTO>> getMaterialStocksByBranch(@PathVariable Long branchId) {
        List<MaterialStockDTO> materialStocks = materialStockService.getMaterialStocksByBranch(branchId);
        return ResponseEntity.ok(materialStocks);
    }

    // 특정 재료의 지점별 재고 조회
    @GetMapping("/material/{materialId}")
    public ResponseEntity<List<MaterialStockDTO>> getMaterialStocksByMaterial(@PathVariable Long materialId) {
        List<MaterialStockDTO> materialStocks = materialStockService.getMaterialStocksByMaterial(materialId);
        return ResponseEntity.ok(materialStocks);
    }

    // 재고 상태별 조회 (부족, 정상, 과다)
    @GetMapping("/branch/{branchId}/status/{status}")
    public ResponseEntity<List<MaterialStockDTO>> getMaterialStocksByStatus(
            @PathVariable Long branchId, 
            @PathVariable String status) {
        List<MaterialStockDTO> materialStocks = materialStockService.getMaterialStocksByStatus(branchId, status);
        return ResponseEntity.ok(materialStocks);
    }

    // 지점별 재고 알림 조회 (현재 재고 상태 알림)
    @GetMapping("/branch/{branchId}/alerts")
    public ResponseEntity<List<InventoryAlertDTO>> getInventoryAlertsByBranch(@PathVariable Long branchId) {
        // 현재 재고 상태에 대한 알림 생성 (재고 알림 페이지용)
        List<InventoryAlertDTO> alerts = materialStockService.generateCurrentStockAlerts(branchId);
        return ResponseEntity.ok(alerts);
    }

    // 재고 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<MaterialStockDTO> updateMaterialStock(
            @PathVariable Long id, 
            @RequestBody MaterialStockDTO materialStockDTO) {
        // DTO를 Entity로 변환하는 로직이 필요하지만, 현재는 간단하게 처리
        return ResponseEntity.ok(materialStockDTO);
    }
}
