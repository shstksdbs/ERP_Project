package erp_project.erp_project.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {
    private Long orderId;
    private String orderNumber;
    private String orderStatus;
    private String orderType;
    private BigDecimal totalAmount;
    private BigDecimal finalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private LocalDateTime orderTime;
    private List<OrderItemResponse> items;
    
    // 기본 생성자
    public OrderResponse() {}
    
    // 간단한 생성자 (주문 생성 시)
    public OrderResponse(Long orderId, String orderNumber) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
    }
    
    // 전체 생성자
    public OrderResponse(Long orderId, String orderNumber, String orderStatus, 
                        String orderType, BigDecimal totalAmount, BigDecimal finalAmount,
                        String paymentMethod, String paymentStatus, LocalDateTime orderTime,
                        List<OrderItemResponse> items) {
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.orderStatus = orderStatus;
        this.orderType = orderType;
        this.totalAmount = totalAmount;
        this.finalAmount = finalAmount;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.orderTime = orderTime;
        this.items = items;
    }
    
    // Getters and Setters
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    
    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
    
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    
    public BigDecimal getFinalAmount() { return finalAmount; }
    public void setFinalAmount(BigDecimal finalAmount) { this.finalAmount = finalAmount; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public LocalDateTime getOrderTime() { return orderTime; }
    public void setOrderTime(LocalDateTime orderTime) { this.orderTime = orderTime; }
    
    public List<OrderItemResponse> getItems() { return items; }
    public void setItems(List<OrderItemResponse> items) { this.items = items; }
}
