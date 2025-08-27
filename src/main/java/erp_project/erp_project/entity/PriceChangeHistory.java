package erp_project.erp_project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "price_change_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceChangeHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;
    
    @Column(name = "menu_id", insertable = false, updatable = false)
    private Long menuId;
    
    @Column(name = "old_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal oldPrice;
    
    @Column(name = "new_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal newPrice;
    
    @Column(name = "change_amount", precision = 10, scale = 2)
    private BigDecimal changeAmount;
    
    @Column(name = "change_date", nullable = false)
    @CreationTimestamp
    private LocalDateTime changeDate;
    
    @Column(name = "reason", length = 500)
    private String reason;
    
    @Column(name = "updated_by", length = 100)
    private String updatedBy;
    
    @Column(name = "menu_name", length = 255)
    private String menuName;
    
    // 메뉴 ID getter (엔티티 필드 우선, 없으면 관계에서 가져오기)
    public Long getMenuId() {
        if (this.menuId != null) {
            return this.menuId;
        }
        return menu != null ? menu.getId() : null;
    }
    
    // 메뉴 이름 설정 메서드
    public void setMenuName(String menuName) {
        this.menuName = menuName;
    }
    
    // 메뉴 이름 가져오기 (엔티티 필드 우선, 없으면 관계에서 가져오기)
    public String getMenuName() {
        if (this.menuName != null) {
            return this.menuName;
        }
        return menu != null ? menu.getName() : null;
    }
}
