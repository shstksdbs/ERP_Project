package erp_project.erp_project.service;

import erp_project.erp_project.entity.Menu;
import erp_project.erp_project.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
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
}
