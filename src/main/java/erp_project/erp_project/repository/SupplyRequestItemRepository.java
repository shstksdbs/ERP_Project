package erp_project.erp_project.repository;

import erp_project.erp_project.entity.SupplyRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplyRequestItemRepository extends JpaRepository<SupplyRequestItem, Long> {
    
    /**
     * 특정 발주 요청의 모든 아이템 조회
     */
    List<SupplyRequestItem> findBySupplyRequestIdOrderById(Long supplyRequestId);
    
    /**
     * 특정 발주 요청의 모든 아이템 조회
     */
    List<SupplyRequestItem> findBySupplyRequestId(Long supplyRequestId);
    
    /**
     * 특정 발주 요청의 모든 아이템 조회 (Material과 함께)
     */
    @Query("SELECT sri FROM SupplyRequestItem sri JOIN FETCH sri.material WHERE sri.supplyRequestId = :supplyRequestId")
    List<SupplyRequestItem> findBySupplyRequestIdWithMaterial(@Param("supplyRequestId") Long supplyRequestId);
    
    /**
     * 특정 원재료의 발주 요청 상품 목록 조회
     */
    List<SupplyRequestItem> findByMaterialId(Long materialId);
    
    /**
     * 특정 상태의 발주 요청 상품 목록 조회
     */
    List<SupplyRequestItem> findByStatus(SupplyRequestItem.SupplyRequestItemStatus status);
    
    /**
     * 특정 지점의 발주 아이템 조회 (SupplyRequest와 JOIN하여 조회)
     */
    @Query("SELECT sri FROM SupplyRequestItem sri JOIN SupplyRequest sr ON sri.supplyRequestId = sr.id WHERE sr.requestingBranchId = :branchId ORDER BY sri.createdAt DESC")
    List<SupplyRequestItem> findByBranchIdOrderByCreatedAtDesc(@Param("branchId") Long branchId);
}
