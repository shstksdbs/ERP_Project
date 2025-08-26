package erp_project.erp_project.service;

import erp_project.erp_project.dto.UserResponseDto;
import erp_project.erp_project.entity.Users;
import erp_project.erp_project.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import erp_project.erp_project.entity.Users.UserRole;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UsersRepository usersRepository;

    // 모든 사용자 조회
    public List<UserResponseDto> getAllUsers() {
        List<Users> users = usersRepository.findAll();
        return users.stream()
                .map(UserResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 지점별 사용자 조회
    public List<UserResponseDto> getUsersByBranch(Long branchId) {
        List<Users> users = usersRepository.findByBranchId(branchId);
        return users.stream()
                .map(UserResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // 활성 사용자만 조회
    public List<UserResponseDto> getActiveUsers() {
        log.info("활성 사용자 조회");
        List<Users> activeUsers = usersRepository.findByIsActiveTrue();
        return activeUsers.stream()
                .map(UserResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateUserStatus(Long userId, String newStatus) {
        log.info("사용자 상태 변경 - 사용자 ID: {}, 새 상태: {}", userId, newStatus);
        
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
        
        // 상태값에 따라 isActive 설정
        boolean isActive;
        switch (newStatus.toLowerCase()) {
            case "active":
                isActive = true;
                break;
            case "inactive":
            case "suspended":
                isActive = false;
                break;
            default:
                throw new RuntimeException("유효하지 않은 상태값입니다: " + newStatus);
        }
        
        user.setIsActive(isActive);
        usersRepository.save(user);
        
        log.info("사용자 상태 변경 완료 - 사용자 ID: {}, 새 상태: {}, isActive: {}", 
                userId, newStatus, isActive);
    }

    @Transactional
    public void updateUser(Long userId, Map<String, Object> request) {
        log.info("사용자 정보 수정 - 사용자 ID: {}, 수정 데이터: {}", userId, request);
        
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
        
        // 사용자명 수정
        if (request.containsKey("username")) {
            String username = (String) request.get("username");
            if (username != null && !username.trim().isEmpty()) {
                user.setUsername(username.trim());
            }
        }
        
        // 실명 수정
        if (request.containsKey("name")) {
            String realName = (String) request.get("name");
            if (realName != null && !realName.trim().isEmpty()) {
                user.setRealName(realName.trim());
            }
        }
        
        // 이메일 수정
        if (request.containsKey("email")) {
            String email = (String) request.get("email");
            if (email != null && !email.trim().isEmpty()) {
                user.setEmail(email.trim());
            }
        }
        
        // 권한 수정
        if (request.containsKey("role")) {
            String role = (String) request.get("role");
            if (role != null && !role.trim().isEmpty()) {
                user.setRole(Users.UserRole.valueOf(role.toUpperCase()));
            }
        }
        
        // 상태 수정
        if (request.containsKey("status")) {
            String status = (String) request.get("status");
            if (status != null && !status.trim().isEmpty()) {
                boolean isActive;
                switch (status.toLowerCase()) {
                    case "active":
                        isActive = true;
                        break;
                    case "inactive":
                    case "suspended":
                        isActive = false;
                        break;
                    default:
                        throw new RuntimeException("유효하지 않은 상태값입니다: " + status);
                }
                user.setIsActive(isActive);
            }
        }
        
        // 지점 수정
        if (request.containsKey("branchId")) {
            Object branchIdObj = request.get("branchId");
            if (branchIdObj != null) {
                if (branchIdObj instanceof String && !((String) branchIdObj).trim().isEmpty()) {
                    try {
                        Long branchId = Long.parseLong((String) branchIdObj);
                        user.setBranchId(branchId);
                    } catch (NumberFormatException e) {
                        log.warn("잘못된 지점 ID 형식: {}", branchIdObj);
                    }
                } else if (branchIdObj instanceof Number) {
                    Long branchId = ((Number) branchIdObj).longValue();
                    user.setBranchId(branchId);
                }
            } else {
                user.setBranchId(null); // 지점 없음
            }
        }
        
        usersRepository.save(user);
        
        log.info("사용자 정보 수정 완료 - 사용자 ID: {}", userId);
    }

    @Transactional
    public void deleteUser(Long userId) {
        log.info("사용자 삭제 - 사용자 ID: {}", userId);
        
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
        
        // 사용자 삭제 (실제로는 데이터베이스에서 제거)
        usersRepository.delete(user);
        
        log.info("사용자 삭제 완료 - 사용자 ID: {}", userId);
    }

    @Transactional
    public void createUser(Map<String, Object> request) {
        log.info("사용자 생성 - 사용자 데이터: {}", request);
        
        // 필수 필드 검증
        String username = (String) request.get("username");
        String name = (String) request.get("name");
        String email = (String) request.get("email");
        
        if (username == null || username.trim().isEmpty()) {
            throw new RuntimeException("사용자명은 필수입니다");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("이름은 필수입니다");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("이메일은 필수입니다");
        }
        
        // 사용자명 중복 검사
        if (usersRepository.findByUsername(username.trim()).isPresent()) {
            throw new RuntimeException("이미 존재하는 사용자명입니다: " + username);
        }
        
        // 이메일 중복 검사
        if (usersRepository.findByEmail(email.trim()).isPresent()) {
            throw new RuntimeException("이미 존재하는 이메일입니다: " + email);
        }
        
        // 새 사용자 생성
        Users newUser = new Users();
        newUser.setUsername(username.trim());
        newUser.setRealName(name.trim());
        newUser.setEmail(email.trim());
        
        // 권한 설정
        String role = (String) request.get("role");
        if (role != null && !role.trim().isEmpty()) {
            try {
                newUser.setRole(Users.UserRole.valueOf(role.toUpperCase()));
            } catch (IllegalArgumentException e) {
                newUser.setRole(Users.UserRole.STAFF); // 기본값
            }
        } else {
            newUser.setRole(Users.UserRole.STAFF); // 기본값
        }
        
        // 상태 설정
        String status = (String) request.get("status");
        if ("active".equalsIgnoreCase(status)) {
            newUser.setIsActive(true);
        } else {
            newUser.setIsActive(false);
        }
        
        // 지점 설정
        Object branchIdObj = request.get("branchId");
        if (branchIdObj != null) {
            if (branchIdObj instanceof String && !((String) branchIdObj).trim().isEmpty()) {
                try {
                    Long branchId = Long.parseLong((String) branchIdObj);
                    newUser.setBranchId(branchId);
                } catch (NumberFormatException e) {
                    log.warn("잘못된 지점 ID 형식: {}", branchIdObj);
                }
            } else if (branchIdObj instanceof Number) {
                Long branchId = ((Number) branchIdObj).longValue();
                newUser.setBranchId(branchId);
            }
        }
        
        // 기본 비밀번호 설정 (실제로는 암호화된 비밀번호를 설정해야 함)
        newUser.setPassword("defaultPassword123"); // 임시 비밀번호
        
        // 사용자 저장
        usersRepository.save(newUser);
        
        log.info("사용자 생성 완료 - 사용자명: {}, 이름: {}", username, name);
    }
}
