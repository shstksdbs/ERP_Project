package erp_project.erp_project.service;

import erp_project.erp_project.dto.MaterialDto;
import erp_project.erp_project.entity.Material;
import erp_project.erp_project.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MaterialService {
    
    private final MaterialRepository materialRepository;
    
    // 모든 원재료 조회
    public List<MaterialDto> getAllMaterials() {
        return materialRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 카테고리별 원재료 조회
    public List<MaterialDto> getMaterialsByCategory(String category) {
        return materialRepository.findByCategory(category).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 공급업체별 원재료 조회
    public List<MaterialDto> getMaterialsBySupplier(String supplier) {
        return materialRepository.findBySupplier(supplier).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 상태별 원재료 조회
    public List<MaterialDto> getMaterialsByStatus(String status) {
        Material.MaterialStatus materialStatus = Material.MaterialStatus.valueOf(status);
        return materialRepository.findByStatus(materialStatus).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 이름으로 검색
    public List<MaterialDto> searchMaterialsByName(String name) {
        return materialRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 코드로 검색
    public List<MaterialDto> searchMaterialsByCode(String code) {
        return materialRepository.findByCodeContainingIgnoreCase(code).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // 모든 카테고리 조회
    public List<String> getAllCategories() {
        return materialRepository.findAllCategories();
    }
    
    // 모든 공급업체 조회
    public List<String> getAllSuppliers() {
        return materialRepository.findAllSuppliers();
    }
    
    // 원재료 추가
    @Transactional
    public MaterialDto createMaterial(MaterialDto materialDto) {
        Material.MaterialStatus status = materialDto.getStatus() != null ? 
            Material.MaterialStatus.valueOf(materialDto.getStatus()) : Material.MaterialStatus.ACTIVE;
            
        Material material = Material.builder()
                .name(materialDto.getName())
                .code(materialDto.getCode())
                .category(materialDto.getCategory())
                .unit(materialDto.getUnit())
                .costPerUnit(materialDto.getCostPerUnit())
                .supplier(materialDto.getSupplier())
                .status(status)
                .build();
        
        Material savedMaterial = materialRepository.save(material);
        return convertToDto(savedMaterial);
    }
    
    // 원재료 수정
    @Transactional
    public MaterialDto updateMaterial(Long id, MaterialDto materialDto) {
        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("원재료를 찾을 수 없습니다: " + id));
        
        material.setName(materialDto.getName());
        material.setCode(materialDto.getCode());
        material.setCategory(materialDto.getCategory());
        material.setUnit(materialDto.getUnit());
        material.setCostPerUnit(materialDto.getCostPerUnit());
        material.setSupplier(materialDto.getSupplier());
        
        if (materialDto.getStatus() != null) {
            Material.MaterialStatus status = Material.MaterialStatus.valueOf(materialDto.getStatus());
            material.setStatus(status);
        }
        
        Material updatedMaterial = materialRepository.save(material);
        return convertToDto(updatedMaterial);
    }
    
    // 원재료 삭제
    @Transactional
    public void deleteMaterial(Long id) {
        materialRepository.deleteById(id);
    }
    
    // Entity를 DTO로 변환
    private MaterialDto convertToDto(Material material) {
        return MaterialDto.builder()
                .id(material.getId())
                .name(material.getName())
                .code(material.getCode())
                .category(material.getCategory())
                .unit(material.getUnit())
                .costPerUnit(material.getCostPerUnit())
                .supplier(material.getSupplier())
                .status(material.getStatus() != null ? material.getStatus().name() : null)
                .createdAt(material.getCreatedAt())
                .updatedAt(material.getUpdatedAt())
                .build();
    }
}
