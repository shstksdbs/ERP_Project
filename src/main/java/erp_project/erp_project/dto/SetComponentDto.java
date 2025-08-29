package erp_project.erp_project.dto;

import java.math.BigDecimal;

public class SetComponentDto {
    
    private String componentType; // BURGER, SIDE, DRINK
    private Long menuId;
    private String menuName;
    private BigDecimal unitPrice;
    private Integer quantity;
    private String notes;
    
    // 기본 생성자
    public SetComponentDto() {}
    
    // Getters and Setters
    public String getComponentType() { return componentType; }
    public void setComponentType(String componentType) { this.componentType = componentType; }
    
    public Long getMenuId() { return menuId; }
    public void setMenuId(Long menuId) { this.menuId = menuId; }
    
    public String getMenuName() { return menuName; }
    public void setMenuName(String menuName) { this.menuName = menuName; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
