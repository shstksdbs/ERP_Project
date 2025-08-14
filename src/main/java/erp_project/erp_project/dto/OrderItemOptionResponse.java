package erp_project.erp_project.dto;

import java.math.BigDecimal;

public class OrderItemOptionResponse {
    private Long id;
    private Long optionId;
    private String optionName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    
    // 기본 생성자
    public OrderItemOptionResponse() {}
    
    // 생성자
    public OrderItemOptionResponse(Long id, Long optionId, String optionName, 
                                 Integer quantity, BigDecimal unitPrice, BigDecimal totalPrice) {
        this.id = id;
        this.optionId = optionId;
        this.optionName = optionName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getOptionId() { return optionId; }
    public void setOptionId(Long optionId) { this.optionId = optionId; }
    
    public String getOptionName() { return optionName; }
    public void setOptionName(String optionName) { this.optionName = optionName; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
}
