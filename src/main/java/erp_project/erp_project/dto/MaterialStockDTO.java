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
public class MaterialStockDTO {
    
    private Long id;
    private MaterialDTO material;
    private Long branchId;
    private String branchName;
    private BigDecimal currentStock;
    private BigDecimal minStock;
    private BigDecimal maxStock;
    private BigDecimal reservedStock;
    private BigDecimal availableStock;
    private LocalDateTime lastUpdated;
    private LocalDateTime createdAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MaterialDTO {
        private Long id;
        private String name;
        private String code;
        private String category;
        private String unit;
        private BigDecimal costPerUnit;
        private String supplier;
        private String status;
    }
}
