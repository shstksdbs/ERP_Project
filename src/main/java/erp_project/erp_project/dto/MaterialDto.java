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
public class MaterialDto {
    private Long id;
    private String name;
    private String code;
    private String category;
    private String unit;
    private BigDecimal costPerUnit;
    private String supplier;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
