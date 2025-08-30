package erp_project.erp_project.service;

import erp_project.erp_project.dto.SupplyRequestDto;
import erp_project.erp_project.dto.SupplyRequestItemDto;
import erp_project.erp_project.dto.SupplyRequestCreateDto;
import erp_project.erp_project.dto.SupplyRequestUpdateDto;
import erp_project.erp_project.entity.*;
import erp_project.erp_project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SupplyRequestManagementService {
    
    private final SupplyRequestRepository supplyRequestRepository;
    private final SupplyRequestItemRepository supplyRequestItemRepository;
    private final BranchesRepository branchesRepository;
    private final MaterialRepository materialRepository;
    private final UsersRepository usersRepository;
    
    /**
     * 모든 발주 요청 조회 (본사용)
     */
    @Transactional(readOnly = true)
    public List<SupplyRequestDto> getAllSupplyRequests() {
        List<SupplyRequest> requests = supplyRequestRepository.findAllByOrderByCreatedAtDesc();
        return requests.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * 특정 지점의 발주 요청 조회
     */
    @Transactional(readOnly = true)
    public List<SupplyRequestDto> getSupplyRequestsByBranch(Long branchId) {
        List<SupplyRequest> requests = supplyRequestRepository.findByRequestingBranchIdOrderByCreatedAtDesc(branchId);
        return requests.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * 발주 요청 상세 조회
     */
    @Transactional(readOnly = true)
    public SupplyRequestDto getSupplyRequestById(Long id) {
        SupplyRequest request = supplyRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("발주 요청을 찾을 수 없습니다: " + id));
        return convertToDto(request);
    }
    
    /**
     * 발주 요청 생성
     */
    public SupplyRequestDto createSupplyRequest(SupplyRequestCreateDto createDto) {
        // 지점 존재 확인
        Branches branch = branchesRepository.findById(createDto.getRequestingBranchId())
                .orElseThrow(() -> new RuntimeException("지점을 찾을 수 없습니다: " + createDto.getRequestingBranchId()));
        
        // 사용자 존재 확인
        Users user = usersRepository.findById(createDto.getRequesterId())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + createDto.getRequesterId()));
        
        // 발주 요청 생성
        SupplyRequest supplyRequest = SupplyRequest.builder()
                .requestingBranchId(createDto.getRequestingBranchId())
                .requesterId(createDto.getRequesterId())
                .requesterName(createDto.getRequesterName())
                .expectedDeliveryDate(createDto.getExpectedDeliveryDate())
                .priority(createDto.getPriority() != null ? createDto.getPriority() : SupplyRequest.SupplyRequestPriority.NORMAL)
                .notes(createDto.getNotes())
                .status(SupplyRequest.SupplyRequestStatus.PENDING)
                .build();
        
        SupplyRequest savedRequest = supplyRequestRepository.save(supplyRequest);
        
        // 발주 아이템 생성
        List<SupplyRequestItem> items = createDto.getItems().stream()
                .map(itemDto -> {
                    Material material = materialRepository.findById(itemDto.getMaterialId())
                            .orElseThrow(() -> new RuntimeException("자재를 찾을 수 없습니다: " + itemDto.getMaterialId()));
                    
                    return SupplyRequestItem.builder()
                            .supplyRequestId(savedRequest.getId())
                            .material(material)
                            .requestedQuantity(itemDto.getRequestedQuantity())
                            .unit(itemDto.getUnit())
                            .costPerUnit(itemDto.getCostPerUnit())
                            .notes(itemDto.getNotes())
                            .status(SupplyRequestItem.SupplyRequestItemStatus.PENDING)
                            .build();
                })
                .collect(Collectors.toList());
        
        supplyRequestItemRepository.saveAll(items);
        
        // 총 비용 계산 및 업데이트
        BigDecimal totalCost = items.stream()
                .map(item -> item.getRequestedQuantity().multiply(item.getCostPerUnit()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        savedRequest.setTotalCost(totalCost);
        supplyRequestRepository.save(savedRequest);
        
        return convertToDto(savedRequest);
    }
    
    /**
     * 발주 요청 상태 업데이트 (본사 승인/거부)
     */
    public SupplyRequestDto updateSupplyRequestStatus(Long id, SupplyRequestUpdateDto updateDto) {
        SupplyRequest request = supplyRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("발주 요청을 찾을 수 없습니다: " + id));
        
        // 상태 업데이트
        if (updateDto.getStatus() != null) {
            request.setStatus(updateDto.getStatus());
        }
        
        if (updateDto.getNotes() != null) {
            request.setNotes(updateDto.getNotes());
        }
        
        // 아이템 상태 업데이트
        if (updateDto.getItems() != null) {
            for (SupplyRequestUpdateDto.SupplyRequestItemUpdateDto itemUpdateDto : updateDto.getItems()) {
                SupplyRequestItem item = supplyRequestItemRepository.findById(itemUpdateDto.getId())
                        .orElseThrow(() -> new RuntimeException("발주 아이템을 찾을 수 없습니다: " + itemUpdateDto.getId()));
                
                if (itemUpdateDto.getApprovedQuantity() != null) {
                    item.setApprovedQuantity(itemUpdateDto.getApprovedQuantity());
                }
                
                if (itemUpdateDto.getDeliveredQuantity() != null) {
                    item.setDeliveredQuantity(itemUpdateDto.getDeliveredQuantity());
                }
                
                if (itemUpdateDto.getStatus() != null) {
                    item.setStatus(itemUpdateDto.getStatus());
                }
                
                if (itemUpdateDto.getNotes() != null) {
                    item.setNotes(itemUpdateDto.getNotes());
                }
                
                supplyRequestItemRepository.save(item);
            }
        }
        
        SupplyRequest savedRequest = supplyRequestRepository.save(request);
        return convertToDto(savedRequest);
    }
    
    /**
     * 발주 요청 취소
     */
    public SupplyRequestDto cancelSupplyRequest(Long id, String reason) {
        SupplyRequest request = supplyRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("발주 요청을 찾을 수 없습니다: " + id));
        
        request.setStatus(SupplyRequest.SupplyRequestStatus.CANCELLED);
        request.setNotes(reason);
        
        SupplyRequest savedRequest = supplyRequestRepository.save(request);
        return convertToDto(savedRequest);
    }
    
    /**
     * Entity를 DTO로 변환
     */
    private SupplyRequestDto convertToDto(SupplyRequest request) {
        List<SupplyRequestItem> items = supplyRequestItemRepository.findBySupplyRequestId(request.getId());
        
        List<SupplyRequestItemDto> itemDtos = items.stream()
                .map(this::convertItemToDto)
                .collect(Collectors.toList());
        
        String branchName = branchesRepository.findById(request.getRequestingBranchId())
                .map(Branches::getBranchName)
                .orElse("알 수 없음");
        
        return SupplyRequestDto.builder()
                .id(request.getId())
                .requestingBranchId(request.getRequestingBranchId())
                .branchName(branchName)
                .requesterId(request.getRequesterId())
                .requesterName(request.getRequesterName())
                .requestDate(request.getRequestDate())
                .expectedDeliveryDate(request.getExpectedDeliveryDate())
                .status(request.getStatus())
                .priority(request.getPriority())
                .totalCost(request.getTotalCost())
                .notes(request.getNotes())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .items(itemDtos)
                .totalItems(items.size())
                .build();
    }
    
    /**
     * SupplyRequestItem을 DTO로 변환
     */
    private SupplyRequestItemDto convertItemToDto(SupplyRequestItem item) {
        return SupplyRequestItemDto.builder()
                .id(item.getId())
                .supplyRequestId(item.getSupplyRequestId())
                .materialId(item.getMaterial().getId())
                .materialName(item.getMaterial().getName())
                .materialCode(item.getMaterial().getCode())
                .requestedQuantity(item.getRequestedQuantity())
                .approvedQuantity(item.getApprovedQuantity())
                .deliveredQuantity(item.getDeliveredQuantity())
                .unit(item.getUnit())
                .costPerUnit(item.getCostPerUnit())
                .totalCost(item.getTotalCost())
                .status(item.getStatus())
                .notes(item.getNotes())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
