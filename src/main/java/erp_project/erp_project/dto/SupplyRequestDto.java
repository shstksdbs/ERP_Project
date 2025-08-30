package erp_project.erp_project.dto;

import erp_project.erp_project.entity.SupplyRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplyRequestDto {
    
    private Long id;
    private Long requestingBranchId;
    private String branchName;
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
    private List<SupplyRequestItemDto> items;
    private Integer totalItems;
    private String statusDisplay;
    private String priorityDisplay;
    
    // 상태 표시용 메서드
    public String getStatusDisplay() {
        if (status == null) return "";
        switch (status) {
            case PENDING: return "대기중";
            case APPROVED: return "승인됨";
            case IN_TRANSIT: return "배송중";
            case DELIVERED: return "배송완료";
            case CANCELLED: return "취소됨";
            default: return status.toString();
        }
    }
    
    // 우선순위 표시용 메서드
    public String getPriorityDisplay() {
        if (priority == null) return "";
        switch (priority) {
            case LOW: return "낮음";
            case NORMAL: return "보통";
            case HIGH: return "높음";
            case URGENT: return "긴급";
            default: return priority.toString();
        }
    }
}
