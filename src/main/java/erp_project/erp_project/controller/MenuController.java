package erp_project.erp_project.controller;

import erp_project.erp_project.entity.Menu;
import erp_project.erp_project.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 키오스크 프론트엔드에서 접근 허용
public class MenuController {
    
    private final MenuService menuService;
    
    // 모든 메뉴 조회
    @GetMapping
    public ResponseEntity<List<Menu>> getAllMenus() {
        List<Menu> menus = menuService.getAllMenus();
        return ResponseEntity.ok(menus);
    }
    
    // 카테고리별 메뉴 조회
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Menu>> getMenusByCategory(@PathVariable String category) {
        List<Menu> menus = menuService.getMenusByCategory(category);
        return ResponseEntity.ok(menus);
    }
    
    // 특정 메뉴 조회
    @GetMapping("/{id}")
    public ResponseEntity<Menu> getMenuById(@PathVariable Long id) {
        return menuService.getMenuById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // 메뉴 옵션 조회
    @GetMapping("/{id}/options")
    public ResponseEntity<?> getMenuOptions(@PathVariable Long id) {
        return menuService.getMenuOptions(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // 메뉴명으로 검색
    @GetMapping("/search")
    public ResponseEntity<List<Menu>> searchMenusByName(@RequestParam String name) {
        List<Menu> menus = menuService.searchMenusByName(name);
        return ResponseEntity.ok(menus);
    }
    
    // 가격 범위로 검색
    @GetMapping("/search/price")
    public ResponseEntity<List<Menu>> getMenusByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice) {
        List<Menu> menus = menuService.getMenusByPriceRange(minPrice, maxPrice);
        return ResponseEntity.ok(menus);
    }
    
    // 메뉴 추가 (관리자용)
    @PostMapping
    public ResponseEntity<Menu> createMenu(@RequestBody Menu menu) {
        Menu createdMenu = menuService.createMenu(menu);
        return ResponseEntity.ok(createdMenu);
    }
    
    // 메뉴 수정 (관리자용)
    @PutMapping("/{id}")
    public ResponseEntity<Menu> updateMenu(@PathVariable Long id, @RequestBody Menu menuDetails) {
        Menu updatedMenu = menuService.updateMenu(id, menuDetails);
        return ResponseEntity.ok(updatedMenu);
    }
    
    // 메뉴 삭제 (관리자용)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenu(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return ResponseEntity.ok().build();
    }
    
    // 메뉴 가용성 토글 (관리자용)
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Menu> toggleMenuAvailability(@PathVariable Long id) {
        menuService.toggleMenuAvailability(id);
        return ResponseEntity.ok().build();
    }
}
