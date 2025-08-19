package erp_project.erp_project.controller;

import erp_project.erp_project.entity.Branches;
import erp_project.erp_project.repository.BranchesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BranchController {
    
    private final BranchesRepository branchesRepository;
    
    @GetMapping
    public ResponseEntity<List<Branches>> getAllBranches() {
        try {
            List<Branches> branches = branchesRepository.findAll();
            return ResponseEntity.ok(branches);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Branches>> getActiveBranches() {
        try {
            List<Branches> activeBranches = branchesRepository.findByStatus(Branches.BranchStatus.active);
            return ResponseEntity.ok(activeBranches);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{branchId}")
    public ResponseEntity<Branches> getBranchById(@PathVariable Long branchId) {
        try {
            return branchesRepository.findById(branchId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/{branchId}")
    public ResponseEntity<Branches> updateBranch(@PathVariable Long branchId, @RequestBody Branches branchRequest) {
        try {
            return branchesRepository.findById(branchId)
                    .map(existingBranch -> {
                        // 기존 데이터 업데이트
                        existingBranch.setBranchName(branchRequest.getBranchName());
                        existingBranch.setBranchCode(branchRequest.getBranchCode());
                        existingBranch.setAddress(branchRequest.getAddress());
                        existingBranch.setPhone(branchRequest.getPhone());
                        existingBranch.setManagerName(branchRequest.getManagerName());
                        existingBranch.setStatus(branchRequest.getStatus());
                        existingBranch.setOpeningHours(branchRequest.getOpeningHours());
                        existingBranch.setOpeningDate(branchRequest.getOpeningDate());
                        
                        // 업데이트된 지점 저장
                        Branches updatedBranch = branchesRepository.save(existingBranch);
                        return ResponseEntity.ok(updatedBranch);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
