package erp_project.erp_project.service;

import erp_project.erp_project.entity.MenuOption;
import erp_project.erp_project.repository.MenuOptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MenuOptionService {
    
    private final MenuOptionRepository menuOptionRepository;
    
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
}
