package erp_project.erp_project.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItems {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Long orderItemId;
    
    @Column(name = "order_id", nullable = false)
    private Long orderId;
    
    @Column(name = "menu_id", nullable = false)
    private Long menuId;
    
    @Column(name = "menu_name", nullable = false)
    private String menuName;
    
    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "total_price", nullable = false)
    private BigDecimal totalPrice;
    
    @Column(name = "options_json", columnDefinition = "TEXT")
    private String optionsJson;
    
    @Column(name = "display_name")
    private String displayName;
    
    @Column(name = "display_options", columnDefinition = "TEXT")
    private String displayOptions;
    
    // 새로운 필드들 추가
    @Enumerated(EnumType.STRING)
    @Column(name = "item_type")
    private ItemType itemType;
    
    @Column(name = "parent_item_id")
    private Long parentItemId;
    
    @Column(name = "is_substituted")
    private Boolean isSubstituted = false;
    
    @Column(name = "original_menu_id")
    private Long originalMenuId;
    
    @Column(name = "actual_menu_id")
    private Long actualMenuId;
    
    @Column(name = "substitution_reason")
    private String substitutionReason;
    
    @Column(name = "ingredient_type")
    private String ingredientType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "ingredient_action")
    private IngredientAction ingredientAction;
    
    @Column(name = "ingredient_price")
    private BigDecimal ingredientPrice;
    
    @Column(name = "is_set_component")
    private Boolean isSetComponent = false;
    
    // Menu와의 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", insertable = false, updatable = false)
    private Menu menu;
    
    // Orders와의 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", insertable = false, updatable = false)
    private Orders order;
    
    // 기본 생성자
    public OrderItems() {}
    
    // Getters and Setters
    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }
    
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    
    public Long getMenuId() { return menuId; }
    public void setMenuId(Long menuId) { this.menuId = menuId; }
    
    public String getMenuName() { return menuName; }
    public void setMenuName(String menuName) { this.menuName = menuName; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    
    public String getOptionsJson() { return optionsJson; }
    public void setOptionsJson(String optionsJson) { this.optionsJson = optionsJson; }
    
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    
    public String getDisplayOptions() { return displayOptions; }
    public void setDisplayOptions(String displayOptions) { this.displayOptions = displayOptions; }
    
    // 새로운 필드들의 Getters and Setters
    public ItemType getItemType() { return itemType; }
    public void setItemType(ItemType itemType) { this.itemType = itemType; }
    
    public Long getParentItemId() { return parentItemId; }
    public void setParentItemId(Long parentItemId) { this.parentItemId = parentItemId; }
    
    public Boolean getIsSubstituted() { return isSubstituted; }
    public void setIsSubstituted(Boolean isSubstituted) { this.isSubstituted = isSubstituted; }
    
    public Long getOriginalMenuId() { return originalMenuId; }
    public void setOriginalMenuId(Long originalMenuId) { this.originalMenuId = originalMenuId; }
    
    public Long getActualMenuId() { return actualMenuId; }
    public void setActualMenuId(Long actualMenuId) { this.actualMenuId = actualMenuId; }
    
    public String getSubstitutionReason() { return substitutionReason; }
    public void setSubstitutionReason(String substitutionReason) { this.substitutionReason = substitutionReason; }
    
    public String getIngredientType() { return ingredientType; }
    public void setIngredientType(String ingredientType) { this.ingredientType = ingredientType; }
    
    public IngredientAction getIngredientAction() { return ingredientAction; }
    public void setIngredientAction(IngredientAction ingredientAction) { this.ingredientAction = ingredientAction; }
    
    public BigDecimal getIngredientPrice() { return ingredientPrice; }
    public void setIngredientPrice(BigDecimal ingredientPrice) { this.ingredientPrice = ingredientPrice; }
    
    public Boolean getIsSetComponent() { return isSetComponent; }
    public void setIsSetComponent(Boolean isSetComponent) { this.isSetComponent = isSetComponent; }
    
    public Menu getMenu() { return menu; }
    public void setMenu(Menu menu) { this.menu = menu; }
    
    public Orders getOrder() { return order; }
    public void setOrder(Orders order) { this.order = order; }
    
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
