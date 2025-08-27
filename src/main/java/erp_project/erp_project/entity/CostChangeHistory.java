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
@Table(name = "cost_change_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostChangeHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;
    
    @Column(name = "old_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal oldCost;
    
    @Column(name = "new_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal newCost;
    
    @Column(name = "change_date", nullable = false)
    @CreationTimestamp
    private LocalDateTime changeDate;
    
    @Column(name = "reason", length = 500)
    private String reason;
    
    @Column(name = "updated_by", length = 100)
    private String updatedBy;
    
    // 메뉴 ID만 가져오는 편의 메서드
    public Long getMenuId() {
        return menu != null ? menu.getId() : null;
    }
    
    // 메뉴 이름만 가져오는 편의 메서드
    public String getMenuName() {
        return menu != null ? menu.getName() : null;
    }
}
