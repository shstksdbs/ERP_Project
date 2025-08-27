package erp_project.erp_project.repository;

import erp_project.erp_project.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    
    // 카테고리별 원재료 조회
    List<Material> findByCategory(String category);
    
    // 공급업체별 원재료 조회
    List<Material> findBySupplier(String supplier);
    
    // 상태별 원재료 조회
    List<Material> findByStatus(Material.MaterialStatus status);
    
    // 이름으로 검색
    List<Material> findByNameContainingIgnoreCase(String name);
    
    // 코드로 검색
    List<Material> findByCodeContainingIgnoreCase(String code);
    
    // 카테고리와 상태로 조회
    List<Material> findByCategoryAndStatus(String category, Material.MaterialStatus status);
    
    // 모든 카테고리 조회
    @Query("SELECT DISTINCT m.category FROM Material m WHERE m.category IS NOT NULL")
    List<String> findAllCategories();
    
    // 모든 공급업체 조회
    @Query("SELECT DISTINCT m.supplier FROM Material m WHERE m.supplier IS NOT NULL")
    List<String> findAllSuppliers();
}
