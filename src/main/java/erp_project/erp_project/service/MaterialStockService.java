package erp_project.erp_project.service;

import erp_project.erp_project.dto.MaterialStockDTO;
import erp_project.erp_project.dto.InventoryAlertDTO;
import erp_project.erp_project.entity.MaterialStock;
import erp_project.erp_project.repository.MaterialStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MaterialStockService {

    private final MaterialStockRepository materialStockRepository;

    // 지점별 재고 조회 (DTO 사용)
    public List<MaterialStockDTO> getMaterialStocksByBranch(Long branchId) {
        List<MaterialStock> materialStocks = materialStockRepository.findByBranchId(branchId);
        return materialStocks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 특정 재료의 지점별 재고 조회
    public List<MaterialStockDTO> getMaterialStocksByMaterial(Long materialId) {
        List<MaterialStock> materialStocks = materialStockRepository.findByMaterialId(materialId);
        return materialStocks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 재고 상태별 조회
    public List<MaterialStockDTO> getMaterialStocksByStatus(Long branchId, String status) {
        List<MaterialStock> allStocks = materialStockRepository.findByBranchId(branchId);
        
        return allStocks.stream()
                .filter(stock -> {
                    String stockStatus = determineStockStatus(stock);
                    return stockStatus.equals(status);
                })
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // 지점별 현재 재고 상태 알림 생성 (재고 알림 페이지용)
    public List<InventoryAlertDTO> generateCurrentStockAlerts(Long branchId) {
        List<MaterialStock> materialStocks = materialStockRepository.findByBranchId(branchId);
        List<InventoryAlertDTO> alerts = materialStocks.stream()
                .map(this::generateAlertFromCurrentStock)
                .filter(alert -> alert != null) // null이 아닌 알림만 필터링
                .collect(Collectors.toList());
        
        // 최신 알림이 위로 오도록 정렬
        return alerts.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
    }

    // 개별 재고로부터 현재 상태 알림 생성 (재고 알림 페이지용)
    private InventoryAlertDTO generateAlertFromCurrentStock(MaterialStock stock) {
        if (stock.getMaterial() == null) {
            return null;
        }

        BigDecimal currentStock = stock.getCurrentStock();
        BigDecimal minStock = stock.getMinStock();
        BigDecimal maxStock = stock.getMaxStock();
        
        // 재고 상태에 따른 알림 생성
        if (currentStock.compareTo(minStock) <= 0) {
            // 위험 수준: 최소 재고 이하
            return InventoryAlertDTO.builder()
                    .id(stock.getId())
                    .type(InventoryAlertDTO.TYPE_CRITICAL)
                    .message(stock.getMaterial().getName() + " 재고가 최소 재고량 이하입니다.")
                    .itemName(stock.getMaterial().getName())
                    .category(stock.getMaterial().getCategory())
                    .currentStock(currentStock)
                    .minStock(minStock)
                    .maxStock(maxStock)
                    .unit(stock.getMaterial().getUnit())
                    .timestamp(stock.getLastUpdated() != null ? stock.getLastUpdated() : LocalDateTime.now())
                    .isRead(false)
                    .build();
        } else if (currentStock.compareTo(minStock.multiply(BigDecimal.valueOf(1.2))) <= 0) {
            // 경고 수준: 최소 재고의 1.2배 이하
            return InventoryAlertDTO.builder()
                    .id(stock.getId())
                    .type(InventoryAlertDTO.TYPE_WARNING)
                    .message(stock.getMaterial().getName() + " 재고가 부족합니다.")
                    .itemName(stock.getMaterial().getName())
                    .category(stock.getMaterial().getCategory())
                    .currentStock(currentStock)
                    .minStock(minStock)
                    .maxStock(maxStock)
                    .unit(stock.getMaterial().getUnit())
                    .timestamp(stock.getLastUpdated() != null ? stock.getLastUpdated() : LocalDateTime.now())
                    .isRead(false)
                    .build();
        } else if (maxStock.compareTo(BigDecimal.ZERO) > 0 && 
                   currentStock.compareTo(maxStock.multiply(BigDecimal.valueOf(0.8))) >= 0) {
            // 과다 수준: 최대 재고의 80% 이상
            return InventoryAlertDTO.builder()
                    .id(stock.getId())
                    .type(InventoryAlertDTO.TYPE_WARNING)
                    .message(stock.getMaterial().getName() + " 재고가 과다합니다.")
                    .itemName(stock.getMaterial().getName())
                    .category(stock.getMaterial().getCategory())
                    .currentStock(currentStock)
                    .minStock(minStock)
                    .maxStock(maxStock)
                    .unit(stock.getMaterial().getUnit())
                    .timestamp(stock.getLastUpdated() != null ? stock.getLastUpdated() : LocalDateTime.now())
                    .isRead(false)
                    .build();
        }
        
        return null; // 정상 상태는 알림 생성하지 않음
    }

    // Entity를 DTO로 변환
    private MaterialStockDTO convertToDTO(MaterialStock stock) {
        return MaterialStockDTO.builder()
                .id(stock.getId())
                .material(MaterialStockDTO.MaterialDTO.builder()
                        .id(stock.getMaterial().getId())
                        .name(stock.getMaterial().getName())
                        .code(stock.getMaterial().getCode())
                        .category(stock.getMaterial().getCategory())
                        .unit(stock.getMaterial().getUnit())
                        .costPerUnit(stock.getMaterial().getCostPerUnit())
                        .supplier(stock.getMaterial().getSupplier())
                        .status(stock.getMaterial().getStatus().name())
                        .build())
                .branchId(stock.getBranch().getId())
                .branchName(stock.getBranch().getBranchName())
                .currentStock(stock.getCurrentStock())
                .minStock(stock.getMinStock())
                .maxStock(stock.getMaxStock())
                .reservedStock(stock.getReservedStock())
                .availableStock(stock.getAvailableStock())
                .lastUpdated(stock.getLastUpdated())
                .createdAt(stock.getCreatedAt())
                .build();
    }

    // 재고 상태 판단 (부족, 정상, 과다)
    private String determineStockStatus(MaterialStock stock) {
        BigDecimal currentStock = stock.getCurrentStock();
        BigDecimal minStock = stock.getMinStock();
        BigDecimal maxStock = stock.getMaxStock();
        
        if (currentStock.compareTo(minStock) <= 0) {
            return "low"; // 부족
        } else if (currentStock.compareTo(maxStock.multiply(BigDecimal.valueOf(0.8))) >= 0) {
            return "excess"; // 과다
        } else {
            return "normal"; // 정상
        }
    }

    // 재고 업데이트
    @Transactional
    public MaterialStock updateMaterialStock(Long id, MaterialStock materialStock) {
        MaterialStock existingStock = materialStockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("재고 정보를 찾을 수 없습니다."));
        
        // 재고 상태 변경 시 알림은 InventoryService에서 재고 차감 시에만 전송
        // MaterialStockService에서는 이전 상태를 저장하지 않음
        
        existingStock.setCurrentStock(materialStock.getCurrentStock());
        existingStock.setMinStock(materialStock.getMinStock());
        existingStock.setMaxStock(materialStock.getMaxStock());
        existingStock.setReservedStock(materialStock.getReservedStock());
        existingStock.setLastUpdated(LocalDateTime.now());
        
        MaterialStock updatedStock = materialStockRepository.save(existingStock);
        
        // 재고 상태 변경 시 알림은 InventoryService에서 재고 차감 시에만 전송
        // MaterialStockService에서는 상태 변경 알림을 전송하지 않음
        
        return updatedStock;
    }
    
    // 재고 상태 변경 시 알림은 InventoryService에서 재고 차감 시에만 전송
    // MaterialStockService에서는 알림 관련 메서드들을 제거
    
    // 상태 텍스트 변환 메서드는 InventoryService에서만 사용
}
