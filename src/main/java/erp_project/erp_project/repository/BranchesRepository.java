package erp_project.erp_project.repository;

import erp_project.erp_project.entity.Branches;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchesRepository extends JpaRepository<Branches, Long> {
    
    Optional<Branches> findByBranchCode(String branchCode);
    
    List<Branches> findByStatus(Branches.BranchStatus status);
    
    List<Branches> findByBranchType(Branches.BranchType branchType);
    
    @Query("SELECT b FROM Branches b WHERE b.branchCode IN :branchCodes")
    List<Branches> findByBranchCodes(@Param("branchCodes") List<String> branchCodes);
    
    boolean existsByBranchCode(String branchCode);
}
