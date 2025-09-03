package erp_project.erp_project.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    private String category; // 기존 호환성
    private Long categoryId;
    private String categoryName; // 카테고리 이름
    private String categoryDisplayName; // 카테고리 표시 이름
    private BigDecimal basePrice;
    private Boolean isAvailable;
    private Integer displayOrder;
    private String imageUrl;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
}