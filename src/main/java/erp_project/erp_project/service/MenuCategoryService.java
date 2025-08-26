package erp_project.erp_project.service;

import erp_project.erp_project.dto.MenuCategoryRequestDto;
import erp_project.erp_project.dto.MenuCategoryResponseDto;
import erp_project.erp_project.entity.MenuCategory;
import erp_project.erp_project.repository.MenuCategoryRepository;
import erp_project.erp_project.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MenuCategoryService {
    
    private final MenuCategoryRepository menuCategoryRepository;
    private final MenuRepository menuRepository;
    
    /**
     * 모든 활성화된 카테고리 조회 (계층 구조)
     */
    public List<MenuCategoryResponseDto> getAllActiveCategories() {
        List<MenuCategory> topLevelCategories = menuCategoryRepository.findTopLevelCategories();
        
        return topLevelCategories.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }
    
    /**
     * 모든 카테고리 조회 (관리자용)
     */
    public List<MenuCategoryResponseDto> getAllCategories() {
        List<MenuCategory> categories = menuCategoryRepository.findAllByOrderByDisplayOrderAsc();
        
        return categories.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }
    
    /**
     * 카테고리 ID로 조회
     */
    public MenuCategoryResponseDto getCategoryById(Long id) {
        MenuCategory category = menuCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + id));
        
        return convertToResponseDto(category);
    }
    
    /**
     * 카테고리명으로 조회
     */
    public MenuCategoryResponseDto getCategoryByName(String name) {
        MenuCategory category = menuCategoryRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + name));
        
        return convertToResponseDto(category);
    }
    
    /**
     * 상위 카테고리만 조회
     */
    public List<MenuCategoryResponseDto> getTopLevelCategories() {
        List<MenuCategory> categories = menuCategoryRepository.findByParentCategoryIdIsNullAndIsActiveTrueOrderByDisplayOrderAsc();
        
        return categories.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }
    
    /**
     * 특정 상위 카테고리의 하위 카테고리들 조회
     */
    public List<MenuCategoryResponseDto> getSubCategories(Long parentId) {
        List<MenuCategory> categories = menuCategoryRepository.findByParentCategoryIdAndIsActiveTrueOrderByDisplayOrderAsc(parentId);
        
        return categories.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }
    
    /**
     * 카테고리 검색
     */
    public List<MenuCategoryResponseDto> searchCategories(String searchTerm) {
        List<MenuCategory> categories = menuCategoryRepository.searchCategories(searchTerm);
        
        return categories.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }
    
    /**
     * 카테고리 생성
     */
    @Transactional
    public MenuCategoryResponseDto createCategory(MenuCategoryRequestDto requestDto) {
        // 카테고리명 중복 확인
        if (menuCategoryRepository.existsByName(requestDto.getName())) {
            throw new RuntimeException("이미 존재하는 카테고리명입니다: " + requestDto.getName());
        }
        
        // 표시명 중복 확인
        if (menuCategoryRepository.existsByDisplayName(requestDto.getDisplayName())) {
            throw new RuntimeException("이미 존재하는 표시명입니다: " + requestDto.getDisplayName());
        }
        
        MenuCategory category = MenuCategory.builder()
                .name(requestDto.getName())
                .displayName(requestDto.getDisplayName())
                .description(requestDto.getDescription())
                .displayOrder(requestDto.getDisplayOrder())
                .isActive(requestDto.getIsActive())
                .imageUrl(requestDto.getImageUrl())
                .parentCategoryId(requestDto.getParentCategoryId())
                .build();
        
        MenuCategory savedCategory = menuCategoryRepository.save(category);
        return convertToResponseDto(savedCategory);
    }
    
    /**
     * 카테고리 수정
     */
    @Transactional
    public MenuCategoryResponseDto updateCategory(Long id, MenuCategoryRequestDto requestDto) {
        MenuCategory category = menuCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + id));
        
        // 카테고리명 중복 확인 (자신 제외)
        if (!category.getName().equals(requestDto.getName()) && 
            menuCategoryRepository.existsByName(requestDto.getName())) {
            throw new RuntimeException("이미 존재하는 카테고리명입니다: " + requestDto.getName());
        }
        
        // 표시명 중복 확인 (자신 제외)
        if (!category.getDisplayName().equals(requestDto.getDisplayName()) && 
            menuCategoryRepository.existsByDisplayName(requestDto.getDisplayName())) {
            throw new RuntimeException("이미 존재하는 표시명입니다: " + requestDto.getDisplayName());
        }
        
        // 순환 참조 방지 (자신을 상위 카테고리로 설정하는 것 방지)
        if (requestDto.getParentCategoryId() != null && requestDto.getParentCategoryId().equals(id)) {
            throw new RuntimeException("자신을 상위 카테고리로 설정할 수 없습니다");
        }
        
        category.setName(requestDto.getName());
        category.setDisplayName(requestDto.getDisplayName());
        category.setDescription(requestDto.getDescription());
        category.setDisplayOrder(requestDto.getDisplayOrder());
        category.setIsActive(requestDto.getIsActive());
        category.setImageUrl(requestDto.getImageUrl());
        category.setParentCategoryId(requestDto.getParentCategoryId());
        
        MenuCategory updatedCategory = menuCategoryRepository.save(category);
        return convertToResponseDto(updatedCategory);
    }
    
    /**
     * 카테고리 삭제 (실제 삭제)
     */
    @Transactional
    public void deleteCategory(Long id) {
        MenuCategory category = menuCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + id));
        
        // 해당 카테고리에 메뉴가 있는지 확인
        long menuCount = menuRepository.countByCategoryIdAndIsAvailableTrue(id);
        if (menuCount > 0) {
            throw new RuntimeException("메뉴가 포함된 카테고리는 삭제할 수 없습니다. 메뉴 개수: " + menuCount);
        }
        
        // 하위 카테고리가 있는지 확인
        List<MenuCategory> subCategories = menuCategoryRepository.findByParentCategoryIdAndIsActiveTrueOrderByDisplayOrderAsc(id);
        if (!subCategories.isEmpty()) {
            throw new RuntimeException("하위 카테고리가 있는 카테고리는 삭제할 수 없습니다. 하위 카테고리 개수: " + subCategories.size());
        }
        
        // 실제 삭제
        menuCategoryRepository.delete(category);
    }
    
    /**
     * 카테고리 순서 변경
     */
    @Transactional
    public void updateCategoryOrder(Long id, Integer newOrder) {
        MenuCategory category = menuCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다: " + id));
        
        category.setDisplayOrder(newOrder);
        menuCategoryRepository.save(category);
    }
    
    /**
     * Entity를 ResponseDto로 변환
     */
    private MenuCategoryResponseDto convertToResponseDto(MenuCategory category) {
        // 하위 카테고리 조회
        List<MenuCategoryResponseDto> subCategories = menuCategoryRepository
                .findByParentCategoryIdAndIsActiveTrueOrderByDisplayOrderAsc(category.getId())
                .stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
        
        // 메뉴 개수 조회
        long menuCount = menuRepository.countByCategoryIdAndIsAvailableTrue(category.getId());
        
        return MenuCategoryResponseDto.builder()
                .id(category.getId())
                .name(category.getName())
                .displayName(category.getDisplayName())
                .description(category.getDescription())
                .displayOrder(category.getDisplayOrder())
                .isActive(category.getIsActive())
                .imageUrl(category.getImageUrl())
                .parentCategoryId(category.getParentCategoryId())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .subCategories(subCategories)
                .menuCount(menuCount)
                .build();
    }
}
