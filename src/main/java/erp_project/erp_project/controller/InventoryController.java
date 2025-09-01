package erp_project.erp_project.controller;

import erp_project.erp_project.entity.MaterialStock;
import erp_project.erp_project.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    /**
     * 주문 완료 시 재고 차감
     */
    @PostMapping("/deduct-from-order/{orderId}")
    public ResponseEntity<Map<String, String>> deductInventoryFromOrder(@PathVariable Long orderId) {
        try {
            inventoryService.deductInventoryFromOrder(orderId);
            return ResponseEntity.ok(Map.of("message", "재고 차감이 완료되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "재고 차감 실패: " + e.getMessage()));
        }
    }

    /**
     * 주문 전 재고 가용성 체크
     */
    @GetMapping("/check-availability/{orderId}")
    public ResponseEntity<Map<String, Object>> checkInventoryAvailability(@PathVariable Long orderId) {
        try {
            boolean isAvailable = inventoryService.checkInventoryAvailability(orderId);
            return ResponseEntity.ok(Map.of("isAvailable", isAvailable));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "재고 확인 실패: " + e.getMessage()));
        }
    }

    /**
     * 특정 지점의 전체 재고 현황
     */
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<MaterialStock>> getBranchInventoryStatus(@PathVariable Long branchId) {
        try {
            List<MaterialStock> inventory = inventoryService.getBranchInventoryStatus(branchId);
            return ResponseEntity.ok(inventory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 재고 부족 시 알림 (최소 재고 기준)
     */
    @GetMapping("/branch/{branchId}/low-stock")
    public ResponseEntity<List<MaterialStock>> getLowStockMaterials(@PathVariable Long branchId) {
        try {
            List<MaterialStock> lowStock = inventoryService.getLowStockMaterials(branchId);
            return ResponseEntity.ok(lowStock);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 재고 차감 문제 진단을 위한 테스트 API
     */
    @GetMapping("/test/{orderId}")
    public ResponseEntity<Map<String, Object>> testInventoryDeduction(@PathVariable Long orderId) {
        try {
            Map<String, Object> result = inventoryService.testInventoryDeduction(orderId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "테스트 실패: " + e.getMessage()));
        }
    }
}
