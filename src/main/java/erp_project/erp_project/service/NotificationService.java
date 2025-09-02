package erp_project.erp_project.service;

import erp_project.erp_project.dto.NotificationDTO;
import erp_project.erp_project.dto.InventoryAlertDTO;
import erp_project.erp_project.entity.Notification;
import erp_project.erp_project.repository.NotificationRepository;
import erp_project.erp_project.service.MaterialStockService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final MaterialStockService materialStockService;
    private final NotificationRepository notificationRepository;
    
    // 상수 정의
    public static final String RECIPIENT_TYPE_HEADQUARTERS = "HEADQUARTERS";
    public static final String RECIPIENT_TYPE_BRANCH = "BRANCH";

    // 지점별 모든 알림 조회 (실제 알림 데이터만) - 기존 메서드 (호환성 유지)
    public List<NotificationDTO> getAllNotificationsByBranch(Long branchId) {
        return getAllNotificationsByBranch(branchId, 0, Integer.MAX_VALUE);
    }
    
    // 지점별 모든 알림 조회 (페이징 지원)
    public List<NotificationDTO> getAllNotificationsByBranch(Long branchId, int page, int size) {
        // 데이터베이스에서 저장된 실제 알림만 조회 (페이징)
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationPage = notificationRepository
                .findByRecipientTypeAndRecipientIdOrderByTimestampDesc(RECIPIENT_TYPE_BRANCH, branchId, pageable);
        
        List<Notification> dbNotifications = notificationPage.getContent();
        
        System.out.println("알림 조회 - 지점 ID: " + branchId + ", 페이지: " + page + ", 크기: " + size + 
                         ", 조회된 알림 개수: " + dbNotifications.size() + ", 전체 개수: " + notificationPage.getTotalElements());
        
        return dbNotifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // 본사별 모든 알림 조회
    public List<NotificationDTO> getAllNotificationsByHeadquarters() {
        List<Notification> dbNotifications = notificationRepository
                .findByRecipientTypeOrderByTimestampDesc(RECIPIENT_TYPE_HEADQUARTERS);
        return dbNotifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 현재 재고 상태 알림 생성 (재고 알림 페이지용 - 별도 메서드)
    public List<NotificationDTO> getCurrentStockNotifications(Long branchId) {
        try {
            List<InventoryAlertDTO> inventoryAlerts = materialStockService.generateCurrentStockAlerts(branchId);
            return inventoryAlerts.stream()
                    .map(alert -> NotificationDTO.builder()
                            .id(alert.getId())
                            .type(NotificationDTO.TYPE_INVENTORY)
                            .category(alert.getType().equals("critical") ? 
                                    NotificationDTO.CATEGORY_CRITICAL : 
                                    NotificationDTO.CATEGORY_WARNING)
                            .title("재고 상태 알림")
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

    // 알림 저장 (웹소켓 전송용)
    @Transactional
    public Notification saveNotification(NotificationDTO notificationDTO) {
        Notification notification = Notification.builder()
                .recipientType(notificationDTO.getRecipientType())
                .recipientId(notificationDTO.getRecipientId())
                .type(notificationDTO.getType())
                .category(notificationDTO.getCategory())
                .title(notificationDTO.getTitle())
                .message(notificationDTO.getMessage())
                .targetType(notificationDTO.getTargetType())
                .targetId(notificationDTO.getTargetId())
                .targetName(notificationDTO.getTargetName())
                .targetDetail(notificationDTO.getTargetDetail())
                .timestamp(notificationDTO.getTimestamp())
                .isRead(false)
                .build();
        
        System.out.println("알림 저장 시작 - 제목: " + notification.getTitle() + ", isRead: " + notification.getIsRead());
        Notification savedNotification = notificationRepository.save(notification);
        System.out.println("알림 저장 완료 - ID: " + savedNotification.getId() + ", isRead: " + savedNotification.getIsRead());
        
        return savedNotification;
    }
    
    // 알림 읽음 처리
    @Transactional
    public void markNotificationAsRead(Long notificationId) {
        System.out.println("알림 읽음 처리 시작 - 알림 ID: " + notificationId);
        try {
            // 읽음 처리 전 상태 확인
            Optional<Notification> beforeNotification = notificationRepository.findById(notificationId);
            if (beforeNotification.isPresent()) {
                System.out.println("읽음 처리 전 - 알림 ID: " + notificationId + ", isRead: " + beforeNotification.get().getIsRead());
            }
            
            notificationRepository.markAsRead(notificationId, LocalDateTime.now());
            
            // 읽음 처리 후 상태 확인
            Optional<Notification> afterNotification = notificationRepository.findById(notificationId);
            if (afterNotification.isPresent()) {
                System.out.println("읽음 처리 후 - 알림 ID: " + notificationId + ", isRead: " + afterNotification.get().getIsRead());
            }
            
            System.out.println("알림 읽음 처리 완료 - 알림 ID: " + notificationId);
        } catch (Exception e) {
            System.out.println("알림 읽음 처리 실패 - 알림 ID: " + notificationId + ", 오류: " + e.getMessage());
            throw e;
        }
    }

    // 지점의 모든 알림 읽음 처리
    @Transactional
    public void markAllNotificationsAsRead(Long branchId) {
        System.out.println("모든 알림 읽음 처리 시작 - 지점 ID: " + branchId);
        try {
            notificationRepository.markAllAsRead(RECIPIENT_TYPE_BRANCH, branchId, LocalDateTime.now());
            System.out.println("모든 알림 읽음 처리 완료 - 지점 ID: " + branchId);
        } catch (Exception e) {
            System.out.println("모든 알림 읽음 처리 실패 - 지점 ID: " + branchId + ", 오류: " + e.getMessage());
            throw e;
        }
    }
    
    // 본사의 모든 알림 읽음 처리
    @Transactional
    public void markAllNotificationsAsReadForHeadquarters() {
        notificationRepository.markAllAsReadForHeadquarters(RECIPIENT_TYPE_HEADQUARTERS, LocalDateTime.now());
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

    // 읽지 않은 알림만 조회 (지점)
    public List<NotificationDTO> getUnreadNotifications(Long branchId) {
        List<Notification> unreadNotifications = notificationRepository
                .findByRecipientTypeAndRecipientIdAndIsReadFalseOrderByTimestampDesc(RECIPIENT_TYPE_BRANCH, branchId);
        return unreadNotifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // 읽지 않은 알림만 조회 (본사)
    public List<NotificationDTO> getUnreadNotificationsForHeadquarters() {
        List<Notification> unreadNotifications = notificationRepository
                .findByRecipientTypeAndIsReadFalseOrderByTimestampDesc(RECIPIENT_TYPE_HEADQUARTERS);
        return unreadNotifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // 읽지 않은 알림 개수 조회 (지점)
    public long getUnreadNotificationCount(Long branchId) {
        return notificationRepository.countByRecipientTypeAndRecipientIdAndIsReadFalse(RECIPIENT_TYPE_BRANCH, branchId);
    }
    
    // 읽지 않은 알림 개수 조회 (본사)
    public long getUnreadNotificationCountForHeadquarters() {
        return notificationRepository.countByRecipientTypeAndIsReadFalse(RECIPIENT_TYPE_HEADQUARTERS);
    }
    
    // Entity를 DTO로 변환
    private NotificationDTO convertToDTO(Notification notification) {
        Boolean isReadValue = notification.getIsRead();
        System.out.println("DTO 변환 - 알림 ID: " + notification.getId() + 
                         ", 원본 isRead: " + isReadValue + " (타입: " + isReadValue.getClass().getSimpleName() + ")");
        
        NotificationDTO dto = NotificationDTO.builder()
                .id(notification.getId())
                .recipientType(notification.getRecipientType())
                .recipientId(notification.getRecipientId())
                .type(notification.getType())
                .category(notification.getCategory())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .targetType(notification.getTargetType())
                .targetId(notification.getTargetId())
                .targetName(notification.getTargetName())
                .targetDetail(notification.getTargetDetail())
                .timestamp(notification.getTimestamp())
                .isRead(isReadValue)
                .readAt(notification.getReadAt())
                .branchId(notification.getRecipientId()) // 호환성을 위해
                .userId(null)
                .userName("시스템")
                .build();
        
        System.out.println("DTO 변환 완료 - 알림 ID: " + dto.getId() + 
                         ", DTO isRead: " + dto.isRead() + " (타입: " + (dto.isRead() ? "boolean" : "boolean") + ")");
        
        return dto;
    }
}
