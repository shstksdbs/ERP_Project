package erp_project.erp_project.controller;

import erp_project.erp_project.entity.SupplyRequest;
import erp_project.erp_project.entity.SupplyRequestItem;
import erp_project.erp_project.entity.Material;
import erp_project.erp_project.entity.Branches;
import erp_project.erp_project.entity.MaterialStock;
import erp_project.erp_project.entity.StockMovement;
import erp_project.erp_project.repository.SupplyRequestRepository;
import erp_project.erp_project.repository.SupplyRequestItemRepository;
import erp_project.erp_project.repository.MaterialRepository;
import erp_project.erp_project.repository.BranchesRepository;
import erp_project.erp_project.repository.MaterialStockRepository;
import erp_project.erp_project.repository.StockMovementRepository;
import erp_project.erp_project.service.WebSocketNotificationService;
import erp_project.erp_project.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/supply-requests")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SupplyRequestController {
    
    private final SupplyRequestRepository supplyRequestRepository;
    private final SupplyRequestItemRepository supplyRequestItemRepository;
    private final MaterialRepository materialRepository;
    private final BranchesRepository branchesRepository;
    private final MaterialStockRepository materialStockRepository;
    private final StockMovementRepository stockMovementRepository;
    private final WebSocketNotificationService webSocketNotificationService;
    
    /**
     * 발주 요청 목록 조회
     * GET /api/supply-requests?branchId={branchId}
     */
    @GetMapping
    public ResponseEntity<List<SupplyRequestSummaryResponse>> getSupplyRequests(
            @RequestParam(required = false) Long branchId) {
        try {
            List<SupplyRequest> requests;
            if (branchId != null) {
                requests = supplyRequestRepository.findByRequestingBranchId(branchId);
            } else {
                requests = supplyRequestRepository.findAll();
            }
            
            // 각 발주 요청에 대해 원재료 목록을 포함한 요약 정보 생성
            List<SupplyRequestSummaryResponse> summaryResponses = requests.stream()
                    .map(request -> {
                        // 발주 상품 목록 조회
                        List<SupplyRequestItem> items = supplyRequestItemRepository.findBySupplyRequestId(request.getId());
                        
                        return SupplyRequestSummaryResponse.builder()
                                .id(request.getId())
                                .requestingBranchId(request.getRequestingBranchId())
                                .requesterId(request.getRequesterId())
                                .requesterName(request.getRequesterName())
                                .requestDate(request.getRequestDate())
                                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                                .status(request.getStatus())
                                .priority(request.getPriority())
                                .totalCost(request.getTotalCost())
                                .notes(request.getNotes())
                                .createdAt(request.getCreatedAt())
                                .updatedAt(request.getUpdatedAt())
                                .processedBy(request.getProcessedBy())
                                .processedAt(request.getProcessedAt())
                                .items(items.stream().map(item -> SupplyRequestItemResponse.builder()
                                        .id(item.getId())
                                        .materialId(item.getMaterial().getId())
                                        .materialName(item.getMaterial().getName())
                                        .materialCategory(item.getMaterial().getCategory())
                                        .requestedQuantity(item.getRequestedQuantity())
                                        .unit(item.getUnit())
                                        .costPerUnit(item.getCostPerUnit())
                                        .totalCost(item.getTotalCost())
                                        .build())
                                        .collect(Collectors.toList()))
                                .build();
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(summaryResponses);
        } catch (Exception e) {
            log.error("발주 요청 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 상태별 발주 요청 조회
     * GET /api/supply-requests/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<SupplyRequestSummaryResponse>> getSupplyRequestsByStatus(
            @PathVariable String status) {
        try {
            SupplyRequest.SupplyRequestStatus requestStatus = SupplyRequest.SupplyRequestStatus.valueOf(status.toUpperCase());
            List<SupplyRequest> requests = supplyRequestRepository.findByStatus(requestStatus);
            
            List<SupplyRequestSummaryResponse> summaryResponses = requests.stream()
                    .map(request -> {
                        List<SupplyRequestItem> items = supplyRequestItemRepository.findBySupplyRequestId(request.getId());
                        
                        return SupplyRequestSummaryResponse.builder()
                                .id(request.getId())
                                .requestingBranchId(request.getRequestingBranchId())
                                .requesterId(request.getRequesterId())
                                .requesterName(request.getRequesterName())
                                .requestDate(request.getRequestDate())
                                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                                .status(request.getStatus())
                                .priority(request.getPriority())
                                .totalCost(request.getTotalCost())
                                .notes(request.getNotes())
                                .createdAt(request.getCreatedAt())
                                .updatedAt(request.getUpdatedAt())
                                .processedBy(request.getProcessedBy())
                                .processedAt(request.getProcessedAt())
                                .items(items.stream().map(item -> SupplyRequestItemResponse.builder()
                                        .id(item.getId())
                                        .materialId(item.getMaterial().getId())
                                        .materialName(item.getMaterial().getName())
                                        .materialCategory(item.getMaterial().getCategory())
                                        .requestedQuantity(item.getRequestedQuantity())
                                        .unit(item.getUnit())
                                        .costPerUnit(item.getCostPerUnit())
                                        .totalCost(item.getTotalCost())
                                        .build())
                                        .collect(Collectors.toList()))
                                .build();
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(summaryResponses);
        } catch (IllegalArgumentException e) {
            log.error("잘못된 상태값: {}", status, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("상태별 발주 요청 조회 실패: status={}", status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 지점별 발주 요청 조회
     * GET /api/supply-requests/branch/{branchId}
     */
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<SupplyRequestSummaryResponse>> getSupplyRequestsByBranch(
            @PathVariable Long branchId) {
        try {
            List<SupplyRequest> requests = supplyRequestRepository.findByRequestingBranchId(branchId);
            
            List<SupplyRequestSummaryResponse> summaryResponses = requests.stream()
                    .map(request -> {
                        List<SupplyRequestItem> items = supplyRequestItemRepository.findBySupplyRequestId(request.getId());
                        
                        return SupplyRequestSummaryResponse.builder()
                                .id(request.getId())
                                .requestingBranchId(request.getRequestingBranchId())
                                .requesterId(request.getRequesterId())
                                .requesterName(request.getRequesterName())
                                .requestDate(request.getRequestDate())
                                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                                .status(request.getStatus())
                                .priority(request.getPriority())
                                .totalCost(request.getTotalCost())
                                .notes(request.getNotes())
                                .createdAt(request.getCreatedAt())
                                .updatedAt(request.getUpdatedAt())
                                .processedBy(request.getProcessedBy())
                                .processedAt(request.getProcessedAt())
                                .items(items.stream().map(item -> SupplyRequestItemResponse.builder()
                                        .id(item.getId())
                                        .materialId(item.getMaterial().getId())
                                        .materialName(item.getMaterial().getName())
                                        .materialCategory(item.getMaterial().getCategory())
                                        .requestedQuantity(item.getRequestedQuantity())
                                        .unit(item.getUnit())
                                        .costPerUnit(item.getCostPerUnit())
                                        .totalCost(item.getTotalCost())
                                        .build())
                                        .collect(Collectors.toList()))
                                .build();
                    })
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(summaryResponses);
        } catch (Exception e) {
            log.error("지점별 발주 요청 조회 실패: branchId={}", branchId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 발주 요청 삭제
     * DELETE /api/supply-requests/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSupplyRequest(@PathVariable Long id) {
        try {
            log.info("발주 요청 삭제 시작: id={}", id);
            
            // 발주 요청 존재 여부 확인
            Optional<SupplyRequest> optionalRequest = supplyRequestRepository.findById(id);
            if (!optionalRequest.isPresent()) {
                log.warn("삭제할 발주 요청을 찾을 수 없음: id={}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("삭제할 발주 요청을 찾을 수 없습니다.");
            }
            
            SupplyRequest request = optionalRequest.get();
            
            // 디버깅을 위한 로그 추가
            log.info("발주 요청 상태 확인: id={}, status={}, statusType={}", 
                    id, request.getStatus(), request.getStatus().getClass().getName());
            
            // 승인대기 상태가 아닌 경우 삭제 불가
            if (!"PENDING".equals(request.getStatus().toString())) {
                log.warn("승인대기 상태가 아닌 발주 요청은 삭제할 수 없음: id={}, status={}, statusString={}", 
                        id, request.getStatus(), request.getStatus().toString());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("승인대기 상태가 아닌 발주 요청은 삭제할 수 없습니다. 현재 상태: " + request.getStatus());
            }
            
            // 발주 상품 목록 먼저 삭제
            List<SupplyRequestItem> items = supplyRequestItemRepository.findBySupplyRequestId(id);
            supplyRequestItemRepository.deleteAll(items);
            log.info("발주 상품 목록 삭제 완료: {}개", items.size());
            
            // 발주 요청 삭제
            supplyRequestRepository.deleteById(id);
            log.info("발주 요청 삭제 완료: id={}", id);
            
            return ResponseEntity.ok("발주 요청이 성공적으로 삭제되었습니다.");
            
        } catch (Exception e) {
            log.error("발주 요청 삭제 실패: id={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("발주 요청 삭제 중 오류가 발생했습니다.");
        }
    }

    /**
     * 발주 요청 생성
     * POST /api/supply-requests
     */
    @PostMapping
    public ResponseEntity<SupplyRequest> createSupplyRequest(@RequestBody SupplyRequestCreateRequest request) {
        try {
            log.info("발주 요청 생성 시작: branchId={}, items={}", request.getRequestingBranchId(), request.getItems().size());
            
            // 지점 존재 여부 확인
            Optional<Branches> branchOpt = branchesRepository.findById(request.getRequestingBranchId());
            if (branchOpt.isEmpty()) {
                log.error("지점을 찾을 수 없습니다: branchId={}", request.getRequestingBranchId());
                return ResponseEntity.badRequest().build();
            }
            
            // SupplyRequest 생성
            SupplyRequest supplyRequest = SupplyRequest.builder()
                    .requestingBranchId(request.getRequestingBranchId())
                    .requesterId(request.getRequesterId())
                    .requesterName(request.getRequesterName())
                    .requestDate(LocalDateTime.now())
                    .expectedDeliveryDate(request.getExpectedDeliveryDate())
                    .status(SupplyRequest.SupplyRequestStatus.PENDING)
                    .priority(SupplyRequest.SupplyRequestPriority.valueOf(request.getPriority()))
                    .notes(request.getNotes())
                    .build();
            
            SupplyRequest savedRequest = supplyRequestRepository.save(supplyRequest);
            
            // 총 비용 계산
            BigDecimal totalCost = BigDecimal.ZERO;
            
            // SupplyRequestItem 생성
            for (SupplyRequestItemRequest itemRequest : request.getItems()) {
                Optional<Material> materialOpt = materialRepository.findById(itemRequest.getMaterialId());
                if (materialOpt.isEmpty()) {
                    log.error("원재료를 찾을 수 없습니다: materialId={}", itemRequest.getMaterialId());
                    continue;
                }
                
                Material material = materialOpt.get();
                BigDecimal itemTotalCost = itemRequest.getRequestedQuantity().multiply(itemRequest.getCostPerUnit());
                totalCost = totalCost.add(itemTotalCost);
                
                SupplyRequestItem item = SupplyRequestItem.builder()
                        .supplyRequestId(savedRequest.getId())
                        .material(material)
                        .requestedQuantity(itemRequest.getRequestedQuantity())
                        .unit(itemRequest.getUnit())
                        .costPerUnit(itemRequest.getCostPerUnit())
                        .totalCost(itemTotalCost)
                        .build();
                
                supplyRequestItemRepository.save(item);
            }
            
            // 총 비용 업데이트
            savedRequest.setTotalCost(totalCost);
            SupplyRequest finalRequest = supplyRequestRepository.save(savedRequest);
            
            log.info("발주 요청 생성 완료: requestId={}, totalCost={}", finalRequest.getId(), totalCost);
            return ResponseEntity.status(HttpStatus.CREATED).body(finalRequest);
            
        } catch (Exception e) {
            log.error("발주 요청 생성 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 발주 요청 상세 조회
     * GET /api/supply-requests/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<SupplyRequestDetailResponse> getSupplyRequest(@PathVariable Long id) {
        try {
            Optional<SupplyRequest> requestOpt = supplyRequestRepository.findById(id);
            if (requestOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            SupplyRequest supplyRequest = requestOpt.get();
            
            // 발주 상품 목록 조회
            List<SupplyRequestItem> items = supplyRequestItemRepository.findBySupplyRequestId(id);
            
            // 응답 DTO 생성
            SupplyRequestDetailResponse response = SupplyRequestDetailResponse.builder()
                    .id(supplyRequest.getId())
                    .requestingBranchId(supplyRequest.getRequestingBranchId())
                    .requesterId(supplyRequest.getRequesterId())
                    .requesterName(supplyRequest.getRequesterName())
                    .requestDate(supplyRequest.getRequestDate())
                    .expectedDeliveryDate(supplyRequest.getExpectedDeliveryDate())
                    .status(supplyRequest.getStatus())
                    .priority(supplyRequest.getPriority())
                    .totalCost(supplyRequest.getTotalCost())
                    .notes(supplyRequest.getNotes())
                    .createdAt(supplyRequest.getCreatedAt())
                    .updatedAt(supplyRequest.getUpdatedAt())
                    .processedBy(supplyRequest.getProcessedBy())
                    .processedAt(supplyRequest.getProcessedAt())
                    .items(items.stream().map(item -> SupplyRequestItemResponse.builder()
                            .id(item.getId())
                            .materialId(item.getMaterial().getId())
                            .materialName(item.getMaterial().getName())
                            .materialCategory(item.getMaterial().getCategory())
                            .requestedQuantity(item.getRequestedQuantity())
                            .unit(item.getUnit())
                            .costPerUnit(item.getCostPerUnit())
                            .totalCost(item.getTotalCost())
                            .build())
                            .collect(Collectors.toList()))
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("발주 요청 상세 조회 실패: id={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 발주 요청 상태 업데이트
     * PATCH /api/supply-requests/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<SupplyRequest> updateSupplyRequestStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        try {
            log.info("발주 요청 상태 업데이트 시작: id={}, status={}", id, request.getStatus());
            
            Optional<SupplyRequest> requestOpt = supplyRequestRepository.findById(id);
            if (requestOpt.isEmpty()) {
                log.warn("발주 요청을 찾을 수 없음: id={}", id);
                return ResponseEntity.notFound().build();
            }
            
            SupplyRequest supplyRequest = requestOpt.get();
            log.info("현재 발주 요청 상태: {}", supplyRequest.getStatus());
            
            SupplyRequest.SupplyRequestStatus newStatus = SupplyRequest.SupplyRequestStatus.valueOf(request.getStatus());
            log.info("새로운 상태로 변경: {} -> {}", supplyRequest.getStatus(), newStatus);
            supplyRequest.setStatus(newStatus);
            
            // 처리자 정보와 처리 시간이 있으면 저장
            if (request.getProcessedBy() != null) {
                if (request.getProcessedAt() != null) {
                    supplyRequest.setProcessedBy(request.getProcessedBy());
                    supplyRequest.setProcessedAt(request.getProcessedAt());
                } else {
                    supplyRequest.setProcessedInfo(request.getProcessedBy());
                }
            }
            
            // 배송 완료 상태로 변경 시 재고 업데이트
            if (newStatus == SupplyRequest.SupplyRequestStatus.DELIVERED) {
                updateInventoryOnDelivery(supplyRequest);
            }
            
            SupplyRequest updatedRequest = supplyRequestRepository.save(supplyRequest);
            
            // 발주 상태 변경 시 웹소켓 알림 전송
            sendSupplyRequestStatusChangeNotification(updatedRequest, newStatus);
            
            return ResponseEntity.ok(updatedRequest);
        } catch (Exception e) {
            log.error("발주 요청 상태 업데이트 실패: id={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 발주 요청 취소
     * PATCH /api/supply-requests/{id}/cancel
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<SupplyRequest> cancelSupplyRequest(
            @PathVariable Long id,
            @RequestBody(required = false) StatusUpdateRequest request) {
        try {
            Optional<SupplyRequest> requestOpt = supplyRequestRepository.findById(id);
            if (requestOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            SupplyRequest supplyRequest = requestOpt.get();
            supplyRequest.setStatus(SupplyRequest.SupplyRequestStatus.CANCELLED);
            
            // 처리자 정보와 처리 시간이 있으면 저장
            if (request != null && request.getProcessedBy() != null) {
                if (request.getProcessedAt() != null) {
                    supplyRequest.setProcessedBy(request.getProcessedBy());
                    supplyRequest.setProcessedAt(request.getProcessedAt());
                } else {
                    supplyRequest.setProcessedInfo(request.getProcessedBy());
                }
            }
            
            SupplyRequest cancelledRequest = supplyRequestRepository.save(supplyRequest);
            
            // 발주 취소 시 웹소켓 알림 전송
            sendSupplyRequestStatusChangeNotification(cancelledRequest, SupplyRequest.SupplyRequestStatus.CANCELLED);
            
            return ResponseEntity.ok(cancelledRequest);
        } catch (Exception e) {
            log.error("발주 요청 취소 실패: id={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // DTO 클래스들
    public static class SupplyRequestCreateRequest {
        private Long requestingBranchId;
        private Long requesterId;
        private String requesterName;
        private String expectedDeliveryDate;
        private String priority;
        private String notes;
        private List<SupplyRequestItemRequest> items;
        
        // Getters and Setters
        public Long getRequestingBranchId() { return requestingBranchId; }
        public void setRequestingBranchId(Long requestingBranchId) { this.requestingBranchId = requestingBranchId; }
        
        public Long getRequesterId() { return requesterId; }
        public void setRequesterId(Long requesterId) { this.requesterId = requesterId; }
        
        public String getRequesterName() { return requesterName; }
        public void setRequesterName(String requesterName) { this.requesterName = requesterName; }
        
        public String getExpectedDeliveryDate() { return expectedDeliveryDate; }
        public void setExpectedDeliveryDate(String expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
        
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        
        public List<SupplyRequestItemRequest> getItems() { return items; }
        public void setItems(List<SupplyRequestItemRequest> items) { this.items = items; }
    }
    
    public static class SupplyRequestItemRequest {
        private Long materialId;
        private BigDecimal requestedQuantity;
        private String unit;
        private BigDecimal costPerUnit;
        
        // Getters and Setters
        public Long getMaterialId() { return materialId; }
        public void setMaterialId(Long materialId) { this.materialId = materialId; }
        
        public BigDecimal getRequestedQuantity() { return requestedQuantity; }
        public void setRequestedQuantity(BigDecimal requestedQuantity) { this.requestedQuantity = requestedQuantity; }
        
        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }
        
        public BigDecimal getCostPerUnit() { return costPerUnit; }
        public void setCostPerUnit(BigDecimal costPerUnit) { this.costPerUnit = costPerUnit; }
    }
    
    public static class StatusUpdateRequest {
        private String status;
        private String processedBy; // 처리자명
        private LocalDateTime processedAt; // 처리 시간
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        
        public String getProcessedBy() { return processedBy; }
        public void setProcessedBy(String processedBy) { this.processedBy = processedBy; }
        
        public LocalDateTime getProcessedAt() { return processedAt; }
        public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    }
    
    // 발주 상세 조회 응답 DTO
    public static class SupplyRequestDetailResponse {
        private Long id;
        private Long requestingBranchId;
        private Long requesterId;
        private String requesterName;
        private LocalDateTime requestDate;
        private String expectedDeliveryDate;
        private SupplyRequest.SupplyRequestStatus status;
        private SupplyRequest.SupplyRequestPriority priority;
        private BigDecimal totalCost;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String processedBy;
        private LocalDateTime processedAt;
        private List<SupplyRequestItemResponse> items;
        
        // Builder 패턴
        public static SupplyRequestDetailResponseBuilder builder() {
            return new SupplyRequestDetailResponseBuilder();
        }
        
        public static class SupplyRequestDetailResponseBuilder {
            private SupplyRequestDetailResponse response = new SupplyRequestDetailResponse();
            
            public SupplyRequestDetailResponseBuilder id(Long id) {
                response.id = id;
                return this;
            }
            
            public SupplyRequestDetailResponseBuilder requestingBranchId(Long requestingBranchId) {
                response.requestingBranchId = requestingBranchId;
                return this;
            }
            
            public SupplyRequestDetailResponseBuilder requesterId(Long requesterId) {
                response.requesterId = requesterId;
                return this;
            }
            
            public SupplyRequestDetailResponseBuilder requesterName(String requesterName) {
                response.requesterName = requesterName;
                return this;
            }
            
            public SupplyRequestDetailResponseBuilder requestDate(LocalDateTime requestDate) {
                response.requestDate = requestDate;
                return this;
            }
            
            public SupplyRequestDetailResponseBuilder expectedDeliveryDate(String expectedDeliveryDate) {
                response.expectedDeliveryDate = expectedDeliveryDate;
                return this;
            }
            
            public SupplyRequestDetailResponseBuilder status(SupplyRequest.SupplyRequestStatus status) {
                response.status = status;
                return this;
            }
            
            public SupplyRequestDetailResponseBuilder priority(SupplyRequest.SupplyRequestPriority priority) {
                response.priority = priority;
                return this;
            }
            
            public SupplyRequestDetailResponseBuilder totalCost(BigDecimal totalCost) {
                response.totalCost = totalCost;
                return this;
            }
            
            public SupplyRequestDetailResponseBuilder notes(String notes) {
                response.notes = notes;
                return this;
            }
            
            public SupplyRequestDetailResponseBuilder createdAt(LocalDateTime createdAt) {
                response.createdAt = createdAt;
                return this;
            }
            
            public SupplyRequestDetailResponseBuilder updatedAt(LocalDateTime updatedAt) {
                response.updatedAt = updatedAt;
                return this;
            }
            
            public SupplyRequestDetailResponseBuilder processedBy(String processedBy) {
                response.processedBy = processedBy;
                return this;
            }
            
            public SupplyRequestDetailResponseBuilder processedAt(LocalDateTime processedAt) {
                response.processedAt = processedAt;
                return this;
            }
            
            public SupplyRequestDetailResponseBuilder items(List<SupplyRequestItemResponse> items) {
                response.items = items;
                return this;
            }
            
            public SupplyRequestDetailResponse build() {
                return response;
            }
        }
        
        // Getters
        public Long getId() { return id; }
        public Long getRequestingBranchId() { return requestingBranchId; }
        public Long getRequesterId() { return requesterId; }
        public String getRequesterName() { return requesterName; }
        public LocalDateTime getRequestDate() { return requestDate; }
        public String getExpectedDeliveryDate() { return expectedDeliveryDate; }
        public SupplyRequest.SupplyRequestStatus getStatus() { return status; }
        public SupplyRequest.SupplyRequestPriority getPriority() { return priority; }
        public BigDecimal getTotalCost() { return totalCost; }
        public String getNotes() { return notes; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public String getProcessedBy() { return processedBy; }
        public LocalDateTime getProcessedAt() { return processedAt; }
        public List<SupplyRequestItemResponse> getItems() { return items; }
    }
    
    // 발주 요약 응답 DTO (목록 조회용)
    public static class SupplyRequestSummaryResponse {
        private Long id;
        private Long requestingBranchId;
        private Long requesterId;
        private String requesterName;
        private LocalDateTime requestDate;
        private String expectedDeliveryDate;
        private SupplyRequest.SupplyRequestStatus status;
        private SupplyRequest.SupplyRequestPriority priority;
        private BigDecimal totalCost;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String processedBy;
        private LocalDateTime processedAt;
        private List<SupplyRequestItemResponse> items;
        
        // Builder 패턴
        public static SupplyRequestSummaryResponseBuilder builder() {
            return new SupplyRequestSummaryResponseBuilder();
        }
        
        public static class SupplyRequestSummaryResponseBuilder {
            private SupplyRequestSummaryResponse response = new SupplyRequestSummaryResponse();
            
            public SupplyRequestSummaryResponseBuilder id(Long id) {
                response.id = id;
                return this;
            }
            
            public SupplyRequestSummaryResponseBuilder requestingBranchId(Long requestingBranchId) {
                response.requestingBranchId = requestingBranchId;
                return this;
            }
            
            public SupplyRequestSummaryResponseBuilder requesterId(Long requesterId) {
                response.requesterId = requesterId;
                return this;
            }
            
            public SupplyRequestSummaryResponseBuilder requesterName(String requesterName) {
                response.requesterName = requesterName;
                return this;
            }
            
            public SupplyRequestSummaryResponseBuilder requestDate(LocalDateTime requestDate) {
                response.requestDate = requestDate;
                return this;
            }
            
            public SupplyRequestSummaryResponseBuilder expectedDeliveryDate(String expectedDeliveryDate) {
                response.expectedDeliveryDate = expectedDeliveryDate;
                return this;
            }
            
            public SupplyRequestSummaryResponseBuilder status(SupplyRequest.SupplyRequestStatus status) {
                response.status = status;
                return this;
            }
            
            public SupplyRequestSummaryResponseBuilder priority(SupplyRequest.SupplyRequestPriority priority) {
                response.priority = priority;
                return this;
            }
            
            public SupplyRequestSummaryResponseBuilder totalCost(BigDecimal totalCost) {
                response.totalCost = totalCost;
                return this;
            }
            
            public SupplyRequestSummaryResponseBuilder notes(String notes) {
                response.notes = notes;
                return this;
            }
            
            public SupplyRequestSummaryResponseBuilder createdAt(LocalDateTime createdAt) {
                response.createdAt = createdAt;
                return this;
            }
            
            public SupplyRequestSummaryResponseBuilder updatedAt(LocalDateTime updatedAt) {
                response.updatedAt = updatedAt;
                return this;
            }
            
            public SupplyRequestSummaryResponseBuilder processedBy(String processedBy) {
                response.processedBy = processedBy;
                return this;
            }
            
            public SupplyRequestSummaryResponseBuilder processedAt(LocalDateTime processedAt) {
                response.processedAt = processedAt;
                return this;
            }
            
            public SupplyRequestSummaryResponseBuilder items(List<SupplyRequestItemResponse> items) {
                response.items = items;
                return this;
            }
            
            public SupplyRequestSummaryResponse build() {
                return response;
            }
        }
        
        // Getters
        public Long getId() { return id; }
        public Long getRequestingBranchId() { return requestingBranchId; }
        public Long getRequesterId() { return requesterId; }
        public String getRequesterName() { return requesterName; }
        public LocalDateTime getRequestDate() { return requestDate; }
        public String getExpectedDeliveryDate() { return expectedDeliveryDate; }
        public SupplyRequest.SupplyRequestStatus getStatus() { return status; }
        public SupplyRequest.SupplyRequestPriority getPriority() { return priority; }
        public BigDecimal getTotalCost() { return totalCost; }
        public String getNotes() { return notes; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public String getProcessedBy() { return processedBy; }
        public LocalDateTime getProcessedAt() { return processedAt; }
        public List<SupplyRequestItemResponse> getItems() { return items; }
    }
    
    // 발주 상품 응답 DTO
    public static class SupplyRequestItemResponse {
        private Long id;
        private Long materialId;
        private String materialName;
        private String materialCategory;
        private BigDecimal requestedQuantity;
        private String unit;
        private BigDecimal costPerUnit;
        private BigDecimal totalCost;
        
        // Builder 패턴
        public static SupplyRequestItemResponseBuilder builder() {
            return new SupplyRequestItemResponseBuilder();
        }
        
        public static class SupplyRequestItemResponseBuilder {
            private SupplyRequestItemResponse response = new SupplyRequestItemResponse();
            
            public SupplyRequestItemResponseBuilder id(Long id) {
                response.id = id;
                return this;
            }
            
            public SupplyRequestItemResponseBuilder materialId(Long materialId) {
                response.materialId = materialId;
                return this;
            }
            
            public SupplyRequestItemResponseBuilder materialName(String materialName) {
                response.materialName = materialName;
                return this;
            }
            
            public SupplyRequestItemResponseBuilder materialCategory(String materialCategory) {
                response.materialCategory = materialCategory;
                return this;
            }
            
            public SupplyRequestItemResponseBuilder requestedQuantity(BigDecimal requestedQuantity) {
                response.requestedQuantity = requestedQuantity;
                return this;
            }
            
            public SupplyRequestItemResponseBuilder unit(String unit) {
                response.unit = unit;
                return this;
            }
            
            public SupplyRequestItemResponseBuilder costPerUnit(BigDecimal costPerUnit) {
                response.costPerUnit = costPerUnit;
                return this;
            }
            
            public SupplyRequestItemResponseBuilder totalCost(BigDecimal totalCost) {
                response.totalCost = totalCost;
                return this;
            }
            
            public SupplyRequestItemResponse build() {
                return response;
            }
        }
        
        // Getters
        public Long getId() { return id; }
        public Long getMaterialId() { return materialId; }
        public String getMaterialName() { return materialName; }
        public String getMaterialCategory() { return materialCategory; }
        public BigDecimal getRequestedQuantity() { return requestedQuantity; }
        public String getUnit() { return unit; }
        public BigDecimal getCostPerUnit() { return costPerUnit; }
        public BigDecimal getTotalCost() { return totalCost; }
    }

    /**
     * 배송 완료 시 재고 업데이트
     */
    private void updateInventoryOnDelivery(SupplyRequest supplyRequest) {
        try {
            log.info("배송 완료 시 재고 업데이트 시작: supplyRequestId={}, branchId={}", 
                    supplyRequest.getId(), supplyRequest.getRequestingBranchId());
            
            // 발주 아이템 목록 조회
            List<SupplyRequestItem> items = supplyRequestItemRepository.findBySupplyRequestId(supplyRequest.getId());
            
            for (SupplyRequestItem item : items) {
                Long materialId = item.getMaterial().getId();
                Long branchId = supplyRequest.getRequestingBranchId();
                BigDecimal quantity = item.getRequestedQuantity();
                String unit = item.getUnit();
                BigDecimal costPerUnit = item.getCostPerUnit();
                
                log.info("재고 업데이트: materialId={}, branchId={}, quantity={}, unit={}", 
                        materialId, branchId, quantity, unit);
                
                // 해당 지점의 재고 정보 조회
                MaterialStock existingStock = materialStockRepository.findByBranchIdAndMaterialId(branchId, materialId);
                
                if (existingStock != null) {
                    // 기존 재고가 있는 경우 수량 증가
                    BigDecimal newCurrentStock = existingStock.getCurrentStock().add(quantity);
                    existingStock.setCurrentStock(newCurrentStock);
                    existingStock.setLastUpdated(LocalDateTime.now());
                    
                    materialStockRepository.save(existingStock);
                    log.info("기존 재고 업데이트 완료: materialId={}, branchId={}, 기존수량={}, 추가수량={}, 새수량={}", 
                            materialId, branchId, existingStock.getCurrentStock().subtract(quantity), quantity, newCurrentStock);
                    
                } else {
                    // 기존 재고가 없는 경우 새로 생성
                    Material material = item.getMaterial();
                    Branches branch = branchesRepository.findById(branchId)
                            .orElseThrow(() -> new RuntimeException("지점을 찾을 수 없습니다: " + branchId));
                    
                    MaterialStock newStock = MaterialStock.builder()
                            .material(material)
                            .branch(branch)
                            .currentStock(quantity)
                            .minStock(BigDecimal.ZERO)
                            .maxStock(BigDecimal.valueOf(1000)) // 기본값 설정
                            .reservedStock(BigDecimal.ZERO)
                            .lastUpdated(LocalDateTime.now())
                            .createdAt(LocalDateTime.now())
                            .build();
                    
                    materialStockRepository.save(newStock);
                    log.info("새 재고 생성 완료: materialId={}, branchId={}, 수량={}", 
                            materialId, branchId, quantity);
                }
                
                // 재고 이동 이력 기록
                try {
                    log.info("StockMovement 생성 시작: materialId={}, branchId={}, quantity={}, costPerUnit={}", 
                            materialId, branchId, quantity, costPerUnit);
                    
                    StockMovement movement = StockMovement.builder()
                            .material(item.getMaterial())
                            .branch(branchesRepository.findById(branchId).orElse(null))
                            .movementType(StockMovement.MovementType.SUPPLY_IN)
                            .quantity(quantity)
                            .unit(unit)
                            .costPerUnit(costPerUnit)
                            .totalCost(quantity.multiply(costPerUnit))
                            .referenceId(supplyRequest.getId())
                            .referenceType("SUPPLY_REQUEST")
                            .notes("발주 요청 배송 완료로 인한 재고 입고")
                            .movementDate(LocalDateTime.now())
                            .createdAt(LocalDateTime.now())
                            .build();
                    
                    log.info("StockMovement 객체 생성 완료: {}", movement);
                    
                    StockMovement savedMovement = stockMovementRepository.save(movement);
                    log.info("재고 이동 이력 저장 완료: id={}, materialId={}, branchId={}, 수량={}, 타입={}", 
                            savedMovement.getId(), materialId, branchId, quantity, StockMovement.MovementType.SUPPLY_IN);
                            
                } catch (Exception e) {
                    log.error("StockMovement 저장 실패: materialId={}, branchId={}, error={}", materialId, branchId, e.getMessage(), e);
                    // StockMovement 저장 실패는 전체 트랜잭션에 영향을 주지 않도록 처리
                }
            }
            
            log.info("배송 완료 시 재고 업데이트 완료: supplyRequestId={}", supplyRequest.getId());
            
        } catch (Exception e) {
            log.error("배송 완료 시 재고 업데이트 실패: supplyRequestId={}", supplyRequest.getId(), e);
            throw new RuntimeException("재고 업데이트 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 발주 이력 응답 DTO
     */
    public static class SupplyRequestHistoryResponse {
        private Long id;
        private String orderNumber;
        private Long branchId;
        private String branchName;
        private String branchRegion;
        private Long requesterId;
        private String requesterName;
        private LocalDateTime requestDate;
        private String expectedDeliveryDate;
        private SupplyRequest.SupplyRequestStatus status;
        private SupplyRequest.SupplyRequestPriority priority;
        private BigDecimal totalCost;
        private Integer totalItems;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String processedBy;
        private LocalDateTime processedAt;
        private List<SupplyRequestItemDetailResponse> items;
        
        // Builder 패턴
        public static SupplyRequestHistoryResponseBuilder builder() {
            return new SupplyRequestHistoryResponseBuilder();
        }
        
        public static class SupplyRequestHistoryResponseBuilder {
            private SupplyRequestHistoryResponse response = new SupplyRequestHistoryResponse();
            
            public SupplyRequestHistoryResponseBuilder id(Long id) {
                response.id = id;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder orderNumber(String orderNumber) {
                response.orderNumber = orderNumber;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder branchId(Long branchId) {
                response.branchId = branchId;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder branchName(String branchName) {
                response.branchName = branchName;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder branchRegion(String branchRegion) {
                response.branchRegion = branchRegion;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder requesterId(Long requesterId) {
                response.requesterId = requesterId;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder requesterName(String requesterName) {
                response.requesterName = requesterName;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder requestDate(LocalDateTime requestDate) {
                response.requestDate = requestDate;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder expectedDeliveryDate(String expectedDeliveryDate) {
                response.expectedDeliveryDate = expectedDeliveryDate;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder status(SupplyRequest.SupplyRequestStatus status) {
                response.status = status;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder priority(SupplyRequest.SupplyRequestPriority priority) {
                response.priority = priority;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder totalCost(BigDecimal totalCost) {
                response.totalCost = totalCost;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder totalItems(Integer totalItems) {
                response.totalItems = totalItems;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder notes(String notes) {
                response.notes = notes;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder createdAt(LocalDateTime createdAt) {
                response.createdAt = createdAt;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder updatedAt(LocalDateTime updatedAt) {
                response.updatedAt = updatedAt;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder processedBy(String processedBy) {
                response.processedBy = processedBy;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder processedAt(LocalDateTime processedAt) {
                response.processedAt = processedAt;
                return this;
            }
            
            public SupplyRequestHistoryResponseBuilder items(List<SupplyRequestItemDetailResponse> items) {
                response.items = items;
                return this;
            }
            
            public SupplyRequestHistoryResponse build() {
                return response;
            }
        }
        
        // Getters
        public Long getId() { return id; }
        public String getOrderNumber() { return orderNumber; }
        public Long getBranchId() { return branchId; }
        public String getBranchName() { return branchName; }
        public String getBranchRegion() { return branchRegion; }
        public Long getRequesterId() { return requesterId; }
        public String getRequesterName() { return requesterName; }
        public LocalDateTime getRequestDate() { return requestDate; }
        public String getExpectedDeliveryDate() { return expectedDeliveryDate; }
        public SupplyRequest.SupplyRequestStatus getStatus() { return status; }
        public SupplyRequest.SupplyRequestPriority getPriority() { return priority; }
        public BigDecimal getTotalCost() { return totalCost; }
        public Integer getTotalItems() { return totalItems; }
        public String getNotes() { return notes; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public String getProcessedBy() { return processedBy; }
        public LocalDateTime getProcessedAt() { return processedAt; }
        public List<SupplyRequestItemDetailResponse> getItems() { return items; }
    }

    /**
     * 발주 상품 상세 응답 DTO
     */
    public static class SupplyRequestItemDetailResponse {
        private Long id;
        private Long materialId;
        private String materialName;
        private String materialCategory;
        private BigDecimal requestedQuantity;
        private BigDecimal approvedQuantity;
        private BigDecimal deliveredQuantity;
        private String unit;
        private BigDecimal costPerUnit;
        private BigDecimal totalCost;
        private SupplyRequestItem.SupplyRequestItemStatus status;
        
        // Builder 패턴
        public static SupplyRequestItemDetailResponseBuilder builder() {
            return new SupplyRequestItemDetailResponseBuilder();
        }
        
        public static class SupplyRequestItemDetailResponseBuilder {
            private SupplyRequestItemDetailResponse response = new SupplyRequestItemDetailResponse();
            
            public SupplyRequestItemDetailResponseBuilder id(Long id) {
                response.id = id;
                return this;
            }
            
            public SupplyRequestItemDetailResponseBuilder materialId(Long materialId) {
                response.materialId = materialId;
                return this;
            }
            
            public SupplyRequestItemDetailResponseBuilder materialName(String materialName) {
                response.materialName = materialName;
                return this;
            }
            
            public SupplyRequestItemDetailResponseBuilder materialCategory(String materialCategory) {
                response.materialCategory = materialCategory;
                return this;
            }
            
            public SupplyRequestItemDetailResponseBuilder requestedQuantity(BigDecimal requestedQuantity) {
                response.requestedQuantity = requestedQuantity;
                return this;
            }
            
            public SupplyRequestItemDetailResponseBuilder approvedQuantity(BigDecimal approvedQuantity) {
                response.approvedQuantity = approvedQuantity;
                return this;
            }
            
            public SupplyRequestItemDetailResponseBuilder deliveredQuantity(BigDecimal deliveredQuantity) {
                response.deliveredQuantity = deliveredQuantity;
                return this;
            }
            
            public SupplyRequestItemDetailResponseBuilder unit(String unit) {
                response.unit = unit;
                return this;
            }
            
            public SupplyRequestItemDetailResponseBuilder costPerUnit(BigDecimal costPerUnit) {
                response.costPerUnit = costPerUnit;
                return this;
            }
            
            public SupplyRequestItemDetailResponseBuilder totalCost(BigDecimal totalCost) {
                response.totalCost = totalCost;
                return this;
            }
            
            public SupplyRequestItemDetailResponseBuilder status(SupplyRequestItem.SupplyRequestItemStatus status) {
                response.status = status;
                return this;
            }
            
            public SupplyRequestItemDetailResponse build() {
                return response;
            }
        }
        
        // Getters
        public Long getId() { return id; }
        public Long getMaterialId() { return materialId; }
        public String getMaterialName() { return materialName; }
        public String getMaterialCategory() { return materialCategory; }
        public BigDecimal getRequestedQuantity() { return requestedQuantity; }
        public BigDecimal getApprovedQuantity() { return approvedQuantity; }
        public BigDecimal getDeliveredQuantity() { return deliveredQuantity; }
        public String getUnit() { return unit; }
        public BigDecimal getCostPerUnit() { return costPerUnit; }
        public BigDecimal getTotalCost() { return totalCost; }
        public SupplyRequestItem.SupplyRequestItemStatus getStatus() { return status; }
    }
    
    /**
     * 발주 상태 변경 시 웹소켓 알림 전송
     */
    private void sendSupplyRequestStatusChangeNotification(SupplyRequest request, SupplyRequest.SupplyRequestStatus newStatus) {
        try {
            log.info("발주 상태 변경 알림 생성 시작 - 발주 ID: {}, 지점 ID: {}", request.getId(), request.getRequestingBranchId());
            
            // newStatus가 null인 경우 request의 현재 상태 사용
            if (newStatus == null) {
                newStatus = request.getStatus();
                log.info("newStatus가 null이므로 request 상태 사용: {}", newStatus);
            }
            
            String statusText = getSupplyRequestStatusText(newStatus);
            String category = getSupplyRequestNotificationCategory(newStatus);
            
            NotificationDTO notification = NotificationDTO.builder()
                    .id(System.currentTimeMillis()) // 임시 ID
                    .type(NotificationDTO.TYPE_ORDER)
                    .category(category)
                    .title("발주 상태 변경")
                    .message(generateSupplyRequestStatusMessage(request, statusText))
                    .targetType(NotificationDTO.TARGET_TYPE_ORDER)
                    .targetId(request.getId())
                    .targetName("발주 요청 #" + request.getId())
                    .targetDetail(String.format("{\"supplyRequestId\":%d,\"status\":\"%s\",\"requestingBranchId\":%d,\"totalCost\":%s,\"notes\":\"%s\"}", 
                            request.getId(), newStatus, request.getRequestingBranchId(), request.getTotalCost(), request.getNotes()))
                    .timestamp(LocalDateTime.now())
                    .isRead(false)
                    .branchId(request.getRequestingBranchId())
                    .userId(null)
                    .userName("본사")
                    .build();
            
            log.info("발주 알림 생성 완료 - 제목: {}, 메시지: {}", notification.getTitle(), notification.getMessage());
            
            // 해당 지점에 웹소켓 알림 전송
            webSocketNotificationService.sendNotificationToBranch(request.getRequestingBranchId(), notification);
            log.info("발주 웹소켓 알림 전송 완료 - 지점 ID: {}", request.getRequestingBranchId());
            
        } catch (Exception e) {
            log.error("발주 상태 변경 알림 전송 실패: {}", e.getMessage(), e);
        }
    }
    
    /**
     * 발주 상태에 따른 알림 카테고리 결정
     */
    private String getSupplyRequestNotificationCategory(SupplyRequest.SupplyRequestStatus status) {
        switch (status) {
            case APPROVED:
                return NotificationDTO.CATEGORY_SUCCESS;
            case CANCELLED:
                return NotificationDTO.CATEGORY_WARNING;
            case IN_TRANSIT:
            case DELIVERED:
                return NotificationDTO.CATEGORY_INFO;
            default:
                return NotificationDTO.CATEGORY_INFO;
        }
    }
    
    /**
     * 발주 상태 텍스트 변환
     */
    private String getSupplyRequestStatusText(SupplyRequest.SupplyRequestStatus status) {
        switch (status) {
            case PENDING:
                return "승인 대기";
            case APPROVED:
                return "승인됨";
            case IN_TRANSIT:
                return "배송 중";
            case CANCELLED:
                return "취소됨";
            case DELIVERED:
                return "배송 완료";
            default:
                return status.toString();
        }
    }
    
    /**
     * 발주 상태 변경 메시지 생성
     */
    private String generateSupplyRequestStatusMessage(SupplyRequest request, String statusText) {
        return String.format("발주 요청 #%d이 %s 상태로 변경되었습니다. (총 금액: %s원)", 
                request.getId(), statusText, request.getTotalCost());
    }
}
