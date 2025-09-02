package erp_project.erp_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySalesTrendResponseDto {
    
    private List<String> dates; // 날짜 목록 (예: ["2024-12-01", "2024-12-02", ...])
    private List<BranchTrendDto> branches; // 지점별 일별 매출 데이터
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchTrendDto {
        private Long branchId;
        private String branchName;
        private String branchCode;
        private List<BigDecimal> dailySales; // 일별 매출 (dates와 같은 순서)
    }
}
