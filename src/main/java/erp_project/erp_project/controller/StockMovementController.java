package erp_project.erp_project.controller;

import erp_project.erp_project.entity.StockMovement;
import erp_project.erp_project.repository.StockMovementRepository;
import erp_project.erp_project.repository.MaterialStockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stock-movements")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class StockMovementController {
    
    private final StockMovementRepository stockMovementRepository;
    private final MaterialStockRepository materialStockRepository;
    
    /**
     * 특정 지점의 재고 이동 이력 조회
     * GET /api/stock-movements/branch/{branchId}
     */
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<StockMovementResponse>> getStockMovementsByBranch(
            @PathVariable Long branchId,
            @RequestParam(required = false) String movementType,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String searchTerm) {
        try {
            log.info("지점별 재고 이동 이력 조회: branchId={}, movementType={}, startDate={}, endDate={}, searchTerm={}", 
                    branchId, movementType, startDate, endDate, searchTerm);
            
            List<StockMovement> movements;
            
            // 기본적으로 지점별 조회
            if (movementType != null && !movementType.equals("all")) {
                movements = stockMovementRepository.findByBranchIdAndMovementTypeOrderByMovementDateDesc(
                    branchId, StockMovement.MovementType.valueOf(movementType.toUpperCase()));
            } else {
                movements = stockMovementRepository.findByBranchIdOrderByMovementDateDesc(branchId);
            }
            
            // 날짜 범위 필터링
            if (startDate != null && endDate != null) {
                LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
                LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
                movements = movements.stream()
                    .filter(movement -> movement.getMovementDate().isAfter(start) && 
                                       movement.getMovementDate().isBefore(end))
                    .collect(Collectors.toList());
            }
            
            // 검색어 필터링
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                movements = movements.stream()
                    .filter(movement -> movement.getMaterial().getName().toLowerCase()
                        .contains(searchTerm.toLowerCase()))
                    .collect(Collectors.toList());
            }
            
            // 응답 DTO 변환
            List<StockMovementResponse> responses = movements.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
            
            log.info("재고 이동 이력 조회 완료: {}건", responses.size());
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            log.error("재고 이동 이력 조회 실패: branchId={}", branchId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 특정 자재의 재고 이동 이력 조회
     * GET /api/stock-movements/material/{materialId}
     */
    @GetMapping("/material/{materialId}")
    public ResponseEntity<List<StockMovementResponse>> getStockMovementsByMaterial(
            @PathVariable Long materialId,
            @RequestParam(required = false) Long branchId) {
        try {
            List<StockMovement> movements;
            if (branchId != null) {
                movements = stockMovementRepository.findByMaterialIdAndBranchIdOrderByMovementDateDesc(materialId, branchId);
            } else {
                movements = stockMovementRepository.findByMaterialIdOrderByMovementDateDesc(materialId);
            }
            
            List<StockMovementResponse> responses = movements.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            log.error("자재별 재고 이동 이력 조회 실패: materialId={}", materialId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 재고 이동 이력을 응답 DTO로 변환
     */
    private StockMovementResponse convertToResponse(StockMovement movement) {
        // 이전 재고와 현재 재고 계산
        Long materialId = movement.getMaterial().getId();
        Long branchId = movement.getBranch().getId();
        
        // 현재 재고 조회
        Integer currentStock = 0;
        try {
            var stock = materialStockRepository.findByBranchIdAndMaterialId(branchId, materialId);
            if (stock != null) {
                currentStock = stock.getCurrentStock().intValue();
            }
        } catch (Exception e) {
            log.warn("재고 정보 조회 실패: materialId={}, branchId={}", materialId, branchId);
        }
        
        // 이전 재고 계산 (현재 재고 - 이동 수량)
        Integer previousStock = currentStock;
        if (movement.getMovementType() == StockMovement.MovementType.SUPPLY_IN) {
            previousStock = currentStock - movement.getQuantity().intValue();
        } else if (movement.getMovementType() == StockMovement.MovementType.SALE_DEDUCTION) {
            previousStock = currentStock + movement.getQuantity().intValue();
        }
        
        return StockMovementResponse.builder()
                .id(movement.getId())
                .itemName(movement.getMaterial().getName())
                .itemCategory(movement.getMaterial().getCategory())
                .type(convertMovementTypeToFrontendType(movement.getMovementType()))
                .quantity(movement.getQuantity().intValue())
                .previousStock(previousStock)
                .currentStock(currentStock)
                .reason(getMovementReason(movement))
                .employeeName(movement.getNotes() != null ? movement.getNotes() : "시스템")
                .timestamp(movement.getMovementDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
                .unit(movement.getUnit())
                .costPerUnit(movement.getCostPerUnit())
                .totalCost(movement.getTotalCost())
                .referenceType(movement.getReferenceType())
                .referenceId(movement.getReferenceId())
                .build();
    }
    
    /**
     * MovementType을 프론트엔드 타입으로 변환
     */
    private String convertMovementTypeToFrontendType(StockMovement.MovementType movementType) {
        switch (movementType) {
            case SUPPLY_IN:
                return "in";
            case SALE_DEDUCTION:
                return "out";
            case ADJUSTMENT:
                return "adjustment";
            case LOSS:
                return "out";
            case RETURN:
                return "in";
            default:
                return "adjustment";
        }
    }
    
    /**
     * 이동 사유 생성
     */
    private String getMovementReason(StockMovement movement) {
        switch (movement.getMovementType()) {
            case SUPPLY_IN:
                if ("SUPPLY_REQUEST".equals(movement.getReferenceType())) {
                    return "발주 입고";
                } else if ("RETURN".equals(movement.getReferenceType())) {
                    return "반품 입고";
                }
                return "입고";
            case SALE_DEDUCTION:
                return "주문 출고";
            case ADJUSTMENT:
                return "재고 조정";
            case LOSS:
                return "재고 손실";
            case RETURN:
                return "반품";
            default:
                return "기타";
        }
    }
    
    /**
     * 재고 이동 이력 응답 DTO
     */
    public static class StockMovementResponse {
        private Long id;
        private String itemName;
        private String itemCategory;
        private String type;
        private Integer quantity;
        private Integer previousStock;
        private Integer currentStock;
        private String reason;
        private String employeeName;
        private String timestamp;
        private String unit;
        private java.math.BigDecimal costPerUnit;
        private java.math.BigDecimal totalCost;
        private String referenceType;
        private Long referenceId;
        
        // Builder 패턴
        public static StockMovementResponseBuilder builder() {
            return new StockMovementResponseBuilder();
        }
        
        public static class StockMovementResponseBuilder {
            private StockMovementResponse response = new StockMovementResponse();
            
            public StockMovementResponseBuilder id(Long id) {
                response.id = id;
                return this;
            }
            
            public StockMovementResponseBuilder itemName(String itemName) {
                response.itemName = itemName;
                return this;
            }
            
            public StockMovementResponseBuilder itemCategory(String itemCategory) {
                response.itemCategory = itemCategory;
                return this;
            }
            
            public StockMovementResponseBuilder type(String type) {
                response.type = type;
                return this;
            }
            
            public StockMovementResponseBuilder quantity(Integer quantity) {
                response.quantity = quantity;
                return this;
            }
            
            public StockMovementResponseBuilder previousStock(Integer previousStock) {
                response.previousStock = previousStock;
                return this;
            }
            
            public StockMovementResponseBuilder currentStock(Integer currentStock) {
                response.currentStock = currentStock;
                return this;
            }
            
            public StockMovementResponseBuilder reason(String reason) {
                response.reason = reason;
                return this;
            }
            
            public StockMovementResponseBuilder employeeName(String employeeName) {
                response.employeeName = employeeName;
                response.employeeName = employeeName;
                return this;
            }
            
            public StockMovementResponseBuilder timestamp(String timestamp) {
                response.timestamp = timestamp;
                return this;
            }
            
            public StockMovementResponseBuilder unit(String unit) {
                response.unit = unit;
                return this;
            }
            
            public StockMovementResponseBuilder costPerUnit(java.math.BigDecimal costPerUnit) {
                response.costPerUnit = costPerUnit;
                return this;
            }
            
            public StockMovementResponseBuilder totalCost(java.math.BigDecimal totalCost) {
                response.totalCost = totalCost;
                return this;
            }
            
            public StockMovementResponseBuilder referenceType(String referenceType) {
                response.referenceType = referenceType;
                return this;
            }
            
            public StockMovementResponseBuilder referenceId(Long referenceId) {
                response.referenceId = referenceId;
                return this;
            }
            
            public StockMovementResponse build() {
                return response;
            }
        }
        
        // Getters
        public Long getId() { return id; }
        public String getItemName() { return itemName; }
        public String getItemCategory() { return itemCategory; }
        public String getType() { return type; }
        public Integer getQuantity() { return quantity; }
        public Integer getPreviousStock() { return previousStock; }
        public Integer getCurrentStock() { return currentStock; }
        public String getReason() { return reason; }
        public String getEmployeeName() { return employeeName; }
        public String getTimestamp() { return timestamp; }
        public String getUnit() { return unit; }
        public java.math.BigDecimal getCostPerUnit() { return costPerUnit; }
        public java.math.BigDecimal getTotalCost() { return totalCost; }
        public String getReferenceType() { return referenceType; }
        public Long getReferenceId() { return referenceId; }
    }
}
