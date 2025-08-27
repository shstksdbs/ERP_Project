package erp_project.erp_project.controller;

import erp_project.erp_project.dto.MaterialDto;
import erp_project.erp_project.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MaterialController {
    
    private final MaterialService materialService;
    
    // 모든 원재료 조회
    @GetMapping
    public ResponseEntity<List<MaterialDto>> getAllMaterials() {
        List<MaterialDto> materials = materialService.getAllMaterials();
        return ResponseEntity.ok(materials);
    }
    
    // 카테고리별 원재료 조회
    @GetMapping("/category/{category}")
    public ResponseEntity<List<MaterialDto>> getMaterialsByCategory(@PathVariable String category) {
        List<MaterialDto> materials = materialService.getMaterialsByCategory(category);
        return ResponseEntity.ok(materials);
    }
    
    // 공급업체별 원재료 조회
    @GetMapping("/supplier/{supplier}")
    public ResponseEntity<List<MaterialDto>> getMaterialsBySupplier(@PathVariable String supplier) {
        List<MaterialDto> materials = materialService.getMaterialsBySupplier(supplier);
        return ResponseEntity.ok(materials);
    }
    
    // 상태별 원재료 조회
    @GetMapping("/status/{status}")
    public ResponseEntity<List<MaterialDto>> getMaterialsByStatus(@PathVariable String status) {
        List<MaterialDto> materials = materialService.getMaterialsByStatus(status);
        return ResponseEntity.ok(materials);
    }
    
    // 이름으로 검색
    @GetMapping("/search/name")
    public ResponseEntity<List<MaterialDto>> searchMaterialsByName(@RequestParam String name) {
        List<MaterialDto> materials = materialService.searchMaterialsByName(name);
        return ResponseEntity.ok(materials);
    }
    
    // 코드로 검색
    @GetMapping("/search/code")
    public ResponseEntity<List<MaterialDto>> searchMaterialsByCode(@RequestParam String code) {
        List<MaterialDto> materials = materialService.searchMaterialsByCode(code);
        return ResponseEntity.ok(materials);
    }
    
    // 모든 카테고리 조회
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = materialService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
    
    // 모든 공급업체 조회
    @GetMapping("/suppliers")
    public ResponseEntity<List<String>> getAllSuppliers() {
        List<String> suppliers = materialService.getAllSuppliers();
        return ResponseEntity.ok(suppliers);
    }
    
    // 원재료 추가
    @PostMapping
    public ResponseEntity<MaterialDto> createMaterial(@RequestBody MaterialDto materialDto) {
        MaterialDto createdMaterial = materialService.createMaterial(materialDto);
        return ResponseEntity.ok(createdMaterial);
    }
    
    // 원재료 수정
    @PutMapping("/{id}")
    public ResponseEntity<MaterialDto> updateMaterial(@PathVariable Long id, @RequestBody MaterialDto materialDto) {
        MaterialDto updatedMaterial = materialService.updateMaterial(id, materialDto);
        return ResponseEntity.ok(updatedMaterial);
    }
    
    // 원재료 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.ok().build();
    }
}
