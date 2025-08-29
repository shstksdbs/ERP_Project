package erp_project.erp_project.dto;

import erp_project.erp_project.entity.OrderItemDetails;
import java.math.BigDecimal;

public class OrderItemDetailDto {
    
    private Long detailId;
    private Long orderItemId;
    private String itemType;
    private Long menuId;
    private String menuName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private Boolean isSubstituted;
    private Long originalMenuId;
    private String substitutionReason;
    private String ingredientType;
    private String ingredientAction;
    private BigDecimal ingredientPrice;
    private String notes;
    
    // 기본 생성자
    public OrderItemDetailDto() {}
    
    // Entity에서 DTO로 변환하는 생성자
    public OrderItemDetailDto(OrderItemDetails entity) {
        this.detailId = entity.getDetailId();
        this.orderItemId = entity.getOrderItemId();
        this.itemType = entity.getItemType() != null ? entity.getItemType().name() : null;
        this.menuId = entity.getMenuId();
        this.menuName = entity.getMenuName();
        this.quantity = entity.getQuantity();
        this.unitPrice = entity.getUnitPrice();
        this.totalPrice = entity.getTotalPrice();
        this.isSubstituted = entity.getIsSubstituted();
        this.originalMenuId = entity.getOriginalMenuId();
        this.substitutionReason = entity.getSubstitutionReason();
        this.ingredientType = entity.getIngredientType();
        this.ingredientAction = entity.getIngredientAction() != null ? entity.getIngredientAction().name() : null;
        this.ingredientPrice = entity.getIngredientPrice();
        this.notes = entity.getNotes();
    }
    
    // DTO에서 Entity로 변환하는 메서드
    public OrderItemDetails toEntity() {
        OrderItemDetails entity = new OrderItemDetails();
        entity.setDetailId(this.detailId);
        entity.setOrderItemId(this.orderItemId);
        entity.setItemType(this.itemType != null ? OrderItemDetails.ItemType.valueOf(this.itemType) : null);
        entity.setMenuId(this.menuId);
        entity.setMenuName(this.menuName);
        entity.setQuantity(this.quantity);
        entity.setUnitPrice(this.unitPrice);
        entity.setTotalPrice(this.totalPrice);
        entity.setIsSubstituted(this.isSubstituted);
        entity.setOriginalMenuId(this.originalMenuId);
        entity.setSubstitutionReason(this.substitutionReason);
        entity.setIngredientType(this.ingredientType);
        entity.setIngredientAction(this.ingredientAction != null ? OrderItemDetails.IngredientAction.valueOf(this.ingredientAction) : null);
        entity.setIngredientPrice(this.ingredientPrice);
        entity.setNotes(this.notes);
        return entity;
    }
    
    // Getters and Setters
    public Long getDetailId() { return detailId; }
    public void setDetailId(Long detailId) { this.detailId = detailId; }
    
    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }
    
    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }
    
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
    
    public String getIngredientAction() { return ingredientAction; }
    public void setIngredientAction(String ingredientAction) { this.ingredientAction = ingredientAction; }
    
    public BigDecimal getIngredientPrice() { return ingredientPrice; }
    public void setIngredientPrice(BigDecimal ingredientPrice) { this.ingredientPrice = ingredientPrice; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
