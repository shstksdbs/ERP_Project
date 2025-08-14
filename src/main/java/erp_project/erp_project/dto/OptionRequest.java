package erp_project.erp_project.dto;

import java.math.BigDecimal;

public class OptionRequest {
    private Long optionId;
    private String optionName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private String action; // "add" or "remove"
    
    // 기본 생성자
    public OptionRequest() {}
    
    // 생성자
    public OptionRequest(Long optionId, String optionName, Integer quantity, 
                        BigDecimal unitPrice, String action) {
        this.optionId = optionId;
        this.optionName = optionName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.action = action;
    }
    
    // Getters and Setters
    public Long getOptionId() { return optionId; }
    public void setOptionId(Long optionId) { this.optionId = optionId; }
    
    public String getOptionName() { return optionName; }
    public void setOptionName(String optionName) { this.optionName = optionName; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
}
