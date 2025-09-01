package erp_project.erp_project.repository;

import erp_project.erp_project.entity.MenuSalesStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MenuSalesStatisticsRepository extends JpaRepository<MenuSalesStatistics, Long> {
    
    // 지점별 메뉴별 특정 날짜 통계 조회
    Optional<MenuSalesStatistics> findByBranchIdAndMenuIdAndStatisticDate(Long branchId, Long menuId, LocalDate date);
    
    // 지점별 특정 날짜의 모든 메뉴 통계 조회
    List<MenuSalesStatistics> findByBranchIdAndStatisticDateOrderByNetSalesDesc(Long branchId, LocalDate date);
    
    // 메뉴별 기간 내 통계 조회
    List<MenuSalesStatistics> findByMenuIdAndStatisticDateBetweenOrderByStatisticDate(Long menuId, LocalDate startDate, LocalDate endDate);
    
    // 지점별 기간 내 메뉴별 통계 조회
    List<MenuSalesStatistics> findByBranchIdAndStatisticDateBetweenOrderByStatisticDateDescNetSalesDesc(Long branchId, LocalDate startDate, LocalDate endDate);
    
    // 전체 지점의 특정 메뉴 기간 내 통계 조회
    List<MenuSalesStatistics> findByMenuIdAndStatisticDateBetweenOrderByStatisticDateDescBranchId(Long menuId, LocalDate startDate, LocalDate endDate);
    
    // 커스텀 쿼리: 메뉴별 인기 순위 (수량 기준)
    @Query("SELECT m FROM MenuSalesStatistics m WHERE m.branchId = :branchId AND m.statisticDate BETWEEN :startDate AND :endDate ORDER BY m.quantitySold DESC")
    List<MenuSalesStatistics> findTopSellingMenusByQuantity(@Param("branchId") Long branchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // 커스텀 쿼리: 메뉴별 인기 순위 (매출 기준)
    @Query("SELECT m FROM MenuSalesStatistics m WHERE m.branchId = :branchId AND m.statisticDate BETWEEN :startDate AND :endDate ORDER BY m.netSales DESC")
    List<MenuSalesStatistics> findTopSellingMenusBySales(@Param("branchId") Long branchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // 커스텀 쿼리: 메뉴 이름을 포함한 인기 순위 (매출 기준)
    @Query("SELECT m, menu.name as menuName FROM MenuSalesStatistics m JOIN Menu menu ON m.menuId = menu.id WHERE m.branchId = :branchId AND m.statisticDate BETWEEN :startDate AND :endDate ORDER BY m.netSales DESC")
    List<Object[]> findTopSellingMenusBySalesWithName(@Param("branchId") Long branchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // 커스텀 쿼리: 메뉴 이름을 포함한 인기 순위 (수량 기준)
    @Query("SELECT m, menu.name as menuName FROM MenuSalesStatistics m JOIN Menu menu ON m.menuId = menu.id WHERE m.branchId = :branchId AND m.statisticDate BETWEEN :startDate AND :endDate ORDER BY m.quantitySold DESC")
    List<Object[]> findTopSellingMenusByQuantityWithName(@Param("branchId") Long branchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // 커스텀 쿼리: 전체 지점 메뉴별 통합 통계
    @Query("SELECT m FROM MenuSalesStatistics m WHERE m.statisticDate BETWEEN :startDate AND :endDate ORDER BY m.netSales DESC")
    List<MenuSalesStatistics> findTopSellingMenusAllBranches(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // 상품별 매출 통계 조회 (새로 추가)
    @Query("SELECT m, menu.name as menuName, menu.category as menuCategory, menu.price as menuPrice FROM MenuSalesStatistics m JOIN Menu menu ON m.menuId = menu.id WHERE m.branchId = :branchId AND m.statisticDate BETWEEN :startDate AND :endDate ORDER BY m.netSales DESC")
    List<Object[]> findProductSalesStatistics(@Param("branchId") Long branchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // 카테고리별 상품 매출 통계 조회
    @Query("SELECT menu.category as menuCategory, SUM(m.netSales) as totalSales, SUM(m.quantitySold) as totalQuantity, COUNT(DISTINCT m.menuId) as productCount FROM MenuSalesStatistics m JOIN Menu menu ON m.menuId = menu.id WHERE m.branchId = :branchId AND m.statisticDate BETWEEN :startDate AND :endDate GROUP BY menu.category ORDER BY totalSales DESC")
    List<Object[]> findCategorySalesStatistics(@Param("branchId") Long branchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
