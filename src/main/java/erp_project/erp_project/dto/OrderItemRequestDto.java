package erp_project.erp_project.dto;

import java.math.BigDecimal;
import java.util.List;

public class OrderItemRequestDto {
    
    private Long menuId;
    private String menuName;
    private String itemType; // SET, BURGER, SIDE, DRINK
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String optionsJson;
    private String displayName;
    
    // 세트 메뉴 구성 요소들
    private List<SetComponentDto> setComponents;
    
    // 재료 추가/제거 사항들
    private List<IngredientModificationDto> ingredientModifications;
    
    // 기본 생성자
    public OrderItemRequestDto() {}
    
    // Getters and Setters
    public Long getMenuId() { return menuId; }
    public void setMenuId(Long menuId) { this.menuId = menuId; }
    
    public String getMenuName() { return menuName; }
    public void setMenuName(String menuName) { this.menuName = menuName; }
    
    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    
    public String getOptionsJson() { return optionsJson; }
    public void setOptionsJson(String optionsJson) { this.optionsJson = optionsJson; }
    
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    
    public List<SetComponentDto> getSetComponents() { return setComponents; }
    public void setSetComponents(List<SetComponentDto> setComponents) { this.setComponents = setComponents; }
    
    public List<IngredientModificationDto> getIngredientModifications() { return ingredientModifications; }
    public void setIngredientModifications(List<IngredientModificationDto> ingredientModifications) { this.ingredientModifications = ingredientModifications; }
}
