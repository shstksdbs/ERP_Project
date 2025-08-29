package erp_project.erp_project.dto;

import java.math.BigDecimal;

public class IngredientModificationDto {
    
    private String ingredientType; // 양상추, 토마토, 치즈 등
    private String action; // ADD, REMOVE
    private BigDecimal price; // 추가 시 가격, 제거 시 0
    private String notes; // 특별 요청 사항
    
    // 기본 생성자
    public IngredientModificationDto() {}
    
    // Getters and Setters
    public String getIngredientType() { return ingredientType; }
    public void setIngredientType(String ingredientType) { this.ingredientType = ingredientType; }
    
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
