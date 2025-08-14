package erp_project.erp_project.dto;

import java.math.BigDecimal;
import java.util.List;

public class OrderItemResponse {
    private Long orderItemId;
    private Long menuId;
    private String menuName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private String displayName;
    private List<String> displayOptions;
    private List<OrderItemOptionResponse> options;
    
    // 기본 생성자
    public OrderItemResponse() {}
    
    // 생성자
    public OrderItemResponse(Long orderItemId, Long menuId, String menuName, 
                           Integer quantity, BigDecimal unitPrice, BigDecimal totalPrice,
                           String displayName, List<String> displayOptions,
                           List<OrderItemOptionResponse> options) {
        this.orderItemId = orderItemId;
        this.menuId = menuId;
        this.menuName = menuName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
        this.displayName = displayName;
        this.displayOptions = displayOptions;
        this.options = options;
    }
    
    // Getters and Setters
    public Long getOrderItemId() { return orderItemId; }
    public void setOrderItemId(Long orderItemId) { this.orderItemId = orderItemId; }
    
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
    
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    
    public List<String> getDisplayOptions() { return displayOptions; }
    public void setDisplayOptions(List<String> displayOptions) { this.displayOptions = displayOptions; }
    
    public List<OrderItemOptionResponse> getOptions() { return options; }
    public void setOptions(List<OrderItemOptionResponse> options) { this.options = options; }
}
