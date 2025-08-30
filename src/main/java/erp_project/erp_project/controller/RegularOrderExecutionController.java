package erp_project.erp_project.controller;

import erp_project.erp_project.entity.RegularOrderExecution;
import erp_project.erp_project.service.RegularOrderExecutionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/regular-order-executions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class RegularOrderExecutionController {

    private final RegularOrderExecutionService executionService;

    /**
     * 특정 정기발주를 수동으로 실행
     */
    @PostMapping("/execute/{orderId}")
    public ResponseEntity<Map<String, Object>> executeRegularOrder(@PathVariable Long orderId) {
        try {
            executionService.executeRegularOrderManually(orderId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "정기발주가 성공적으로 실행되었습니다.");
            response.put("orderId", orderId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("정기발주 실행 실패: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "정기발주 실행에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 모든 예정된 정기발주를 즉시 실행 (테스트용)
     */
    @PostMapping("/execute-all")
    public ResponseEntity<Map<String, Object>> executeAllScheduledOrders() {
        try {
            executionService.executeScheduledOrders();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "모든 예정된 정기발주가 실행되었습니다.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("정기발주 일괄 실행 실패: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "정기발주 일괄 실행에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
}
