package erp_project.erp_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branches branch;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 20)
    private MovementType movementType;
    
    @Column(name = "quantity", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantity; // 양수: 입고, 음수: 출고
    
    @Column(name = "unit", nullable = false, length = 20)
    private String unit;
    
    @Column(name = "cost_per_unit", nullable = false, precision = 10, scale = 2)
    private BigDecimal costPerUnit;
    
    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;
    
    @Column(name = "reference_id")
    private Long referenceId; // order_id, supply_request_id 등
    
    @Column(name = "reference_type", length = 50)
    private String referenceType; // 'ORDER', 'SUPPLY_REQUEST' 등
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "movement_date", nullable = false)
    private LocalDateTime movementDate;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (movementDate == null) {
            movementDate = LocalDateTime.now();
        }
        calculateTotalCost();
    }
    
    private void calculateTotalCost() {
        if (quantity != null && costPerUnit != null) {
            this.totalCost = quantity.abs().multiply(costPerUnit);
        }
    }
    
    public enum MovementType {
        SUPPLY_IN,         // 공급 입고
        SALE_DEDUCTION,    // 판매 차감
        ADJUSTMENT,        // 조정
        LOSS,              // 손실
        RETURN             // 반품
    }
}
