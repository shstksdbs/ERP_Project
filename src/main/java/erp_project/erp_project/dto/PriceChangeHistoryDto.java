package erp_project.erp_project.dto;

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
public class PriceChangeHistoryDto {
    
    private Long id;
    private Long menuId;
    private String menuName;
    private BigDecimal oldPrice;
    private BigDecimal newPrice;
    private BigDecimal changeAmount;
    private String reason;
    private String updatedBy;
    private LocalDateTime changeDate;
}
