package erp_project.erp_project.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductCostDTO {
    private Long id;
    private String name;
    private String code;
    private String category;
    private BigDecimal sellingPrice;
    private BigDecimal costPrice;
    private BigDecimal margin;
    private BigDecimal costRatio;
    private LocalDateTime lastUpdated;
    private String status;
    private String newCostPrice;
    private String changeReason;
}
