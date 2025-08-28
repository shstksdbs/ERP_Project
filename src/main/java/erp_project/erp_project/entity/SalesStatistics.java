package erp_project.erp_project.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_statistics")
public class SalesStatistics {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "statistic_id")
    private Long statisticId;
    
    @Column(name = "branch_id", nullable = false)
    private Long branchId;
    
    @Column(name = "statistic_date", nullable = false)
    private LocalDate statisticDate;
    
    @Column(name = "statistic_hour")
    private Integer statisticHour; // 시간별 통계용 (0-23), NULL이면 일별 통계
    
    @Column(name = "total_orders", columnDefinition = "INT DEFAULT 0")
    private Integer totalOrders = 0;
    
    @Column(name = "total_sales", columnDefinition = "DECIMAL(12,2) DEFAULT 0.00")
    private BigDecimal totalSales = BigDecimal.ZERO;
    
    @Column(name = "total_discount", columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal totalDiscount = BigDecimal.ZERO;
    
    @Column(name = "net_sales", columnDefinition = "DECIMAL(12,2) DEFAULT 0.00")
    private BigDecimal netSales = BigDecimal.ZERO;
    
    @Column(name = "cash_sales", columnDefinition = "DECIMAL(12,2) DEFAULT 0.00")
    private BigDecimal cashSales = BigDecimal.ZERO;
    
    @Column(name = "card_sales", columnDefinition = "DECIMAL(12,2) DEFAULT 0.00")
    private BigDecimal cardSales = BigDecimal.ZERO;
    
    @Column(name = "mobile_sales", columnDefinition = "DECIMAL(12,2) DEFAULT 0.00")
    private BigDecimal mobileSales = BigDecimal.ZERO;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 기본 생성자
    public SalesStatistics() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getStatisticId() { return statisticId; }
    public void setStatisticId(Long statisticId) { this.statisticId = statisticId; }
    
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    
    public LocalDate getStatisticDate() { return statisticDate; }
    public void setStatisticDate(LocalDate statisticDate) { this.statisticDate = statisticDate; }
    
    public Integer getStatisticHour() { return statisticHour; }
    public void setStatisticHour(Integer statisticHour) { this.statisticHour = statisticHour; }
    
    public Integer getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Integer totalOrders) { this.totalOrders = totalOrders; }
    
    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }
    
    public BigDecimal getTotalDiscount() { return totalDiscount; }
    public void setTotalDiscount(BigDecimal totalDiscount) { this.totalDiscount = totalDiscount; }
    
    public BigDecimal getNetSales() { return netSales; }
    public void setNetSales(BigDecimal netSales) { this.netSales = netSales; }
    
    public BigDecimal getCashSales() { return cashSales; }
    public void setCashSales(BigDecimal cashSales) { this.cashSales = cashSales; }
    
    public BigDecimal getCardSales() { return cardSales; }
    public void setCardSales(BigDecimal cardSales) { this.cardSales = cardSales; }
    
    public BigDecimal getMobileSales() { return mobileSales; }
    public void setMobileSales(BigDecimal mobileSales) { this.mobileSales = mobileSales; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // 편의 메서드
    public void incrementOrders() {
        this.totalOrders++;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void addSales(BigDecimal amount) {
        this.totalSales = this.totalSales.add(amount);
        this.updatedAt = LocalDateTime.now();
    }
    
    public void addDiscount(BigDecimal amount) {
        this.totalDiscount = this.totalDiscount.add(amount);
        this.updatedAt = LocalDateTime.now();
    }
    
    public void updateNetSales() {
        this.netSales = this.totalSales.subtract(this.totalDiscount);
        this.updatedAt = LocalDateTime.now();
    }
}
