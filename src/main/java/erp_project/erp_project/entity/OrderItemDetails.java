package erp_project.erp_project.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_item_details")
public class OrderItemDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "detail_id")
    private Long detailId;
    
    @Column(name = "order_item_id", nullable = false)
    private Long orderItemId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false)
    private ItemType itemType;
    
    @Column(name = "menu_id")
    private Long menuId;
    
    @Column(name = "menu_name")
    private String menuName;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;
    
    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;
    
    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;
    
    @Column(name = "is_substituted", nullable = false)
    private Boolean isSubstituted = false;
    
    @Column(name = "original_menu_id")
    private Long originalMenuId;
    
    @Column(name = "substitution_reason")
    private String substitutionReason;
    
    @Column(name = "ingredient_type")
    private String ingredientType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "ingredient_action")
    private IngredientAction ingredientAction;
    
    @Column(name = "ingredient_price")
    private BigDecimal ingredientPrice;
    
    @Column(name = "notes")
    private String notes;
    
    // 기본 생성자
    public OrderItemDetails() {}
    
    // Getters and Setters
    public Long getDetailId() { return detailId; }
    public void setDetailId(Long detailId) { this.detailId = detailId; }
    
    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }
    
    public ItemType getItemType() { return itemType; }
    public void setItemType(ItemType itemType) { this.itemType = itemType; }
    
    public Long getMenuId() { return menuId; }
    public void setMenuId(Long menuId) { this.menuId = menuId; }
    
    public String getMenuName() { return menuName; }
    public void setMenuName(String menuName) { this.menuName = menuName; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    
    public Boolean getIsSubstituted() { return isSubstituted; }
    public void setIsSubstituted(Boolean isSubstituted) { this.isSubstituted = isSubstituted; }
    
    public Long getOriginalMenuId() { return originalMenuId; }
    public void setOriginalMenuId(Long originalMenuId) { this.originalMenuId = originalMenuId; }
    
    public String getSubstitutionReason() { return substitutionReason; }
    public void setSubstitutionReason(String substitutionReason) { this.substitutionReason = substitutionReason; }
    
    public String getIngredientType() { return ingredientType; }
    public void setIngredientType(String ingredientType) { this.ingredientType = ingredientType; }
    
    public IngredientAction getIngredientAction() { return ingredientAction; }
    public void setIngredientAction(IngredientAction ingredientAction) { this.ingredientAction = ingredientAction; }
    
    public BigDecimal getIngredientPrice() { return ingredientPrice; }
    public void setIngredientPrice(BigDecimal ingredientPrice) { this.ingredientPrice = ingredientPrice; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    // Enum 클래스들
    public enum ItemType {
        SET,           // 세트 메뉴
        BURGER,        // 단품 버거
        SIDE,          // 사이드
        DRINK,         // 음료
        INGREDIENT     // 재료 (추가/제거)
    }
    
    public enum IngredientAction {
        ADD,           // 재료 추가
        REMOVE         // 재료 제거
    }
}
