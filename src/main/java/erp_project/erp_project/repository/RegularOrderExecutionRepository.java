package erp_project.erp_project.repository;

import erp_project.erp_project.entity.RegularOrder;
import erp_project.erp_project.entity.RegularOrderExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegularOrderExecutionRepository extends JpaRepository<RegularOrderExecution, Long> {
    
    /**
     * 특정 정기발주와 실행일로 실행 기록 조회
     */
    Optional<RegularOrderExecution> findByRegularOrderAndExecutionDate(RegularOrder regularOrder, LocalDate executionDate);
    
    /**
     * 특정 정기발주의 모든 실행 기록 조회
     */
    List<RegularOrderExecution> findByRegularOrderOrderByExecutionDateDesc(RegularOrder regularOrder);
    
    /**
     * 특정 지점의 정기발주 실행 기록 조회
     */
    List<RegularOrderExecution> findByRegularOrder_BranchIdOrderByExecutionDateDesc(Long branchId);
    
    /**
     * 특정 기간의 실행 기록 조회
     */
    List<RegularOrderExecution> findByExecutionDateBetweenOrderByExecutionDateDesc(LocalDate startDate, LocalDate endDate);
}
