package erp_project.erp_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "materials")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Material {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "code", nullable = false, length = 20, unique = true)
    private String code;
    
    @Column(name = "category", length = 50)
    private String category;
    
    @Column(name = "unit", nullable = false, length = 20)
    private String unit;
    
    @Column(name = "cost_per_unit", nullable = false, precision = 10, scale = 2)
    private BigDecimal costPerUnit;
    
    @Column(name = "min_stock", precision = 10, scale = 2)
    private BigDecimal minStock;
    
    @Column(name = "current_stock", precision = 10, scale = 2)
    private BigDecimal currentStock;
    
    @Column(name = "supplier", length = 100)
    private String supplier;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private MaterialStatus status;
    
    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MaterialStock> materialStocks = new ArrayList<>();
    
    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RecipeIngredient> recipeIngredients = new ArrayList<>();
    
    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StockMovement> stockMovements = new ArrayList<>();
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = MaterialStatus.ACTIVE;
        }
        if (minStock == null) {
            minStock = BigDecimal.ZERO;
        }
        if (currentStock == null) {
            currentStock = BigDecimal.ZERO;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum MaterialStatus {
        ACTIVE, INACTIVE
    }
}
