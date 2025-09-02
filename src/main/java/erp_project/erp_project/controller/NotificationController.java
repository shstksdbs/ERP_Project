package erp_project.erp_project.controller;

import erp_project.erp_project.dto.NotificationDTO;
import erp_project.erp_project.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * 지점별 모든 알림 조회 (페이징 지원)
     */
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByBranch(
            @PathVariable Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<NotificationDTO> notifications = notificationService.getAllNotificationsByBranch(branchId, page, size);
            
            // 응답 데이터 로그
            log.info("지점 알림 조회 성공 - 지점 ID: {}, 페이지: {}, 크기: {}, 알림 개수: {}", 
                    branchId, page, size, notifications.size());
            
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("지점 알림 조회 실패 - 지점 ID: {}, 오류: {}", branchId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 본사 알림 조회
     */
    @GetMapping("/headquarters")
    public ResponseEntity<List<NotificationDTO>> getNotificationsForHeadquarters() {
        try {
            List<NotificationDTO> notifications = notificationService.getAllNotificationsByHeadquarters();
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("본사 알림 조회 실패 - 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 지점별 읽지 않은 알림 조회
     */
    @GetMapping("/branch/{branchId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotificationsByBranch(@PathVariable Long branchId) {
        try {
            List<NotificationDTO> notifications = notificationService.getUnreadNotifications(branchId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("지점 읽지 않은 알림 조회 실패 - 지점 ID: {}, 오류: {}", branchId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 본사 읽지 않은 알림 조회
     */
    @GetMapping("/headquarters/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotificationsForHeadquarters() {
        try {
            List<NotificationDTO> notifications = notificationService.getUnreadNotificationsForHeadquarters();
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("본사 읽지 않은 알림 조회 실패 - 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 지점별 읽지 않은 알림 개수 조회
     */
    @GetMapping("/branch/{branchId}/unread-count")
    public ResponseEntity<Long> getUnreadNotificationCountByBranch(@PathVariable Long branchId) {
        try {
            long count = notificationService.getUnreadNotificationCount(branchId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("지점 읽지 않은 알림 개수 조회 실패 - 지점 ID: {}, 오류: {}", branchId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 본사 읽지 않은 알림 개수 조회
     */
    @GetMapping("/headquarters/unread-count")
    public ResponseEntity<Long> getUnreadNotificationCountForHeadquarters() {
        try {
            long count = notificationService.getUnreadNotificationCountForHeadquarters();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("본사 읽지 않은 알림 개수 조회 실패 - 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 알림 읽음 처리
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long notificationId) {
        try {
            log.info("알림 읽음 처리 API 호출 - 알림 ID: {}", notificationId);
            notificationService.markNotificationAsRead(notificationId);
            log.info("알림 읽음 처리 API 성공 - 알림 ID: {}", notificationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("알림 읽음 처리 실패 - 알림 ID: {}, 오류: {}", notificationId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 지점의 모든 알림 읽음 처리
     */
    @PutMapping("/branch/{branchId}/read-all")
    public ResponseEntity<Void> markAllNotificationsAsReadByBranch(@PathVariable Long branchId) {
        try {
            log.info("모든 알림 읽음 처리 API 호출 - 지점 ID: {}", branchId);
            notificationService.markAllNotificationsAsRead(branchId);
            log.info("모든 알림 읽음 처리 API 성공 - 지점 ID: {}", branchId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("지점 모든 알림 읽음 처리 실패 - 지점 ID: {}, 오류: {}", branchId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 본사의 모든 알림 읽음 처리
     */
    @PutMapping("/headquarters/read-all")
    public ResponseEntity<Void> markAllNotificationsAsReadForHeadquarters() {
        try {
            notificationService.markAllNotificationsAsReadForHeadquarters();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("본사 모든 알림 읽음 처리 실패 - 오류: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 지점별 현재 재고 상태 알림 조회 (재고 알림 페이지용)
     */
    @GetMapping("/branch/{branchId}/stock-status")
    public ResponseEntity<List<NotificationDTO>> getCurrentStockNotificationsByBranch(@PathVariable Long branchId) {
        try {
            List<NotificationDTO> notifications = notificationService.getCurrentStockNotifications(branchId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("지점 재고 상태 알림 조회 실패 - 지점 ID: {}, 오류: {}", branchId, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}