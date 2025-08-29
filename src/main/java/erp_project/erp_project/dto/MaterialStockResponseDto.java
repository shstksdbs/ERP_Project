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
public class MaterialStockResponseDto {
    
    private Long id;
    private MaterialDto material;
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
    public static class MaterialDto {
        private Long id;
        private String name;
        private String code;
        private String category;
        private String unit;
        private BigDecimal costPerUnit;
        private String supplier;
    }
}
