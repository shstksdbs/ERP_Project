package erp_project.erp_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "recipient_type", nullable = false, length = 20)
    private String recipientType; // "HEADQUARTERS" 또는 "BRANCH"
    
    @Column(name = "recipient_id")
    private Long recipientId; // 본사인 경우 null, 가맹점인 경우 branch_id
    
    @Column(name = "type", nullable = false, length = 50)
    private String type;
    
    @Column(name = "category", nullable = false, length = 20)
    private String category;
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "message", nullable = false, length = 1000)
    private String message;
    
    @Column(name = "target_type", length = 50)
    private String targetType;
    
    @Column(name = "target_id")
    private Long targetId;
    
    @Column(name = "target_name", length = 200)
    private String targetName;
    
    @Column(name = "target_detail", columnDefinition = "TEXT")
    private String targetDetail;
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (timestamp == null) {
            timestamp = now;
        }
    }
}
