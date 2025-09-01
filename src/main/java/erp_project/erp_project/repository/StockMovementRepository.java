package erp_project.erp_project.repository;

import erp_project.erp_project.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    
    // 특정 자재의 재고 이동 이력 조회
    List<StockMovement> findByMaterialIdOrderByMovementDateDesc(Long materialId);
    
    // 특정 지점의 재고 이동 이력 조회
    List<StockMovement> findByBranchIdOrderByMovementDateDesc(Long branchId);
    
    // 특정 자재와 지점의 재고 이동 이력 조회
    List<StockMovement> findByMaterialIdAndBranchIdOrderByMovementDateDesc(Long materialId, Long branchId);
    
    // 특정 지점과 이동 타입의 재고 이동 이력 조회
    List<StockMovement> findByBranchIdAndMovementTypeOrderByMovementDateDesc(Long branchId, StockMovement.MovementType movementType);
    
    // 특정 기간의 재고 이동 이력 조회
    @Query("SELECT sm FROM StockMovement sm WHERE sm.movementDate BETWEEN :startDate AND :endDate ORDER BY sm.movementDate DESC")
    List<StockMovement> findByMovementDateBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // 특정 참조 타입의 재고 이동 이력 조회
    List<StockMovement> findByReferenceTypeOrderByMovementDateDesc(String referenceType);
    
    // 특정 참조 ID의 재고 이동 이력 조회
    List<StockMovement> findByReferenceIdOrderByMovementDateDesc(Long referenceId);
    
    // 특정 이동 타입의 재고 이동 이력 조회
    List<StockMovement> findByMovementTypeOrderByMovementDateDesc(StockMovement.MovementType movementType);
}
