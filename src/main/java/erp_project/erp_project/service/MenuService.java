package erp_project.erp_project.service;

import erp_project.erp_project.dto.MenuResponseDto;
import erp_project.erp_project.dto.PriceChangeHistoryDto;
import erp_project.erp_project.entity.Menu;
import erp_project.erp_project.entity.MenuCategory;
import erp_project.erp_project.repository.MenuRepository;
import erp_project.erp_project.repository.MenuCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import erp_project.erp_project.entity.PriceChangeHistory;
import erp_project.erp_project.repository.PriceChangeHistoryRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MenuService {
    
    private final MenuRepository menuRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final PriceChangeHistoryRepository priceChangeHistoryRepository;
    
    // 모든 메뉴 조회 (카테고리 정보 포함) - Redis 캐싱 적용
    @Cacheable(value = "menus", key = "'all'")
    public List<MenuResponseDto> getAllMenus() {
        List<Menu> menus = menuRepository.findAllWithCategoryOrderByDisplayOrder();
        return menus.stream()
                .map(this::convertToDto)
                .toList();
    }
    
    // 카테고리별 메뉴 조회 (기존 호환성 유지) - Redis 캐싱 적용
    @Cacheable(value = "menus", key = "'category:' + #category")
    public List<MenuResponseDto> getMenusByCategory(String category) {
        List<Menu> menus = menuRepository.findByCategoryAndIsAvailableTrueOrderByDisplayOrderAsc(category);
        return menus.stream()
                .map(this::convertToDto)
                .toList();
    }
    
    // 카테고리 ID로 메뉴 조회 (새로운 방식) - Redis 캐싱 적용
    @Cacheable(value = "menus", key = "'categoryId:' + #categoryId")
    public List<MenuResponseDto> getMenusByCategoryId(Long categoryId) {
        List<Menu> menus = menuRepository.findByCategoryIdAndIsAvailableTrueOrderByDisplayOrderAsc(categoryId);
        return menus.stream()
                .map(this::convertToDto)
                .toList();
    }
    
    // 특정 메뉴 조회 - Redis 캐싱 적용
    @Cacheable(value = "menu", key = "#id")
    public Optional<MenuResponseDto> getMenuById(Long id) {
        return menuRepository.findById(id)
                .map(this::convertToDto);
    }
    
    // 메뉴명으로 검색
    public List<Menu> searchMenusByName(String name) {
        return menuRepository.findByNameContainingIgnoreCaseAndIsAvailableTrue(name);
    }
    
    // Menu 엔티티를 MenuResponseDto로 변환
    private MenuResponseDto convertToDto(Menu menu) {
        // updatedAt이 null인 경우 현재 시간으로 설정
        LocalDateTime updatedAt = menu.getUpdatedAt();
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
            log.warn("메뉴 {}의 updatedAt이 null입니다. 현재 시간으로 설정합니다.", menu.getName());
        }
        
        return MenuResponseDto.builder()
                .id(menu.getId())
                .name(menu.getName())
                .description(menu.getDescription())
                .price(menu.getPrice())
                .category(menu.getCategory())
                .categoryId(menu.getCategoryId())
                .categoryName(menu.getMenuCategory() != null ? menu.getMenuCategory().getName() : null)
                .categoryDisplayName(menu.getMenuCategory() != null ? menu.getMenuCategory().getDisplayName() : null)
                .basePrice(menu.getBasePrice())
                .isAvailable(menu.getIsAvailable())
                .displayOrder(menu.getDisplayOrder())
                .imageUrl(menu.getImageUrl())
                .createdAt(menu.getCreatedAt())
                .updatedAt(updatedAt)
                .build();
    }
    
    // 가격 범위로 검색
    public List<Menu> getMenusByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return menuRepository.findByPriceRange(minPrice, maxPrice);
    }
    
    // 메뉴 추가 - 캐시 무효화
    @Transactional
    @CacheEvict(value = {"menus", "menu"}, allEntries = true)
    public Menu createMenu(Menu menu) {
        return menuRepository.save(menu);
    }
    
    // 이미지 업로드를 포함한 메뉴 추가 - 캐시 무효화
    @Transactional
    @CacheEvict(value = {"menus", "menu"}, allEntries = true)
    public Menu createMenuWithImage(
            String name, String code, Long categoryId, BigDecimal price, 
            BigDecimal basePrice, Integer stock, String unit, String description, 
            Boolean isAvailable, Integer displayOrder, MultipartFile image) {
        
        Menu menu = new Menu();
        menu.setName(name);
        // code 필드가 없으므로 name을 사용
        menu.setCategoryId(categoryId);
        // category 필드도 설정 (기존 호환성을 위해)
        if (categoryId != null) {
            // 실제 카테고리 이름을 가져와서 설정
            MenuCategory category = menuCategoryRepository.findById(categoryId).orElse(null);
            if (category != null) {
                menu.setCategory(category.getName());
            } else {
                menu.setCategory("unknown");
            }
        } else {
            menu.setCategory("uncategorized");
        }
        menu.setPrice(price);
        menu.setBasePrice(basePrice != null ? basePrice : BigDecimal.ZERO);
        // stock, unit 필드가 없으므로 제거
        menu.setDescription(description);
        menu.setIsAvailable(isAvailable != null ? isAvailable : true);
        menu.setDisplayOrder(displayOrder != null ? displayOrder : 1);
        
        // 이미지 처리
        if (image != null && !image.isEmpty()) {
            try {
                String imageUrl = saveImage(image);
                menu.setImageUrl(imageUrl);
            } catch (IOException e) {
                throw new RuntimeException("이미지 저장 중 오류가 발생했습니다: " + e.getMessage());
            }
        }
        
        return menuRepository.save(menu);
    }
    
    // 이미지 저장
    private String saveImage(MultipartFile image) throws IOException {
        // 업로드 디렉토리 생성
        String uploadDir = "uploads/menu-images";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // 파일명 생성 (중복 방지)
        String originalFilename = image.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IllegalArgumentException("파일명이 없습니다.");
        }
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String filename = UUID.randomUUID().toString() + fileExtension;
        
        // 파일 저장
        Path filePath = uploadPath.resolve(filename);
        Files.copy(image.getInputStream(), filePath);
        
        // 이미지 URL 반환
        return "/uploads/menu-images/" + filename;
    }
    
    // 메뉴 수정 - 캐시 무효화
    @Transactional
    @CacheEvict(value = {"menus", "menu"}, allEntries = true)
    public Menu updateMenu(Long id, Menu menuDetails) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다: " + id));
        
        menu.setName(menuDetails.getName());
        menu.setDescription(menuDetails.getDescription());
        menu.setPrice(menuDetails.getPrice());
        menu.setCategory(menuDetails.getCategory()); // 기존 호환성 유지
        menu.setCategoryId(menuDetails.getCategoryId()); // 새로운 카테고리 ID 설정
        menu.setBasePrice(menuDetails.getBasePrice());
        menu.setIsAvailable(menuDetails.getIsAvailable());
        menu.setDisplayOrder(menuDetails.getDisplayOrder());
        menu.setImageUrl(menuDetails.getImageUrl());
        
        return menuRepository.save(menu);
    }

    // 판매가만 수정 - 캐시 무효화
    @Transactional
    @CacheEvict(value = {"menus", "menu"}, allEntries = true)
    public MenuResponseDto updateMenuPrice(Long id, BigDecimal newPrice, String reason, String updatedBy) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다: " + id));
        
        BigDecimal oldPrice = menu.getPrice();
        menu.setPrice(newPrice);
        Menu savedMenu = menuRepository.save(menu);
        
        // 판매가 변경 이력 저장
        PriceChangeHistory history = PriceChangeHistory.builder()
                .menu(menu)
                .oldPrice(oldPrice)
                .newPrice(newPrice)
                .changeAmount(newPrice.subtract(oldPrice))
                .reason(reason)
                .updatedBy(updatedBy)
                .menuName(menu.getName())
                .build();
        
        priceChangeHistoryRepository.save(history);
        
        return convertToResponseDto(savedMenu);
    }
    
    // 메뉴 수정 (이미지 업로드 포함) - 캐시 무효화
    @Transactional
    @CacheEvict(value = {"menus", "menu"}, allEntries = true)
    public Menu updateMenuWithImage(Long id, String name, String description, BigDecimal price, 
                                   String category, BigDecimal basePrice, Boolean isAvailable, 
                                   Integer displayOrder, MultipartFile image) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다: " + id));
        
        menu.setName(name);
        menu.setDescription(description);
        menu.setPrice(price);
        menu.setCategory(category);
        
        // 카테고리 ID 설정 (카테고리 이름으로 찾기)
        if (category != null && !category.isEmpty()) {
            // MenuCategoryRepository를 주입받아서 카테고리 ID를 찾아야 하지만,
            // 현재 구조에서는 category 이름만 사용하므로 기존 categoryId는 유지
            // 필요시 MenuCategoryRepository를 주입받아서 처리 가능
        }
        
        menu.setBasePrice(basePrice != null ? basePrice : BigDecimal.ZERO);
        menu.setIsAvailable(isAvailable);
        menu.setDisplayOrder(displayOrder != null ? displayOrder : menu.getDisplayOrder());
        
        // 이미지 처리
        if (image != null && !image.isEmpty()) {
            try {
                // 기존 이미지 파일 삭제 (선택사항)
                if (menu.getImageUrl() != null && !menu.getImageUrl().isEmpty()) {
                    String existingImagePath = menu.getImageUrl();
                    if (existingImagePath.startsWith("/uploads/")) {
                        Path existingPath = Paths.get("uploads" + existingImagePath.substring("/uploads".length()));
                        if (Files.exists(existingPath)) {
                            Files.delete(existingPath);
                        }
                    }
                }
                
                // 새 이미지 저장
                String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
                Path uploadPath = Paths.get("uploads/menu-images");
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                
                Path filePath = uploadPath.resolve(filename);
                Files.copy(image.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                
                // 이미지 URL 설정
                menu.setImageUrl("/uploads/menu-images/" + filename);
            } catch (IOException e) {
                throw new RuntimeException("이미지 업로드 중 오류가 발생했습니다: " + e.getMessage());
            }
        }
        
        return menuRepository.save(menu);
    }
    
    // 메뉴 삭제 (실제 데이터베이스에서 삭제) - 캐시 무효화
    @Transactional
    @CacheEvict(value = {"menus", "menu"}, allEntries = true)
    public void deleteMenu(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다: " + id));
        
        // 실제 데이터베이스에서 메뉴 삭제
        menuRepository.delete(menu);
    }
    
    // 메뉴 가용성 토글 - 캐시 무효화
    @Transactional
    @CacheEvict(value = {"menus", "menu"}, allEntries = true)
    public void toggleMenuAvailability(Long id) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다: " + id));
        
        menu.setIsAvailable(!menu.getIsAvailable());
        menuRepository.save(menu);
    }
    
    // 메뉴 이미지 URL 업데이트
    @Transactional
    public Menu updateMenuImage(Long id, String imageUrl) {
        Menu menu = menuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("메뉴를 찾을 수 없습니다: " + id));
        
        menu.setImageUrl(imageUrl);
        return menuRepository.save(menu);
    }
    
    // 메뉴 옵션 조회
    public Optional<Map<String, Object>> getMenuOptions(Long menuId) {
        Menu menu = menuRepository.findById(menuId)
                .orElse(null);
        
        if (menu == null) {
            return Optional.empty();
        }
        
        // 여기서는 간단한 예시를 위해 하드코딩된 옵션을 반환
        // 실제로는 MenuOptionRelation을 조회해야 함
        Map<String, Object> options = new HashMap<>();
        
        if ("burger".equals(menu.getCategory())) {
            Map<String, Object> toppingOptions = new HashMap<>();
            toppingOptions.put("tomato", Map.of("name", "토마토", "price", 300, "default", true, "removable", true, "addable", true, "quantitySelectable", false));
            toppingOptions.put("onion", Map.of("name", "양파", "price", 300, "default", true, "removable", true, "addable", true, "quantitySelectable", false));
            toppingOptions.put("lettuce", Map.of("name", "양상추", "price", 300, "default", true, "removable", true, "addable", true, "quantitySelectable", false));
            toppingOptions.put("cheese", Map.of("name", "치즈", "price", 300, "default", true, "removable", true, "addable", true, "quantitySelectable", true, "maxQuantity", 5, "description", "개수 선택 가능 (최대 5개)"));
            toppingOptions.put("pickle", Map.of("name", "피클", "price", 0, "default", false, "removable", true, "addable", true, "quantitySelectable", false));
            toppingOptions.put("sauce", Map.of("name", "소스", "price", 0, "default", true, "removable", true, "addable", true, "quantitySelectable", false, "description", "마요네즈, 케찹, 머스타드 중 선택"));
            toppingOptions.put("bacon", Map.of("name", "베이컨", "price", 500, "default", false, "removable", true, "addable", true, "quantitySelectable", true, "maxQuantity", 3, "description", "개수 선택 가능 (최대 3개)"));
            
            options.put("toppings", toppingOptions);
        }
        
        return Optional.of(options);
    }
    
    /**
     * Menu 엔티티를 MenuResponseDto로 변환
     */
    public MenuResponseDto convertToResponseDto(Menu menu) {
        // updatedAt이 null인 경우 현재 시간으로 설정
        LocalDateTime updatedAt = menu.getUpdatedAt();
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
            log.warn("메뉴 {}의 updatedAt이 null입니다. 현재 시간으로 설정합니다.", menu.getName());
        }
        
        return MenuResponseDto.builder()
                .id(menu.getId())
                .name(menu.getName())
                .description(menu.getDescription())
                .price(menu.getPrice())
                .category(menu.getCategory())
                .categoryId(menu.getCategoryId())
                .categoryName(menu.getMenuCategory() != null ? menu.getMenuCategory().getName() : null)
                .categoryDisplayName(menu.getMenuCategory() != null ? menu.getMenuCategory().getDisplayName() : null)
                .basePrice(menu.getBasePrice())
                .isAvailable(menu.getIsAvailable())
                .displayOrder(menu.getDisplayOrder())
                .imageUrl(menu.getImageUrl())
                .createdAt(menu.getCreatedAt())
                .updatedAt(updatedAt)
                .build();
    }
    
    // 가격 변경 이력 조회
    public List<PriceChangeHistoryDto> getPriceChangeHistory() {
        List<PriceChangeHistory> histories = priceChangeHistoryRepository.findAllByOrderByChangeDateDesc();
        return histories.stream()
                .map(this::convertToPriceChangeHistoryDto)
                .collect(java.util.stream.Collectors.toList());
    }
    
    // 특정 메뉴의 가격 변경 이력 조회
    public List<PriceChangeHistoryDto> getPriceChangeHistoryByMenuId(Long menuId) {
        List<PriceChangeHistory> histories = priceChangeHistoryRepository.findByMenuIdOrderByChangeDateDesc(menuId);
        return histories.stream()
                .map(this::convertToPriceChangeHistoryDto)
                .collect(java.util.stream.Collectors.toList());
    }
    
    // PriceChangeHistory를 PriceChangeHistoryDto로 변환
    private PriceChangeHistoryDto convertToPriceChangeHistoryDto(PriceChangeHistory history) {
        return PriceChangeHistoryDto.builder()
                .id(history.getId())
                .menuId(history.getMenuId())
                .menuName(history.getMenuName())
                .oldPrice(history.getOldPrice())
                .newPrice(history.getNewPrice())
                .changeAmount(history.getChangeAmount())
                .changeDate(history.getChangeDate())
                .reason(history.getReason())
                .updatedBy(history.getUpdatedBy())
                .build();
    }
}
