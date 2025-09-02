package erp_project.erp_project.service;

import erp_project.erp_project.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    /**
     * 특정 지점에 알림 전송 (DB 저장 + 웹소켓 전송)
     */
    public void sendNotificationToBranch(Long branchId, NotificationDTO notification) {
        try {
            // 1. 알림을 데이터베이스에 저장
            notification.setRecipientType(NotificationService.RECIPIENT_TYPE_BRANCH);
            notification.setRecipientId(branchId);
            notificationService.saveNotification(notification);
            
            // 2. 웹소켓으로 실시간 전송
            String destination = "/topic/notifications/branch/" + branchId;
            messagingTemplate.convertAndSend(destination, notification);
            log.info("알림 전송 완료 - 지점 ID: {}, 알림 ID: {}", branchId, notification.getId());
        } catch (Exception e) {
            log.error("알림 전송 실패 - 지점 ID: {}, 오류: {}", branchId, e.getMessage());
        }
    }

    /**
     * 모든 지점에 알림 전송 (시스템 알림용)
     */
    public void sendNotificationToAllBranches(NotificationDTO notification) {
        try {
            String destination = "/topic/notifications/all";
            messagingTemplate.convertAndSend(destination, notification);
            log.info("전체 알림 전송 완료 - 알림 ID: {}", notification.getId());
        } catch (Exception e) {
            log.error("전체 알림 전송 실패 - 오류: {}", e.getMessage());
        }
    }

    /**
     * 본사에 알림 전송 (DB 저장 + 웹소켓 전송)
     */
    public void sendNotificationToHeadquarters(NotificationDTO notification) {
        try {
            // 1. 알림을 데이터베이스에 저장
            notification.setRecipientType(NotificationService.RECIPIENT_TYPE_HEADQUARTERS);
            notification.setRecipientId(null);
            notificationService.saveNotification(notification);
            
            // 2. 웹소켓으로 실시간 전송
            String destination = "/topic/notifications/headquarters";
            messagingTemplate.convertAndSend(destination, notification);
            log.info("본사 알림 전송 완료 - 알림 ID: {}", notification.getId());
        } catch (Exception e) {
            log.error("본사 알림 전송 실패 - 오류: {}", e.getMessage());
        }
    }

    /**
     * 특정 사용자에게 개인 알림 전송
     */
    public void sendNotificationToUser(Long userId, NotificationDTO notification) {
        try {
            String destination = "/queue/notifications/user/" + userId;
            messagingTemplate.convertAndSend(destination, notification);
            log.info("개인 알림 전송 완료 - 사용자 ID: {}, 알림 ID: {}", userId, notification.getId());
        } catch (Exception e) {
            log.error("개인 알림 전송 실패 - 사용자 ID: {}, 오류: {}", userId, e.getMessage());
        }
    }
}
