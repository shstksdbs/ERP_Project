package erp_project.erp_project.repository;

import erp_project.erp_project.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    
    // 카테고리별 메뉴 조회
    List<Menu> findByCategoryOrderByDisplayOrderAsc(String category);
    
    // 사용 가능한 메뉴만 조회
    List<Menu> findByIsAvailableTrueOrderByDisplayOrderAsc();
    
    // 카테고리별 사용 가능한 메뉴 조회
    List<Menu> findByCategoryAndIsAvailableTrueOrderByDisplayOrderAsc(String category);
    
    // 메뉴명으로 검색
    List<Menu> findByNameContainingIgnoreCaseAndIsAvailableTrue(String name);
    
    // 가격 범위로 검색
    @Query("SELECT m FROM Menu m WHERE m.price BETWEEN :minPrice AND :maxPrice AND m.isAvailable = true")
    List<Menu> findByPriceRange(@Param("minPrice") java.math.BigDecimal minPrice, 
                                @Param("maxPrice") java.math.BigDecimal maxPrice);
    
    // 카테고리 ID로 메뉴 조회 (새로운 방식)
    List<Menu> findByCategoryIdAndIsAvailableTrueOrderByDisplayOrderAsc(Long categoryId);
    
    // 카테고리 ID로 메뉴 개수 조회
    long countByCategoryIdAndIsAvailableTrue(Long categoryId);
    
    // 카테고리 ID로 메뉴 존재 여부 확인
    boolean existsByCategoryId(Long categoryId);
    
    // 카테고리 ID와 상위 카테고리 ID로 메뉴 조회 (하위 카테고리 포함)
    @Query("SELECT m FROM Menu m JOIN MenuCategory c ON m.categoryId = c.id WHERE (c.id = :categoryId OR c.parentCategoryId = :categoryId) AND m.isAvailable = true ORDER BY m.displayOrder")
    List<Menu> findByCategoryIdOrParentCategoryIdAndIsAvailableTrue(@Param("categoryId") Long categoryId);
    
    // 카테고리 정보와 함께 메뉴 조회 (JOIN FETCH) - 모든 메뉴 포함
    @Query("SELECT m FROM Menu m LEFT JOIN FETCH m.menuCategory ORDER BY m.menuCategory.displayOrder, m.displayOrder")
    List<Menu> findAllWithCategoryOrderByDisplayOrder();
    
    // 메뉴명으로 정확히 일치하는 메뉴 조회
    Optional<Menu> findByNameAndIsAvailableTrue(String name);
}
