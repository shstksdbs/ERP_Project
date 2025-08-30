package erp_project.erp_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "supply_request_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplyRequestItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "supply_request_id", nullable = false)
    private Long supplyRequestId;
    
    // supplyRequestId setter 메서드 추가
    public void setSupplyRequestId(Long supplyRequestId) {
        this.supplyRequestId = supplyRequestId;
    }
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;
    
    @Column(name = "requested_quantity", nullable = false, precision = 10, scale = 3)
    private BigDecimal requestedQuantity;
    
    @Column(name = "approved_quantity", precision = 10, scale = 3)
    private BigDecimal approvedQuantity;
    
    @Column(name = "delivered_quantity", precision = 10, scale = 3)
    private BigDecimal deliveredQuantity;
    
    @Column(name = "unit", nullable = false, length = 20)
    private String unit;
    
    @Column(name = "cost_per_unit", nullable = false, precision = 10, scale = 2)
    private BigDecimal costPerUnit;
    
    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private SupplyRequestItemStatus status;
    
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
        if (deliveredQuantity == null) {
            deliveredQuantity = BigDecimal.ZERO;
        }
        if (status == null) {
            status = SupplyRequestItemStatus.PENDING;
        }
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
    
    public enum SupplyRequestItemStatus {
        PENDING,                    // 대기중
        APPROVED,                   // 승인됨
        PARTIALLY_DELIVERED,        // 부분 배송
        DELIVERED                   // 배송완료
    }
}
