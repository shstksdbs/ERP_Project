package erp_project.erp_project.repository;

import erp_project.erp_project.entity.SupplyRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplyRequestItemRepository extends JpaRepository<SupplyRequestItem, Long> {
    
    /**
     * 특정 발주 요청의 상품 목록 조회
     */
    List<SupplyRequestItem> findBySupplyRequestId(Long supplyRequestId);
    
    /**
     * 특정 원재료의 발주 요청 상품 목록 조회
     */
    List<SupplyRequestItem> findByMaterialId(Long materialId);
    
    /**
     * 특정 상태의 발주 요청 상품 목록 조회
     */
    List<SupplyRequestItem> findByStatus(SupplyRequestItem.SupplyRequestItemStatus status);
}
