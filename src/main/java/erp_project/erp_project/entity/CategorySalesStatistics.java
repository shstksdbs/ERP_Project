package erp_project.erp_project.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "category_sales_statistics")
public class CategorySalesStatistics {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_statistic_id")
    private Long categoryStatisticId;
    
    @Column(name = "branch_id", nullable = false)
    private Long branchId;
    
    @Column(name = "category_id", nullable = false)
    private Long categoryId;
    
    @Column(name = "statistic_date", nullable = false)
    private LocalDate statisticDate;
    
    @Column(name = "quantity_sold", columnDefinition = "INT DEFAULT 0")
    private Integer quantitySold = 0;
    
    @Column(name = "total_sales", columnDefinition = "DECIMAL(12,2) DEFAULT 0.00")
    private BigDecimal totalSales = BigDecimal.ZERO;
    
    @Column(name = "discount_amount", columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    @Column(name = "net_sales", columnDefinition = "DECIMAL(12,2) DEFAULT 0.00")
    private BigDecimal netSales = BigDecimal.ZERO;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 기본 생성자
    public CategorySalesStatistics() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getCategoryStatisticId() { return categoryStatisticId; }
    public void setCategoryStatisticId(Long categoryStatisticId) { this.categoryStatisticId = categoryStatisticId; }
    
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    
    public LocalDate getStatisticDate() { return statisticDate; }
    public void setStatisticDate(LocalDate statisticDate) { this.statisticDate = statisticDate; }
    
    public Integer getQuantitySold() { return quantitySold; }
    public void setQuantitySold(Integer quantitySold) { this.quantitySold = quantitySold; }
    
    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }
    
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    
    public BigDecimal getNetSales() { return netSales; }
    public void setNetSales(BigDecimal netSales) { this.netSales = netSales; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // 편의 메서드
    public void addQuantity(Integer quantity) {
        this.quantitySold += quantity;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void addSales(BigDecimal amount) {
        this.totalSales = this.totalSales.add(amount);
        this.updatedAt = LocalDateTime.now();
    }
    
    public void addDiscount(BigDecimal amount) {
        this.discountAmount = this.discountAmount.add(amount);
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updateNetSales() {
        this.netSales = this.totalSales.subtract(this.discountAmount);
        this.updatedAt = LocalDateTime.now();
    }
}
