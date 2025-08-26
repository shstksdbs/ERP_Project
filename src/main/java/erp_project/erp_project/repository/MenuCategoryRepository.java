package erp_project.erp_project.repository;

import erp_project.erp_project.entity.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long> {
    
    // 기존 메뉴의 category 문자열과 매핑하기 위한 메서드
    Optional<MenuCategory> findByName(String name);
    
    // 모든 카테고리 조회 (활성/비활성 구분 없이)
    List<MenuCategory> findAllByOrderByDisplayOrderAsc();
    
    // 활성화된 카테고리만 조회
    List<MenuCategory> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    // 상위 카테고리만 조회 (parentCategoryId가 null인 것들)
    List<MenuCategory> findByParentCategoryIdIsNullAndIsActiveTrueOrderByDisplayOrderAsc();
    
    // 특정 상위 카테고리의 하위 카테고리들 조회
    List<MenuCategory> findByParentCategoryIdAndIsActiveTrueOrderByDisplayOrderAsc(Long parentCategoryId);
    
    // 표시명으로 조회
    Optional<MenuCategory> findByDisplayName(String displayName);
    
    // 카테고리명 존재 여부 확인
    boolean existsByName(String name);
    
    // 표시명 존재 여부 확인
    boolean existsByDisplayName(String displayName);
    
    // 계층 구조로 모든 카테고리 조회 (상위 카테고리부터)
    @Query("SELECT c FROM MenuCategory c WHERE c.parentCategoryId IS NULL AND c.isActive = true ORDER BY c.displayOrder")
    List<MenuCategory> findTopLevelCategories();
    
    // 특정 카테고리의 전체 하위 카테고리 조회 (재귀적)
    @Query("SELECT c FROM MenuCategory c WHERE c.isActive = true AND (c.id = :categoryId OR c.parentCategoryId = :categoryId) ORDER BY c.displayOrder")
    List<MenuCategory> findCategoryWithSubCategories(@Param("categoryId") Long categoryId);
    
    // 카테고리별 메뉴 개수 조회 (기존 category 필드 기준)
    @Query("SELECT c.name, c.displayName, COUNT(m.id) as menuCount FROM MenuCategory c LEFT JOIN Menu m ON c.name = m.category WHERE c.isActive = true GROUP BY c.name, c.displayName ORDER BY c.displayOrder")
    List<Object[]> findCategoryMenuCounts();
    
    // 검색어로 카테고리 검색
    @Query("SELECT c FROM MenuCategory c WHERE c.isActive = true AND (c.name LIKE %:searchTerm% OR c.displayName LIKE %:searchTerm% OR c.description LIKE %:searchTerm%) ORDER BY c.displayOrder")
    List<MenuCategory> searchCategories(@Param("searchTerm") String searchTerm);
}
