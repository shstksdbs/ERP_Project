package erp_project.erp_project.repository;

import erp_project.erp_project.entity.NoticeReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoticeReadStatusRepository extends JpaRepository<NoticeReadStatus, Long> {
    
    // 특정 사용자의 특정 공지사항 읽음 상태 조회
    Optional<NoticeReadStatus> findByNoticeIdAndUserId(Long noticeId, Long userId);
    
    // 특정 사용자의 모든 읽음 상태 조회
    @Query("SELECT nrs FROM NoticeReadStatus nrs WHERE nrs.userId = :userId")
    List<NoticeReadStatus> findByUserId(@Param("userId") Long userId);
    
    // 특정 공지사항의 모든 읽음 상태 조회
    @Query("SELECT nrs FROM NoticeReadStatus nrs WHERE nrs.noticeId = :noticeId")
    List<NoticeReadStatus> findByNoticeId(@Param("noticeId") Long noticeId);
    
    // 특정 공지사항의 읽음 상태 삭제
    void deleteByNoticeId(Long noticeId);
    
    // 특정 사용자의 읽지 않은 공지사항 수 조회
    @Query("SELECT COUNT(nrs) FROM NoticeReadStatus nrs " +
           "WHERE nrs.userId = :userId AND nrs.isRead = false")
    Long countUnreadNoticesByUserId(@Param("userId") Long userId);
    
    // 특정 공지사항의 읽음 통계 조회
    @Query("SELECT COUNT(nrs) FROM NoticeReadStatus nrs " +
           "WHERE nrs.noticeId = :noticeId AND nrs.isRead = true")
    Long countReadByNoticeId(@Param("noticeId") Long noticeId);
    
    @Query("SELECT COUNT(nrs) FROM NoticeReadStatus nrs " +
           "WHERE nrs.noticeId = :noticeId")
    Long countTotalByNoticeId(@Param("noticeId") Long noticeId);
}
