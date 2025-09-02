package erp_project.erp_project.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notice_target_groups")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class NoticeTargetGroup {
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "target_branches", columnDefinition = "JSON")
    @JsonRawValue
    private String targetBranches; // JSON 형태로 저장: ["branch1", "branch2", ...]
    
    @Column(name = "target_positions", columnDefinition = "JSON")
    @JsonRawValue
    private String targetPositions; // JSON 형태로 저장: ["MANAGER", "STAFF", ...]
    
    // 배열을 JSON 문자열로 변환하는 커스텀 setter
    @com.fasterxml.jackson.annotation.JsonSetter("targetBranches")
    public void setTargetBranches(Object targetBranches) {
        if (targetBranches == null) {
            this.targetBranches = "[]";
        } else if (targetBranches instanceof String) {
            this.targetBranches = (String) targetBranches;
        } else {
            try {
                this.targetBranches = objectMapper.writeValueAsString(targetBranches);
            } catch (Exception e) {
                this.targetBranches = "[]";
            }
        }
    }
    
    @com.fasterxml.jackson.annotation.JsonSetter("targetPositions")
    public void setTargetPositions(Object targetPositions) {
        if (targetPositions == null) {
            this.targetPositions = "[]";
        } else if (targetPositions instanceof String) {
            this.targetPositions = (String) targetPositions;
        } else {
            try {
                this.targetPositions = objectMapper.writeValueAsString(targetPositions);
            } catch (Exception e) {
                this.targetPositions = "[]";
            }
        }
    }
    
    @Column(name = "member_count", nullable = false)
    private Integer memberCount;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "ENUM('active', 'inactive') DEFAULT 'active'")
    private TargetGroupStatus status;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (memberCount == null) {
            memberCount = 0;
        }
        if (status == null) {
            status = TargetGroupStatus.active;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum TargetGroupStatus {
        active,         // 활성
        inactive        // 비활성
    }
}
