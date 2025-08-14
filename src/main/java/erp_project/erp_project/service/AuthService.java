package erp_project.erp_project.service;

import erp_project.erp_project.dto.LoginRequest;
import erp_project.erp_project.dto.LoginResponse;
import erp_project.erp_project.entity.Users;
import erp_project.erp_project.repository.UsersRepository;
import erp_project.erp_project.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UsersRepository usersRepository;
    private final JwtUtil jwtUtil;
    
    public LoginResponse login(LoginRequest request) {
        // 입력값 검증
        if (request.getUsername() == null || request.getPassword() == null || request.getBranchId() == null) {
            throw new IllegalArgumentException("모든 필드를 입력해주세요.");
        }
        
        // 사용자 인증
        Optional<Users> userOpt = usersRepository.findByUsernameAndBranchIdAndPassword(
            request.getUsername(), 
            request.getBranchId(), 
            request.getPassword()
        );
        
        if (userOpt.isEmpty()) {
            throw new RuntimeException("사용자명, 지점 ID 또는 비밀번호가 올바르지 않습니다.");
        }
        
        Users user = userOpt.get();
        
        // 계정 활성화 상태 확인
        if (!user.getIsActive()) {
            throw new RuntimeException("비활성화된 계정입니다. 관리자에게 문의하세요.");
        }
        
        // 마지막 로그인 시간 업데이트
        user.setLastLogin(LocalDateTime.now());
        usersRepository.save(user);
        
        // JWT 토큰 생성
        String token = jwtUtil.generateToken(user.getUsername(), user.getBranchId().toString());
        
        // 로그인 응답 생성
        return LoginResponse.fromUser(user, token);
    }
    
    public boolean validateToken(String token) {
        try {
            return jwtUtil.validateToken(token);
        } catch (Exception e) {
            return false;
        }
    }
    
    public String getUsernameFromToken(String token) {
        return jwtUtil.getUsernameFromToken(token);
    }
    
    public Long getBranchIdFromToken(String token) {
        return Long.parseLong(jwtUtil.getBranchIdFromToken(token));
    }
}
