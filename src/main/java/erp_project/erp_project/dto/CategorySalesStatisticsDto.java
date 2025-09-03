package erp_project.erp_project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategorySalesStatisticsDto {
    private String category;
    private Long totalQuantitySold;
    private BigDecimal totalSales;
}
