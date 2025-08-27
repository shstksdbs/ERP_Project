package erp_project.erp_project.repository;

import erp_project.erp_project.entity.CostChangeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CostChangeHistoryRepository extends JpaRepository<CostChangeHistory, Long> {
    
    // 특정 메뉴의 원가 변경 이력 조회 (menu.id로 조회)
    @Query("SELECT c FROM CostChangeHistory c WHERE c.menu.id = :menuId ORDER BY c.changeDate DESC")
    List<CostChangeHistory> findByMenuIdOrderByChangeDateDesc(@Param("menuId") Long menuId);
    
    // 전체 원가 변경 이력 (최신순)
    List<CostChangeHistory> findAllByOrderByChangeDateDesc();
    
    // 특정 기간의 원가 변경 이력 조회
    @Query("SELECT c FROM CostChangeHistory c WHERE c.changeDate BETWEEN :startDate AND :endDate ORDER BY c.changeDate DESC")
    List<CostChangeHistory> findByChangeDateBetween(@Param("startDate") java.time.LocalDateTime startDate, 
                                                   @Param("endDate") java.time.LocalDateTime endDate);
    
    // 특정 사용자가 수정한 원가 변경 이력
    List<CostChangeHistory> findByUpdatedByOrderByChangeDateDesc(String updatedBy);
    
    // 메뉴 정보와 함께 조회 (JOIN FETCH)
    @Query("SELECT c FROM CostChangeHistory c JOIN FETCH c.menu ORDER BY c.changeDate DESC")
    List<CostChangeHistory> findAllWithMenuOrderByChangeDateDesc();
}
