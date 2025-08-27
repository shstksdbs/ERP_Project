package erp_project.erp_project.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CostHistoryDTO {
    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal oldCost;
    private BigDecimal newCost;
    private LocalDateTime changeDate;
    private String reason;
    private String updatedBy;
}
