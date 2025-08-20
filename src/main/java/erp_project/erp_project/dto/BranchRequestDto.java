package erp_project.erp_project.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Data
public class BranchRequestDto {
    
    @NotBlank(message = "지점명은 필수입니다")
    @Size(max = 100, message = "지점명은 100자를 초과할 수 없습니다")
    private String branchName;
    
    @NotBlank(message = "지점 코드는 필수입니다")
    @Size(max = 10, message = "지점 코드는 10자를 초과할 수 없습니다")
    private String branchCode;
    
    @Size(max = 100, message = "주소는 100자를 초과할 수 없습니다")
    private String address;
    
    @Size(max = 20, message = "전화번호는 20자를 초과할 수 없습니다")
    private String phone;
    
    @Size(max = 100, message = "지점장 이름은 100자를 초과할 수 없습니다")
    private String managerName;
    
    @Size(max = 500, message = "운영시간은 500자를 초과할 수 없습니다")
    private String operatingHours;
    
    private LocalDate openDate;
    
    private String status = "active";
}
