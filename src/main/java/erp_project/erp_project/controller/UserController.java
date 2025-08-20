package erp_project.erp_project.controller;

import erp_project.erp_project.dto.UserResponseDto;
import erp_project.erp_project.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    // 모든 사용자 조회
    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        log.info("전체 사용자 조회 요청");
        List<UserResponseDto> users = userService.getAllUsers();
        log.info("사용자 조회 성공: {}명", users.size());
        return ResponseEntity.ok(users);
    }

    // 지점별 사용자 조회
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<UserResponseDto>> getUsersByBranch(@PathVariable Long branchId) {
        log.info("지점 {} 사용자 조회 요청", branchId);
        List<UserResponseDto> users = userService.getUsersByBranch(branchId);
        log.info("지점 {} 사용자 조회 성공: {}명", branchId, users.size());
        return ResponseEntity.ok(users);
    }

    // 활성 사용자만 조회
    @GetMapping("/active")
    public ResponseEntity<List<UserResponseDto>> getActiveUsers() {
        log.info("활성 사용자 조회 API 호출");
        try {
            List<UserResponseDto> users = userService.getActiveUsers();
            log.info("활성 사용자 조회 성공: {}명", users.size());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("활성 사용자 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{userId}/status")
    public ResponseEntity<String> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        log.info("사용자 상태 변경 API 호출 - 사용자 ID: {}, 새 상태: {}", userId, request.get("status"));
        try {
            String newStatus = request.get("status");
            if (newStatus == null) {
                return ResponseEntity.badRequest().body("상태값이 필요합니다");
            }
            
            userService.updateUserStatus(userId, newStatus);
            log.info("사용자 상태 변경 성공 - 사용자 ID: {}, 새 상태: {}", userId, newStatus);
            return ResponseEntity.ok("사용자 상태가 성공적으로 변경되었습니다");
        } catch (Exception e) {
            log.error("사용자 상태 변경 실패 - 사용자 ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("사용자 상태 변경에 실패했습니다");
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<String> updateUser(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> request) {
        log.info("사용자 정보 수정 API 호출 - 사용자 ID: {}, 수정 데이터: {}", userId, request);
        try {
            userService.updateUser(userId, request);
            log.info("사용자 정보 수정 성공 - 사용자 ID: {}", userId);
            return ResponseEntity.ok("사용자 정보가 성공적으로 수정되었습니다");
        } catch (Exception e) {
            log.error("사용자 정보 수정 실패 - 사용자 ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("사용자 정보 수정에 실패했습니다: " + e.getMessage());
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        log.info("사용자 삭제 API 호출 - 사용자 ID: {}", userId);
        try {
            userService.deleteUser(userId);
            log.info("사용자 삭제 성공 - 사용자 ID: {}", userId);
            return ResponseEntity.ok("사용자가 성공적으로 삭제되었습니다");
        } catch (Exception e) {
            log.error("사용자 삭제 실패 - 사용자 ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("사용자 삭제에 실패했습니다: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody Map<String, Object> request) {
        log.info("사용자 추가 API 호출 - 사용자 데이터: {}", request);
        try {
            userService.createUser(request);
            log.info("사용자 추가 성공");
            return ResponseEntity.ok("사용자가 성공적으로 추가되었습니다");
        } catch (Exception e) {
            log.error("사용자 추가 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("사용자 추가에 실패했습니다: " + e.getMessage());
        }
    }
}
