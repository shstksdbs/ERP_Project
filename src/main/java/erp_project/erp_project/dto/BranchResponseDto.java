package erp_project.erp_project.dto;

import lombok.Data;
import erp_project.erp_project.entity.Branches;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BranchResponseDto {
    
    private Long id;
    private String branchCode;
    private String branchName;
    private String branchType;
    private String address;
    private String phone;
    private String managerName;
    private String status;
    private String openingHours;
    private LocalDate openingDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Entity를 DTO로 변환하는 정적 메서드
    public static BranchResponseDto fromEntity(Branches branch) {
        BranchResponseDto dto = new BranchResponseDto();
        dto.setId(branch.getId());
        dto.setBranchCode(branch.getBranchCode());
        dto.setBranchName(branch.getBranchName());
        dto.setBranchType(branch.getBranchType() != null ? branch.getBranchType().name() : null);
        dto.setAddress(branch.getAddress());
        dto.setPhone(branch.getPhone());
        dto.setManagerName(branch.getManagerName());
        dto.setStatus(branch.getStatus() != null ? branch.getStatus().name() : null);
        dto.setOpeningHours(branch.getOpeningHours());
        dto.setOpeningDate(branch.getOpeningDate());
        dto.setCreatedAt(branch.getCreatedAt());
        dto.setUpdatedAt(branch.getUpdatedAt());
        return dto;
    }
}
