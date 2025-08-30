package erp_project.erp_project.controller;

import erp_project.erp_project.dto.RegularOrderDto;
import erp_project.erp_project.service.RegularOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/regular-orders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class RegularOrderController {
    
    private final RegularOrderService regularOrderService;
    
    /**
     * 지점별 모든 정기발주 조회
     */
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<RegularOrderDto>> getAllRegularOrders(@PathVariable Long branchId) {
        try {
            List<RegularOrderDto> regularOrders = regularOrderService.getAllRegularOrders(branchId);
            return ResponseEntity.ok(regularOrders);
        } catch (Exception e) {
            log.error("정기발주 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 지점별 활성 정기발주 조회
     */
    @GetMapping("/branch/{branchId}/active")
    public ResponseEntity<List<RegularOrderDto>> getActiveRegularOrders(@PathVariable Long branchId) {
        try {
            List<RegularOrderDto> regularOrders = regularOrderService.getActiveRegularOrders(branchId);
            return ResponseEntity.ok(regularOrders);
        } catch (Exception e) {
            log.error("활성 정기발주 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 지점별 비활성 정기발주 조회
     */
    @GetMapping("/branch/{branchId}/inactive")
    public ResponseEntity<List<RegularOrderDto>> getInactiveRegularOrders(@PathVariable Long branchId) {
        try {
            List<RegularOrderDto> regularOrders = regularOrderService.getInactiveRegularOrders(branchId);
            return ResponseEntity.ok(regularOrders);
        } catch (Exception e) {
            log.error("비활성 정기발주 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 정기발주명으로 검색
     */
    @GetMapping("/branch/{branchId}/search")
    public ResponseEntity<List<RegularOrderDto>> searchRegularOrders(
            @PathVariable Long branchId,
            @RequestParam String keyword) {
        try {
            List<RegularOrderDto> regularOrders = regularOrderService.searchRegularOrders(branchId, keyword);
            return ResponseEntity.ok(regularOrders);
        } catch (Exception e) {
            log.error("정기발주 검색 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 등록자별 정기발주 조회
     */
    @GetMapping("/branch/{branchId}/creator/{createdBy}")
    public ResponseEntity<List<RegularOrderDto>> getRegularOrdersByCreator(
            @PathVariable Long branchId,
            @PathVariable String createdBy) {
        try {
            List<RegularOrderDto> regularOrders = regularOrderService.getRegularOrdersByCreator(branchId, createdBy);
            return ResponseEntity.ok(regularOrders);
        } catch (Exception e) {
            log.error("등록자별 정기발주 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 날짜에 발주 예정인 정기발주 조회
     */
    @GetMapping("/branch/{branchId}/next-order-date")
    public ResponseEntity<List<RegularOrderDto>> getRegularOrdersByNextOrderDate(
            @PathVariable Long branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<RegularOrderDto> regularOrders = regularOrderService.getRegularOrdersByNextOrderDate(branchId, date);
            return ResponseEntity.ok(regularOrders);
        } catch (Exception e) {
            log.error("발주 예정일별 정기발주 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 정기발주 상세 조회 (아이템 포함)
     */
    @GetMapping("/{regularOrderId}")
    public ResponseEntity<RegularOrderDto> getRegularOrderById(@PathVariable Long regularOrderId) {
        try {
            RegularOrderDto regularOrder = regularOrderService.getRegularOrderById(regularOrderId);
            return ResponseEntity.ok(regularOrder);
        } catch (RuntimeException e) {
            log.warn("정기발주를 찾을 수 없습니다: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("정기발주 상세 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 정기발주 활성화/비활성화 토글
     */
    @PutMapping("/{regularOrderId}/toggle-status")
    public ResponseEntity<RegularOrderDto> toggleRegularOrderStatus(@PathVariable Long regularOrderId) {
        try {
            RegularOrderDto regularOrder = regularOrderService.toggleRegularOrderStatus(regularOrderId);
            return ResponseEntity.ok(regularOrder);
        } catch (RuntimeException e) {
            log.warn("정기발주를 찾을 수 없습니다: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("정기발주 상태 변경 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 정기발주 상태별 필터링
     */
    @GetMapping("/branch/{branchId}/status/{status}")
    public ResponseEntity<List<RegularOrderDto>> getRegularOrdersByStatus(
            @PathVariable Long branchId,
            @PathVariable String status) {
        try {
            List<RegularOrderDto> regularOrders = regularOrderService.getRegularOrdersByStatus(branchId, status);
            return ResponseEntity.ok(regularOrders);
        } catch (Exception e) {
            log.error("상태별 정기발주 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 다음 발주일이 가까운 순으로 정렬된 활성 정기발주 조회
     */
    @GetMapping("/branch/{branchId}/next-order-date-sorted")
    public ResponseEntity<List<RegularOrderDto>> getActiveOrdersByNextOrderDate(@PathVariable Long branchId) {
        try {
            List<RegularOrderDto> regularOrders = regularOrderService.getActiveOrdersByNextOrderDate(branchId);
            return ResponseEntity.ok(regularOrders);
        } catch (Exception e) {
            log.error("다음 발주일 순 정기발주 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 정기발주 생성
     */
    @PostMapping
    public ResponseEntity<RegularOrderDto> createRegularOrder(@RequestBody RegularOrderDto regularOrderDto) {
        try {
            RegularOrderDto createdOrder = regularOrderService.createRegularOrder(regularOrderDto);
            return ResponseEntity.status(201).body(createdOrder);
        } catch (Exception e) {
            log.error("정기발주 생성 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 정기발주 수정
     */
    @PutMapping("/{regularOrderId}")
    public ResponseEntity<RegularOrderDto> updateRegularOrder(
            @PathVariable Long regularOrderId,
            @RequestBody RegularOrderDto regularOrderDto) {
        try {
            regularOrderDto.setId(regularOrderId);
            RegularOrderDto updatedOrder = regularOrderService.updateRegularOrder(regularOrderDto);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            log.warn("정기발주를 찾을 수 없습니다: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("정기발주 수정 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 정기발주 삭제
     */
    @DeleteMapping("/{regularOrderId}")
    public ResponseEntity<Void> deleteRegularOrder(@PathVariable Long regularOrderId) {
        try {
            regularOrderService.deleteRegularOrder(regularOrderId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.warn("정기발주를 찾을 수 없습니다: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("정기발주 삭제 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
