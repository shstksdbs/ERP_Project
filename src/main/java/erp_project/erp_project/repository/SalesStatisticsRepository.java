package erp_project.erp_project.repository;

import erp_project.erp_project.entity.SalesStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalesStatisticsRepository extends JpaRepository<SalesStatistics, Long> {
    
    // 지점별 특정 날짜의 일별 통계 조회
    Optional<SalesStatistics> findByBranchIdAndStatisticDateAndStatisticHourIsNull(Long branchId, LocalDate date);
    
    // 지점별 특정 날짜의 시간별 통계 조회
    List<SalesStatistics> findByBranchIdAndStatisticDateAndStatisticHourIsNotNullOrderByStatisticHour(Long branchId, LocalDate date);
    
    // 지점별 기간 내 일별 통계 조회
    List<SalesStatistics> findByBranchIdAndStatisticDateBetweenAndStatisticHourIsNullOrderByStatisticDate(Long branchId, LocalDate startDate, LocalDate endDate);
    
    // 지점별 기간 내 시간별 통계 조회
    List<SalesStatistics> findByBranchIdAndStatisticDateBetweenAndStatisticHourIsNotNullOrderByStatisticDateAscStatisticHourAsc(Long branchId, LocalDate startDate, LocalDate endDate);
    
    // 전체 지점의 특정 날짜 통계 조회
    List<SalesStatistics> findByStatisticDateAndStatisticHourIsNullOrderByBranchId(LocalDate date);
    
    // 전체 지점의 기간 내 통계 조회
    List<SalesStatistics> findByStatisticDateBetweenAndStatisticHourIsNullOrderByStatisticDateDescBranchId(LocalDate startDate, LocalDate endDate);
    
    // 특정 시간대의 전체 지점 통계 조회
    List<SalesStatistics> findByStatisticDateAndStatisticHourOrderByBranchId(LocalDate date, Integer hour);
    
    // 커스텀 쿼리: 지점별 일별 매출 요약
    @Query("SELECT s FROM SalesStatistics s WHERE s.branchId = :branchId AND s.statisticDate BETWEEN :startDate AND :endDate ORDER BY s.statisticDate ASC")
    List<SalesStatistics> findDailySummaryByBranchAndDateRange(@Param("branchId") Long branchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // 커스텀 쿼리: 시간대별 매출 분석 (전체 지점)
    @Query("SELECT s FROM SalesStatistics s WHERE s.statisticDate BETWEEN :startDate AND :endDate AND s.statisticHour IS NOT NULL ORDER BY s.statisticHour")
    List<SalesStatistics> findHourlyAnalysisByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // 커스텀 쿼리: 지점별 시간대별 매출 분석
    @Query("SELECT s FROM SalesStatistics s WHERE s.branchId = :branchId AND s.statisticDate BETWEEN :startDate AND :endDate AND s.statisticHour IS NOT NULL ORDER BY s.statisticHour")
    List<SalesStatistics> findHourlyAnalysisByBranchAndDateRange(@Param("branchId") Long branchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // 전지점 오늘 총매출 조회
    @Query("SELECT COALESCE(SUM(s.netSales), 0) FROM SalesStatistics s WHERE s.statisticDate = :today AND s.statisticHour IS NULL")
    java.math.BigDecimal findTodayTotalSalesByAllBranches(@Param("today") LocalDate today);
    
    // 전지점 주간 매출 추이 조회 (일별 합계)
    @Query("SELECT s.statisticDate, COALESCE(SUM(s.netSales), 0) FROM SalesStatistics s " +
           "WHERE s.statisticDate BETWEEN :startDate AND :endDate AND s.statisticHour IS NULL " +
           "GROUP BY s.statisticDate ORDER BY s.statisticDate ASC")
    List<Object[]> findWeeklySalesTrendByAllBranches(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // 전지점 오늘 총 주문 수 조회 (statistic_hour이 null인 레코드 개수)
    @Query("SELECT COUNT(s) FROM SalesStatistics s WHERE s.statisticDate = :today AND s.statisticHour IS NULL")
    Long findTodayTotalOrdersByAllBranches(@Param("today") LocalDate today);
    
    // 특정 지점의 오늘 총매출 조회 (SUM 집계)
    @Query("SELECT COALESCE(SUM(s.netSales), 0) FROM SalesStatistics s WHERE s.branchId = :branchId AND s.statisticDate = :today AND s.statisticHour IS NULL")
    java.math.BigDecimal findTodaySalesByBranch(@Param("branchId") Long branchId, @Param("today") LocalDate today);
    
    // 특정 지점의 오늘 총 주문 수 조회 (SUM 집계)
    @Query("SELECT COALESCE(SUM(s.totalOrders), 0) FROM SalesStatistics s WHERE s.branchId = :branchId AND s.statisticDate = :today AND s.statisticHour IS NULL")
    Long findTodayOrdersByBranch(@Param("branchId") Long branchId, @Param("today") LocalDate today);
    
    // 특정 지점의 주간 매출 추이 조회 (일별 SUM 집계)
    @Query("SELECT s.statisticDate, COALESCE(SUM(s.netSales), 0) FROM SalesStatistics s " +
           "WHERE s.branchId = :branchId AND s.statisticDate BETWEEN :startDate AND :endDate AND s.statisticHour IS NULL " +
           "GROUP BY s.statisticDate ORDER BY s.statisticDate ASC")
    List<Object[]> findWeeklySalesTrendByBranch(@Param("branchId") Long branchId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // 대용량 처리를 위한 메서드들
    List<SalesStatistics> findByBranchIdAndStatisticDateBetweenAndStatisticHourIsNull(Long branchId, LocalDate startDate, LocalDate endDate);
    
    List<SalesStatistics> findByStatisticDateBefore(LocalDate date);
    
    List<SalesStatistics> findByStatisticDateBetween(LocalDate startDate, LocalDate endDate);
    
    long countByStatisticDateAfter(LocalDate date);
    
    long countByStatisticDateBefore(LocalDate date);
}
