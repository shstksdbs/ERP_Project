package erp_project.erp_project.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "notices")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "category", columnDefinition = "ENUM('general', 'important', 'event', 'maintenance', 'update') DEFAULT 'general'")
    private NoticeCategory category;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", columnDefinition = "ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal'")
    private NoticePriority priority;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "ENUM('draft', 'published', 'scheduled', 'archived') DEFAULT 'draft'")
    private NoticeStatus status;
    
    @Column(name = "is_important", nullable = false)
    private Boolean isImportant;
    
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic;
    
    @Column(name = "author_id", nullable = false)
    private Long authorId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Users author;
    
    @OneToMany(mappedBy = "notice", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @JsonManagedReference
    private List<NoticeTargetMapping> targetMappings;
    
    @Column(name = "view_count", nullable = false)
    private Integer viewCount;
    
    @Column(name = "start_date")
    private LocalDateTime startDate;
    
    @Column(name = "end_date")
    private LocalDateTime endDate;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isImportant == null) {
            isImportant = false;
        }
        if (isPublic == null) {
            isPublic = true;
        }
        if (viewCount == null) {
            viewCount = 0;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum NoticeCategory {
        general,        // 일반공지
        important,      // 중요공지
        event,          // 이벤트
        maintenance,    // 점검공지
        update;         // 업데이트
        
        public String getDisplayName() {
            switch (this) {
                case general:
                    return "일반공지";
                case important:
                    return "중요공지";
                case event:
                    return "이벤트";
                case maintenance:
                    return "점검공지";
                case update:
                    return "업데이트";
                default:
                    return this.name();
            }
        }
    }
    
    public enum NoticePriority {
        low,            // 낮음
        normal,         // 보통
        high,           // 높음
        urgent;         // 긴급
        
        public String getDisplayName() {
            switch (this) {
                case low:
                    return "낮음";
                case normal:
                    return "보통";
                case high:
                    return "높음";
                case urgent:
                    return "긴급";
                default:
                    return this.name();
            }
        }
    }
    
    public enum NoticeStatus {
        draft,          // 임시저장
        published,      // 발행
        scheduled,      // 예약발행
        archived;       // 보관
        
        public String getDisplayName() {
            switch (this) {
                case draft:
                    return "임시저장";
                case published:
                    return "발행";
                case scheduled:
                    return "예약발행";
                case archived:
                    return "보관";
                default:
                    return this.name();
            }
        }
    }
}
