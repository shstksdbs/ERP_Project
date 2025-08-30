package erp_project.erp_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "regular_orders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegularOrder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "branch_id", nullable = false)
    private Long branchId;
    
    @Column(name = "order_name", nullable = false, length = 200)
    private String orderName;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "cycle_type", nullable = false, length = 20)
    private OrderCycleType cycleType;
    
    @Column(name = "cycle_value", nullable = false)
    private Integer cycleValue;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    
    @Column(name = "next_order_date", nullable = false)
    private LocalDate nextOrderDate;
    
    @Column(name = "last_order_date")
    private LocalDate lastOrderDate;
    
    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "regularOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RegularOrderItem> items = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
        if (nextOrderDate == null) {
            nextOrderDate = LocalDate.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum OrderCycleType {
        DAILY,      // 매일
        WEEKLY,     // 매주
        MONTHLY,    // 매월
        YEARLY      // 매년
    }
    
    // 정기발주 활성화/비활성화 메서드
    public void activate() {
        this.isActive = true;
    }
    
    public void deactivate() {
        this.isActive = false;
    }
    
    // 다음 발주일 계산 메서드
    public void calculateNextOrderDate() {
        if (lastOrderDate != null && cycleType != null && cycleValue != null) {
            switch (cycleType) {
                case DAILY:
                    this.nextOrderDate = lastOrderDate.plusDays(cycleValue);
                    break;
                case WEEKLY:
                    this.nextOrderDate = lastOrderDate.plusWeeks(cycleValue);
                    break;
                case MONTHLY:
                    this.nextOrderDate = lastOrderDate.plusMonths(cycleValue);
                    break;
                case YEARLY:
                    this.nextOrderDate = lastOrderDate.plusYears(cycleValue);
                    break;
            }
        }
    }
}
