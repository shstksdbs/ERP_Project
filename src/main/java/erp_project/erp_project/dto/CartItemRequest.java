package erp_project.erp_project.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartItemRequest {
    private Long menuId;
    private String menuName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private List<OptionRequest> options;
    private String displayName;
    private List<String> displayOptions;
    
    // 기본 생성자
    public CartItemRequest() {}
    
    // 생성자
    public CartItemRequest(Long menuId, String menuName, Integer quantity, 
                          BigDecimal unitPrice, BigDecimal totalPrice, 
                          List<OptionRequest> options, String displayName, 
                          List<String> displayOptions) {
        this.menuId = menuId;
        this.menuName = menuName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
        this.options = options;
        this.displayName = displayName;
        this.displayOptions = displayOptions;
    }
    
    // Getters and Setters
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
    
    public List<OptionRequest> getOptions() { return options; }
    public void setOptions(List<OptionRequest> options) { this.options = options; }
    
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    
    public List<String> getDisplayOptions() { return displayOptions; }
    public void setDisplayOptions(List<String> displayOptions) { this.displayOptions = displayOptions; }
}
