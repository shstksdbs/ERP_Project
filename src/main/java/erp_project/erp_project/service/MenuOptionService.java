package erp_project.erp_project.service;

import erp_project.erp_project.entity.MenuOption;
import erp_project.erp_project.entity.Menu;
import erp_project.erp_project.repository.MenuOptionRepository;
import erp_project.erp_project.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuOptionService {
    
    private final MenuOptionRepository menuOptionRepository;
    private final MenuRepository menuRepository;
    
    // 모든 메뉴 옵션 조회
    public List<MenuOption> getAllMenuOptions() {
        return menuOptionRepository.findAll();
    }
    
    // 카테고리별 메뉴 옵션 조회
    public List<MenuOption> getMenuOptionsByCategory(String category) {
        return menuOptionRepository.findByCategoryOrderByDisplayOrderAsc(category);
    }
    
    // 사용 가능한 메뉴 옵션만 조회
    public List<MenuOption> getAvailableMenuOptions() {
        return menuOptionRepository.findByIsAvailableTrueOrderByDisplayOrderAsc();
    }
    
    // 특정 메뉴 옵션 조회
    public Optional<MenuOption> getMenuOptionById(Long id) {
        return menuOptionRepository.findById(id);
    }
    
    // 메뉴 옵션의 display_name으로 menus 테이블의 ID 찾기
    public Long getMenuIdByDisplayName(String displayName) {
        Optional<Menu> menu = menuRepository.findByNameAndIsAvailableTrue(displayName);
        return menu.map(Menu::getId).orElse(null);
    }
    
    // 카테고리별 메뉴 옵션과 해당하는 menus 테이블 ID 함께 조회
    public List<Object> getMenuOptionsWithMenuId(String category) {
        List<MenuOption> options = menuOptionRepository.findByCategoryOrderByDisplayOrderAsc(category);
        
        return options.stream().map(option -> {
            // 각 옵션에 대해 menus 테이블의 ID 찾기
            Long foundMenuId = getMenuIdByDisplayName(option.getDisplayName());
            
            return new Object() {
                public final Long optionId = option.getId();
                public final String displayName = option.getDisplayName();
                public final String category = option.getCategory();
                public final java.math.BigDecimal price = option.getPrice();
                public final Boolean isAvailable = option.getIsAvailable();
                public final Integer displayOrder = option.getDisplayOrder();
                public final Long menuId = foundMenuId; // menus 테이블의 ID
            };
        }).collect(Collectors.toList());
    }
}
