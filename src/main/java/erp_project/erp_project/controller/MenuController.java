package erp_project.erp_project.controller;

import erp_project.erp_project.dto.MenuResponseDto;
import erp_project.erp_project.entity.Menu;
import erp_project.erp_project.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/menus")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // 키오스크 프론트엔드에서 접근 허용
public class MenuController {
    
    private final MenuService menuService;
    
    // 모든 메뉴 조회 (카테고리 정보 포함)
    @GetMapping
    public ResponseEntity<List<MenuResponseDto>> getAllMenus() {
        List<Menu> menus = menuService.getAllMenus();
        List<MenuResponseDto> menuDtos = menus.stream()
                .map(menu -> menuService.convertToResponseDto(menu))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(menuDtos);
    }
    
    // 카테고리별 메뉴 조회 (기존 호환성 유지)
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Menu>> getMenusByCategory(@PathVariable String category) {
        List<Menu> menus = menuService.getMenusByCategory(category);
        return ResponseEntity.ok(menus);
    }
    
    // 카테고리 ID로 메뉴 조회 (새로운 방식)
    @GetMapping("/category-id/{categoryId}")
    public ResponseEntity<List<Menu>> getMenusByCategoryId(@PathVariable Long categoryId) {
        List<Menu> menus = menuService.getMenusByCategoryId(categoryId);
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
    
    // 메뉴 상태 확인 (테스트용)
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getMenuStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("message", "메뉴 API가 정상적으로 작동합니다");
        status.put("timestamp", new java.util.Date());
        status.put("availableEndpoints", List.of(
            "GET /api/menus - 모든 메뉴 조회",
            "GET /api/menus/category/{category} - 카테고리별 메뉴 조회",
            "GET /api/menus/category-id/{categoryId} - 카테고리 ID로 메뉴 조회",
            "GET /api/menus/{id} - 특정 메뉴 조회",
            "GET /api/menus/search?name={name} - 메뉴명으로 검색"
        ));
        return ResponseEntity.ok(status);
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
    
    // 메뉴 추가 (관리자용) - 이미지 업로드 포함
    @PostMapping
    public ResponseEntity<?> createMenu(
            @RequestParam(value = "name", required = true) String name,
            @RequestParam(value = "code", required = false) String code,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "price", required = true) BigDecimal price,
            @RequestParam(value = "basePrice", required = false) BigDecimal basePrice,
            @RequestParam(value = "stock", required = false) Integer stock,
            @RequestParam(value = "unit", required = false) String unit,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "isAvailable", required = false) Boolean isAvailable,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        
        try {
            Menu createdMenu = menuService.createMenuWithImage(
                name, code, categoryId, price, basePrice, stock, unit, 
                description, isAvailable, displayOrder, image
            );
            return ResponseEntity.ok(createdMenu);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "메뉴 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
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
    
    // 메뉴 이미지 URL 업데이트 (관리자용)
    @PatchMapping("/{id}/image")
    public ResponseEntity<Menu> updateMenuImage(@PathVariable Long id, @RequestBody String imageUrl) {
        Menu updatedMenu = menuService.updateMenuImage(id, imageUrl);
        return ResponseEntity.ok(updatedMenu);
    }
}
