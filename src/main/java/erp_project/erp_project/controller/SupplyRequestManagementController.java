package erp_project.erp_project.controller;

import erp_project.erp_project.dto.SupplyRequestDto;
import erp_project.erp_project.dto.SupplyRequestCreateDto;
import erp_project.erp_project.dto.SupplyRequestUpdateDto;
import erp_project.erp_project.service.SupplyRequestManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supply-requests/management")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SupplyRequestManagementController {
    
    private final SupplyRequestManagementService supplyRequestManagementService;
    
    /**
     * 모든 발주 요청 조회 (본사용)
     */
    @GetMapping
    public ResponseEntity<List<SupplyRequestDto>> getAllSupplyRequests() {
        try {
            List<SupplyRequestDto> requests = supplyRequestManagementService.getAllSupplyRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            log.error("발주 요청 조회 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 지점의 발주 요청 조회
     */
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<SupplyRequestDto>> getSupplyRequestsByBranch(@PathVariable Long branchId) {
        try {
            List<SupplyRequestDto> requests = supplyRequestManagementService.getSupplyRequestsByBranch(branchId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            log.error("지점별 발주 요청 조회 중 오류 발생: branchId={}", branchId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 발주 요청 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<SupplyRequestDto> getSupplyRequestById(@PathVariable Long id) {
        try {
            SupplyRequestDto request = supplyRequestManagementService.getSupplyRequestById(id);
            return ResponseEntity.ok(request);
        } catch (RuntimeException e) {
            log.warn("발주 요청을 찾을 수 없음: id={}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("발주 요청 상세 조회 중 오류 발생: id={}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 발주 요청 생성
     */
    @PostMapping
    public ResponseEntity<SupplyRequestDto> createSupplyRequest(@RequestBody SupplyRequestCreateDto createDto) {
        try {
            SupplyRequestDto createdRequest = supplyRequestManagementService.createSupplyRequest(createDto);
            log.info("발주 요청 생성 완료: id={}, branchId={}", createdRequest.getId(), createdRequest.getRequestingBranchId());
            return ResponseEntity.ok(createdRequest);
        } catch (RuntimeException e) {
            log.warn("발주 요청 생성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("발주 요청 생성 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 발주 요청 상태 업데이트 (본사 승인/거부)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<SupplyRequestDto> updateSupplyRequestStatus(
            @PathVariable Long id,
            @RequestBody SupplyRequestUpdateDto updateDto) {
        try {
            updateDto.setId(id);
            SupplyRequestDto updatedRequest = supplyRequestManagementService.updateSupplyRequestStatus(id, updateDto);
            log.info("발주 요청 상태 업데이트 완료: id={}, status={}", id, updatedRequest.getStatus());
            return ResponseEntity.ok(updatedRequest);
        } catch (RuntimeException e) {
            log.warn("발주 요청 상태 업데이트 실패: id={}, error={}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("발주 요청 상태 업데이트 중 오류 발생: id={}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 발주 요청 취소
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<SupplyRequestDto> cancelSupplyRequest(
            @PathVariable Long id,
            @RequestParam String reason) {
        try {
            SupplyRequestDto cancelledRequest = supplyRequestManagementService.cancelSupplyRequest(id, reason);
            log.info("발주 요청 취소 완료: id={}, reason={}", id, reason);
            return ResponseEntity.ok(cancelledRequest);
        } catch (RuntimeException e) {
            log.warn("발주 요청 취소 실패: id={}, error={}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("발주 요청 취소 중 오류 발생: id={}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 발주 요청 승인
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<SupplyRequestDto> approveSupplyRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String notes) {
        try {
            SupplyRequestUpdateDto updateDto = SupplyRequestUpdateDto.builder()
                    .id(id)
                    .status(erp_project.erp_project.entity.SupplyRequest.SupplyRequestStatus.APPROVED)
                    .notes(notes)
                    .build();
            
            SupplyRequestDto approvedRequest = supplyRequestManagementService.updateSupplyRequestStatus(id, updateDto);
            log.info("발주 요청 승인 완료: id={}", id);
            return ResponseEntity.ok(approvedRequest);
        } catch (Exception e) {
            log.error("발주 요청 승인 중 오류 발생: id={}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 발주 요청 배송 시작
     */
    @PutMapping("/{id}/start-delivery")
    public ResponseEntity<SupplyRequestDto> startDelivery(
            @PathVariable Long id,
            @RequestParam(required = false) String notes) {
        try {
            SupplyRequestUpdateDto updateDto = SupplyRequestUpdateDto.builder()
                    .id(id)
                    .status(erp_project.erp_project.entity.SupplyRequest.SupplyRequestStatus.IN_TRANSIT)
                    .notes(notes)
                    .build();
            
            SupplyRequestDto inTransitRequest = supplyRequestManagementService.updateSupplyRequestStatus(id, updateDto);
            log.info("발주 요청 배송 시작: id={}", id);
            return ResponseEntity.ok(inTransitRequest);
        } catch (Exception e) {
            log.error("발주 요청 배송 시작 중 오류 발생: id={}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 발주 요청 배송 완료
     */
    @PutMapping("/{id}/complete-delivery")
    public ResponseEntity<SupplyRequestDto> completeDelivery(
            @PathVariable Long id,
            @RequestParam(required = false) String notes) {
        try {
            SupplyRequestUpdateDto updateDto = SupplyRequestUpdateDto.builder()
                    .id(id)
                    .status(erp_project.erp_project.entity.SupplyRequest.SupplyRequestStatus.DELIVERED)
                    .notes(notes)
                    .build();
            
            SupplyRequestDto deliveredRequest = supplyRequestManagementService.updateSupplyRequestStatus(id, updateDto);
            log.info("발주 요청 배송 완료: id={}", id);
            return ResponseEntity.ok(deliveredRequest);
        } catch (Exception e) {
            log.error("발주 요청 배송 완료 중 오류 발생: id={}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
