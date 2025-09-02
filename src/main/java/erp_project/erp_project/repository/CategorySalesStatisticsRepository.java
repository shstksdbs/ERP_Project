package erp_project.erp_project.repository;

import erp_project.erp_project.entity.CategorySalesStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CategorySalesStatisticsRepository extends JpaRepository<CategorySalesStatistics, Long> {
    
    // 특정 기간의 카테고리별 매출 통계 조회 (본사 제외)
    @Query("SELECT c FROM CategorySalesStatistics c " +
           "WHERE c.statisticDate BETWEEN :startDate AND :endDate " +
           "AND c.branchId IN :branchIds")
    List<CategorySalesStatistics> findByStatisticDateBetweenAndBranchIdIn(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("branchIds") List<Long> branchIds
    );
    
    // 특정 지점의 특정 기간 카테고리별 매출 통계 조회 (순매출 기준 내림차순)
    @Query("SELECT c FROM CategorySalesStatistics c " +
           "WHERE c.branchId = :branchId " +
           "AND c.statisticDate BETWEEN :startDate AND :endDate " +
           "ORDER BY c.statisticDate DESC, c.netSales DESC")
    List<CategorySalesStatistics> findByBranchIdAndStatisticDateBetweenOrderByStatisticDateDescNetSalesDesc(
        @Param("branchId") Long branchId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // 특정 지점의 특정 기간 카테고리별 매출 기준 상위 카테고리 조회
    @Query("SELECT c FROM CategorySalesStatistics c " +
           "WHERE c.branchId = :branchId " +
           "AND c.statisticDate BETWEEN :startDate AND :endDate " +
           "ORDER BY c.netSales DESC")
    List<CategorySalesStatistics> findTopSellingCategoriesBySales(
        @Param("branchId") Long branchId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}