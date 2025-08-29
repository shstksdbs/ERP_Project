package erp_project.erp_project.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "material_stocks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaterialStock {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branches branch;
    
    @Column(name = "current_stock", nullable = false, precision = 10, scale = 3)
    private BigDecimal currentStock;
    
    @Column(name = "min_stock", nullable = false, precision = 10, scale = 3)
    private BigDecimal minStock;
    
    @Column(name = "max_stock", nullable = false, precision = 10, scale = 3)
    private BigDecimal maxStock;
    
    @Column(name = "reserved_stock", nullable = false, precision = 10, scale = 3)
    private BigDecimal reservedStock;
    
    @Column(name = "available_stock", precision = 10, scale = 3)
    private BigDecimal availableStock;
    
    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastUpdated = LocalDateTime.now();
        if (currentStock == null) {
            currentStock = BigDecimal.ZERO;
        }
        if (minStock == null) {
            minStock = BigDecimal.ZERO;
        }
        if (maxStock == null) {
            maxStock = BigDecimal.ZERO;
        }
        if (reservedStock == null) {
            reservedStock = BigDecimal.ZERO;
        }
        calculateAvailableStock();
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
        calculateAvailableStock();
    }
    
    private void calculateAvailableStock() {
        if (currentStock != null && reservedStock != null) {
            this.availableStock = currentStock.subtract(reservedStock);
        }
    }
}
