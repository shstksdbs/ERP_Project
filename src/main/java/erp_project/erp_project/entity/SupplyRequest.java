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
@Table(name = "supply_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplyRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "requesting_branch_id", nullable = false)
    private Long requestingBranchId;
    
    @Column(name = "requester_id")
    private Long requesterId;
    
    @Column(name = "requester_name", length = 100)
    private String requesterName;
    
    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;
    
    @Column(name = "expected_delivery_date")
    private String expectedDeliveryDate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private SupplyRequestStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    private SupplyRequestPriority priority;
    
    @Column(name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "processed_by", length = 100)
    private String processedBy;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    // 처리자 정보 설정 메서드 추가
    public void setProcessedInfo(String processedBy) {
        this.processedBy = processedBy;
        this.processedAt = LocalDateTime.now();
    }
    
    // 개별 setter 메서드 추가
    public void setProcessedBy(String processedBy) {
        this.processedBy = processedBy;
    }
    
    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
    
    // totalCost setter 메서드 추가
    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = SupplyRequestStatus.PENDING;
        }
        if (priority == null) {
            priority = SupplyRequestPriority.NORMAL;
        }
        if (requestDate == null) {
            requestDate = LocalDateTime.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum SupplyRequestStatus {
        PENDING,        // 대기중
        APPROVED,       // 승인됨
        IN_TRANSIT,     // 배송중
        DELIVERED,      // 배송완료
        CANCELLED       // 취소됨
    }
    
    public enum SupplyRequestPriority {
        LOW,            // 낮음
        NORMAL,         // 보통
        HIGH,           // 높음
        URGENT          // 긴급
    }
}
