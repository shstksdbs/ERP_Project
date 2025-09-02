package erp_project.erp_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesOverviewResponseDto {
    
    private SalesSummaryDto summary;
    private List<FranchiseSalesDto> franchises;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesSummaryDto {
        private BigDecimal totalSales;
        private Integer totalCustomers;
        private Integer franchiseCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FranchiseSalesDto {
        private Long branchId;
        private String branchName;
        private String branchCode;
        private String managerName;
        private String branchType;
        private BigDecimal monthlySales;
        private Integer totalOrders;
        private BigDecimal avgOrderValue;
        private List<TopProductDto> topProducts;
        private Map<String, BigDecimal> salesByCategory;
        private Map<String, BigDecimal> salesByTime;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProductDto {
        private String name;
        private Integer quantity;
        private BigDecimal sales;
    }
}
