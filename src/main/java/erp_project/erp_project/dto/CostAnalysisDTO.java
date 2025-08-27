package erp_project.erp_project.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CostAnalysisDTO {
    private Long categoryId;
    private String categoryName;
    private String categoryCode;
    private Integer menuCount;
    private BigDecimal avgMargin;
    private BigDecimal avgCostRatio;
    private List<MiniProductDTO> products;
    
    @Data
    public static class MiniProductDTO {
        private Long id;
        private String name;
        private BigDecimal margin;
    }
}
