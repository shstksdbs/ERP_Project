package erp_project.erp_project.repository;

import erp_project.erp_project.entity.PriceChangeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceChangeHistoryRepository extends JpaRepository<PriceChangeHistory, Long> {
    
    // 메뉴별 변경 이력 조회
    List<PriceChangeHistory> findByMenuIdOrderByChangeDateDesc(Long menuId);
    
    // 전체 변경 이력 조회 (최신순)
    List<PriceChangeHistory> findAllByOrderByChangeDateDesc();
    
    // 특정 기간 동안의 변경 이력 조회
    @Query("SELECT p FROM PriceChangeHistory p WHERE p.changeDate BETWEEN ?1 AND ?2 ORDER BY p.changeDate DESC")
    List<PriceChangeHistory> findByChangeDateBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}
