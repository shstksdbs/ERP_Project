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
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    private final UsersRepository usersRepository;
    
    /**
     * 사용자 ID로 사용자 정보 조회
     */
    public Optional<Users> getUserById(Long userId) {
        return usersRepository.findById(userId);
    }
    
    /**
     * 현재 로그인한 사용자 정보 조회 (임시로 1번 사용자 반환)
     * 실제로는 Spring Security의 SecurityContext에서 가져와야 함
     */
    public Users getCurrentUser() {
        // 임시로 1번 사용자 반환 (실제로는 SecurityContext에서 가져와야 함)
        return usersRepository.findById(1L)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
    
    /**
     * 사용자 실명으로 사용자 조회
     */
    public Optional<Users> getUserByName(String realName) {
        return usersRepository.findByRealName(realName);
    }
    
    /**
     * 모든 사용자 조회
     */
    public List<UserResponseDto> getAllUsers() {
        List<Users> users = usersRepository.findAll();
        return users.stream()
            .map(this::convertToUserResponseDto)
            .collect(Collectors.toList());
    }
    
    /**
     * 지점별 사용자 조회
     */
    public List<UserResponseDto> getUsersByBranch(Long branchId) {
        List<Users> users = usersRepository.findByBranchId(branchId);
        return users.stream()
            .map(this::convertToUserResponseDto)
            .collect(Collectors.toList());
    }
    
    /**
     * 활성 사용자만 조회
     */
    public List<UserResponseDto> getActiveUsers() {
        List<Users> users = usersRepository.findByIsActiveTrue();
        return users.stream()
            .map(this::convertToUserResponseDto)
            .collect(Collectors.toList());
    }
    
    /**
     * 사용자 상태 변경
     */
    @Transactional
    public void updateUserStatus(Long userId, String status) {
        Users user = usersRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
        
        user.setIsActive("active".equals(status));
        usersRepository.save(user);
    }
    
    /**
     * 사용자 정보 수정
     */
    @Transactional
    public void updateUser(Long userId, Map<String, Object> request) {
        Users user = usersRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
        
        if (request.containsKey("realName")) {
            user.setRealName((String) request.get("realName"));
        }
        if (request.containsKey("username")) {
            user.setUsername((String) request.get("username"));
        }
        if (request.containsKey("email")) {
            user.setEmail((String) request.get("email"));
        }
        if (request.containsKey("phone")) {
            user.setPhone((String) request.get("phone"));
        }
        if (request.containsKey("role")) {
            user.setRole(Users.UserRole.valueOf((String) request.get("role")));
        }
        if (request.containsKey("branchId")) {
            user.setBranchId(Long.valueOf(request.get("branchId").toString()));
        }
        if (request.containsKey("isActive")) {
            user.setIsActive((Boolean) request.get("isActive"));
        }
        
        usersRepository.save(user);
    }
    
    /**
     * 사용자 삭제
     */
    @Transactional
    public void deleteUser(Long userId) {
        Users user = usersRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
        
        usersRepository.delete(user);
    }
    
    /**
     * 사용자 생성
     */
    @Transactional
    public void createUser(Map<String, Object> request) {
        Users user = Users.builder()
            .username((String) request.get("username"))
            .realName((String) request.get("realName"))
            .password((String) request.get("password"))
            .email((String) request.get("email"))
            .phone((String) request.get("phone"))
            .role(Users.UserRole.valueOf((String) request.get("role")))
            .branchId(Long.valueOf(request.get("branchId").toString()))
            .isActive(true)
            .build();
        
        usersRepository.save(user);
    }
    
    /**
     * Users 엔티티를 UserResponseDto로 변환
     */
    private UserResponseDto convertToUserResponseDto(Users user) {
        return UserResponseDto.fromEntity(user);
    }
}