package erp_project.erp_project.dto;

import erp_project.erp_project.entity.Users;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LoginResponse {
    private String token;
    private Long userId;  // 사용자 ID 추가
    private String username;
    private String realName;
    private Long branchId;
    private Users.UserRole role;
    private LocalDateTime loginTime;
    private LocalDateTime lastLogin;  // 사용자의 마지막 로그인 시간
    
    public static LoginResponse fromUser(Users user, String token) {
        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUserId(user.getId());  // 사용자 ID 설정
        response.setUsername(user.getUsername());
        response.setRealName(user.getRealName());
        response.setBranchId(user.getBranchId());
        response.setRole(user.getRole());
        response.setLoginTime(LocalDateTime.now());
        response.setLastLogin(user.getLastLogin());  // 사용자의 실제 last_login 값 사용
        return response;
    }
}
