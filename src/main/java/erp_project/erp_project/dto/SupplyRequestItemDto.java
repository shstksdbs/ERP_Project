package erp_project.erp_project.dto;

import erp_project.erp_project.entity.SupplyRequestItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplyRequestItemDto {
    
    private Long id;
    private Long supplyRequestId;
    private Long materialId;
    private String materialName;
    private String materialCode;
    private BigDecimal requestedQuantity;
    private BigDecimal approvedQuantity;
    private BigDecimal deliveredQuantity;
    private String unit;
    private BigDecimal costPerUnit;
    private BigDecimal totalCost;
    private SupplyRequestItem.SupplyRequestItemStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String statusDisplay;
    
    // 상태 표시용 메서드
    public String getStatusDisplay() {
        if (status == null) return "";
        switch (status) {
            case PENDING: return "대기중";
            case APPROVED: return "승인됨";
            case PARTIALLY_DELIVERED: return "부분 배송";
            case DELIVERED: return "배송완료";
            default: return status.toString();
        }
    }
}
