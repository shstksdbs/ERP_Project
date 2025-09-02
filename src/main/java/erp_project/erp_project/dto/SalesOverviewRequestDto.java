package erp_project.erp_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesOverviewRequestDto {
    
    @NotNull(message = "연도는 필수입니다")
    @Min(value = 2020, message = "연도는 2020년 이후여야 합니다")
    @Max(value = 2030, message = "연도는 2030년 이전이어야 합니다")
    private Integer year;
    
    @NotNull(message = "월은 필수입니다")
    @Min(value = 1, message = "월은 1월 이상이어야 합니다")
    @Max(value = 12, message = "월은 12월 이하여야 합니다")
    private Integer month;
}
