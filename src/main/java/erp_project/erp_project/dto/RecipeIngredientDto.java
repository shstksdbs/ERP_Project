package erp_project.erp_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeIngredientDto {
    
    private Long id;
    private Long materialId;
    private String materialName;
    private String materialCode;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal costPerUnit;
    private BigDecimal totalCost;
    private String notes;
}
