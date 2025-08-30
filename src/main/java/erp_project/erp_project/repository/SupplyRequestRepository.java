package erp_project.erp_project.repository;

import erp_project.erp_project.entity.SupplyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplyRequestRepository extends JpaRepository<SupplyRequest, Long> {
    
    /**
     * 특정 지점의 발주 요청 목록 조회
     */
    List<SupplyRequest> findByRequestingBranchId(Long branchId);
    
    /**
     * 특정 상태의 발주 요청 목록 조회
     */
    List<SupplyRequest> findByStatus(SupplyRequest.SupplyRequestStatus status);
    
    /**
     * 특정 지점과 상태의 발주 요청 목록 조회
     */
    List<SupplyRequest> findByRequestingBranchIdAndStatus(Long branchId, SupplyRequest.SupplyRequestStatus status);
    
    /**
     * 특정 우선순위의 발주 요청 목록 조회
     */
    List<SupplyRequest> findByPriority(SupplyRequest.SupplyRequestPriority priority);
}
