package erp_project.erp_project.controller;

import erp_project.erp_project.dto.NotificationDTO;
import erp_project.erp_project.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    // 지점별 모든 알림 조회
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<NotificationDTO>> getAllNotificationsByBranch(@PathVariable Long branchId) {
        List<NotificationDTO> notifications = notificationService.getAllNotificationsByBranch(branchId);
        return ResponseEntity.ok(notifications);
    }

    // 지점별 읽지 않은 알림만 조회
    @GetMapping("/branch/{branchId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotificationsByBranch(@PathVariable Long branchId) {
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(branchId);
        return ResponseEntity.ok(notifications);
    }

    // 지점별 알림 타입별 조회
    @GetMapping("/branch/{branchId}/type/{type}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByType(
            @PathVariable Long branchId, 
            @PathVariable String type) {
        List<NotificationDTO> notifications = notificationService.getNotificationsByType(branchId, type);
        return ResponseEntity.ok(notifications);
    }

    // 지점별 알림 카테고리별 조회
    @GetMapping("/branch/{branchId}/category/{category}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByCategory(
            @PathVariable Long branchId, 
            @PathVariable String category) {
        List<NotificationDTO> notifications = notificationService.getNotificationsByCategory(branchId, category);
        return ResponseEntity.ok(notifications);
    }

    // 개별 알림 읽음 처리
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long notificationId) {
        notificationService.markNotificationAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    // 지점별 모든 알림 읽음 처리
    @PutMapping("/branch/{branchId}/read-all")
    public ResponseEntity<Void> markAllNotificationsAsRead(@PathVariable Long branchId) {
        notificationService.markAllNotificationsAsRead(branchId);
        return ResponseEntity.ok().build();
    }
}
