package erp_project.erp_project.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "branches")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Branches {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "branch_id")
    private Long id;
    
    @Column(name = "branch_code", unique = true, nullable = false, length = 10)
    private String branchCode;
    
    @Column(name = "branch_name", nullable = false, length = 100)
    private String branchName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "branch_type", columnDefinition = "ENUM('headquarters', 'branch', 'franchise') DEFAULT 'branch'")
    private BranchType branchType;
    
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;
    
    @Column(name = "phone", length = 20)
    private String phone;
    
    @Column(name = "manager_name", length = 100)
    private String managerName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "ENUM('active', 'inactive', 'maintenance') DEFAULT 'active'")
    private BranchStatus status;
    
    @Column(name = "opening_hours", columnDefinition = "JSON")
    private String openingHours;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;
    
    public enum BranchType {
        headquarters, branch, franchise
    }
    
    public enum BranchStatus {
        active, inactive, maintenance
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
