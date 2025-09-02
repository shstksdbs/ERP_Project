package erp_project.erp_project.repository;

import erp_project.erp_project.entity.NoticeTargetMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeTargetMappingRepository extends JpaRepository<NoticeTargetMapping, Long> {
    
    // 특정 공지사항의 대상 그룹 조회
    @Query("SELECT ntm FROM NoticeTargetMapping ntm " +
           "JOIN FETCH ntm.targetGroup " +
           "WHERE ntm.noticeId = :noticeId")
    List<NoticeTargetMapping> findByNoticeId(@Param("noticeId") Long noticeId);
    
    // 특정 대상 그룹의 공지사항 조회
    @Query("SELECT ntm FROM NoticeTargetMapping ntm " +
           "JOIN FETCH ntm.notice " +
           "WHERE ntm.targetGroupId = :targetGroupId")
    List<NoticeTargetMapping> findByTargetGroupId(@Param("targetGroupId") Long targetGroupId);
    
    // 공지사항 ID로 매핑 삭제
    void deleteByNoticeId(Long noticeId);
    
    // 대상 그룹 ID로 매핑 삭제
    void deleteByTargetGroupId(Long targetGroupId);
}
