package erp_project.erp_project.service;

import erp_project.erp_project.entity.RegularOrder;
import erp_project.erp_project.entity.RegularOrderExecution;
import erp_project.erp_project.entity.RegularOrderItem;
import erp_project.erp_project.entity.SupplyRequest;
import erp_project.erp_project.entity.SupplyRequestItem;
import erp_project.erp_project.repository.RegularOrderExecutionRepository;
import erp_project.erp_project.repository.RegularOrderRepository;
import erp_project.erp_project.repository.SupplyRequestRepository;
import erp_project.erp_project.repository.SupplyRequestItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegularOrderExecutionService {

    private final RegularOrderRepository regularOrderRepository;
    private final RegularOrderExecutionRepository executionRepository;
    private final SupplyRequestRepository supplyRequestRepository;
    private final SupplyRequestItemRepository supplyRequestItemRepository;

    /**
     * 매일 오전 9시에 실행할 정기발주를 확인하고 실행
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void executeScheduledOrders() {
        log.info("정기발주 자동 실행 시작: {}", LocalDateTime.now());
        
        LocalDate today = LocalDate.now();
        
        // 오늘 실행해야 할 정기발주들을 찾기
        List<RegularOrder> ordersToExecute = regularOrderRepository
            .findByIsActiveTrueAndNextOrderDateLessThanEqual(today);
        
        log.info("실행할 정기발주 수: {}", ordersToExecute.size());
        
        for (RegularOrder order : ordersToExecute) {
            try {
                executeRegularOrder(order);
                log.info("정기발주 실행 완료: {}", order.getOrderName());
            } catch (Exception e) {
                log.error("정기발주 실행 실패: {} - {}", order.getOrderName(), e.getMessage());
            }
        }
    }

    /**
     * 개별 정기발주 실행
     */
    @Transactional
    public void executeRegularOrder(RegularOrder order) {
        LocalDate today = LocalDate.now();
        
        // 이미 오늘 실행되었는지 확인
        Optional<RegularOrderExecution> existingExecution = executionRepository
            .findByRegularOrderAndExecutionDate(order, today);
        
        if (existingExecution.isPresent()) {
            log.info("이미 오늘 실행된 정기발주: {}", order.getOrderName());
            return;
        }

        // 1. RegularOrderExecution 생성
        RegularOrderExecution execution = createExecutionRecord(order, today);
        executionRepository.save(execution);

        // 2. 실제 SupplyRequest 생성
        SupplyRequest supplyRequest = createSupplyRequest(order, today);
        supplyRequestRepository.save(supplyRequest);
        
        // 3. SupplyRequestItem들 생성 및 저장
        List<SupplyRequestItem> items = order.getItems().stream()
            .map(this::createSupplyRequestItem)
            .toList();
        
        // 각 아이템에 supplyRequestId 설정하고 저장
        for (SupplyRequestItem item : items) {
            // supplyRequestId 설정
            item.setSupplyRequestId(supplyRequest.getId());
            
            // 아이템 저장
            supplyRequestItemRepository.save(item);
        }

        // 4. 다음 발주일 계산 및 업데이트
        updateNextOrderDate(order, today);
        regularOrderRepository.save(order);

        log.info("정기발주 실행 완료: {} -> 발주번호: {}", order.getOrderName(), supplyRequest.getId());
    }

    /**
     * 실행 기록 생성
     */
    private RegularOrderExecution createExecutionRecord(RegularOrder order, LocalDate executionDate) {
        BigDecimal totalAmount = order.getItems().stream()
            .map(item -> item.getCostPerUnit().multiply(item.getRequestedQuantity()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return RegularOrderExecution.builder()
            .regularOrder(order)
            .executionDate(executionDate)
            .scheduledOrderDate(order.getNextOrderDate())
            .status(RegularOrderExecution.ExecutionStatus.COMPLETED)
            .totalAmount(totalAmount)
            .notes("자동 실행된 정기발주")
            .build();
    }

    /**
     * 실제 발주 요청 생성
     */
    private SupplyRequest createSupplyRequest(RegularOrder order, LocalDate requestDate) {
        SupplyRequest supplyRequest = SupplyRequest.builder()
            .requestingBranchId(order.getBranchId())
            .requestDate(requestDate.atStartOfDay())
            .requesterName(order.getCreatedBy())
            .status(SupplyRequest.SupplyRequestStatus.PENDING)
            .priority(SupplyRequest.SupplyRequestPriority.NORMAL)
            .notes(order.getOrderName())
            .build();

        // 총 금액 계산
        BigDecimal totalCost = order.getItems().stream()
            .map(item -> item.getCostPerUnit().multiply(item.getRequestedQuantity()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        supplyRequest.setTotalCost(totalCost);

        return supplyRequest;
    }

    /**
     * 발주 아이템 생성
     */
    private SupplyRequestItem createSupplyRequestItem(RegularOrderItem orderItem) {
        return SupplyRequestItem.builder()
            .material(orderItem.getMaterial())
            .requestedQuantity(orderItem.getRequestedQuantity())
            .unit(orderItem.getUnit())
            .costPerUnit(orderItem.getCostPerUnit())
            .totalCost(orderItem.getCostPerUnit().multiply(orderItem.getRequestedQuantity()))
            .build();
    }

    /**
     * 다음 발주일 계산 및 업데이트
     */
    private void updateNextOrderDate(RegularOrder order, LocalDate currentExecutionDate) {
        LocalDate nextDate = calculateNextOrderDate(order, currentExecutionDate);
        order.setNextOrderDate(nextDate);
        order.setLastOrderDate(currentExecutionDate);
    }

    /**
     * 다음 발주일 계산
     */
    private LocalDate calculateNextOrderDate(RegularOrder order, LocalDate currentDate) {
        return switch (order.getCycleType()) {
            case DAILY -> currentDate.plusDays(1);
            case WEEKLY -> currentDate.plusWeeks(order.getCycleValue());
            case MONTHLY -> currentDate.plusMonths(order.getCycleValue());
            case YEARLY -> currentDate.plusYears(order.getCycleValue());
        };
    }

    /**
     * 수동으로 정기발주 실행 (테스트용)
     */
    @Transactional
    public void executeRegularOrderManually(Long orderId) {
        RegularOrder order = regularOrderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("정기발주를 찾을 수 없습니다: " + orderId));
        
        executeRegularOrder(order);
    }
}
