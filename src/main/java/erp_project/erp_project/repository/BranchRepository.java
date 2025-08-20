package erp_project.erp_project.repository;

import erp_project.erp_project.entity.Branches;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branches, Long> {
    
    // 지점 코드로 지점 조회
    Optional<Branches> findByBranchCode(String branchCode);
    
    // 지점명으로 지점 조회 (부분 일치)
    List<Branches> findByBranchNameContainingIgnoreCase(String branchName);
    
    // 상태별 지점 조회
    List<Branches> findByStatus(Branches.BranchStatus status);
    
    // 활성 상태인 지점만 조회
    @Query("SELECT b FROM Branches b WHERE b.status = 'active'")
    List<Branches> findActiveBranches();
    
    // 지점 코드 중복 확인
    boolean existsByBranchCode(String branchCode);
    
    // 지점명 중복 확인
    boolean existsByBranchName(String branchName);
    
    // 특정 지역의 지점 조회 (주소에 특정 키워드가 포함된 지점)
    @Query("SELECT b FROM Branches b WHERE b.address LIKE %:keyword%")
    List<Branches> findByAddressContaining(@Param("keyword") String keyword);
}
