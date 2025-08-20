package erp_project.erp_project.controller;

import erp_project.erp_project.dto.BranchRequestDto;
import erp_project.erp_project.dto.BranchResponseDto;
import erp_project.erp_project.service.BranchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
@Slf4j
@Validated
@CrossOrigin(origins = "*") // CORS 설정 (개발 환경용)
public class BranchController {
    
    private final BranchService branchService;
    
    /**
     * 지점 등록
     * POST /api/branches
     */
    @PostMapping
    public ResponseEntity<BranchResponseDto> createBranch(@Valid @RequestBody BranchRequestDto requestDto) {
        log.info("지점 등록 API 호출: {}", requestDto.getBranchName());
        
        try {
            BranchResponseDto response = branchService.createBranch(requestDto);
            log.info("지점 등록 성공: ID={}, 이름={}", response.getId(), response.getBranchName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("지점 등록 실패 (검증 오류): {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("지점 등록 실패 (시스템 오류): {}", e.getMessage(), e);
            throw new RuntimeException("지점 등록 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 모든 지점 조회
     * GET /api/branches
     */
    @GetMapping
    public ResponseEntity<List<BranchResponseDto>> getAllBranches() {
        log.info("모든 지점 조회 API 호출");
        
        try {
            List<BranchResponseDto> branches = branchService.getAllBranches();
            log.info("지점 조회 성공: {}개 지점", branches.size());
            return ResponseEntity.ok(branches);
        } catch (Exception e) {
            log.error("지점 조회 실패: {}", e.getMessage(), e);
            throw new RuntimeException("지점 조회 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 활성 상태인 지점만 조회
     * GET /api/branches/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<BranchResponseDto>> getActiveBranches() {
        log.info("활성 지점 조회 API 호출");
        
        try {
            List<BranchResponseDto> branches = branchService.getActiveBranches();
            log.info("활성 지점 조회 성공: {}개 지점", branches.size());
            return ResponseEntity.ok(branches);
        } catch (Exception e) {
            log.error("활성 지점 조회 실패: {}", e.getMessage(), e);
            throw new RuntimeException("활성 지점 조회 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * ID로 지점 조회
     * GET /api/branches/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<BranchResponseDto> getBranchById(@PathVariable Long id) {
        log.info("지점 조회 API 호출: ID={}", id);
        
        try {
            BranchResponseDto branch = branchService.getBranchById(id);
            log.info("지점 조회 성공: ID={}, 이름={}", branch.getId(), branch.getBranchName());
            return ResponseEntity.ok(branch);
        } catch (IllegalArgumentException e) {
            log.error("지점 조회 실패 (존재하지 않는 지점): {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("지점 조회 실패 (시스템 오류): {}", e.getMessage(), e);
            throw new RuntimeException("지점 조회 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 지점 코드로 지점 조회
     * GET /api/branches/code/{branchCode}
     */
    @GetMapping("/code/{branchCode}")
    public ResponseEntity<BranchResponseDto> getBranchByCode(@PathVariable String branchCode) {
        log.info("지점 코드로 조회 API 호출: {}", branchCode);
        
        try {
            BranchResponseDto branch = branchService.getBranchByCode(branchCode);
            log.info("지점 코드 조회 성공: 코드={}, 이름={}", branch.getBranchCode(), branch.getBranchName());
            return ResponseEntity.ok(branch);
        } catch (IllegalArgumentException e) {
            log.error("지점 코드 조회 실패 (존재하지 않는 지점): {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("지점 코드 조회 실패 (시스템 오류): {}", e.getMessage(), e);
            throw new RuntimeException("지점 조회 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 지점 수정
     * PUT /api/branches/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<BranchResponseDto> updateBranch(
            @PathVariable Long id, 
            @Valid @RequestBody BranchRequestDto requestDto) {
        log.info("지점 수정 API 호출: ID={}", id);
        
        try {
            BranchResponseDto response = branchService.updateBranch(id, requestDto);
            log.info("지점 수정 성공: ID={}, 이름={}", response.getId(), response.getBranchName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("지점 수정 실패 (검증 오류): {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("지점 수정 실패 (시스템 오류): {}", e.getMessage(), e);
            throw new RuntimeException("지점 수정 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 지점 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBranch(@PathVariable Long id) {
        log.info("지점 삭제 API 호출: ID={}", id);
        try {
            branchService.deleteBranch(id);
            return ResponseEntity.ok("지점이 성공적으로 삭제되었습니다.");
        } catch (IllegalArgumentException e) {
            log.error("지점 삭제 실패 (존재하지 않는 지점): {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("삭제할 지점을 찾을 수 없습니다: " + e.getMessage());
        } catch (Exception e) {
            log.error("지점 삭제 중 오류 발생: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("지점 삭제 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
    
    /**
     * 지점 검색
     * GET /api/branches/search?keyword={keyword}
     */
    @GetMapping("/search")
    public ResponseEntity<List<BranchResponseDto>> searchBranches(@RequestParam String keyword) {
        log.info("지점 검색 API 호출: 키워드={}", keyword);
        
        try {
            List<BranchResponseDto> branches = branchService.searchBranches(keyword);
            log.info("지점 검색 성공: 키워드={}, 결과={}개", keyword, branches.size());
            return ResponseEntity.ok(branches);
        } catch (Exception e) {
            log.error("지점 검색 실패: {}", e.getMessage(), e);
            throw new RuntimeException("지점 검색 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 지점 코드 중복 확인
     * GET /api/branches/check-code/{branchCode}
     */
    @GetMapping("/check-code/{branchCode}")
    public ResponseEntity<Boolean> checkBranchCodeExists(@PathVariable String branchCode) {
        log.info("지점 코드 중복 확인 API 호출: {}", branchCode);
        
        try {
            boolean exists = branchService.getBranchByCode(branchCode) != null;
            log.info("지점 코드 중복 확인 완료: {} = {}", branchCode, exists);
            return ResponseEntity.ok(exists);
        } catch (IllegalArgumentException e) {
            // 존재하지 않는 경우 false 반환
            return ResponseEntity.ok(false);
        } catch (Exception e) {
            log.error("지점 코드 중복 확인 실패: {}", e.getMessage(), e);
            throw new RuntimeException("지점 코드 중복 확인 중 오류가 발생했습니다.", e);
        }
    }
}
