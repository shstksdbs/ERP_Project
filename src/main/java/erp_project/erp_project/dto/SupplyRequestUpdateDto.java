package erp_project.erp_project.dto;

import erp_project.erp_project.entity.SupplyRequest;
import erp_project.erp_project.entity.SupplyRequestItem;
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
public class SupplyRequestUpdateDto {
    
    private Long id;
    private SupplyRequest.SupplyRequestStatus status;
    private String notes;
    private List<SupplyRequestItemUpdateDto> items;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplyRequestItemUpdateDto {
        private Long id;
        private BigDecimal approvedQuantity;
        private BigDecimal deliveredQuantity;
        private SupplyRequestItem.SupplyRequestItemStatus status;
        private String notes;
    }
}
