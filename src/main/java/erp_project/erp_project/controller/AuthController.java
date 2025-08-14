package erp_project.erp_project.controller;

import erp_project.erp_project.dto.LoginRequest;
import erp_project.erp_project.dto.LoginResponse;
import erp_project.erp_project.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("VALIDATION_ERROR", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse("AUTH_ERROR", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "로그인 처리 중 오류가 발생했습니다."));
        }
    }
    
    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            // "Bearer " 제거
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            boolean isValid = authService.validateToken(token);
            if (isValid) {
                String username = authService.getUsernameFromToken(token);
                Long branchId = authService.getBranchIdFromToken(token);
                return ResponseEntity.ok(new TokenValidationResponse(true, username, branchId));
            } else {
                return ResponseEntity.ok(new TokenValidationResponse(false, null, null));
            }
        } catch (Exception e) {
            return ResponseEntity.ok(new TokenValidationResponse(false, null, null));
        }
    }
    
    // 에러 응답 클래스
    public static class ErrorResponse {
        private String error;
        private String message;
        
        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }
        
        public String getError() { return error; }
        public String getMessage() { return message; }
    }
    
    // 토큰 검증 응답 클래스
    public static class TokenValidationResponse {
        private boolean valid;
        private String username;
        private Long branchId;
        
        public TokenValidationResponse(boolean valid, String username, Long branchId) {
            this.valid = valid;
            this.username = username;
            this.branchId = branchId;
        }
        
        public boolean isValid() { return valid; }
        public String getUsername() { return username; }
        public Long getBranchId() { return branchId; }
    }
}
