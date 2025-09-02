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
public class FranchiseSalesResponseDto {
    
    // 가맹점별 상품 매출 데이터
    private List<FranchiseProductSales> franchiseProductSales;
    
    // 지점별 인기 메뉴 데이터
    private List<BranchTopMenus> branchTopMenus;
    
    // 상품별 수익률 데이터
    private List<ProductProfitMargin> productProfitMargins;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FranchiseProductSales {
        private String productName;
        private Long productId;
        private String category;
        private Map<String, BigDecimal> salesByFranchise; // 지점명 -> 매출액
        private BigDecimal totalSales;
        private Long totalQuantity;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchTopMenus {
        private String branchName;
        private List<TopMenu> topMenus; // 상위 5개 메뉴
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopMenu {
        private String productName;
        private Long productId;
        private String category;
        private BigDecimal sales;
        private Long quantity;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductProfitMargin {
        private String productName;
        private Long productId;
        private String category;
        private BigDecimal price;
        private BigDecimal cost;
        private Double profitMargin;
        private BigDecimal monthlySales;
        private Long monthlyQuantity;
    }
}
