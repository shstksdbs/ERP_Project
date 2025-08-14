package erp_project.erp_project.service;

import erp_project.erp_project.entity.Menu;
import erp_project.erp_project.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MenuService {
    
    private final MenuRepository menuRepository;
    
    // 모든 메뉴 조회
    public List<Menu> getAllMenus() {
        return menuRepository.findByIsAvailableTrueOrderByDisplayOrderAsc();
    }
    
    // 카테고리별 메뉴 조회
    public List<Menu> getMenusByCategory(String category) {
        return menuRepository.findByCategoryAndIsAvailableTrueOrderByDisplayOrderAsc(category);
    }
    
    // 특정 메뉴 조회
    public Optional<Menu> getMenuById(Long id) {
        return menuRepository.findById(id);
    }
    
    // 메뉴명으로 검색
    public List<Menu> searchMenusByName(String name) {
        return menuRepository.findByNameContainingIgnoreCaseAndIsAvailableTrue(name);
    }
    
    // 가격 범위로 검색
    public List<Menu> getMenusByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return menuRepository.findByPriceRange(minPrice, maxPrice);
    }
    
    // 메뉴 추가
    @Transactional
    public Menu createMenu(Menu menu) {
        return menuRepository.save(menu);
    }
    
    // 메뉴 수정
    @Transactional
    public Menu updateMenu(Long id, Menu menuDetails) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다: " + id));
        
        menu.setName(menuDetails.getName());
        menu.setDescription(menuDetails.getDescription());
        menu.setPrice(menuDetails.getPrice());
        menu.setCategory(menuDetails.getCategory());
        menu.setBasePrice(menuDetails.getBasePrice());
        menu.setIsAvailable(menuDetails.getIsAvailable());
        menu.setDisplayOrder(menuDetails.getDisplayOrder());
        menu.setImageUrl(menuDetails.getImageUrl());
        
        return menuRepository.save(menu);
    }
    
    // 메뉴 삭제 (소프트 삭제)
    @Transactional
    public void deleteMenu(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다: " + id));
        
        menu.setIsAvailable(false);
        menuRepository.save(menu);
    }
    
    // 메뉴 가용성 토글
    @Transactional
    public void toggleMenuAvailability(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다: " + id));
        
        menu.setIsAvailable(!menu.getIsAvailable());
        menuRepository.save(menu);
    }
    
    // 메뉴 이미지 URL 업데이트
    @Transactional
    public Menu updateMenuImage(Long id, String imageUrl) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다: " + id));
        
        menu.setImageUrl(imageUrl);
        return menuRepository.save(menu);
    }
    
    // 메뉴 옵션 조회
    public Optional<Map<String, Object>> getMenuOptions(Long menuId) {
        Menu menu = menuRepository.findById(menuId)
                .orElse(null);
        
        if (menu == null) {
            return Optional.empty();
        }
        
        // 여기서는 간단한 예시를 위해 하드코딩된 옵션을 반환
        // 실제로는 MenuOptionRelation을 조회해야 함
        Map<String, Object> options = new HashMap<>();
        
        if ("burger".equals(menu.getCategory())) {
            Map<String, Object> toppingOptions = new HashMap<>();
            toppingOptions.put("tomato", Map.of("name", "토마토", "price", 300, "default", true, "removable", true, "addable", true, "quantitySelectable", false));
            toppingOptions.put("onion", Map.of("name", "양파", "price", 300, "default", true, "removable", true, "addable", true, "quantitySelectable", false));
            toppingOptions.put("lettuce", Map.of("name", "양상추", "price", 300, "default", true, "removable", true, "addable", true, "quantitySelectable", false));
            toppingOptions.put("cheese", Map.of("name", "치즈", "price", 300, "default", true, "removable", true, "addable", true, "quantitySelectable", true, "maxQuantity", 5, "description", "개수 선택 가능 (최대 5개)"));
            toppingOptions.put("pickle", Map.of("name", "피클", "price", 0, "default", false, "removable", true, "addable", true, "quantitySelectable", false));
            toppingOptions.put("sauce", Map.of("name", "소스", "price", 0, "default", true, "removable", true, "addable", true, "quantitySelectable", false, "description", "마요네즈, 케찹, 머스타드 중 선택"));
            toppingOptions.put("bacon", Map.of("name", "베이컨", "price", 500, "default", false, "removable", true, "addable", true, "quantitySelectable", true, "maxQuantity", 3, "description", "개수 선택 가능 (최대 3개)"));
            
            options.put("toppings", toppingOptions);
        }
        
        return Optional.of(options);
    }
}
