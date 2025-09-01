package erp_project.erp_project.repository;

import erp_project.erp_project.entity.MaterialStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialStockRepository extends JpaRepository<MaterialStock, Long> {

    // 지점별 재고 조회
    List<MaterialStock> findByBranchId(Long branchId);

    // 특정 재료의 지점별 재고 조회
    List<MaterialStock> findByMaterialId(Long materialId);

    // 지점과 재료로 특정 재고 조회
    MaterialStock findByBranchIdAndMaterialId(Long branchId, Long materialId);

    // 재고 부족 항목 조회 (현재 재고가 최소 재고 이하)
    @Query("SELECT ms FROM MaterialStock ms WHERE ms.branch.id = :branchId AND ms.currentStock <= ms.minStock")
    List<MaterialStock> findLowStockItems(@Param("branchId") Long branchId);

    // 재고 과다 항목 조회 (현재 재고가 최대 재고의 80% 이상)
    @Query("SELECT ms FROM MaterialStock ms WHERE ms.branch.id = :branchId AND ms.currentStock >= (ms.maxStock * 0.8)")
    List<MaterialStock> findExcessStockItems(@Param("branchId") Long branchId);
    
    // 재고 부족 시 알림 (최소 재고 기준) - InventoryService에서 사용
    @Query("SELECT ms FROM MaterialStock ms WHERE ms.branch.id = :branchId AND ms.currentStock < ms.minStock")
    List<MaterialStock> findByBranchIdAndCurrentStockLessThanMinStock(@Param("branchId") Long branchId);
}
