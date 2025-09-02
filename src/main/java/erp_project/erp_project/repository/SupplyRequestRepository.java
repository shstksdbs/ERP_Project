package erp_project.erp_project.repository;

import erp_project.erp_project.entity.SupplyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplyRequestRepository extends JpaRepository<SupplyRequest, Long> {
    
    /**
     * 모든 발주 요청을 생성일 기준 내림차순으로 조회
     */
    List<SupplyRequest> findAllByOrderByCreatedAtDesc();
    
    /**
     * 모든 발주 요청을 요청일 기준 내림차순으로 조회
     */
    List<SupplyRequest> findAllByOrderByRequestDateDesc();
    
    /**
     * 특정 지점의 발주 요청 목록을 생성일 기준 내림차순으로 조회
     */
    List<SupplyRequest> findByRequestingBranchIdOrderByCreatedAtDesc(Long branchId);
    
    /**
     * 특정 지점의 발주 요청 목록을 요청일 기준 내림차순으로 조회
     */
    List<SupplyRequest> findByRequestingBranchIdOrderByRequestDateDesc(Long branchId);
    
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
    
    /**
     * 특정 지점의 특정 상태 발주 요청 수 조회
     */
    long countByRequestingBranchIdAndStatus(Long branchId, SupplyRequest.SupplyRequestStatus status);
}
