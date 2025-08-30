package erp_project.erp_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "regular_order_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegularOrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "regular_order_id", nullable = false)
    private RegularOrder regularOrder;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;
    
    @Column(name = "requested_quantity", nullable = false, precision = 10, scale = 3)
    private BigDecimal requestedQuantity;
    
    @Column(name = "unit", nullable = false, length = 20)
    private String unit;
    
    @Column(name = "cost_per_unit", nullable = false, precision = 10, scale = 2)
    private BigDecimal costPerUnit;
    
    @Column(name = "total_cost", precision = 10, scale = 2)
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
        calculateTotalCost();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateTotalCost();
    }
    
    private void calculateTotalCost() {
        if (requestedQuantity != null && costPerUnit != null) {
            this.totalCost = requestedQuantity.multiply(costPerUnit);
        }
    }
}
