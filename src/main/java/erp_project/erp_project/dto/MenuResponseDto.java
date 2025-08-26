package erp_project.erp_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuResponseDto {
    
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category; // 기존 호환성 유지
    private Long categoryId; // 새로운 카테고리 ID
    private BigDecimal basePrice;
    private Boolean isAvailable;
    private Integer displayOrder;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 카테고리 정보
    private MenuCategoryResponseDto menuCategory;
}
