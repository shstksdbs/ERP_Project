package erp_project.erp_project.dto;

import erp_project.erp_project.entity.Users;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LoginResponse {
    private String token;
    private String username;
    private String realName;
    private Long branchId;
    private Users.UserRole role;
    private LocalDateTime loginTime;
    
    public static LoginResponse fromUser(Users user, String token) {
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        response.setRealName(user.getRealName());
        response.setBranchId(user.getBranchId());
        response.setRole(user.getRole());
        response.setLoginTime(LocalDateTime.now());
        return response;
    }
}
