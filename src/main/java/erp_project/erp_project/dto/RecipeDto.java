package erp_project.erp_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeDto {
    
    private Long id;
    private Long menuId;
    private String menuName;
    private String menuCode;
    private String menuCategory;
    private String name;
    private String description;
    private BigDecimal yieldQuantity;
    private String yieldUnit;
    private String instructions;
    private Integer preparationTime;
    private Integer cookingTime;
    private String difficulty;
    private String status;
    private List<RecipeIngredientDto> ingredients;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private BigDecimal totalCost;
}
