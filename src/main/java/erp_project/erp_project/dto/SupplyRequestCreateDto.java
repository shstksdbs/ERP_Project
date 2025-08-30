package erp_project.erp_project.dto;

import erp_project.erp_project.entity.SupplyRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplyRequestCreateDto {
    
    private Long requestingBranchId;
    private Long requesterId;
    private String requesterName;
    private String expectedDeliveryDate;
    private SupplyRequest.SupplyRequestPriority priority;
    private String notes;
    private List<SupplyRequestItemCreateDto> items;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplyRequestItemCreateDto {
        private Long materialId;
        private BigDecimal requestedQuantity;
        private String unit;
        private BigDecimal costPerUnit;
        private String notes;
    }
}
