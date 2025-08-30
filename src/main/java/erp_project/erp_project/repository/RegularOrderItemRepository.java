package erp_project.erp_project.repository;

import erp_project.erp_project.entity.RegularOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegularOrderItemRepository extends JpaRepository<RegularOrderItem, Long> {
    
    // 정기발주 ID로 아이템 조회
    List<RegularOrderItem> findByRegularOrderIdOrderById(Long regularOrderId);
    
    // 재료 ID로 정기발주 아이템 조회
    List<RegularOrderItem> findByMaterialId(Long materialId);
    
    // 정기발주 ID와 재료 ID로 조회
    RegularOrderItem findByRegularOrderIdAndMaterialId(Long regularOrderId, Long materialId);
    
    // 정기발주 ID로 아이템들 삭제
    void deleteByRegularOrderId(Long regularOrderId);
}
