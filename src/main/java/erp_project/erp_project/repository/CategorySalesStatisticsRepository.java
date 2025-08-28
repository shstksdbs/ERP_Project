package erp_project.erp_project.repository;

import erp_project.erp_project.entity.CategorySalesStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategorySalesStatisticsRepository extends JpaRepository<CategorySalesStatistics, Long> {
    
    // 지점별 카테고리별 특정 날짜 통계 조회
    Optional<CategorySalesStatistics> findByBranchIdAndCategoryIdAndStatisticDate(Long branchId, Long categoryId, LocalDate date);
    
    // 지점별 특정 날짜의 모든 카테고리 통계 조회
    List<CategorySalesStatistics> findByBranchIdAndStatisticDateOrderByNetSalesDesc(Long branchId, LocalDate date);
    
    // 카테고리별 기간 내 통계 조회
    List<CategorySalesStatistics> findByCategoryIdAndStatisticDateBetweenOrderByStatisticDate(Long categoryId, LocalDate startDate, LocalDate endDate);
    
    // 지점별 기간 내 카테고리별 통계 조회
    List<CategorySalesStatistics> findByBranchIdAndStatisticDateBetweenOrderByStatisticDateDescNetSalesDesc(Long branchId, LocalDate startDate, LocalDate endDate);
    
    // 전체 지점의 특정 카테고리 기간 내 통계 조회
    List<CategorySalesStatistics> findByCategoryIdAndStatisticDateBetweenOrderByStatisticDateDescBranchId(Long categoryId, LocalDate startDate, LocalDate endDate);
    
    // 커스텀 쿼리: 카테고리별 인기 순위 (수량 기준)
    @Query("SELECT c FROM CategorySalesStatistics c WHERE c.branchId = :branchId AND c.statisticDate BETWEEN :startDate AND :endDate ORDER BY c.quantitySold DESC")
    List<CategorySalesStatistics> findTopSellingCategoriesByQuantity(@Param("branchId") Long branchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // 커스텀 쿼리: 카테고리별 인기 순위 (매출 기준)
    @Query("SELECT c FROM CategorySalesStatistics c WHERE c.branchId = :branchId AND c.statisticDate BETWEEN :startDate AND :endDate ORDER BY c.netSales DESC")
    List<CategorySalesStatistics> findTopSellingCategoriesBySales(@Param("branchId") Long branchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // 커스텀 쿼리: 전체 지점 카테고리별 통합 통계
    @Query("SELECT c FROM CategorySalesStatistics c WHERE c.statisticDate BETWEEN :startDate AND :endDate ORDER BY c.netSales DESC")
    List<CategorySalesStatistics> findTopSellingCategoriesAllBranches(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
