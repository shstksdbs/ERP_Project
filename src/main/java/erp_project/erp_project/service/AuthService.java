package erp_project.erp_project.service;

import erp_project.erp_project.dto.LoginRequest;
import erp_project.erp_project.dto.LoginResponse;
import erp_project.erp_project.entity.Users;
import erp_project.erp_project.repository.UsersRepository;
import erp_project.erp_project.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest loginRequest) {
        Users user = usersRepository.findByUsername(loginRequest.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return new LoginResponse(null, null, null, "잘못된 사용자명 또는 비밀번호입니다");
        }

        String token = jwtUtil.generateToken(user.getUsername());
        
        return new LoginResponse(
            token,
            user.getUsername(),
            user.getRole().getRoleName(),
            "로그인 성공"
        );
    }
}
