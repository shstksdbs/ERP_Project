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
public class ProductSalesResponseDto {
    
    // 요약 정보
    private BigDecimal totalSales;
    private Long totalQuantity;
    private BigDecimal averageProfitMargin;
    private Long totalProducts;
    
    // 상품별 매출 데이터
    private List<ProductSalesDto> productSales;
    
    // 카테고리별 매출 분포
    private Map<String, BigDecimal> categorySales;
    
    // 일별 매출 추이 (상품별)
    private Map<String, List<DailySalesDto>> dailySalesTrend;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSalesDto {
        private Long productId;
        private String productName;
        private String productCode;
        private String category;
        private BigDecimal price;
        private BigDecimal cost;
        private BigDecimal monthlySales;
        private Long monthlyQuantity;
        private BigDecimal profitMargin;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySalesDto {
        private Integer day;
        private BigDecimal sales;
        private Long quantity;
    }
}
