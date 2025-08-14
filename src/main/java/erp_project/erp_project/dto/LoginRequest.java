package erp_project.erp_project.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
    private Long branchId;
}
