package erp_project.erp_project.controller;

import erp_project.erp_project.entity.MenuOption;
import erp_project.erp_project.service.MenuOptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu-options")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 키오스크 프론트엔드에서 접근 허용
public class MenuOptionController {
    
    private final MenuOptionService menuOptionService;
    
    // 모든 메뉴 옵션 조회
    @GetMapping
    public ResponseEntity<List<MenuOption>> getAllMenuOptions() {
        List<MenuOption> options = menuOptionService.getAllMenuOptions();
        return ResponseEntity.ok(options);
    }
    
    // 카테고리별 메뉴 옵션 조회
    @GetMapping("/category/{category}")
    public ResponseEntity<List<MenuOption>> getMenuOptionsByCategory(@PathVariable String category) {
        List<MenuOption> options = menuOptionService.getMenuOptionsByCategory(category);
        return ResponseEntity.ok(options);
    }
    
    // 사용 가능한 메뉴 옵션만 조회
    @GetMapping("/available")
    public ResponseEntity<List<MenuOption>> getAvailableMenuOptions() {
        List<MenuOption> options = menuOptionService.getAvailableMenuOptions();
        return ResponseEntity.ok(options);
    }
    
    // 특정 메뉴 옵션 조회
    @GetMapping("/{id}")
    public ResponseEntity<MenuOption> getMenuOptionById(@PathVariable Long id) {
        return menuOptionService.getMenuOptionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // 메뉴 옵션의 display_name으로 menus 테이블의 ID 찾기
    @GetMapping("/menu-id/{displayName}")
    public ResponseEntity<Long> getMenuIdByDisplayName(@PathVariable String displayName) {
        Long menuId = menuOptionService.getMenuIdByDisplayName(displayName);
        if (menuId != null) {
            return ResponseEntity.ok(menuId);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // 카테고리별 메뉴 옵션과 해당하는 menus 테이블 ID 함께 조회
    @GetMapping("/category/{category}/with-menu-id")
    public ResponseEntity<List<Object>> getMenuOptionsWithMenuId(@PathVariable String category) {
        List<Object> optionsWithMenuId = menuOptionService.getMenuOptionsWithMenuId(category);
        return ResponseEntity.ok(optionsWithMenuId);
    }
}
