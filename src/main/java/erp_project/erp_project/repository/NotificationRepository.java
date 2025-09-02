package erp_project.erp_project.repository;

import erp_project.erp_project.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // 특정 수신자의 모든 알림 조회 (최신순)
    List<Notification> findByRecipientTypeAndRecipientIdOrderByTimestampDesc(String recipientType, Long recipientId);
    
    // 특정 수신자의 모든 알림 조회 (페이징 지원)
    Page<Notification> findByRecipientTypeAndRecipientIdOrderByTimestampDesc(String recipientType, Long recipientId, Pageable pageable);
    
    // 본사의 모든 알림 조회 (최신순)
    List<Notification> findByRecipientTypeOrderByTimestampDesc(String recipientType);
    
    // 본사의 모든 알림 조회 (페이징 지원)
    Page<Notification> findByRecipientTypeOrderByTimestampDesc(String recipientType, Pageable pageable);
    
    // 특정 수신자의 읽지 않은 알림 조회
    List<Notification> findByRecipientTypeAndRecipientIdAndIsReadFalseOrderByTimestampDesc(String recipientType, Long recipientId);
    
    // 본사의 읽지 않은 알림 조회
    List<Notification> findByRecipientTypeAndIsReadFalseOrderByTimestampDesc(String recipientType);
    
    // 특정 수신자의 읽지 않은 알림 개수 조회
    long countByRecipientTypeAndRecipientIdAndIsReadFalse(String recipientType, Long recipientId);
    
    // 본사의 읽지 않은 알림 개수 조회
    long countByRecipientTypeAndIsReadFalse(String recipientType);
    
    // 특정 알림을 읽음으로 표시
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :id")
    void markAsRead(@Param("id") Long id, @Param("readAt") LocalDateTime readAt);
    
    // 특정 수신자의 모든 알림을 읽음으로 표시
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.recipientType = :recipientType AND n.recipientId = :recipientId")
    void markAllAsRead(@Param("recipientType") String recipientType, @Param("recipientId") Long recipientId, @Param("readAt") LocalDateTime readAt);
    
    // 본사의 모든 알림을 읽음으로 표시
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.recipientType = :recipientType AND n.recipientId IS NULL")
    void markAllAsReadForHeadquarters(@Param("recipientType") String recipientType, @Param("readAt") LocalDateTime readAt);
    
    // 특정 수신자의 오래된 알림 삭제 (30일 이상)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipientType = :recipientType AND n.recipientId = :recipientId AND n.timestamp < :cutoffDate")
    void deleteOldNotifications(@Param("recipientType") String recipientType, @Param("recipientId") Long recipientId, @Param("cutoffDate") LocalDateTime cutoffDate);
    
    // 본사의 오래된 알림 삭제 (30일 이상)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.recipientType = :recipientType AND n.recipientId IS NULL AND n.timestamp < :cutoffDate")
    void deleteOldNotificationsForHeadquarters(@Param("recipientType") String recipientType, @Param("cutoffDate") LocalDateTime cutoffDate);
    
    // 전지점 읽지 않은 알림 개수 조회
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.isRead = false")
    Long countUnreadNotificationsByAllBranches();
}
