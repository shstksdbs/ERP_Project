package erp_project.erp_project.service;

import erp_project.erp_project.dto.SalesOverviewRequestDto;
import erp_project.erp_project.dto.SalesOverviewResponseDto;
import erp_project.erp_project.dto.DailySalesTrendResponseDto;
import erp_project.erp_project.entity.Branches;
import erp_project.erp_project.entity.SalesStatistics;
import erp_project.erp_project.entity.CategorySalesStatistics;
import erp_project.erp_project.entity.MenuSalesStatistics;
import erp_project.erp_project.entity.MenuCategory;
import erp_project.erp_project.entity.Menu;
import erp_project.erp_project.repository.BranchesRepository;
import erp_project.erp_project.repository.SalesStatisticsRepository;
import erp_project.erp_project.repository.CategorySalesStatisticsRepository;
import erp_project.erp_project.repository.MenuSalesStatisticsRepository;
import erp_project.erp_project.repository.MenuCategoryRepository;
import erp_project.erp_project.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SalesOverviewService {
    
    private final BranchesRepository branchesRepository;
    private final SalesStatisticsRepository salesStatisticsRepository;
    private final CategorySalesStatisticsRepository categorySalesStatisticsRepository;
    private final MenuSalesStatisticsRepository menuSalesStatisticsRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuRepository menuRepository;
    
    public SalesOverviewResponseDto getSalesOverview(SalesOverviewRequestDto request) {
        log.info("매출 개요 조회 시작 - 연도: {}, 월: {}", request.getYear(), request.getMonth());
        
        try {
            // 1. 전체 매출 요약 조회
            SalesOverviewResponseDto.SalesSummaryDto summary = getSalesSummary(request.getYear(), request.getMonth());
            
            // 2. 가맹점별 매출 데이터 조회
            List<SalesOverviewResponseDto.FranchiseSalesDto> franchises = getFranchiseSalesData(request.getYear(), request.getMonth());
            
            return SalesOverviewResponseDto.builder()
                    .summary(summary)
                    .franchises(franchises)
                    .build();
                    
        } catch (Exception e) {
            log.error("매출 개요 조회 중 오류 발생", e);
            throw new RuntimeException("매출 개요 조회에 실패했습니다: " + e.getMessage());
        }
    }
    
    private SalesOverviewResponseDto.SalesSummaryDto getSalesSummary(Integer year, Integer month) {
        // 활성 가맹점 수 조회 (본사 제외)
        List<Branches> activeBranches = branchesRepository.findByStatusAndBranchTypeNot(
                Branches.BranchStatus.active, Branches.BranchType.headquarters);
        int franchiseCount = activeBranches.size();
        
        // 해당 월의 매출 데이터 조회
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        BigDecimal totalSales = BigDecimal.ZERO;
        int totalCustomers = 0;
        
        for (Branches branch : activeBranches) {
            List<SalesStatistics> monthlyStats = salesStatisticsRepository
                    .findByBranchIdAndStatisticDateBetweenAndStatisticHourIsNullOrderByStatisticDate(
                            branch.getId(), startDate, endDate);
            
            for (SalesStatistics stat : monthlyStats) {
                totalSales = totalSales.add(stat.getTotalSales());
                totalCustomers += stat.getTotalOrders();
            }
        }
        
        return SalesOverviewResponseDto.SalesSummaryDto.builder()
                .totalSales(totalSales)
                .totalCustomers(totalCustomers)
                .franchiseCount(franchiseCount)
                .build();
    }
    
    private List<SalesOverviewResponseDto.FranchiseSalesDto> getFranchiseSalesData(Integer year, Integer month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        // 활성 가맹점 조회 (본사 제외)
        List<Branches> activeBranches = branchesRepository.findByStatusAndBranchTypeNot(
                Branches.BranchStatus.active, Branches.BranchType.headquarters);
        List<SalesOverviewResponseDto.FranchiseSalesDto> franchiseSalesList = new ArrayList<>();
        
        for (Branches branch : activeBranches) {
            // 1. 기본 매출 데이터 조회
            List<SalesStatistics> monthlyStats = salesStatisticsRepository
                    .findByBranchIdAndStatisticDateBetweenAndStatisticHourIsNullOrderByStatisticDate(
                            branch.getId(), startDate, endDate);
            
            BigDecimal monthlySales = BigDecimal.ZERO;
            int totalOrders = 0;
            BigDecimal avgOrderValue = BigDecimal.ZERO;
            
            for (SalesStatistics stat : monthlyStats) {
                monthlySales = monthlySales.add(stat.getTotalSales());
                totalOrders += stat.getTotalOrders();
            }
            
            // 평균 주문금액 = 총 매출 / 총 주문수 (소수점 반올림)
            if (totalOrders > 0) {
                avgOrderValue = monthlySales.divide(BigDecimal.valueOf(totalOrders), 0, java.math.RoundingMode.HALF_UP);
            }
            
            // 2. 인기 상품 데이터 조회
            List<MenuSalesStatistics> topProducts = menuSalesStatisticsRepository
                    .findTopSellingMenusByQuantity(branch.getId(), startDate, endDate);
            List<SalesOverviewResponseDto.TopProductDto> topProductsList = topProducts.stream()
                    .limit(3)
                    .map(stat -> {
                        // 실제 메뉴 이름 조회
                        String menuName = "상품명"; // 기본값
                        try {
                            Optional<Menu> menu = menuRepository.findById(stat.getMenuId());
                            if (menu.isPresent()) {
                                menuName = menu.get().getName();
                            }
                        } catch (Exception e) {
                            log.warn("메뉴 조회 실패 - menuId: {}", stat.getMenuId(), e);
                        }
                        
                        return SalesOverviewResponseDto.TopProductDto.builder()
                                .name(menuName)
                                .quantity(stat.getQuantitySold())
                                .sales(stat.getTotalSales())
                                .build();
                    })
                    .collect(Collectors.toList());
            
            // 3. 카테고리별 매출 데이터 조회
            List<CategorySalesStatistics> categoryStats = categorySalesStatisticsRepository
                    .findByBranchIdAndStatisticDateBetweenOrderByStatisticDateDescNetSalesDesc(
                            branch.getId(), startDate, endDate);
            Map<String, BigDecimal> salesByCategory = new HashMap<>();
            for (CategorySalesStatistics stat : categoryStats) {
                // 카테고리명 조회
                Optional<MenuCategory> category = menuCategoryRepository.findById(stat.getCategoryId());
                String categoryName = category.map(MenuCategory::getDisplayName).orElse("기타");
                salesByCategory.put(categoryName, stat.getTotalSales());
            }
            
            // 4. 시간대별 매출 데이터 조회
            List<SalesStatistics> timeStats = salesStatisticsRepository
                    .findByBranchIdAndStatisticDateBetweenAndStatisticHourIsNotNullOrderByStatisticDateAscStatisticHourAsc(
                            branch.getId(), startDate, endDate);
            Map<String, BigDecimal> salesByTime = new HashMap<>();
            for (SalesStatistics stat : timeStats) {
                salesByTime.put(String.valueOf(stat.getStatisticHour()), stat.getTotalSales());
            }
            
            // 5. DTO 생성
            SalesOverviewResponseDto.FranchiseSalesDto franchiseSales = SalesOverviewResponseDto.FranchiseSalesDto.builder()
                    .branchId(branch.getId())
                    .branchName(branch.getBranchName())
                    .branchCode(branch.getBranchCode())
                    .managerName(branch.getManagerName())
                    .branchType(branch.getBranchType().toString())
                    .monthlySales(monthlySales)
                    .totalOrders(totalOrders)
                    .avgOrderValue(avgOrderValue)
                    .topProducts(topProductsList)
                    .salesByCategory(salesByCategory)
                    .salesByTime(salesByTime)
                    .build();
            
            franchiseSalesList.add(franchiseSales);
        }
        
        return franchiseSalesList;
    }
    
    /**
     * 일별 매출 추이 조회
     */
    public DailySalesTrendResponseDto getDailySalesTrend(SalesOverviewRequestDto request, Long branchId) {
        log.info("일별 매출 추이 조회 시작 - 연도: {}, 월: {}, 가맹점 ID: {}", 
                request.getYear(), request.getMonth(), branchId);
        
        LocalDate startDate = LocalDate.of(request.getYear(), request.getMonth(), 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        // 날짜 목록 생성
        List<String> dates = new ArrayList<>();
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            dates.add(currentDate.toString());
            currentDate = currentDate.plusDays(1);
        }
        
        // 지점 목록 조회 (본사 제외)
        List<Branches> branches;
        if (branchId != null) {
            // 특정 지점만 조회
            branches = branchesRepository.findById(branchId)
                    .filter(branch -> branch.getBranchType() != Branches.BranchType.headquarters)
                    .map(List::of)
                    .orElse(Collections.emptyList());
        } else {
            // 모든 지점 조회 (본사 제외)
            branches = branchesRepository.findByStatusAndBranchTypeNot(
                    Branches.BranchStatus.active, Branches.BranchType.headquarters);
        }
        
        List<DailySalesTrendResponseDto.BranchTrendDto> branchTrends = new ArrayList<>();
        
        for (Branches branch : branches) {
            // 해당 지점의 일별 매출 데이터 조회
            List<SalesStatistics> dailyStats = salesStatisticsRepository
                    .findByBranchIdAndStatisticDateBetweenAndStatisticHourIsNullOrderByStatisticDate(
                            branch.getId(), startDate, endDate);
            
            // 날짜별 매출 매핑
            Map<LocalDate, BigDecimal> salesByDate = dailyStats.stream()
                    .collect(Collectors.toMap(
                            SalesStatistics::getStatisticDate,
                            SalesStatistics::getTotalSales,
                            (existing, replacement) -> existing.add(replacement)
                    ));
            
            // 모든 날짜에 대한 매출 데이터 생성 (없는 날짜는 0)
            List<BigDecimal> dailySales = dates.stream()
                    .map(LocalDate::parse)
                    .map(date -> salesByDate.getOrDefault(date, BigDecimal.ZERO))
                    .collect(Collectors.toList());
            
            DailySalesTrendResponseDto.BranchTrendDto branchTrend = DailySalesTrendResponseDto.BranchTrendDto.builder()
                    .branchId(branch.getId())
                    .branchName(branch.getBranchName())
                    .branchCode(branch.getBranchCode())
                    .dailySales(dailySales)
                    .build();
            
            branchTrends.add(branchTrend);
        }
        
        return DailySalesTrendResponseDto.builder()
                .dates(dates)
                .branches(branchTrends)
                .build();
    }

}
