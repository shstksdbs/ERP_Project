package erp_project.erp_project.dto;

import erp_project.erp_project.entity.Users;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponseDto {
    
    private Long id;
    private String username;
    private String realName;
    private String email;
    private String phone;
    private String role;
    private String status;
    private Long branchId;
    private String branchName;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    
    // Entity를 DTO로 변환하는 정적 메서드
    public static UserResponseDto fromEntity(Users user) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setRealName(user.getRealName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        dto.setStatus(user.getIsActive() ? "active" : "inactive");
        dto.setBranchId(user.getBranchId());
        dto.setLastLogin(user.getLastLogin());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
