package erp_project.erp_project.service;

import erp_project.erp_project.dto.ProductCostDTO;
import erp_project.erp_project.dto.CostHistoryDTO;
import erp_project.erp_project.dto.CostAnalysisDTO;
import erp_project.erp_project.entity.Menu;
import erp_project.erp_project.entity.MenuCategory;
import erp_project.erp_project.entity.CostChangeHistory;
import erp_project.erp_project.repository.MenuRepository;
import erp_project.erp_project.repository.MenuCategoryRepository;
import erp_project.erp_project.repository.CostChangeHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductCostService {

    @Autowired
    private MenuRepository menuRepository;

    @Autowired
    private MenuCategoryRepository menuCategoryRepository;
    
    @Autowired
    private CostChangeHistoryRepository costChangeHistoryRepository;

    // 상품 원가 목록 조회
    public List<ProductCostDTO> getProductCosts(String category, String searchTerm) {
        List<Menu> menus;
        
        if (category != null && !category.equals("all")) {
            menus = menuRepository.findByCategoryOrderByDisplayOrderAsc(category);
        } else {
            menus = menuRepository.findAll();
        }
        
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            menus = menus.stream()
                .filter(menu -> menu.getName().toLowerCase().contains(searchTerm.toLowerCase()))
                .collect(Collectors.toList());
        }
        
        return menus.stream()
            .map(this::convertToProductCostDTO)
            .collect(Collectors.toList());
    }

    // 카테고리별 원가 분석
    public List<CostAnalysisDTO> getCostAnalysis() {
        List<MenuCategory> categories = menuCategoryRepository.findAll();
        
        return categories.stream()
            .map(category -> {
                List<Menu> categoryMenus = menuRepository.findByCategoryOrderByDisplayOrderAsc(category.getName());
                
                CostAnalysisDTO analysis = new CostAnalysisDTO();
                analysis.setCategoryId(category.getId());
                analysis.setCategoryName(category.getName());
                analysis.setCategoryCode(category.getName()); // code 대신 name 사용
                analysis.setMenuCount(categoryMenus.size());
                
                if (!categoryMenus.isEmpty()) {
                    BigDecimal avgMargin = categoryMenus.stream()
                        .map(menu -> calculateMargin(menu.getPrice(), menu.getBasePrice()))
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(categoryMenus.size()), 2, RoundingMode.HALF_UP);
                    
                    BigDecimal avgCostRatio = categoryMenus.stream()
                        .map(menu -> calculateCostRatio(menu.getPrice(), menu.getBasePrice()))
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(categoryMenus.size()), 2, RoundingMode.HALF_UP);
                    
                    analysis.setAvgMargin(avgMargin);
                    analysis.setAvgCostRatio(avgCostRatio);
                    
                    List<CostAnalysisDTO.MiniProductDTO> miniProducts = categoryMenus.stream()
                        .map(menu -> {
                            CostAnalysisDTO.MiniProductDTO mini = new CostAnalysisDTO.MiniProductDTO();
                            mini.setId(menu.getId());
                            mini.setName(menu.getName());
                            mini.setMargin(calculateMargin(menu.getPrice(), menu.getBasePrice()));
                            return mini;
                        })
                        .collect(Collectors.toList());
                    
                    analysis.setProducts(miniProducts);
                } else {
                    analysis.setAvgMargin(BigDecimal.ZERO);
                    analysis.setAvgCostRatio(BigDecimal.ZERO);
                    analysis.setProducts(List.of());
                }
                
                return analysis;
            })
            .collect(Collectors.toList());
    }

    // 원가 변경 이력 조회
    public List<CostHistoryDTO> getCostHistory() {
        try {
            // 실제 데이터베이스에서 원가 변경 이력 조회
            List<CostChangeHistory> histories = costChangeHistoryRepository.findAllWithMenuOrderByChangeDateDesc();
            
            return histories.stream()
                .map(this::convertToCostHistoryDTO)
                .collect(Collectors.toList());
        } catch (Exception e) {
            // 오류 발생 시 빈 리스트 반환
            return List.of();
        }
    }

    // 원가 수정
    public ProductCostDTO updateProductCost(Long productId, ProductCostDTO costUpdate) {
        Menu menu = menuRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다."));
        
        BigDecimal oldCost = menu.getBasePrice() != null ? menu.getBasePrice() : BigDecimal.ZERO;
        BigDecimal newCost = new BigDecimal(costUpdate.getNewCostPrice());
        
        // 원가 변경 이력 저장
        CostChangeHistory history = CostChangeHistory.builder()
            .menu(menu)
            .oldCost(oldCost)
            .newCost(newCost)
            .reason(costUpdate.getChangeReason())
            .updatedBy(costUpdate.getChangeReason() != null && !costUpdate.getChangeReason().trim().isEmpty() 
                ? "관리자" : "시스템")
            .build();
        
        costChangeHistoryRepository.save(history);
        
        // 원가 업데이트 (base_price 필드 사용)
        menu.setBasePrice(newCost);
        menu.setUpdatedAt(LocalDateTime.now());
        menuRepository.save(menu);
        
        return convertToProductCostDTO(menu);
    }

    // 원가 데이터 내보내기
    public String exportCostData() {
        List<Menu> allMenus = menuRepository.findAll();
        
        StringBuilder csv = new StringBuilder();
        csv.append("메뉴명,코드,카테고리,판매가,원가,마진율,원가율,최종수정일\n");
        
        for (Menu menu : allMenus) {
            BigDecimal margin = calculateMargin(menu.getPrice(), menu.getBasePrice());
            BigDecimal costRatio = calculateCostRatio(menu.getPrice(), menu.getBasePrice());
            
            csv.append(String.format("%s,%s,%s,%s,%s,%.1f%%,%.1f%%,%s\n",
                menu.getName(),
                menu.getName(), // code 대신 name 사용
                menu.getCategory(),
                menu.getPrice(),
                menu.getBasePrice(),
                margin,
                costRatio,
                menu.getUpdatedAt() != null ? menu.getUpdatedAt().toString() : ""
            ));
        }
        
        return csv.toString();
    }

    // Menu 엔티티를 ProductCostDTO로 변환
    private ProductCostDTO convertToProductCostDTO(Menu menu) {
        ProductCostDTO dto = new ProductCostDTO();
        dto.setId(menu.getId());
        dto.setName(menu.getName());
        dto.setCode(menu.getName()); // code 대신 name 사용
        dto.setCategory(menu.getCategory());
        dto.setSellingPrice(menu.getPrice());
        dto.setCostPrice(menu.getBasePrice());
        dto.setMargin(calculateMargin(menu.getPrice(), menu.getBasePrice()));
        dto.setCostRatio(calculateCostRatio(menu.getPrice(), menu.getBasePrice()));
        dto.setLastUpdated(menu.getUpdatedAt());
        dto.setStatus(menu.getIsAvailable() ? "active" : "inactive");
        return dto;
    }
    
    // CostChangeHistory 엔티티를 CostHistoryDTO로 변환
    private CostHistoryDTO convertToCostHistoryDTO(CostChangeHistory history) {
        CostHistoryDTO dto = new CostHistoryDTO();
        dto.setId(history.getId());
        dto.setProductId(history.getMenuId());
        dto.setProductName(history.getMenuName());
        dto.setOldCost(history.getOldCost());
        dto.setNewCost(history.getNewCost());
        dto.setChangeDate(history.getChangeDate());
        dto.setReason(history.getReason());
        dto.setUpdatedBy(history.getUpdatedBy());
        return dto;
    }

    // 마진율 계산
    private BigDecimal calculateMargin(BigDecimal price, BigDecimal cost) {
        if (price == null || cost == null || price.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return price.subtract(cost).divide(price, 4, RoundingMode.HALF_UP)
                   .multiply(BigDecimal.valueOf(100));
    }

    // 원가율 계산
    private BigDecimal calculateCostRatio(BigDecimal price, BigDecimal cost) {
        if (price == null || cost == null || price.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return cost.divide(price, 4, RoundingMode.HALF_UP)
                   .multiply(BigDecimal.valueOf(100));
    }
}
