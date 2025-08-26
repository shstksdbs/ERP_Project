package erp_project.erp_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuCategoryResponseDto {
    
    private Long id;
    private String name;
    private String displayName;
    private String description;
    private Integer displayOrder;
    private Boolean isActive;
    private String imageUrl;
    private Long parentCategoryId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 하위 카테고리 정보
    private List<MenuCategoryResponseDto> subCategories;
    
    // 메뉴 개수
    private Long menuCount;
}
