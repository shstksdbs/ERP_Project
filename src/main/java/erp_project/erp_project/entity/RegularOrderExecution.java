package erp_project.erp_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "regular_order_executions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegularOrderExecution {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "regular_order_id", nullable = false)
    private RegularOrder regularOrder;
    
    @Column(name = "execution_date", nullable = false)
    private LocalDate executionDate;
    
    @Column(name = "scheduled_order_date", nullable = false)
    private LocalDate scheduledOrderDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ExecutionStatus status;
    
    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
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
        if (status == null) {
            status = ExecutionStatus.PENDING;
        }
        if (executionDate == null) {
            executionDate = LocalDate.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum ExecutionStatus {
        PENDING,        // 대기중
        PROCESSING,     // 처리중
        COMPLETED,      // 완료됨
        FAILED,         // 실패
        CANCELLED       // 취소됨
    }
}
