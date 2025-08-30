package erp_project.erp_project.service;

import erp_project.erp_project.dto.RegularOrderDto;
import erp_project.erp_project.entity.RegularOrder;
import erp_project.erp_project.entity.RegularOrderItem;
import erp_project.erp_project.repository.RegularOrderRepository;
import erp_project.erp_project.repository.RegularOrderItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RegularOrderService {
    
    private final RegularOrderRepository regularOrderRepository;
    private final RegularOrderItemRepository regularOrderItemRepository;
    
    /**
     * 지점별 모든 정기발주 조회
     */
    public List<RegularOrderDto> getAllRegularOrders(Long branchId) {
        List<RegularOrder> regularOrders = regularOrderRepository.findByBranchIdOrderByCreatedAtDesc(branchId);
        return regularOrders.stream()
                .map(RegularOrderDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * 지점별 활성 정기발주 조회
     */
    public List<RegularOrderDto> getActiveRegularOrders(Long branchId) {
        List<RegularOrder> regularOrders = regularOrderRepository.findByBranchIdAndIsActiveTrueOrderByNextOrderDateAsc(branchId);
        return regularOrders.stream()
                .map(RegularOrderDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * 지점별 비활성 정기발주 조회
     */
    public List<RegularOrderDto> getInactiveRegularOrders(Long branchId) {
        List<RegularOrder> regularOrders = regularOrderRepository.findByBranchIdAndIsActiveFalseOrderByCreatedAtDesc(branchId);
        return regularOrders.stream()
                .map(RegularOrderDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * 정기발주명으로 검색
     */
    public List<RegularOrderDto> searchRegularOrders(Long branchId, String keyword) {
        List<RegularOrder> regularOrders = regularOrderRepository.findByOrderNameContaining(branchId, keyword);
        return regularOrders.stream()
                .map(RegularOrderDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * 등록자별 정기발주 조회
     */
    public List<RegularOrderDto> getRegularOrdersByCreator(Long branchId, String createdBy) {
        List<RegularOrder> regularOrders = regularOrderRepository.findByBranchIdAndCreatedByOrderByCreatedAtDesc(branchId, createdBy);
        return regularOrders.stream()
                .map(RegularOrderDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * 특정 날짜에 발주 예정인 정기발주 조회
     */
    public List<RegularOrderDto> getRegularOrdersByNextOrderDate(Long branchId, LocalDate date) {
        List<RegularOrder> regularOrders = regularOrderRepository.findOrdersByNextOrderDate(branchId, date);
        return regularOrders.stream()
                .map(RegularOrderDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * 정기발주 상세 조회 (아이템 포함)
     */
    public RegularOrderDto getRegularOrderById(Long regularOrderId) {
        RegularOrder regularOrder = regularOrderRepository.findById(regularOrderId)
                .orElseThrow(() -> new RuntimeException("정기발주를 찾을 수 없습니다. ID: " + regularOrderId));
        
        return RegularOrderDto.fromEntity(regularOrder);
    }
    
    /**
     * 정기발주 활성화/비활성화
     */
    @Transactional
    public RegularOrderDto toggleRegularOrderStatus(Long regularOrderId) {
        RegularOrder regularOrder = regularOrderRepository.findById(regularOrderId)
                .orElseThrow(() -> new RuntimeException("정기발주를 찾을 수 없습니다. ID: " + regularOrderId));
        
        regularOrder.setIsActive(!regularOrder.getIsActive());
        RegularOrder savedOrder = regularOrderRepository.save(regularOrder);
        
        return RegularOrderDto.fromEntity(savedOrder);
    }
    
    /**
     * 정기발주 상태별 필터링
     */
    public List<RegularOrderDto> getRegularOrdersByStatus(Long branchId, String status) {
        List<RegularOrder> regularOrders;
        
        switch (status.toLowerCase()) {
            case "active":
                regularOrders = regularOrderRepository.findByBranchIdAndIsActiveTrueOrderByNextOrderDateAscWithItems(branchId);
                break;
            case "inactive":
                regularOrders = regularOrderRepository.findByBranchIdAndIsActiveFalseOrderByCreatedAtDescWithItems(branchId);
                break;
            default:
                regularOrders = regularOrderRepository.findByBranchIdOrderByCreatedAtDescWithItems(branchId);
                break;
        }
        
        return regularOrders.stream()
                .map(RegularOrderDto::fromEntity)
                .collect(Collectors.toList());
    }
    
    /**
     * 다음 발주일이 가까운 순으로 정렬된 활성 정기발주 조회
     */
    public List<RegularOrderDto> getActiveOrdersByNextOrderDate(Long branchId) {
        List<RegularOrder> regularOrders = regularOrderRepository.findActiveOrdersByNextOrderDateWithItems(branchId);
        return regularOrders.stream()
                .map(RegularOrderDto::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 정기발주 생성
     */
    @Transactional
    public RegularOrderDto createRegularOrder(RegularOrderDto regularOrderDto) {
        RegularOrder regularOrder = regularOrderDto.toEntity();
        regularOrder.setCreatedAt(LocalDateTime.now());
        regularOrder.setUpdatedAt(LocalDateTime.now());
        
        // 정기발주 저장
        RegularOrder savedOrder = regularOrderRepository.save(regularOrder);
        
        // 정기발주 아이템들 저장
        if (regularOrderDto.getItems() != null && !regularOrderDto.getItems().isEmpty()) {
            List<RegularOrderItem> items = regularOrderDto.getItems().stream()
                .map(itemDto -> {
                    RegularOrderItem item = itemDto.toEntity();
                    item.setRegularOrder(savedOrder);
                    item.setCreatedAt(LocalDateTime.now());
                    item.setUpdatedAt(LocalDateTime.now());
                    return item;
                })
                .collect(Collectors.toList());
            
            regularOrderItemRepository.saveAll(items);
        }
        
        return RegularOrderDto.fromEntity(savedOrder);
    }

    /**
     * 정기발주 수정
     */
    @Transactional
    public RegularOrderDto updateRegularOrder(RegularOrderDto regularOrderDto) {
        RegularOrder existingOrder = regularOrderRepository.findById(regularOrderDto.getId())
                .orElseThrow(() -> new RuntimeException("정기발주를 찾을 수 없습니다. ID: " + regularOrderDto.getId()));
        
        existingOrder.setOrderName(regularOrderDto.getOrderName());
        existingOrder.setDescription(regularOrderDto.getDescription());
        existingOrder.setCycleType(RegularOrder.OrderCycleType.valueOf(regularOrderDto.getCycleType()));
        existingOrder.setCycleValue(regularOrderDto.getCycleValue());
        existingOrder.setNextOrderDate(regularOrderDto.getNextOrderDate());
        existingOrder.setIsActive(regularOrderDto.getIsActive());
        existingOrder.setUpdatedAt(LocalDateTime.now());
        
        RegularOrder savedOrder = regularOrderRepository.save(existingOrder);
        
        // 아이템 처리: 기존 아이템을 모두 삭제하고 새로 저장
        if (regularOrderDto.getItems() != null) {
            try {
                // 기존 아이템들 삭제 (더 안전한 방식)
                List<RegularOrderItem> existingItems = regularOrderItemRepository.findByRegularOrderIdOrderById(savedOrder.getId());
                if (!existingItems.isEmpty()) {
                    regularOrderItemRepository.deleteAll(existingItems);
                    // 삭제 후 즉시 flush하여 데이터베이스에 반영
                    regularOrderItemRepository.flush();
                }
                
                // 새로운 아이템들 저장
                if (!regularOrderDto.getItems().isEmpty()) {
                    List<RegularOrderItem> items = regularOrderDto.getItems().stream()
                        .map(itemDto -> {
                            RegularOrderItem item = itemDto.toEntity();
                            item.setRegularOrder(savedOrder);
                            item.setCreatedAt(LocalDateTime.now());
                            item.setUpdatedAt(LocalDateTime.now());
                            return item;
                        })
                        .collect(Collectors.toList());
                    
                    regularOrderItemRepository.saveAll(items);
                }
            } catch (Exception e) {
                // 오류 발생 시 롤백
                throw new RuntimeException("정기발주 아이템 수정 중 오류가 발생했습니다: " + e.getMessage());
            }
        }
        
        return RegularOrderDto.fromEntity(savedOrder);
    }

    /**
     * 정기발주 삭제
     */
    @Transactional
    public void deleteRegularOrder(Long regularOrderId) {
        RegularOrder regularOrder = regularOrderRepository.findById(regularOrderId)
                .orElseThrow(() -> new RuntimeException("정기발주를 찾을 수 없습니다. ID: " + regularOrderId));
        
        regularOrderRepository.delete(regularOrder);
    }
}
