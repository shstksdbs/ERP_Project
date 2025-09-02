package erp_project.erp_project.repository;

import erp_project.erp_project.entity.Notice;
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
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    
    // 공지사항 목록 조회 (페이징) - 작성자 정보 포함, 지점별 필터링
    @Query("SELECT DISTINCT n FROM Notice n " +
           "LEFT JOIN FETCH n.author a " +
           "LEFT JOIN NoticeTargetMapping ntm ON n.id = ntm.noticeId " +
           "LEFT JOIN NoticeTargetGroup ntg ON ntm.targetGroupId = ntg.id " +
           "WHERE (:category IS NULL OR n.category = :category) " +
           "AND (:status IS NULL OR n.status = :status) " +
           "AND (:isImportant IS NULL OR n.isImportant = :isImportant) " +
           "AND (:searchTerm IS NULL OR n.title LIKE %:searchTerm% OR n.content LIKE %:searchTerm%) " +
           "AND (:branchId IS NULL OR n.isPublic = true OR " +
           "     (ntg.targetBranches LIKE %:branchName% OR ntg.targetBranches = '[]' OR ntg.targetBranches IS NULL)) " +
           "ORDER BY n.isImportant DESC, n.priority DESC, n.createdAt DESC")
    Page<Notice> findNoticesWithFilters(
        @Param("category") Notice.NoticeCategory category,
        @Param("status") Notice.NoticeStatus status,
        @Param("isImportant") Boolean isImportant,
        @Param("searchTerm") String searchTerm,
        @Param("branchId") Long branchId,
        @Param("branchName") String branchName,
        Pageable pageable
    );
    
    // 발행된 공지사항 조회 (사용자용)
    @Query("SELECT n FROM Notice n " +
           "WHERE n.status = 'published' " +
           "AND (n.startDate IS NULL OR n.startDate <= :currentTime) " +
           "AND (n.endDate IS NULL OR n.endDate >= :currentTime) " +
           "ORDER BY n.isImportant DESC, n.priority DESC, n.createdAt DESC")
    List<Notice> findPublishedNotices(@Param("currentTime") LocalDateTime currentTime);
    
    // 특정 사용자가 읽을 수 있는 공지사항 조회 (간단한 버전)
    @Query("SELECT DISTINCT n FROM Notice n " +
           "LEFT JOIN NoticeTargetMapping ntm ON n.id = ntm.noticeId " +
           "LEFT JOIN NoticeTargetGroup ntg ON ntm.targetGroupId = ntg.id " +
           "WHERE n.status = 'published' " +
           "AND (n.startDate IS NULL OR n.startDate <= :currentTime) " +
           "AND (n.endDate IS NULL OR n.endDate >= :currentTime) " +
           "AND (n.isPublic = true OR ntg.id IS NOT NULL) " +
           "ORDER BY n.isImportant DESC, n.priority DESC, n.createdAt DESC")
    List<Notice> findNoticesForUser(
        @Param("currentTime") LocalDateTime currentTime
    );
    
    // 조회수 증가
    @Modifying
    @Query("UPDATE Notice n SET n.viewCount = n.viewCount + 1 WHERE n.id = :noticeId")
    void incrementViewCount(@Param("noticeId") Long noticeId);
    
    // 예약 발행할 공지사항 조회
    @Query("SELECT n FROM Notice n " +
           "WHERE n.status = 'scheduled' " +
           "AND n.startDate <= :currentTime")
    List<Notice> findScheduledNoticesToPublish(@Param("currentTime") LocalDateTime currentTime);
    
    // 만료된 공지사항 조회
    @Query("SELECT n FROM Notice n " +
           "WHERE n.status = 'published' " +
           "AND n.endDate IS NOT NULL " +
           "AND n.endDate < :currentTime")
    List<Notice> findExpiredNotices(@Param("currentTime") LocalDateTime currentTime);
}
