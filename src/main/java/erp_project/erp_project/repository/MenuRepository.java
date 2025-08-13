package erp_project.erp_project.repository;

import erp_project.erp_project.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

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
}
