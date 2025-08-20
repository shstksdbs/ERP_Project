package erp_project.erp_project.service;

import erp_project.erp_project.dto.BranchRequestDto;
import erp_project.erp_project.dto.BranchResponseDto;
import erp_project.erp_project.entity.Branches;
import erp_project.erp_project.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BranchService {
    
    private final BranchRepository branchRepository;
    
    /**
     * 지점 등록
     */
    public BranchResponseDto createBranch(BranchRequestDto requestDto) {
        log.info("지점 등록 요청: {}", requestDto.getBranchName());
        
        // 지점 코드 중복 확인
        if (branchRepository.existsByBranchCode(requestDto.getBranchCode())) {
            throw new IllegalArgumentException("이미 존재하는 지점 코드입니다: " + requestDto.getBranchCode());
        }
        
        // 지점명 중복 확인
        if (branchRepository.existsByBranchName(requestDto.getBranchName())) {
            throw new IllegalArgumentException("이미 존재하는 지점명입니다: " + requestDto.getBranchName());
        }
        
        // DTO를 Entity로 변환
        Branches branch = Branches.builder()
                .branchCode(requestDto.getBranchCode())
                .branchName(requestDto.getBranchName())
                .branchType(Branches.BranchType.branch) // 기본값: branch
                .address(requestDto.getAddress())
                .phone(requestDto.getPhone())
                .managerName(requestDto.getManagerName())
                .openingHours(requestDto.getOperatingHours())
                .openingDate(requestDto.getOpenDate())
                .status(Branches.BranchStatus.valueOf(requestDto.getStatus()))
                .build();
        
        // 저장
        Branches savedBranch = branchRepository.save(branch);
        log.info("지점 등록 완료: ID={}, 이름={}", savedBranch.getId(), savedBranch.getBranchName());
        
        return BranchResponseDto.fromEntity(savedBranch);
    }
    
    /**
     * 모든 지점 조회
     */
    @Transactional(readOnly = true)
    public List<BranchResponseDto> getAllBranches() {
        log.info("모든 지점 조회 요청");
        List<Branches> branches = branchRepository.findAll();
        return branches.stream()
                .map(BranchResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * 활성 상태인 지점만 조회
     */
    @Transactional(readOnly = true)
    public List<BranchResponseDto> getActiveBranches() {
        log.info("활성 지점 조회 요청");
        List<Branches> branches = branchRepository.findActiveBranches();
        return branches.stream()
                .map(BranchResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * ID로 지점 조회
     */
    @Transactional(readOnly = true)
    public BranchResponseDto getBranchById(Long id) {
        log.info("지점 조회 요청: ID={}", id);
        Branches branch = branchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지점입니다: " + id));
        return BranchResponseDto.fromEntity(branch);
    }
    
    /**
     * 지점 코드로 지점 조회
     */
    @Transactional(readOnly = true)
    public BranchResponseDto getBranchByCode(String branchCode) {
        log.info("지점 코드로 조회 요청: {}", branchCode);
        Branches branch = branchRepository.findByBranchCode(branchCode)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지점 코드입니다: " + branchCode));
        return BranchResponseDto.fromEntity(branch);
    }
    
    /**
     * 지점 수정
     */
    public BranchResponseDto updateBranch(Long id, BranchRequestDto requestDto) {
        log.info("지점 수정 요청: ID={}", id);
        
        Branches branch = branchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지점입니다: " + id));
        
        // 지점 코드 변경 시 중복 확인
        if (!branch.getBranchCode().equals(requestDto.getBranchCode()) && 
            branchRepository.existsByBranchCode(requestDto.getBranchCode())) {
            throw new IllegalArgumentException("이미 존재하는 지점 코드입니다: " + requestDto.getBranchCode());
        }
        
        // 지점명 변경 시 중복 확인
        if (!branch.getBranchName().equals(requestDto.getBranchName()) && 
            branchRepository.existsByBranchName(requestDto.getBranchName())) {
            throw new IllegalArgumentException("이미 존재하는 지점명입니다: " + requestDto.getBranchName());
        }
        
        // 데이터 업데이트
        branch.setBranchCode(requestDto.getBranchCode());
        branch.setBranchName(requestDto.getBranchName());
        branch.setAddress(requestDto.getAddress());
        branch.setPhone(requestDto.getPhone());
        branch.setManagerName(requestDto.getManagerName());
        branch.setOpeningHours(requestDto.getOperatingHours());
        branch.setOpeningDate(requestDto.getOpenDate());
        
        // 상태 값 안전하게 변환
        log.info("상태 변경 시도: 기존 상태={}, 요청 상태={}", branch.getStatus(), requestDto.getStatus());
        
        try {
            String requestedStatus = requestDto.getStatus();
            log.info("원본 요청 상태 값: '{}' (타입: {})", requestedStatus, 
                    requestedStatus != null ? requestedStatus.getClass().getSimpleName() : "NULL");
            
            if (requestedStatus == null || requestedStatus.trim().isEmpty()) {
                log.warn("상태 값이 비어있음, 기존 상태 유지: {}", branch.getStatus());
            } else {
                // 공백 제거 및 소문자 변환
                requestedStatus = requestedStatus.trim().toLowerCase();
                log.info("정제된 상태 값: '{}'", requestedStatus);
                
                // 허용된 상태 값들 확인
                log.info("허용된 상태 값들: {}", 
                        java.util.Arrays.toString(Branches.BranchStatus.values()));
                
                // 상태 값 변환 시도
                Branches.BranchStatus newStatus = null;
                
                // 직접 매핑으로 변환
                switch (requestedStatus) {
                    case "active":
                        newStatus = Branches.BranchStatus.active;
                        break;
                    case "inactive":
                        newStatus = Branches.BranchStatus.inactive;
                        break;
                    case "pending":
                        newStatus = Branches.BranchStatus.pending;
                        break;
                    default:
                        throw new IllegalArgumentException("알 수 없는 상태 값: " + requestedStatus);
                }
                
                log.info("변환된 Enum 상태: {}", newStatus);
                
                branch.setStatus(newStatus);
                log.info("상태 변경 성공: {} -> {}", branch.getStatus(), newStatus);
            }
        } catch (IllegalArgumentException e) {
            log.error("잘못된 상태 값: '{}'. 허용된 값: {}", requestDto.getStatus(), 
                     java.util.Arrays.toString(Branches.BranchStatus.values()));
            throw new IllegalArgumentException("잘못된 상태 값입니다: " + requestDto.getStatus() + 
                                           ". 허용된 값: " + java.util.Arrays.toString(Branches.BranchStatus.values()));
        }
        
        Branches updatedBranch = branchRepository.save(branch);
        log.info("지점 수정 완료: ID={}, 이름={}", updatedBranch.getId(), updatedBranch.getBranchName());
        
        return BranchResponseDto.fromEntity(updatedBranch);
    }
    
    /**
     * 지점 삭제 (데이터베이스에서 완전히 제거)
     */
    public void deleteBranch(Long id) {
        log.info("지점 삭제 요청: ID={}", id);
        
        Branches branch = branchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지점입니다: " + id));
        
        // 지점 정보 로깅
        log.info("삭제할 지점 정보: ID={}, 이름={}, 코드={}, 상태={}", 
                branch.getId(), branch.getBranchName(), branch.getBranchCode(), branch.getStatus());
        
        // 데이터베이스에서 완전히 삭제
        branchRepository.deleteById(id);
        
        log.info("지점 삭제 완료: ID={}, 이름={}", branch.getId(), branch.getBranchName());
    }
    
    /**
     * 지점 검색 (지점명 또는 주소로 검색)
     */
    @Transactional(readOnly = true)
    public List<BranchResponseDto> searchBranches(String keyword) {
        log.info("지점 검색 요청: 키워드={}", keyword);
        
        List<Branches> branchesByName = branchRepository.findByBranchNameContainingIgnoreCase(keyword);
        List<Branches> branchesByAddress = branchRepository.findByAddressContaining(keyword);
        
        // 중복 제거하여 반환
        List<Branches> allBranches = branchesByName.stream()
                .filter(branch -> !branchesByAddress.contains(branch))
                .collect(Collectors.toList());
        allBranches.addAll(branchesByAddress);
        
        return allBranches.stream()
                .map(BranchResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
}
