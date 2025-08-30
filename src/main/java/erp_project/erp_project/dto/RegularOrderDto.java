package erp_project.erp_project.dto;

import erp_project.erp_project.entity.RegularOrder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegularOrderDto {
    
    private Long id;
    private Long branchId;
    private String orderName;
    private String description;
    private String cycleType;
    private Integer cycleValue;
    private Boolean isActive;
    private LocalDate nextOrderDate;
    private LocalDate lastOrderDate;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<RegularOrderItemDto> items;
    private BigDecimal totalAmount;
    
    // Entity를 DTO로 변환하는 정적 메서드
    public static RegularOrderDto fromEntity(RegularOrder regularOrder) {
        RegularOrderDto dto = RegularOrderDto.builder()
                .id(regularOrder.getId())
                .branchId(regularOrder.getBranchId())
                .orderName(regularOrder.getOrderName())
                .description(regularOrder.getDescription())
                .cycleType(regularOrder.getCycleType().name())
                .cycleValue(regularOrder.getCycleValue())
                .isActive(regularOrder.getIsActive())
                .nextOrderDate(regularOrder.getNextOrderDate())
                .lastOrderDate(regularOrder.getLastOrderDate())
                .createdBy(regularOrder.getCreatedBy())
                .createdAt(regularOrder.getCreatedAt())
                .updatedAt(regularOrder.getUpdatedAt())
                .build();
        
        // 아이템 리스트 변환
        if (regularOrder.getItems() != null) {
            dto.setItems(regularOrder.getItems().stream()
                    .map(RegularOrderItemDto::fromEntity)
                    .collect(Collectors.toList()));
        }
        
        // 총 금액 계산
        if (dto.getItems() != null) {
            BigDecimal total = dto.getItems().stream()
                    .map(item -> item.getTotalCost() != null ? item.getTotalCost() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            dto.setTotalAmount(total);
        }
        
        return dto;
    }
    
    // DTO를 Entity로 변환하는 메서드
    public RegularOrder toEntity() {
        return RegularOrder.builder()
                .id(this.id)
                .branchId(this.branchId)
                .orderName(this.orderName)
                .description(this.description)
                .cycleType(RegularOrder.OrderCycleType.valueOf(this.cycleType))
                .cycleValue(this.cycleValue)
                .isActive(this.isActive)
                .nextOrderDate(this.nextOrderDate)
                .lastOrderDate(this.lastOrderDate)
                .createdBy(this.createdBy)
                .build();
    }
}
