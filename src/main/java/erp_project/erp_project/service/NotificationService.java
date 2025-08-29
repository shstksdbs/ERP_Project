package erp_project.erp_project.service;

import erp_project.erp_project.dto.NotificationDTO;
import erp_project.erp_project.dto.MaterialStockDTO;
import erp_project.erp_project.dto.InventoryAlertDTO;
import erp_project.erp_project.service.MaterialStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final MaterialStockService materialStockService;

    // 지점별 모든 알림 조회
    public List<NotificationDTO> getAllNotificationsByBranch(Long branchId) {
        List<NotificationDTO> allNotifications = new ArrayList<>();
        
        // 1. 재고 알림
        List<NotificationDTO> inventoryNotifications = generateInventoryNotifications(branchId);
        allNotifications.addAll(inventoryNotifications);
        
        // 2. 발주 관련 알림 (샘플 데이터)
        List<NotificationDTO> orderNotifications = generateOrderNotifications(branchId);
        allNotifications.addAll(orderNotifications);
        
        // 3. 직원 관련 알림 (샘플 데이터)
        List<NotificationDTO> employeeNotifications = generateEmployeeNotifications(branchId);
        allNotifications.addAll(employeeNotifications);
        
        // 4. 시스템 알림 (샘플 데이터)
        List<NotificationDTO> systemNotifications = generateSystemNotifications(branchId);
        allNotifications.addAll(systemNotifications);
        
        // 5. 매출 관련 알림 (샘플 데이터)
        List<NotificationDTO> salesNotifications = generateSalesNotifications(branchId);
        allNotifications.addAll(salesNotifications);
        
        // 시간순으로 정렬 (최신순)
        return allNotifications.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
    }

    // 재고 알림 생성
    private List<NotificationDTO> generateInventoryNotifications(Long branchId) {
        try {
            List<InventoryAlertDTO> inventoryAlerts = materialStockService.generateInventoryAlerts(branchId);
            return inventoryAlerts.stream()
                    .map(alert -> NotificationDTO.builder()
                            .id(alert.getId())
                            .type(NotificationDTO.TYPE_INVENTORY)
                            .category(alert.getType().equals("critical") ? 
                                    NotificationDTO.CATEGORY_CRITICAL : 
                                    NotificationDTO.CATEGORY_WARNING)
                            .title("재고 알림")
                            .message(alert.getMessage())
                            .targetType(NotificationDTO.TARGET_TYPE_MATERIAL)
                            .targetId(alert.getId())
                            .targetName(alert.getItemName())
                            .targetDetail(String.format("{\"currentStock\":%s,\"minStock\":%s,\"maxStock\":%s,\"unit\":\"%s\",\"category\":\"%s\"}", 
                                    alert.getCurrentStock(), alert.getMinStock(), alert.getMaxStock(), alert.getUnit(), alert.getCategory()))
                            .timestamp(alert.getTimestamp())
                            .isRead(alert.isRead())
                            .branchId(branchId)
                            .userId(null)
                            .userName("시스템")
                            .build())
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // 재고 알림 생성 실패 시 빈 리스트 반환
            return new ArrayList<>();
        }
    }

    // 발주 관련 알림 생성 (샘플 데이터)
    private List<NotificationDTO> generateOrderNotifications(Long branchId) {
        List<NotificationDTO> notifications = new ArrayList<>();
        
        // 승인 대기 발주
        notifications.add(NotificationDTO.builder()
                .id(1001L)
                .type(NotificationDTO.TYPE_ORDER)
                .category(NotificationDTO.CATEGORY_WARNING)
                .title("발주 승인 대기")
                .message("카페라떼 원재료 발주가 승인 대기 중입니다.")
                .targetType(NotificationDTO.TARGET_TYPE_ORDER)
                .targetId(1001L)
                .targetName("카페라떼 원재료 발주")
                .targetDetail("{\"orderId\":1001,\"orderType\":\"material\",\"amount\":500000,\"supplier\":\"커피공급업체\"}")
                .timestamp(LocalDateTime.now().minusHours(2))
                .isRead(false)
                .branchId(branchId)
                .userId(1L)
                .userName("김매니저")
                .build());

        // 발주 완료
        notifications.add(NotificationDTO.builder()
                .id(1002L)
                .type(NotificationDTO.TYPE_ORDER)
                .category(NotificationDTO.CATEGORY_SUCCESS)
                .title("발주 완료")
                .message("샌드위치 재료 발주가 완료되었습니다.")
                .targetType(NotificationDTO.TARGET_TYPE_ORDER)
                .targetId(1002L)
                .targetName("샌드위치 재료 발주")
                .targetDetail("{\"orderId\":1002,\"orderType\":\"material\",\"amount\":300000,\"supplier\":\"식재료공급업체\"}")
                .timestamp(LocalDateTime.now().minusHours(4))
                .isRead(true)
                .branchId(branchId)
                .userId(1L)
                .userName("김매니저")
                .build());

        return notifications;
    }

    // 직원 관련 알림 생성 (샘플 데이터)
    private List<NotificationDTO> generateEmployeeNotifications(Long branchId) {
        List<NotificationDTO> notifications = new ArrayList<>();
        
        // 출근 알림
        notifications.add(NotificationDTO.builder()
                .id(2001L)
                .type(NotificationDTO.TYPE_EMPLOYEE)
                .category(NotificationDTO.CATEGORY_INFO)
                .title("직원 출근")
                .message("박직원님이 출근하셨습니다.")
                .targetType(NotificationDTO.TARGET_TYPE_EMPLOYEE)
                .targetId(2001L)
                .targetName("박직원")
                .targetDetail("{\"employeeId\":2001,\"checkInTime\":\"09:00\",\"status\":\"on\"}")
                .timestamp(LocalDateTime.now().minusHours(1))
                .isRead(false)
                .branchId(branchId)
                .userId(2001L)
                .userName("박직원")
                .build());

        // 퇴근 알림
        notifications.add(NotificationDTO.builder()
                .id(2002L)
                .type(NotificationDTO.TYPE_EMPLOYEE)
                .category(NotificationDTO.CATEGORY_INFO)
                .title("직원 퇴근")
                .message("김직원님이 퇴근하셨습니다.")
                .targetType(NotificationDTO.TARGET_TYPE_EMPLOYEE)
                .targetId(2002L)
                .targetName("김직원")
                .targetDetail("{\"employeeId\":2002,\"checkOutTime\":\"18:00\",\"status\":\"off\"}")
                .timestamp(LocalDateTime.now().minusHours(6))
                .isRead(true)
                .branchId(branchId)
                .userId(2002L)
                .userName("김직원")
                .build());

        // 근무 시간 초과 경고
        notifications.add(NotificationDTO.builder()
                .id(2003L)
                .type(NotificationDTO.TYPE_EMPLOYEE)
                .category(NotificationDTO.CATEGORY_WARNING)
                .title("근무 시간 초과")
                .message("이직원님의 근무 시간이 8시간을 초과했습니다.")
                .targetType(NotificationDTO.TARGET_TYPE_EMPLOYEE)
                .targetId(2003L)
                .targetName("이직원")
                .targetDetail("{\"employeeId\":2003,\"workHours\":9.5,\"maxHours\":8.0}")
                .timestamp(LocalDateTime.now().minusMinutes(30))
                .isRead(false)
                .branchId(branchId)
                .userId(2003L)
                .userName("이직원")
                .build());

        return notifications;
    }

    // 시스템 알림 생성 (샘플 데이터)
    private List<NotificationDTO> generateSystemNotifications(Long branchId) {
        List<NotificationDTO> notifications = new ArrayList<>();
        
        // 시스템 점검 알림
        notifications.add(NotificationDTO.builder()
                .id(3001L)
                .type(NotificationDTO.TYPE_SYSTEM)
                .category(NotificationDTO.CATEGORY_INFO)
                .title("시스템 점검")
                .message("정기 시스템 점검이 예정되어 있습니다.")
                .targetType(NotificationDTO.TARGET_TYPE_SYSTEM)
                .targetId(3001L)
                .targetName("시스템 점검")
                .targetDetail("{\"maintenanceType\":\"routine\",\"scheduledTime\":\"2024-01-20 02:00\",\"duration\":\"2시간\"}")
                .timestamp(LocalDateTime.now().minusHours(12))
                .isRead(false)
                .branchId(branchId)
                .userId(null)
                .userName("시스템")
                .build());

        // 백업 완료 알림
        notifications.add(NotificationDTO.builder()
                .id(3002L)
                .type(NotificationDTO.TYPE_SYSTEM)
                .category(NotificationDTO.CATEGORY_SUCCESS)
                .title("데이터 백업 완료")
                .message("일일 데이터 백업이 성공적으로 완료되었습니다.")
                .targetType(NotificationDTO.TARGET_TYPE_SYSTEM)
                .targetId(3002L)
                .targetName("데이터 백업")
                .targetDetail("{\"backupType\":\"daily\",\"backupTime\":\"2024-01-15 01:00\",\"size\":\"2.5GB\"}")
                .timestamp(LocalDateTime.now().minusHours(23))
                .isRead(true)
                .branchId(branchId)
                .userId(null)
                .userName("시스템")
                .build());

        return notifications;
    }

    // 매출 관련 알림 생성 (샘플 데이터)
    private List<NotificationDTO> generateSalesNotifications(Long branchId) {
        List<NotificationDTO> notifications = new ArrayList<>();
        
        // 매출 목표 달성
        notifications.add(NotificationDTO.builder()
                .id(4001L)
                .type(NotificationDTO.TYPE_SALES)
                .category(NotificationDTO.CATEGORY_SUCCESS)
                .title("매출 목표 달성")
                .message("오늘의 매출 목표를 달성했습니다!")
                .targetType(NotificationDTO.TARGET_TYPE_SALES)
                .targetId(4001L)
                .targetName("일일 매출")
                .targetDetail("{\"targetAmount\":1000000,\"actualAmount\":1200000,\"achievementRate\":120}")
                .timestamp(LocalDateTime.now().minusHours(3))
                .isRead(false)
                .branchId(branchId)
                .userId(null)
                .userName("시스템")
                .build());

        // 매출 급감 경고
        notifications.add(NotificationDTO.builder()
                .id(4002L)
                .type(NotificationDTO.TYPE_SALES)
                .category(NotificationDTO.CATEGORY_WARNING)
                .title("매출 급감 경고")
                .message("최근 3일간 매출이 평균 대비 30% 감소했습니다.")
                .targetType(NotificationDTO.TARGET_TYPE_SALES)
                .targetId(4002L)
                .targetName("매출 분석")
                .targetDetail("{\"period\":\"3일\",\"decreaseRate\":30,\"averageAmount\":800000}")
                .timestamp(LocalDateTime.now().minusHours(8))
                .isRead(false)
                .branchId(branchId)
                .userId(null)
                .userName("시스템")
                .build());

        return notifications;
    }

    // 알림 읽음 처리
    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        // 실제 구현에서는 데이터베이스 업데이트
        // 현재는 샘플 데이터이므로 아무것도 하지 않음
    }

    // 모든 알림 읽음 처리
    @Transactional
    public void markAllNotificationsAsRead(Long branchId) {
        // 실제 구현에서는 데이터베이스 업데이트
        // 현재는 샘플 데이터이므로 아무것도 하지 않음
    }

    // 알림 타입별 필터링
    public List<NotificationDTO> getNotificationsByType(Long branchId, String type) {
        List<NotificationDTO> allNotifications = getAllNotificationsByBranch(branchId);
        return allNotifications.stream()
                .filter(notification -> notification.getType().equals(type))
                .collect(Collectors.toList());
    }

    // 알림 카테고리별 필터링
    public List<NotificationDTO> getNotificationsByCategory(Long branchId, String category) {
        List<NotificationDTO> allNotifications = getAllNotificationsByBranch(branchId);
        return allNotifications.stream()
                .filter(notification -> notification.getCategory().equals(category))
                .collect(Collectors.toList());
    }

    // 읽지 않은 알림만 조회
    public List<NotificationDTO> getUnreadNotifications(Long branchId) {
        List<NotificationDTO> allNotifications = getAllNotificationsByBranch(branchId);
        return allNotifications.stream()
                .filter(notification -> !notification.isRead())
                .collect(Collectors.toList());
    }
}
