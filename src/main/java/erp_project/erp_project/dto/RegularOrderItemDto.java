package erp_project.erp_project.dto;

import erp_project.erp_project.entity.RegularOrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import erp_project.erp_project.entity.Material;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegularOrderItemDto {
    
    private Long id;
    private Long regularOrderId;
    private Long materialId;
    private String materialName;
    private BigDecimal requestedQuantity;
    private String unit;
    private BigDecimal costPerUnit;
    private BigDecimal totalCost;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Entity를 DTO로 변환하는 정적 메서드
    public static RegularOrderItemDto fromEntity(RegularOrderItem item) {
        RegularOrderItemDto dto = RegularOrderItemDto.builder()
                .id(item.getId())
                .regularOrderId(item.getRegularOrder().getId())
                .materialId(item.getMaterial().getId())
                .materialName(item.getMaterial().getName())
                .requestedQuantity(item.getRequestedQuantity())
                .unit(item.getUnit())
                .costPerUnit(item.getCostPerUnit())
                .totalCost(item.getTotalCost())
                .notes(item.getNotes())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
        
        return dto;
    }
    
    // DTO를 Entity로 변환하는 메서드
    public RegularOrderItem toEntity() {
        RegularOrderItem item = RegularOrderItem.builder()
                .id(this.id)
                .requestedQuantity(this.requestedQuantity)
                .unit(this.unit)
                .costPerUnit(this.costPerUnit)
                .notes(this.notes)
                .build();
        
        // Material 객체 생성 및 설정
        if (this.materialId != null) {
            Material material = new Material();
            material.setId(this.materialId);
            item.setMaterial(material);
        }
        
        return item;
    }
}
