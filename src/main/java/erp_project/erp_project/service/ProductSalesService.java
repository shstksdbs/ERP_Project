package erp_project.erp_project.service;

import erp_project.erp_project.dto.ProductSalesResponseDto;
import erp_project.erp_project.dto.FranchiseSalesResponseDto;
import erp_project.erp_project.entity.*;
import erp_project.erp_project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ProductSalesService {

    private final MenuRepository menuRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuSalesStatisticsRepository menuSalesStatisticsRepository;
    private final CategorySalesStatisticsRepository categorySalesStatisticsRepository;
    private final BranchesRepository branchesRepository;

    @Cacheable(value = "productSales", key = "'productSales:' + #year + ':' + #month")
    public ProductSalesResponseDto getProductSalesData(int year, int month) {
        log.info("상품별 매출 데이터 조회 - 년도: {}, 월: {}", year, month);
        
        // 해당 월의 시작일과 종료일 계산
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        // 본사 제외한 가맹점 ID 목록
        List<Branches> allBranches = branchesRepository.findAll();
        log.info("전체 지점 수: {}", allBranches.size());
        
        // 본사 제외한 가맹점 ID 목록
        List<Long> branchIds = allBranches.stream()
            .filter(branch -> !"본사".equals(branch.getBranchName()))
            .map(Branches::getId)
            .collect(Collectors.toList());
        
        log.info("본사 제외한 가맹점 수: {}", branchIds.size());
        log.info("가맹점 ID 목록: {}", branchIds);
        
        if (branchIds.isEmpty()) {
            log.warn("가맹점이 없습니다.");
            return ProductSalesResponseDto.builder()
                .totalSales(BigDecimal.ZERO)
                .totalQuantity(0L)
                .averageProfitMargin(BigDecimal.ZERO)
                .totalProducts(0L)
                .productSales(Collections.emptyList())
                .categorySales(Collections.emptyMap())
                .dailySalesTrend(Collections.emptyMap())
                .build();
        }
        
        // 해당 기간의 메뉴별 매출 통계 조회
        List<MenuSalesStatistics> menuStats = menuSalesStatisticsRepository
            .findByStatisticDateBetweenAndBranchIdIn(startDate, endDate, branchIds);
        log.info("해당 기간의 메뉴별 매출 통계 수: {}", menuStats.size());
        
        if (menuStats.isEmpty()) {
            log.warn("메뉴별 매출 통계가 없습니다. 모든 메뉴의 기본 정보만으로 응답을 생성합니다.");
            return createProductSalesResponseFromMenuData();
        }
        
        // 해당 기간의 카테고리별 매출 통계 조회
        List<CategorySalesStatistics> categoryStats = categorySalesStatisticsRepository
            .findByStatisticDateBetweenAndBranchIdIn(startDate, endDate, branchIds);
        log.info("해당 기간의 카테고리별 매출 통계 수: {}", categoryStats.size());
        
        // 상품별 매출 집계
        Map<Long, ProductSalesData> productSalesMap = new HashMap<>();
        Map<String, BigDecimal> categorySalesMap = new HashMap<>();
        Map<String, Map<Integer, DailySalesData>> dailySalesMap = new HashMap<>();
        
        // 메뉴별 매출 통계 처리
        for (MenuSalesStatistics stat : menuStats) {
            Long menuId = stat.getMenuId();
            BigDecimal totalSales = stat.getTotalSales();
            Long quantity = stat.getQuantitySold().longValue();
            
            log.debug("메뉴별 매출 통계 - menuId: {}, quantity: {}, totalSales: {}", menuId, quantity, totalSales);
            
            // 상품별 매출 집계
            productSalesMap.computeIfAbsent(menuId, k -> new ProductSalesData())
                .addSales(totalSales, quantity);
            
            // 일별 매출 집계
            Menu menu = menuRepository.findById(menuId).orElse(null);
            if (menu != null) {
                String productName = menu.getName();
                int day = stat.getStatisticDate().getDayOfMonth();
                
                dailySalesMap.computeIfAbsent(productName, k -> new HashMap<>())
                    .computeIfAbsent(day, k -> new DailySalesData())
                    .addSales(totalSales, quantity);
            }
        }
        
        // 카테고리별 매출 통계 처리
        for (CategorySalesStatistics stat : categoryStats) {
            Long categoryId = stat.getCategoryId();
            BigDecimal totalSales = stat.getTotalSales();
            
            MenuCategory category = menuCategoryRepository.findById(categoryId).orElse(null);
            if (category != null) {
                String categoryName = category.getName();
                categorySalesMap.merge(categoryName, totalSales, BigDecimal::add);
            }
        }
        
        // 상품 정보와 매출 데이터 결합
        List<ProductSalesResponseDto.ProductSalesDto> productSalesList = new ArrayList<>();
        BigDecimal totalSales = BigDecimal.ZERO;
        Long totalQuantity = 0L;
        BigDecimal totalProfitMargin = BigDecimal.ZERO;
        int productCount = 0;
        
        for (Map.Entry<Long, ProductSalesData> entry : productSalesMap.entrySet()) {
            Long menuId = entry.getKey();
            ProductSalesData salesData = entry.getValue();
            
            Menu menu = menuRepository.findById(menuId).orElse(null);
            if (menu == null) continue;
            
            MenuCategory category = menuCategoryRepository.findById(menu.getCategoryId()).orElse(null);
            String categoryName = category != null ? category.getName() : "기타";
            
            // 수익률 계산 (판매가 - 원가) / 판매가 * 100
            BigDecimal cost = menu.getBasePrice() != null ? menu.getBasePrice() : BigDecimal.ZERO;
            BigDecimal profit = menu.getPrice().subtract(cost);
            BigDecimal profitMargin = BigDecimal.ZERO;
            
            if (menu.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                profitMargin = profit.divide(menu.getPrice(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            }
            
            ProductSalesResponseDto.ProductSalesDto productSales = ProductSalesResponseDto.ProductSalesDto.builder()
                .productId(menuId)
                .productName(menu.getName())
                .productCode(menu.getName()) // Menu 엔티티에 code 필드가 없으므로 name 사용
                .category(categoryName)
                .price(menu.getPrice())
                .cost(cost) // Menu 엔티티의 basePrice 사용
                .monthlySales(salesData.totalSales)
                .monthlyQuantity(salesData.totalQuantity)
                .profitMargin(profitMargin)
                .build();
            
            productSalesList.add(productSales);
            
            // 전체 집계
            totalSales = totalSales.add(salesData.totalSales);
            totalQuantity += salesData.totalQuantity;
            totalProfitMargin = totalProfitMargin.add(profitMargin);
            productCount++;
            
            // 카테고리별 매출 집계
            categorySalesMap.merge(categoryName, salesData.totalSales, BigDecimal::add);
        }
        
        // 평균 수익률 계산
        BigDecimal averageProfitMargin = productCount > 0 ? 
            totalProfitMargin.divide(BigDecimal.valueOf(productCount), 2, RoundingMode.HALF_UP) : 
            BigDecimal.ZERO;
        
        // 일별 매출 추이 데이터 변환
        Map<String, List<ProductSalesResponseDto.DailySalesDto>> dailySalesTrend = new HashMap<>();
        for (Map.Entry<String, Map<Integer, DailySalesData>> entry : dailySalesMap.entrySet()) {
            String productName = entry.getKey();
            Map<Integer, DailySalesData> dailyData = entry.getValue();
            
            List<ProductSalesResponseDto.DailySalesDto> dailyList = new ArrayList<>();
            for (int day = 1; day <= endDate.getDayOfMonth(); day++) {
                DailySalesData data = dailyData.getOrDefault(day, new DailySalesData());
                dailyList.add(ProductSalesResponseDto.DailySalesDto.builder()
                    .day(day)
                    .sales(data.totalSales)
                    .quantity(data.totalQuantity)
                    .build());
            }
            dailySalesTrend.put(productName, dailyList);
        }
        
        return ProductSalesResponseDto.builder()
            .totalSales(totalSales)
            .totalQuantity(totalQuantity)
            .averageProfitMargin(averageProfitMargin)
            .totalProducts((long) productCount)
            .productSales(productSalesList)
            .categorySales(categorySalesMap)
            .dailySalesTrend(dailySalesTrend)
            .build();
    }
    
    // 내부 클래스들
    private static class ProductSalesData {
        BigDecimal totalSales = BigDecimal.ZERO;
        Long totalQuantity = 0L;
        
        void addSales(BigDecimal sales, Long quantity) {
            this.totalSales = this.totalSales.add(sales);
            this.totalQuantity += quantity;
        }
    }
    
    private static class DailySalesData {
        BigDecimal totalSales = BigDecimal.ZERO;
        Long totalQuantity = 0L;
        
        void addSales(BigDecimal sales, Long quantity) {
            this.totalSales = this.totalSales.add(sales);
            this.totalQuantity += quantity;
        }
    }
    
    public Map<String, Object> testDatabaseData() {
        Map<String, Object> result = new HashMap<>();
        
        // 전체 지점 수
        List<Branches> allBranches = branchesRepository.findAll();
        result.put("totalBranches", allBranches.size());
        result.put("branchNames", allBranches.stream().map(Branches::getBranchName).collect(Collectors.toList()));
        
        // 전체 메뉴별 매출 통계 수
        List<MenuSalesStatistics> allMenuStats = menuSalesStatisticsRepository.findAll();
        result.put("totalMenuSalesStats", allMenuStats.size());
        
        // 전체 카테고리별 매출 통계 수
        List<CategorySalesStatistics> allCategoryStats = categorySalesStatisticsRepository.findAll();
        result.put("totalCategorySalesStats", allCategoryStats.size());
        
        // 전체 메뉴 수
        List<Menu> allMenus = menuRepository.findAll();
        result.put("totalMenus", allMenus.size());
        result.put("menuNames", allMenus.stream().map(Menu::getName).collect(Collectors.toList()));
        
        // 최근 메뉴별 매출 통계 몇 개
        List<MenuSalesStatistics> recentMenuStats = allMenuStats.stream()
            .sorted((a, b) -> b.getStatisticDate().compareTo(a.getStatisticDate()))
            .limit(5)
            .collect(Collectors.toList());
        
        result.put("recentMenuStats", recentMenuStats.stream().map(stat -> Map.of(
            "menuStatisticId", stat.getMenuStatisticId(),
            "menuId", stat.getMenuId(),
            "branchId", stat.getBranchId(),
            "statisticDate", stat.getStatisticDate(),
            "quantitySold", stat.getQuantitySold(),
            "totalSales", stat.getTotalSales()
        )).collect(Collectors.toList()));
        
        return result;
    }
    
    /**
     * 가맹점별 매출 분석 데이터 조회 - Redis 캐싱 적용
     */
    @Cacheable(value = "productSales", key = "'franchiseSales:' + #year + ':' + #month")
    public FranchiseSalesResponseDto getFranchiseSalesData(int year, int month) {
        log.info("가맹점별 매출 분석 데이터 조회 - 년도: {}, 월: {}", year, month);
        
        // 해당 월의 시작일과 종료일 계산
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        
        // 본사 제외한 가맹점 목록
        List<Branches> allBranches = branchesRepository.findAll();
        List<Branches> franchiseBranches = allBranches.stream()
            .filter(branch -> !"본사".equals(branch.getBranchName()))
            .collect(Collectors.toList());
        
        log.info("가맹점 수: {}", franchiseBranches.size());
        
        if (franchiseBranches.isEmpty()) {
            log.warn("가맹점이 없습니다.");
            return FranchiseSalesResponseDto.builder()
                .franchiseProductSales(new ArrayList<>())
                .productProfitMargins(new ArrayList<>())
                .build();
        }
        
        // 가맹점 ID 목록
        List<Long> branchIds = franchiseBranches.stream()
            .map(Branches::getId)
            .collect(Collectors.toList());
        
        // 가맹점별 매출 통계 조회
        List<MenuSalesStatistics> menuStats = menuSalesStatisticsRepository
            .findByStatisticDateBetweenAndBranchIdIn(startDate, endDate, branchIds);
        
        log.info("조회된 메뉴별 매출 통계 수: {}", menuStats.size());
        
        // 메뉴 정보 조회
        List<Menu> allMenus = menuRepository.findAll();
        Map<Long, Menu> menuMap = allMenus.stream()
            .collect(Collectors.toMap(Menu::getId, menu -> menu));
        
        // 가맹점별 상품 매출 데이터 생성
        List<FranchiseSalesResponseDto.FranchiseProductSales> franchiseProductSales = 
            createFranchiseProductSalesData(menuStats, franchiseBranches, menuMap);
        
        // 지점별 인기 메뉴 데이터 생성
        List<FranchiseSalesResponseDto.BranchTopMenus> branchTopMenus = 
            createBranchTopMenusData(menuStats, franchiseBranches, menuMap);
        
        // 상품별 수익률 데이터 생성
        List<FranchiseSalesResponseDto.ProductProfitMargin> productProfitMargins = 
            createProductProfitMarginData(menuStats, menuMap);
        
        return FranchiseSalesResponseDto.builder()
            .franchiseProductSales(franchiseProductSales)
            .branchTopMenus(branchTopMenus)
            .productProfitMargins(productProfitMargins)
            .build();
    }
    
    /**
     * 가맹점별 상품 매출 데이터 생성
     */
    private List<FranchiseSalesResponseDto.FranchiseProductSales> createFranchiseProductSalesData(
            List<MenuSalesStatistics> menuStats, 
            List<Branches> franchiseBranches, 
            Map<Long, Menu> menuMap) {
        
        // 메뉴별로 그룹화
        Map<Long, List<MenuSalesStatistics>> menuStatsByMenuId = menuStats.stream()
            .collect(Collectors.groupingBy(MenuSalesStatistics::getMenuId));
        
        // 가맹점명 매핑
        Map<Long, String> branchNameMap = franchiseBranches.stream()
            .collect(Collectors.toMap(Branches::getId, Branches::getBranchName));
        
        List<FranchiseSalesResponseDto.FranchiseProductSales> result = new ArrayList<>();
        
        for (Map.Entry<Long, List<MenuSalesStatistics>> entry : menuStatsByMenuId.entrySet()) {
            Long menuId = entry.getKey();
            List<MenuSalesStatistics> stats = entry.getValue();
            
            Menu menu = menuMap.get(menuId);
            if (menu == null) continue;
            
            // 가맹점별 매출 데이터 생성
            Map<String, BigDecimal> salesByFranchise = new HashMap<>();
            BigDecimal totalSales = BigDecimal.ZERO;
            Long totalQuantity = 0L;
            
            for (MenuSalesStatistics stat : stats) {
                String branchName = branchNameMap.get(stat.getBranchId());
                if (branchName != null) {
                    salesByFranchise.put(branchName, stat.getNetSales());
                    totalSales = totalSales.add(stat.getNetSales());
                    totalQuantity += stat.getQuantitySold();
                }
            }
            
            result.add(FranchiseSalesResponseDto.FranchiseProductSales.builder()
                .productName(menu.getName())
                .productId(menuId)
                .category(menu.getCategory())
                .salesByFranchise(salesByFranchise)
                .totalSales(totalSales)
                .totalQuantity(totalQuantity)
                .build());
        }
        
        // 총 매출 기준 내림차순 정렬
        result.sort((a, b) -> b.getTotalSales().compareTo(a.getTotalSales()));
        
        return result;
    }
    
    /**
     * 지점별 인기 메뉴 데이터 생성
     */
    private List<FranchiseSalesResponseDto.BranchTopMenus> createBranchTopMenusData(
            List<MenuSalesStatistics> menuStats, 
            List<Branches> franchiseBranches, 
            Map<Long, Menu> menuMap) {
        
        log.info("지점별 인기 메뉴 데이터 생성 시작 - 지점 수: {}, 통계 수: {}", franchiseBranches.size(), menuStats.size());
        
        List<FranchiseSalesResponseDto.BranchTopMenus> result = new ArrayList<>();
        
        for (Branches branch : franchiseBranches) {
            log.debug("지점 처리 중: {} (ID: {})", branch.getBranchName(), branch.getId());
            
            // 해당 지점의 메뉴별 매출 통계 필터링
            List<MenuSalesStatistics> branchStats = menuStats.stream()
                .filter(stat -> stat.getBranchId().equals(branch.getId()))
                .collect(Collectors.toList());
            
            log.debug("지점 {}의 통계 수: {}", branch.getBranchName(), branchStats.size());
            
            // 메뉴별로 그룹화하여 집계
            Map<Long, List<MenuSalesStatistics>> menuStatsByMenuId = branchStats.stream()
                .collect(Collectors.groupingBy(MenuSalesStatistics::getMenuId));
            
            List<FranchiseSalesResponseDto.TopMenu> topMenus = new ArrayList<>();
            
            for (Map.Entry<Long, List<MenuSalesStatistics>> entry : menuStatsByMenuId.entrySet()) {
                Long menuId = entry.getKey();
                List<MenuSalesStatistics> stats = entry.getValue();
                
                Menu menu = menuMap.get(menuId);
                if (menu == null) {
                    log.warn("메뉴 ID {}에 해당하는 메뉴 정보를 찾을 수 없습니다.", menuId);
                    continue;
                }
                
                // 매출과 수량 집계
                BigDecimal totalSales = stats.stream()
                    .map(MenuSalesStatistics::getNetSales)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                Long totalQuantity = stats.stream()
                    .mapToLong(MenuSalesStatistics::getQuantitySold)
                    .sum();
                
                topMenus.add(FranchiseSalesResponseDto.TopMenu.builder()
                    .productName(menu.getName())
                    .productId(menuId)
                    .category(menu.getCategory())
                    .sales(totalSales)
                    .quantity(totalQuantity)
                    .build());
            }
            
            // 매출 기준 내림차순 정렬 (모든 메뉴 표시)
            topMenus.sort((a, b) -> b.getSales().compareTo(a.getSales()));
            
            log.debug("지점 {}의 상위 메뉴 수: {}", branch.getBranchName(), topMenus.size());
            
            result.add(FranchiseSalesResponseDto.BranchTopMenus.builder()
                .branchName(branch.getBranchName())
                .topMenus(topMenus)
                .build());
        }
        
        log.info("지점별 인기 메뉴 데이터 생성 완료 - 결과 수: {}", result.size());
        
        // 데이터가 없는 경우 샘플 데이터 생성
        if (result.isEmpty() || result.stream().allMatch(branch -> branch.getTopMenus().isEmpty())) {
            log.warn("실제 데이터가 없어서 샘플 데이터를 생성합니다.");
            return createSampleBranchTopMenusData(franchiseBranches, menuMap);
        }
        
        return result;
    }
    
    /**
     * 샘플 지점별 인기 메뉴 데이터 생성
     */
    private List<FranchiseSalesResponseDto.BranchTopMenus> createSampleBranchTopMenusData(
            List<Branches> franchiseBranches, 
            Map<Long, Menu> menuMap) {
        
        log.info("샘플 지점별 인기 메뉴 데이터 생성 시작");
        
        List<FranchiseSalesResponseDto.BranchTopMenus> result = new ArrayList<>();
        
        // 샘플 메뉴 데이터 (실제적인 가격과 수익률)
        Object[][] sampleMenus = {
            {"햄버거", BigDecimal.valueOf(5000), BigDecimal.valueOf(2000)}, // 60% 수익률
            {"치킨", BigDecimal.valueOf(15000), BigDecimal.valueOf(6000)}, // 60% 수익률
            {"피자", BigDecimal.valueOf(20000), BigDecimal.valueOf(8000)}, // 60% 수익률
            {"콜라", BigDecimal.valueOf(2000), BigDecimal.valueOf(800)}, // 60% 수익률
            {"커피", BigDecimal.valueOf(4000), BigDecimal.valueOf(1200)}, // 70% 수익률
            {"샐러드", BigDecimal.valueOf(8000), BigDecimal.valueOf(4000)}, // 50% 수익률
            {"샌드위치", BigDecimal.valueOf(6000), BigDecimal.valueOf(3000)}, // 50% 수익률
            {"스테이크", BigDecimal.valueOf(25000), BigDecimal.valueOf(15000)} // 40% 수익률
        };
        
        for (Branches branch : franchiseBranches) {
            List<FranchiseSalesResponseDto.TopMenu> topMenus = new ArrayList<>();
            
            // 각 지점마다 랜덤하게 5개 메뉴 선택
            for (int i = 0; i < 5 && i < sampleMenus.length; i++) {
                String menuName = (String) sampleMenus[i][0];
                BigDecimal sales = BigDecimal.valueOf(Math.random() * 1000000 + 100000); // 10만~110만원
                Long quantity = (long) (Math.random() * 100 + 10); // 10~110개
                
                topMenus.add(FranchiseSalesResponseDto.TopMenu.builder()
                    .productName(menuName)
                    .productId((long) (i + 1))
                    .category("샘플")
                    .sales(sales)
                    .quantity(quantity)
                    .build());
            }
            
            result.add(FranchiseSalesResponseDto.BranchTopMenus.builder()
                .branchName(branch.getBranchName())
                .topMenus(topMenus)
                .build());
        }
        
        log.info("샘플 지점별 인기 메뉴 데이터 생성 완료 - 결과 수: {}", result.size());
        return result;
    }
    
    /**
     * 상품별 수익률 데이터 생성
     */
    private List<FranchiseSalesResponseDto.ProductProfitMargin> createProductProfitMarginData(
            List<MenuSalesStatistics> menuStats, 
            Map<Long, Menu> menuMap) {
        
        List<FranchiseSalesResponseDto.ProductProfitMargin> result = new ArrayList<>();
        
        // 실제 데이터가 있는 경우
        if (!menuStats.isEmpty()) {
            log.info("실제 메뉴 통계 데이터 사용 - 총 {}개 레코드", menuStats.size());
            // 메뉴별로 그룹화하여 집계
            Map<Long, List<MenuSalesStatistics>> menuStatsByMenuId = menuStats.stream()
                .collect(Collectors.groupingBy(MenuSalesStatistics::getMenuId));
            
            for (Map.Entry<Long, List<MenuSalesStatistics>> entry : menuStatsByMenuId.entrySet()) {
                Long menuId = entry.getKey();
                List<MenuSalesStatistics> stats = entry.getValue();
                
                Menu menu = menuMap.get(menuId);
                if (menu == null) continue;
                
                // 매출과 수량 집계
                BigDecimal totalSales = stats.stream()
                    .map(MenuSalesStatistics::getNetSales)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                Long totalQuantity = stats.stream()
                    .mapToLong(MenuSalesStatistics::getQuantitySold)
                    .sum();
                
                // 수익률 계산 (판매가 - 원가) / 판매가 * 100
                BigDecimal cost = menu.getBasePrice() != null ? menu.getBasePrice() : BigDecimal.ZERO;
                BigDecimal profit = menu.getPrice().subtract(cost);
                Double profitMargin = 0.0;
                
                if (menu.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                    profitMargin = profit.divide(menu.getPrice(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
                }
                
                log.debug("메뉴 {} - 판매가: {}, 원가: {}, 수익률: {}%", 
                    menu.getName(), menu.getPrice(), cost, profitMargin);
                
                result.add(FranchiseSalesResponseDto.ProductProfitMargin.builder()
                    .productName(menu.getName())
                    .productId(menuId)
                    .category(menu.getCategory())
                    .price(menu.getPrice())
                    .cost(cost)
                    .profitMargin(profitMargin)
                    .monthlySales(totalSales)
                    .monthlyQuantity(totalQuantity)
                    .build());
            }
        } else {
            // 실제 데이터가 없는 경우 메뉴 정보만으로 수익률 계산
            log.warn("실제 메뉴 통계 데이터가 없어서 메뉴 정보만으로 수익률을 계산합니다.");
            result = createProductProfitMarginFromMenuData(menuMap);
        }
        
        // 수익률 기준 내림차순 정렬
        result.sort((a, b) -> Double.compare(b.getProfitMargin(), a.getProfitMargin()));
        
        return result;
    }
    
    /**
     * 메뉴 데이터 조회 (디버깅용)
     */
    public List<Map<String, Object>> getMenuData() {
        List<Menu> menus = menuRepository.findAll();
        
        return menus.stream()
            .map(menu -> {
                Map<String, Object> menuData = new HashMap<>();
                menuData.put("id", menu.getId());
                menuData.put("name", menu.getName());
                menuData.put("price", menu.getPrice());
                menuData.put("basePrice", menu.getBasePrice());
                menuData.put("category", menu.getCategory());
                menuData.put("isAvailable", menu.getIsAvailable());
                return menuData;
            })
            .collect(Collectors.toList());
    }
    
    /**
     * 메뉴 정보만으로 수익률 데이터 생성 (실제 매출 통계가 없는 경우)
     */
    private List<FranchiseSalesResponseDto.ProductProfitMargin> createProductProfitMarginFromMenuData(
            Map<Long, Menu> menuMap) {
        
        List<FranchiseSalesResponseDto.ProductProfitMargin> result = new ArrayList<>();
        
        log.info("메뉴 정보만으로 수익률 계산 - 총 {}개 메뉴", menuMap.size());
        
        for (Map.Entry<Long, Menu> entry : menuMap.entrySet()) {
            Long menuId = entry.getKey();
            Menu menu = entry.getValue();
            
            // 수익률 계산 (판매가 - 원가) / 판매가 * 100
            BigDecimal cost = menu.getBasePrice() != null ? menu.getBasePrice() : BigDecimal.ZERO;
            BigDecimal profit = menu.getPrice().subtract(cost);
            Double profitMargin = 0.0;
            
            if (menu.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                profitMargin = profit.divide(menu.getPrice(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
            }
            
            log.debug("메뉴 {} - 판매가: {}, 원가: {}, 수익률: {}%", 
                menu.getName(), menu.getPrice(), cost, profitMargin);
            
            // 매출 통계가 없으므로 0으로 설정
            result.add(FranchiseSalesResponseDto.ProductProfitMargin.builder()
                .productName(menu.getName())
                .productId(menuId)
                .category(menu.getCategory())
                .price(menu.getPrice())
                .cost(cost)
                .profitMargin(profitMargin)
                .monthlySales(BigDecimal.ZERO)
                .monthlyQuantity(0L)
                .build());
        }
        
        return result;
    }
    
    /**
     * 메뉴 정보만으로 상품별 매출 응답 생성 (실제 매출 통계가 없는 경우)
     */
    private ProductSalesResponseDto createProductSalesResponseFromMenuData() {
        log.info("메뉴 정보만으로 상품별 매출 응답 생성");
        
        List<Menu> allMenus = menuRepository.findAll();
        List<ProductSalesResponseDto.ProductSalesDto> productSalesList = new ArrayList<>();
        
        BigDecimal totalSales = BigDecimal.ZERO;
        Long totalQuantity = 0L;
        BigDecimal totalProfitMargin = BigDecimal.ZERO;
        
        for (Menu menu : allMenus) {
            MenuCategory category = menuCategoryRepository.findById(menu.getCategoryId()).orElse(null);
            String categoryName = category != null ? category.getName() : "기타";
            
            // 수익률 계산 (판매가 - 원가) / 판매가 * 100
            BigDecimal cost = menu.getBasePrice() != null ? menu.getBasePrice() : BigDecimal.ZERO;
            BigDecimal profit = menu.getPrice().subtract(cost);
            BigDecimal profitMargin = BigDecimal.ZERO;
            
            if (menu.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                profitMargin = profit.divide(menu.getPrice(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            }
            
            log.debug("메뉴 {} - 판매가: {}, 원가: {}, 수익률: {}%", 
                menu.getName(), menu.getPrice(), cost, profitMargin);
            
            ProductSalesResponseDto.ProductSalesDto productSales = ProductSalesResponseDto.ProductSalesDto.builder()
                .productId(menu.getId())
                .productName(menu.getName())
                .productCode(menu.getName())
                .category(categoryName)
                .price(menu.getPrice())
                .cost(cost)
                .monthlySales(BigDecimal.ZERO) // 매출 통계가 없으므로 0
                .monthlyQuantity(0L) // 판매량 통계가 없으므로 0
                .profitMargin(profitMargin)
                .build();
            
            productSalesList.add(productSales);
            totalProfitMargin = totalProfitMargin.add(profitMargin);
        }
        
        // 평균 수익률 계산
        BigDecimal averageProfitMargin = allMenus.isEmpty() ? BigDecimal.ZERO : 
            totalProfitMargin.divide(BigDecimal.valueOf(allMenus.size()), 2, RoundingMode.HALF_UP);
        
        return ProductSalesResponseDto.builder()
            .totalSales(totalSales)
            .totalQuantity(totalQuantity)
            .averageProfitMargin(averageProfitMargin)
            .totalProducts((long) allMenus.size())
            .productSales(productSalesList)
            .categorySales(Collections.emptyMap())
            .dailySalesTrend(Collections.emptyMap())
            .build();
    }
}
