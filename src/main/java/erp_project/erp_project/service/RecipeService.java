package erp_project.erp_project.service;

import erp_project.erp_project.dto.RecipeDto;
import erp_project.erp_project.dto.RecipeIngredientDto;
import erp_project.erp_project.dto.RecipeRequestDto;
import erp_project.erp_project.entity.Material;
import erp_project.erp_project.entity.Menu;
import erp_project.erp_project.entity.Recipe;
import erp_project.erp_project.entity.RecipeIngredient;
import erp_project.erp_project.repository.MaterialRepository;
import erp_project.erp_project.repository.MenuRepository;
import erp_project.erp_project.repository.RecipeIngredientRepository;
import erp_project.erp_project.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RecipeService {
    
    private final RecipeRepository recipeRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;
    private final MenuRepository menuRepository;
    private final MaterialRepository materialRepository;
    
    // 모든 레시피 조회
    public List<RecipeDto> getAllRecipes() {
        List<Recipe> recipes = recipeRepository.findAll();
        return recipes.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 메뉴 ID로 레시피 조회
    public Optional<RecipeDto> getRecipeByMenuId(Long menuId) {
        return recipeRepository.findByMenuId(menuId)
                .map(this::convertToDto);
    }
    
    // 레시피 ID로 조회
    public Optional<RecipeDto> getRecipeById(Long id) {
        return recipeRepository.findById(id)
                .map(this::convertToDto);
    }
    
    // 레시피 생성
    public RecipeDto createRecipe(RecipeRequestDto requestDto) {
        Menu menu = menuRepository.findById(requestDto.getMenuId())
                .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다: " + requestDto.getMenuId()));
        
        Recipe recipe = Recipe.builder()
                .menu(menu)
                .name(requestDto.getName())
                .description(requestDto.getDescription())
                .yieldQuantity(requestDto.getYieldQuantity())
                .yieldUnit(requestDto.getYieldUnit())
                .instructions(requestDto.getInstructions())
                .preparationTime(requestDto.getPreparationTime())
                .cookingTime(requestDto.getCookingTime())
                .difficulty(Recipe.RecipeDifficulty.valueOf(requestDto.getDifficulty()))
                .status(Recipe.RecipeStatus.valueOf(requestDto.getStatus()))
                .build();
        
        Recipe savedRecipe = recipeRepository.save(recipe);
        
        // 재료 추가
        if (requestDto.getIngredients() != null) {
            for (var ingredientRequest : requestDto.getIngredients()) {
                Material material = materialRepository.findById(ingredientRequest.getMaterialId())
                        .orElseThrow(() -> new RuntimeException("원재료를 찾을 수 없습니다: " + ingredientRequest.getMaterialId()));
                
                RecipeIngredient ingredient = RecipeIngredient.builder()
                        .recipe(savedRecipe)
                        .material(material)
                        .quantity(ingredientRequest.getQuantity())
                        .unit(ingredientRequest.getUnit())
                        .costPerUnit(ingredientRequest.getCostPerUnit() != null ? ingredientRequest.getCostPerUnit() : material.getCostPerUnit())
                        .totalCost(ingredientRequest.getTotalCost() != null ? ingredientRequest.getTotalCost() : ingredientRequest.getQuantity().multiply(material.getCostPerUnit()))
                        .notes(ingredientRequest.getNotes())
                        .build();
                
                recipeIngredientRepository.save(ingredient);
            }
        }
        
        return convertToDto(savedRecipe);
    }
    
    // 레시피 수정
    public RecipeDto updateRecipe(Long id, RecipeRequestDto requestDto) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("레시피를 찾을 수 없습니다: " + id));
        
        Menu menu = menuRepository.findById(requestDto.getMenuId())
                .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다: " + requestDto.getMenuId()));
        
        recipe.setMenu(menu);
        recipe.setName(requestDto.getName());
        recipe.setDescription(requestDto.getDescription());
        recipe.setYieldQuantity(requestDto.getYieldQuantity());
        recipe.setYieldUnit(requestDto.getYieldUnit());
        recipe.setInstructions(requestDto.getInstructions());
        recipe.setPreparationTime(requestDto.getPreparationTime());
        recipe.setCookingTime(requestDto.getCookingTime());
        recipe.setDifficulty(Recipe.RecipeDifficulty.valueOf(requestDto.getDifficulty()));
        recipe.setStatus(Recipe.RecipeStatus.valueOf(requestDto.getStatus()));
        
        // 기존 재료 삭제
        recipeIngredientRepository.deleteByRecipeId(id);
        
        // 새로운 재료 추가
        if (requestDto.getIngredients() != null) {
            for (var ingredientRequest : requestDto.getIngredients()) {
                Material material = materialRepository.findById(ingredientRequest.getMaterialId())
                        .orElseThrow(() -> new RuntimeException("원재료를 찾을 수 없습니다: " + ingredientRequest.getMaterialId()));
                
                RecipeIngredient ingredient = RecipeIngredient.builder()
                        .recipe(recipe)
                        .material(material)
                        .quantity(ingredientRequest.getQuantity())
                        .unit(ingredientRequest.getUnit())
                        .costPerUnit(ingredientRequest.getCostPerUnit() != null ? ingredientRequest.getCostPerUnit() : material.getCostPerUnit())
                        .totalCost(ingredientRequest.getTotalCost() != null ? ingredientRequest.getTotalCost() : ingredientRequest.getQuantity().multiply(material.getCostPerUnit()))
                        .notes(ingredientRequest.getNotes())
                        .build();
                
                recipeIngredientRepository.save(ingredient);
            }
        }
        
        Recipe updatedRecipe = recipeRepository.save(recipe);
        return convertToDto(updatedRecipe);
    }
    
    // 레시피 삭제
    public void deleteRecipe(Long id) {
        recipeRepository.deleteById(id);
    }
    
    // DTO 변환
    private RecipeDto convertToDto(Recipe recipe) {
        List<RecipeIngredientDto> ingredientDtos = new ArrayList<>();
        BigDecimal totalCost = BigDecimal.ZERO;
        
        if (recipe.getIngredients() != null && !recipe.getIngredients().isEmpty()) {
            ingredientDtos = recipe.getIngredients().stream()
                    .map(this::convertIngredientToDto)
                    .collect(Collectors.toList());
            
            totalCost = ingredientDtos.stream()
                    .map(RecipeIngredientDto::getTotalCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        
        return RecipeDto.builder()
                .id(recipe.getId())
                .menuId(recipe.getMenu().getId())
                .menuName(recipe.getMenu().getName())
                .menuCode(String.valueOf(recipe.getMenu().getId())) // code 대신 id를 문자열로 변환
                .menuCategory(recipe.getMenu().getCategory()) // String 타입이므로 직접 사용
                .name(recipe.getName())
                .description(recipe.getDescription())
                .yieldQuantity(recipe.getYieldQuantity())
                .yieldUnit(recipe.getYieldUnit())
                .instructions(recipe.getInstructions())
                .preparationTime(recipe.getPreparationTime())
                .cookingTime(recipe.getCookingTime())
                .difficulty(recipe.getDifficulty().name())
                .status(recipe.getStatus().name())
                .ingredients(ingredientDtos)
                .createdAt(recipe.getCreatedAt())
                .updatedAt(recipe.getUpdatedAt())
                .totalCost(totalCost)
                .build();
    }
    
    // 재료 DTO 변환
    private RecipeIngredientDto convertIngredientToDto(RecipeIngredient ingredient) {
        return RecipeIngredientDto.builder()
                .id(ingredient.getId())
                .materialId(ingredient.getMaterial().getId())
                .materialName(ingredient.getMaterial().getName())
                .materialCode(ingredient.getMaterial().getCode())
                .quantity(ingredient.getQuantity())
                .unit(ingredient.getUnit())
                .costPerUnit(ingredient.getCostPerUnit())
                .totalCost(ingredient.getTotalCost())
                .notes(ingredient.getNotes())
                .build();
    }
}
