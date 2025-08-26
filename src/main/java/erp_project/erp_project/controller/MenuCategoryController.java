package erp_project.erp_project.controller;

import erp_project.erp_project.dto.MenuCategoryRequestDto;
import erp_project.erp_project.dto.MenuCategoryResponseDto;
import erp_project.erp_project.service.MenuCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/menu-categories")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class MenuCategoryController {
    
    private final MenuCategoryService menuCategoryService;
    
    /**
     * 모든 활성화된 카테고리 조회 (계층 구조)
     */
    @GetMapping
    public ResponseEntity<List<MenuCategoryResponseDto>> getAllActiveCategories() {
        try {
            List<MenuCategoryResponseDto> categories = menuCategoryService.getAllActiveCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("카테고리 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 모든 카테고리 조회 (관리자용)
     */
    @GetMapping("/admin")
    public ResponseEntity<List<MenuCategoryResponseDto>> getAllCategories() {
        try {
            List<MenuCategoryResponseDto> categories = menuCategoryService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("모든 카테고리 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 카테고리 ID로 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<MenuCategoryResponseDto> getCategoryById(@PathVariable Long id) {
        try {
            MenuCategoryResponseDto category = menuCategoryService.getCategoryById(id);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            log.warn("카테고리를 찾을 수 없습니다: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("카테고리 조회 중 오류 발생: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 카테고리명으로 조회
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<MenuCategoryResponseDto> getCategoryByName(@PathVariable String name) {
        try {
            MenuCategoryResponseDto category = menuCategoryService.getCategoryByName(name);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            log.warn("카테고리를 찾을 수 없습니다: {}", name);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("카테고리명으로 조회 중 오류 발생: {}", name, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 상위 카테고리만 조회
     */
    @GetMapping("/top-level")
    public ResponseEntity<List<MenuCategoryResponseDto>> getTopLevelCategories() {
        try {
            List<MenuCategoryResponseDto> categories = menuCategoryService.getTopLevelCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("상위 카테고리 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 특정 상위 카테고리의 하위 카테고리들 조회
     */
    @GetMapping("/{parentId}/sub-categories")
    public ResponseEntity<List<MenuCategoryResponseDto>> getSubCategories(@PathVariable Long parentId) {
        try {
            List<MenuCategoryResponseDto> categories = menuCategoryService.getSubCategories(parentId);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("하위 카테고리 조회 중 오류 발생: {}", parentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 카테고리 검색
     */
    @GetMapping("/search")
    public ResponseEntity<List<MenuCategoryResponseDto>> searchCategories(@RequestParam String q) {
        try {
            List<MenuCategoryResponseDto> categories = menuCategoryService.searchCategories(q);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("카테고리 검색 중 오류 발생: {}", q, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 카테고리 생성
     */
    @PostMapping
    public ResponseEntity<MenuCategoryResponseDto> createCategory(@Valid @RequestBody MenuCategoryRequestDto requestDto) {
        try {
            MenuCategoryResponseDto createdCategory = menuCategoryService.createCategory(requestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
        } catch (RuntimeException e) {
            log.warn("카테고리 생성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("카테고리 생성 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 카테고리 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<MenuCategoryResponseDto> updateCategory(
            @PathVariable Long id, 
            @Valid @RequestBody MenuCategoryRequestDto requestDto) {
        try {
            MenuCategoryResponseDto updatedCategory = menuCategoryService.updateCategory(id, requestDto);
            return ResponseEntity.ok(updatedCategory);
        } catch (RuntimeException e) {
            log.warn("카테고리 수정 실패: {} - {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("카테고리 수정 중 오류 발생: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 카테고리 삭제 (비활성화)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        try {
            menuCategoryService.deleteCategory(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.warn("카테고리 삭제 실패: {} - {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("카테고리 삭제 중 오류 발생: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 카테고리 순서 변경
     */
    @PatchMapping("/{id}/order")
    public ResponseEntity<Void> updateCategoryOrder(
            @PathVariable Long id, 
            @RequestParam Integer newOrder) {
        try {
            menuCategoryService.updateCategoryOrder(id, newOrder);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.warn("카테고리 순서 변경 실패: {} - {}", id, e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("카테고리 순서 변경 중 오류 발생: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
