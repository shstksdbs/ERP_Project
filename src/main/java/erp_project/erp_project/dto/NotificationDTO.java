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
public class NotificationDTO {
    
    private Long id;
    private String recipientType; // "HEADQUARTERS" 또는 "BRANCH"
    private Long recipientId; // 본사인 경우 null, 가맹점인 경우 branch_id
    private String type; // inventory, order, employee, system 등
    private String category; // critical, warning, info, success
    private String title;
    private String message;
    private String targetType; // material, order, employee, system 등
    private Long targetId; // 대상 ID
    private String targetName; // 대상 이름
    private String targetDetail; // 추가 상세 정보 (JSON 형태)
    private LocalDateTime timestamp;
    @com.fasterxml.jackson.annotation.JsonProperty("isRead")
    private boolean isRead;
    private LocalDateTime readAt; // 읽은 시간
    private Long branchId; // 지점 ID (호환성을 위해 유지)
    private Long userId; // 생성자 ID
    private String userName; // 생성자 이름
    
    // 알림 타입 상수
    public static final String TYPE_INVENTORY = "inventory";
    public static final String TYPE_ORDER = "order";
    public static final String TYPE_EMPLOYEE = "employee";
    public static final String TYPE_SYSTEM = "system";
    public static final String TYPE_SALES = "sales";
    
    // 알림 카테고리 상수
    public static final String CATEGORY_CRITICAL = "critical";
    public static final String CATEGORY_WARNING = "warning";
    public static final String CATEGORY_INFO = "info";
    public static final String CATEGORY_SUCCESS = "success";
    
    // 대상 타입 상수
    public static final String TARGET_TYPE_MATERIAL = "material";
    public static final String TARGET_TYPE_ORDER = "order";
    public static final String TARGET_TYPE_EMPLOYEE = "employee";
    public static final String TARGET_TYPE_SYSTEM = "system";
    public static final String TARGET_TYPE_SALES = "sales";
}
