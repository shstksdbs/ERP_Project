package erp_project.erp_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuCategoryRequestDto {
    
    @NotBlank(message = "카테고리명은 필수입니다")
    @Size(max = 100, message = "카테고리명은 100자를 초과할 수 없습니다")
    private String name;
    
    @NotBlank(message = "표시명은 필수입니다")
    @Size(max = 100, message = "표시명은 100자를 초과할 수 없습니다")
    private String displayName;
    
    @Size(max = 500, message = "설명은 500자를 초과할 수 없습니다")
    private String description;
    
    @NotNull(message = "표시 순서는 필수입니다")
    private Integer displayOrder;
    
    @NotNull(message = "활성화 여부는 필수입니다")
    private Boolean isActive;
    
    @Size(max = 500, message = "이미지 URL은 500자를 초과할 수 없습니다")
    private String imageUrl;
    
    private Long parentCategoryId;
}
