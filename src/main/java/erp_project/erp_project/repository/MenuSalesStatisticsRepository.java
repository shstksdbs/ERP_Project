package erp_project.erp_project.repository;

import erp_project.erp_project.entity.MenuSalesStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MenuSalesStatisticsRepository extends JpaRepository<MenuSalesStatistics, Long> {
    
    // 특정 기간의 메뉴별 매출 통계 조회 (본사 제외)
    @Query("SELECT m FROM MenuSalesStatistics m " +
           "WHERE m.statisticDate BETWEEN :startDate AND :endDate " +
           "AND m.branchId IN :branchIds")
    List<MenuSalesStatistics> findByStatisticDateBetweenAndBranchIdIn(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("branchIds") List<Long> branchIds
    );
    
    // 특정 메뉴의 특정 기간 매출 통계 조회
    @Query("SELECT m FROM MenuSalesStatistics m " +
           "WHERE m.menuId = :menuId " +
           "AND m.statisticDate BETWEEN :startDate AND :endDate " +
           "AND m.branchId IN :branchIds")
    List<MenuSalesStatistics> findByMenuIdAndStatisticDateBetweenAndBranchIdIn(
        @Param("menuId") Long menuId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("branchIds") List<Long> branchIds
    );
    
    // 특정 지점의 특정 기간 판매량 기준 상위 메뉴 조회
    @Query("SELECT m FROM MenuSalesStatistics m " +
           "WHERE m.branchId = :branchId " +
           "AND m.statisticDate BETWEEN :startDate AND :endDate " +
           "ORDER BY m.quantitySold DESC")
    List<MenuSalesStatistics> findTopSellingMenusByQuantity(
        @Param("branchId") Long branchId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // 특정 지점, 메뉴, 날짜로 통계 조회
    @Query("SELECT m FROM MenuSalesStatistics m " +
           "WHERE m.branchId = :branchId " +
           "AND m.menuId = :menuId " +
           "AND m.statisticDate = :statisticDate")
    java.util.Optional<MenuSalesStatistics> findByBranchIdAndMenuIdAndStatisticDate(
        @Param("branchId") Long branchId,
        @Param("menuId") Long menuId,
        @Param("statisticDate") LocalDate statisticDate
    );
    
    // 특정 지점의 특정 기간 매출 기준 상위 메뉴 조회
    @Query("SELECT m FROM MenuSalesStatistics m " +
           "WHERE m.branchId = :branchId " +
           "AND m.statisticDate BETWEEN :startDate AND :endDate " +
           "ORDER BY m.netSales DESC")
    List<MenuSalesStatistics> findTopSellingMenusBySales(
        @Param("branchId") Long branchId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // 특정 지점의 특정 기간 매출 기준 상위 메뉴 조회 (메뉴 이름 포함)
    @Query("SELECT m.menuId, menu.name, SUM(m.quantitySold), SUM(m.netSales) " +
           "FROM MenuSalesStatistics m " +
           "JOIN Menu menu ON m.menuId = menu.id " +
           "WHERE m.branchId = :branchId " +
           "AND m.statisticDate BETWEEN :startDate AND :endDate " +
           "GROUP BY m.menuId, menu.name " +
           "ORDER BY SUM(m.netSales) DESC")
    List<Object[]> findTopSellingMenusBySalesWithName(
        @Param("branchId") Long branchId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // 특정 지점의 특정 기간 판매량 기준 상위 메뉴 조회 (메뉴 이름 포함)
    @Query("SELECT m.menuId, menu.name, SUM(m.quantitySold), SUM(m.netSales) " +
           "FROM MenuSalesStatistics m " +
           "JOIN Menu menu ON m.menuId = menu.id " +
           "WHERE m.branchId = :branchId " +
           "AND m.statisticDate BETWEEN :startDate AND :endDate " +
           "GROUP BY m.menuId, menu.name " +
           "ORDER BY SUM(m.quantitySold) DESC")
    List<Object[]> findTopSellingMenusByQuantityWithName(
        @Param("branchId") Long branchId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // 상품별 매출 통계 조회
    @Query("SELECT m.menuId, menu.name, menu.category, menu.price, " +
           "SUM(m.quantitySold), SUM(m.totalSales), SUM(m.discountAmount), SUM(m.netSales) " +
           "FROM MenuSalesStatistics m " +
           "JOIN Menu menu ON m.menuId = menu.id " +
           "WHERE m.branchId = :branchId " +
           "AND m.statisticDate BETWEEN :startDate AND :endDate " +
           "GROUP BY m.menuId, menu.name, menu.category, menu.price " +
           "ORDER BY SUM(m.netSales) DESC")
    List<Object[]> findProductSalesStatistics(
        @Param("branchId") Long branchId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // 테스트용 - 데이터 존재 여부 확인
    @Query("SELECT COUNT(m) FROM MenuSalesStatistics m WHERE m.branchId = :branchId")
    Long countByBranchId(@Param("branchId") Long branchId);
    
    // 카테고리별 매출 통계 조회
    @Query("SELECT menu.category, SUM(m.quantitySold), SUM(m.netSales) " +
           "FROM MenuSalesStatistics m " +
           "JOIN Menu menu ON m.menuId = menu.id " +
           "WHERE m.branchId = :branchId " +
           "AND m.statisticDate BETWEEN :startDate AND :endDate " +
           "GROUP BY menu.category " +
           "ORDER BY SUM(m.netSales) DESC")
    List<Object[]> findCategorySalesStatistics(
        @Param("branchId") Long branchId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // 전지점 기준 인기 상품 조회 (매출 기준, 상위 5개)
    @Query("SELECT m.menuId, menu.name, SUM(m.quantitySold), SUM(m.netSales) " +
           "FROM MenuSalesStatistics m " +
           "JOIN Menu menu ON m.menuId = menu.id " +
           "WHERE m.statisticDate BETWEEN :startDate AND :endDate " +
           "GROUP BY m.menuId, menu.name " +
           "ORDER BY SUM(m.netSales) DESC")
    List<Object[]> findTopSellingMenusByAllBranches(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // 대용량 처리를 위한 메서드들
    List<MenuSalesStatistics> findByBranchIdAndStatisticDate(Long branchId, LocalDate date);
    
    List<MenuSalesStatistics> findByBranchIdAndStatisticDateBetween(Long branchId, LocalDate startDate, LocalDate endDate);
    
    List<MenuSalesStatistics> findByStatisticDateBefore(LocalDate date);
    
    List<MenuSalesStatistics> findByStatisticDateBetween(LocalDate startDate, LocalDate endDate);
    
    long countByStatisticDateAfter(LocalDate date);
    
    long countByStatisticDateBefore(LocalDate date);
}