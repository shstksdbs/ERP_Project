package erp_project.erp_project.repository;

import erp_project.erp_project.entity.NoticeTargetGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeTargetGroupRepository extends JpaRepository<NoticeTargetGroup, Long> {
    
    // 활성 상태인 대상 그룹 조회
    @Query("SELECT ntg FROM NoticeTargetGroup ntg WHERE ntg.status = 'active' ORDER BY ntg.name")
    List<NoticeTargetGroup> findActiveTargetGroups();
    

    
    // 이름으로 검색
    @Query("SELECT ntg FROM NoticeTargetGroup ntg " +
           "WHERE ntg.name LIKE %:searchTerm% OR ntg.description LIKE %:searchTerm% " +
           "ORDER BY ntg.name")
    List<NoticeTargetGroup> findByNameOrDescriptionContaining(@Param("searchTerm") String searchTerm);
}
