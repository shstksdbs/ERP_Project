package erp_project.erp_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryAlertDTO {
    
    private Long id;
    private String type; // critical, warning
    private String message;
    private String itemName;
    private String category;
    private BigDecimal currentStock;
    private BigDecimal minStock;
    private BigDecimal maxStock;
    private String unit;
    private LocalDateTime timestamp;
    private boolean isRead;
    
    // 알림 타입 상수
    public static final String TYPE_CRITICAL = "critical";
    public static final String TYPE_WARNING = "warning";
}
