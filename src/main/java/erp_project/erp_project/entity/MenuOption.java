package erp_project.erp_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "menu_options")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MenuOption {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName; // 한국어 표시명 (예: "토마토", "양파")
    
    @Column(name = "category", nullable = false, length = 50)
    private String category; // "topping", "sauce", "side" 등
    
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // 추가 시 가격 (제거 시는 0)
    
    @Column(name = "is_available", nullable = false)
    private Boolean isAvailable = true;
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
