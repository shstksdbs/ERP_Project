package erp_project.erp_project.service;

import erp_project.erp_project.entity.NoticeTargetGroup;
import erp_project.erp_project.entity.Users;
import erp_project.erp_project.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TargetGroupCalculationService {
    
    private final UsersRepository usersRepository;
    
    /**
     * 대상 그룹의 실제 인원수 계산
     * 지점과 직급을 조합해서 계산
     */
    public int calculateMemberCount(NoticeTargetGroup targetGroup) {
        try {
            String targetBranches = targetGroup.getTargetBranches();
            String targetPositions = targetGroup.getTargetPositions();
            
            // 둘 다 비어있거나 "전체"가 포함되어 있으면 전체 직원
            if ((targetBranches == null || targetBranches.isEmpty() || targetBranches.equals("[]") || targetBranches.contains("전체 지점")) &&
                (targetPositions == null || targetPositions.isEmpty() || targetPositions.equals("[]") || targetPositions.contains("전체 직급"))) {
                return calculateAllMembers();
            }
            
            // 지점만 있는 경우
            if (targetBranches != null && !targetBranches.isEmpty() && !targetBranches.equals("[]") &&
                (targetPositions == null || targetPositions.isEmpty() || targetPositions.equals("[]"))) {
                return calculateByBranches(targetBranches);
            }
            
            // 직급만 있는 경우
            if ((targetBranches == null || targetBranches.isEmpty() || targetBranches.equals("[]")) &&
                targetPositions != null && !targetPositions.isEmpty() && !targetPositions.equals("[]")) {
                return calculateByPositions(targetPositions);
            }
            
            // 둘 다 있는 경우 - 교집합 계산
            return calculateByBranchesAndPositions(targetBranches, targetPositions);
            
        } catch (Exception e) {
            log.error("인원수 계산 오류: targetGroupId={}", targetGroup.getId(), e);
            return 0;
        }
    }
    
    /**
     * 전체 직원 수 계산
     */
    private int calculateAllMembers() {
        return (int) usersRepository.count();
    }
    
    /**
     * 지점별 인원수 계산
     */
    private int calculateByBranches(String targetBranches) {
        if (targetBranches == null || targetBranches.isEmpty()) {
            return 0;
        }
        
        try {
            List<String> branches = parseJsonArray(targetBranches);
            int count = 0;
            
            for (String branch : branches) {
                if ("전체 지점".equals(branch)) {
                    return calculateAllMembers();
                }
                count += usersRepository.countByBranchName(branch);
            }
            
            return count;
        } catch (Exception e) {
            log.error("지점별 인원수 계산 오류", e);
            return 0;
        }
    }
    
    /**
     * 직급별 인원수 계산 (일정 직급 이상)
     */
    private int calculateByPositions(String targetPositions) {
        if (targetPositions == null || targetPositions.isEmpty()) {
            return 0;
        }
        
        try {
            List<String> positions = parseJsonArray(targetPositions);
            int count = 0;
            
            for (String position : positions) {
                if ("전체 직급".equals(position)) {
                    return calculateAllMembers();
                }
                try {
                    Users.UserRole role = Users.UserRole.valueOf(position);
                    count += usersRepository.countByRole(role);
                } catch (IllegalArgumentException e) {
                    log.warn("잘못된 직급 값: {}", position);
                }
            }
            
            return count;
        } catch (Exception e) {
            log.error("직급별 인원수 계산 오류", e);
            return 0;
        }
    }
    
    /**
     * 지점과 직급을 모두 고려한 인원수 계산 (교집합)
     */
    private int calculateByBranchesAndPositions(String targetBranches, String targetPositions) {
        try {
            List<String> branches = parseJsonArray(targetBranches);
            List<String> positions = parseJsonArray(targetPositions);
            
            int count = 0;
            
            for (String branch : branches) {
                for (String position : positions) {
                    if ("전체 지점".equals(branch) && "전체 직급".equals(position)) {
                        return calculateAllMembers();
                    } else if ("전체 지점".equals(branch)) {
                        try {
                            Users.UserRole role = Users.UserRole.valueOf(position);
                            count += usersRepository.countByRole(role);
                        } catch (IllegalArgumentException e) {
                            log.warn("잘못된 직급 값: {}", position);
                        }
                    } else if ("전체 직급".equals(position)) {
                        count += usersRepository.countByBranchName(branch);
                    } else {
                        // 특정 지점의 특정 직급 인원수 계산
                        try {
                            Users.UserRole role = Users.UserRole.valueOf(position);
                            count += usersRepository.countByBranchNameAndRole(branch, role);
                        } catch (IllegalArgumentException e) {
                            log.warn("잘못된 직급 값: {}", position);
                        }
                    }
                }
            }
            
            return count;
        } catch (Exception e) {
            log.error("지점+직급 인원수 계산 오류", e);
            return 0;
        }
    }
    
    /**
     * JSON 배열 문자열을 List로 파싱
     */
    private List<String> parseJsonArray(String jsonArray) {
        if (jsonArray == null || jsonArray.isEmpty()) {
            return List.of();
        }
        
        try {
            // JSON 배열인지 확인
            if (jsonArray.startsWith("[") && jsonArray.endsWith("]")) {
                // 실제 JSON 배열 파싱
                String cleaned = jsonArray.substring(1, jsonArray.length() - 1); // [ ] 제거
                if (cleaned.trim().isEmpty()) {
                    return List.of();
                }
                // 쉼표로 분리하고 따옴표 제거
                String[] parts = cleaned.split(",");
                List<String> result = new java.util.ArrayList<>();
                for (String part : parts) {
                    String trimmed = part.trim().replaceAll("^\"|\"$", ""); // 앞뒤 따옴표 제거
                    if (!trimmed.isEmpty()) {
                        result.add(trimmed);
                    }
                }
                return result;
            } else {
                // 단순 문자열인 경우 (예: "전체 지점", "강남점")
                if (jsonArray.equals("전체 지점") || jsonArray.equals("전체 직급")) {
                    return List.of(); // 빈 배열은 전체를 의미
                } else {
                    return List.of(jsonArray); // 단일 값을 배열로 변환
                }
            }
        } catch (Exception e) {
            log.error("JSON 배열 파싱 오류: {}", jsonArray, e);
            return List.of();
        }
    }
    

}
