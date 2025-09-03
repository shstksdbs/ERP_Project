package erp_project.erp_project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSalesStatisticsDto {
    private Long menuId;
    private String menuName;
    private String category;
    private BigDecimal price;
    private Long totalQuantitySold;
    private BigDecimal totalSales;
    private BigDecimal totalDiscount;
    private BigDecimal netSales;
}
