package erp_project.erp_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "menu_option_relations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MenuOptionRelation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_id", nullable = false)
    private MenuOption option;
    
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false; // 기본적으로 포함되는 옵션인지
    
    
    @Column(name = "is_removable", nullable = false)
    private Boolean isRemovable = true; // 제거 가능한 옵션인지
    
    @Column(name = "is_addable", nullable = false)
    private Boolean isAddable = true; // 추가 가능한 옵션인지
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
