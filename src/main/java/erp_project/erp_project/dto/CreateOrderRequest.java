package erp_project.erp_project.dto;

import java.math.BigDecimal;
import java.util.List;

public class CreateOrderRequest {
    private Long branchId;
    private String orderType; // "dine_in" or "takeout"
    private String customerName;
    private String customerPhone;
    private List<CartItemRequest> items;
    private String paymentMethod;
    
    // 기본 생성자
    public CreateOrderRequest() {}
    
    // 생성자
    public CreateOrderRequest(Long branchId, String orderType, String customerName, 
                            String customerPhone, List<CartItemRequest> items, String paymentMethod) {
        this.branchId = branchId;
        this.orderType = orderType;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.items = items;
        this.paymentMethod = paymentMethod;
    }
    
    // Getters and Setters
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    
    public List<CartItemRequest> getItems() { return items; }
    public void setItems(List<CartItemRequest> items) { this.items = items; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
