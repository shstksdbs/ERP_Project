package erp_project.erp_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "recipe_ingredients")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeIngredient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;
    
    @Column(name = "quantity", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantity;
    
    @Column(name = "unit", nullable = false, length = 20)
    private String unit;
    
    @Column(name = "cost_per_unit", nullable = false, precision = 10, scale = 2)
    private BigDecimal costPerUnit;
    
    @Column(name = "total_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalCost;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        // totalCost가 null이거나 0인 경우에만 계산
        if ((totalCost == null || totalCost.compareTo(BigDecimal.ZERO) == 0) && 
            quantity != null && costPerUnit != null) {
            totalCost = quantity.multiply(costPerUnit);
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // totalCost가 null이거나 0인 경우에만 계산
        if ((totalCost == null || totalCost.compareTo(BigDecimal.ZERO) == 0) && 
            quantity != null && costPerUnit != null) {
            totalCost = quantity.multiply(costPerUnit);
        }
    }
}
