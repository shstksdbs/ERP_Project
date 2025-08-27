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
public class RecipeIngredientRequestDto {
    
    private Long materialId;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal costPerUnit;
    private BigDecimal totalCost;
    private String notes;
}
