package erp_project.erp_project.controller;

import erp_project.erp_project.dto.RecipeDto;
import erp_project.erp_project.dto.RecipeRequestDto;
import erp_project.erp_project.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecipeController {
    
    private final RecipeService recipeService;
    
    // 모든 레시피 조회
    @GetMapping
    public ResponseEntity<List<RecipeDto>> getAllRecipes() {
        List<RecipeDto> recipes = recipeService.getAllRecipes();
        return ResponseEntity.ok(recipes);
    }
    
    // 메뉴 ID로 레시피 조회
    @GetMapping("/menu/{menuId}")
    public ResponseEntity<RecipeDto> getRecipeByMenuId(@PathVariable Long menuId) {
        return recipeService.getRecipeByMenuId(menuId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // 레시피 ID로 조회
    @GetMapping("/{id}")
    public ResponseEntity<RecipeDto> getRecipeById(@PathVariable Long id) {
        return recipeService.getRecipeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // 레시피 생성
    @PostMapping
    public ResponseEntity<?> createRecipe(@RequestBody RecipeRequestDto requestDto) {
        try {
            // 데이터 유효성 검증
            if (requestDto.getMenuId() == null) {
                return ResponseEntity.badRequest().body("메뉴 ID는 필수입니다.");
            }
            if (requestDto.getName() == null || requestDto.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("레시피 이름은 필수입니다.");
            }
            if (requestDto.getIngredients() == null || requestDto.getIngredients().isEmpty()) {
                return ResponseEntity.badRequest().body("원재료는 최소 1개 이상 필요합니다.");
            }
            
            RecipeDto createdRecipe = recipeService.createRecipe(requestDto);
            return ResponseEntity.ok(createdRecipe);
        } catch (Exception e) {
            // 에러 로깅 추가
            e.printStackTrace();
            return ResponseEntity.badRequest().body("레시피 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 레시피 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRecipe(@PathVariable Long id, @RequestBody RecipeRequestDto requestDto) {
        try {
            // 데이터 유효성 검증
            if (requestDto.getMenuId() == null) {
                return ResponseEntity.badRequest().body("메뉴 ID는 필수입니다.");
            }
            if (requestDto.getName() == null || requestDto.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("레시피 이름은 필수입니다.");
            }
            if (requestDto.getIngredients() == null || requestDto.getIngredients().isEmpty()) {
                return ResponseEntity.badRequest().body("원재료는 최소 1개 이상 필요합니다.");
            }
            
            RecipeDto updatedRecipe = recipeService.updateRecipe(id, requestDto);
            return ResponseEntity.ok(updatedRecipe);
        } catch (Exception e) {
            // 에러 로깅 추가
            e.printStackTrace();
            return ResponseEntity.badRequest().body("레시피 수정 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    // 레시피 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        try {
            recipeService.deleteRecipe(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
