package erp_project.erp_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "menu_categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuCategory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name; // 기존 메뉴의 category 필드와 매핑할 값
    
    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName; // 화면에 표시할 이름
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    
    @Column(name = "parent_category_id")
    private Long parentCategoryId;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // 하위 카테고리 관계는 나중에 추가 예정 (자기참조)
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "parent_category_id", insertable = false, updatable = false)
    // private MenuCategory parentCategory;
    
    // @OneToMany(mappedBy = "parentCategory", fetch = FetchType.LAZY)
    // private List<MenuCategory> subCategories;
    
    // 메뉴와의 관계
    @OneToMany(mappedBy = "menuCategory", fetch = FetchType.LAZY)
    private List<Menu> menus;
}
