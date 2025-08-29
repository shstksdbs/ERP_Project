package erp_project.erp_project.dto;

import java.math.BigDecimal;
import java.util.List;

public class OrderRequestDto {
    
    private Long branchId;
    private String orderType;
    private String customerName;
    private String customerPhone;
    private String paymentMethod;
    private List<OrderItemRequestDto> items;
    
    // 기본 생성자
    public OrderRequestDto() {}
    
    // Getters and Setters
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public List<OrderItemRequestDto> getItems() { return items; }
    public void setItems(List<OrderItemRequestDto> items) { this.items = items; }
}
