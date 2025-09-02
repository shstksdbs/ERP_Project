package erp_project.erp_project.dto;

import erp_project.erp_project.entity.Users;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDto {
    
    private Long id;
    private String username;
    private String realName;
    private String email;
    private String phone;
    private Users.UserRole role;
    private Boolean isActive;
    private Long branchId;
    private String branchName;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Entity를 DTO로 변환하는 정적 메서드
    public static UserResponseDto fromEntity(Users user) {
        return UserResponseDto.builder()
            .id(user.getId())
            .username(user.getUsername())
            .realName(user.getRealName())
            .email(user.getEmail())
            .phone(user.getPhone())
            .role(user.getRole())
            .isActive(user.getIsActive())
            .branchId(user.getBranchId())
            .lastLogin(user.getLastLogin())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}
