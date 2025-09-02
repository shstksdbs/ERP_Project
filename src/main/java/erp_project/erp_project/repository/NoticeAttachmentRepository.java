package erp_project.erp_project.repository;

import erp_project.erp_project.entity.NoticeAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoticeAttachmentRepository extends JpaRepository<NoticeAttachment, Long> {
    
    // 특정 공지사항의 모든 첨부파일 조회
    @Query("SELECT na FROM NoticeAttachment na WHERE na.noticeId = :noticeId AND na.isActive = true ORDER BY na.createdAt ASC")
    List<NoticeAttachment> findByNoticeIdAndIsActiveTrue(@Param("noticeId") Long noticeId);
    
    // 특정 공지사항의 모든 첨부파일 조회 (관리자용 - 비활성 포함)
    @Query("SELECT na FROM NoticeAttachment na WHERE na.noticeId = :noticeId ORDER BY na.createdAt ASC")
    List<NoticeAttachment> findByNoticeId(@Param("noticeId") Long noticeId);
    
    // 저장된 파일명으로 첨부파일 조회
    Optional<NoticeAttachment> findByStoredFilenameAndIsActiveTrue(String storedFilename);
    
    // 파일 타입별 첨부파일 조회
    @Query("SELECT na FROM NoticeAttachment na WHERE na.noticeId = :noticeId AND na.fileType = :fileType AND na.isActive = true ORDER BY na.createdAt ASC")
    List<NoticeAttachment> findByNoticeIdAndFileTypeAndIsActiveTrue(
        @Param("noticeId") Long noticeId, 
        @Param("fileType") NoticeAttachment.FileType fileType
    );
    
    // 특정 공지사항의 첨부파일 수 조회
    @Query("SELECT COUNT(na) FROM NoticeAttachment na WHERE na.noticeId = :noticeId AND na.isActive = true")
    Long countByNoticeIdAndIsActiveTrue(@Param("noticeId") Long noticeId);
    
    // 특정 공지사항의 첨부파일 총 크기 조회
    @Query("SELECT SUM(na.fileSize) FROM NoticeAttachment na WHERE na.noticeId = :noticeId AND na.isActive = true")
    Long sumFileSizeByNoticeIdAndIsActiveTrue(@Param("noticeId") Long noticeId);
    
    // 다운로드 수가 많은 첨부파일 조회 (인기 파일)
    @Query("SELECT na FROM NoticeAttachment na WHERE na.isActive = true ORDER BY na.downloadCount DESC")
    List<NoticeAttachment> findTopDownloadedAttachments();
    
    // 특정 기간에 업로드된 첨부파일 조회
    @Query("SELECT na FROM NoticeAttachment na WHERE na.createdAt BETWEEN :startDate AND :endDate AND na.isActive = true ORDER BY na.createdAt DESC")
    List<NoticeAttachment> findByCreatedAtBetweenAndIsActiveTrue(
        @Param("startDate") java.time.LocalDateTime startDate,
        @Param("endDate") java.time.LocalDateTime endDate
    );
    
    // 특정 공지사항의 첨부파일 삭제 (논리 삭제)
    @Query("UPDATE NoticeAttachment na SET na.isActive = false WHERE na.noticeId = :noticeId")
    void deactivateByNoticeId(@Param("noticeId") Long noticeId);
    
    // 특정 공지사항의 첨부파일 삭제 (물리 삭제)
    void deleteByNoticeId(Long noticeId);
}
