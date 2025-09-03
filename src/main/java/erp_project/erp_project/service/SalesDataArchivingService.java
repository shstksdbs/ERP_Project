package erp_project.erp_project.service;

import erp_project.erp_project.entity.Orders;
import erp_project.erp_project.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalesDataArchivingService {
    
    private final OrderRepository orderRepository;
    
    @Value("${app.archive.enabled:true}")
    private boolean archivingEnabled;
    
    @Value("${app.archive.retention-days:365}")
    private int retentionDays;
    
    @Value("${app.archive.batch-size:1000}")
    private int batchSize;
    
    /**
     * 주기적 데이터 아카이빙 (매월 1일 새벽 2시)
     */
    @Scheduled(cron = "0 0 2 1 * ?")
    public void archiveOldSalesData() {
        if (!archivingEnabled) {
            log.info("데이터 아카이빙이 비활성화되어 있습니다.");
            return;
        }
        
        log.info("오래된 매출 데이터 아카이빙 시작");
        
        try {
            LocalDate cutoffDate = LocalDate.now().minusDays(retentionDays);
            LocalDateTime cutoffDateTime = cutoffDate.atStartOfDay();
            
            // 1. 아카이빙 대상 데이터 조회
            List<Orders> oldOrders = orderRepository.findByCreatedAtBefore(cutoffDateTime);
            
            if (oldOrders.isEmpty()) {
                log.info("아카이빙할 데이터가 없습니다.");
                return;
            }
            
            log.info("아카이빙 대상 주문 수: {}", oldOrders.size());
            
            // 2. 배치 단위로 아카이빙 처리
            int totalBatches = (int) Math.ceil((double) oldOrders.size() / batchSize);
            
            for (int i = 0; i < totalBatches; i++) {
                int startIndex = i * batchSize;
                int endIndex = Math.min(startIndex + batchSize, oldOrders.size());
                
                List<Orders> batch = oldOrders.subList(startIndex, endIndex);
                processBatchArchive(batch, i + 1, totalBatches);
            }
            
            log.info("데이터 아카이빙 완료: 총 {} 개 주문 처리", oldOrders.size());
            
        } catch (Exception e) {
            log.error("데이터 아카이빙 중 오류 발생", e);
        }
    }
    
    /**
     * 비동기 데이터 아카이빙 (수동 호출용)
     */
    @Async
    public CompletableFuture<Void> archiveOldSalesDataAsync() {
        archiveOldSalesData();
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * 배치 단위 아카이빙 처리
     */
    @Transactional
    private void processBatchArchive(List<Orders> batch, int batchNumber, int totalBatches) {
        log.info("배치 아카이빙 처리: {}/{}", batchNumber, totalBatches);
        
        try {
            // 실제 아카이빙 로직 (예: 별도 테이블로 이동, 파일로 저장 등)
            for (Orders order : batch) {
                // 여기서 실제 아카이빙 로직 구현
                // 예: 별도 아카이브 테이블에 저장
                // archiveOrder(order);
                
                // 또는 파일로 저장
                // saveOrderToFile(order);
                
                // 현재는 로그만 출력 (실제 구현 시 위의 주석 해제)
                log.debug("아카이빙 처리: 주문 ID {}", order.getOrderId());
            }
            
            // 원본 데이터 삭제 (필요한 경우)
            // orderRepository.deleteAll(batch);
            
        } catch (Exception e) {
            log.error("배치 {} 아카이빙 처리 실패", batchNumber, e);
        }
    }
    
    /**
     * 수동 아카이빙 실행
     */
    @Async
    public CompletableFuture<String> manualArchive(LocalDate fromDate, LocalDate toDate) {
        log.info("수동 아카이빙 실행: {} ~ {}", fromDate, toDate);
        
        try {
            LocalDateTime startDateTime = fromDate.atStartOfDay();
            LocalDateTime endDateTime = toDate.plusDays(1).atStartOfDay();
            
            List<Orders> targetOrders = orderRepository.findByCreatedAtBetween(startDateTime, endDateTime);
            
            if (targetOrders.isEmpty()) {
                return CompletableFuture.completedFuture("아카이빙할 데이터가 없습니다.");
            }
            
            processBatchArchive(targetOrders, 1, 1);
            
            return CompletableFuture.completedFuture(
                String.format("수동 아카이빙 완료: %d 개 주문 처리", targetOrders.size()));
                
        } catch (Exception e) {
            log.error("수동 아카이빙 실패", e);
            return CompletableFuture.completedFuture("아카이빙 실패: " + e.getMessage());
        }
    }
    
    /**
     * 아카이빙 통계 조회
     */
    public ArchiveStatistics getArchiveStatistics() {
        LocalDate oneYearAgo = LocalDate.now().minusDays(365);
        LocalDate sixMonthsAgo = LocalDate.now().minusDays(180);
        LocalDate threeMonthsAgo = LocalDate.now().minusDays(90);
        
        long totalOrders = orderRepository.count();
        long ordersOlderThanOneYear = orderRepository.countByCreatedAtBefore(oneYearAgo.atStartOfDay());
        long ordersOlderThanSixMonths = orderRepository.countByCreatedAtBefore(sixMonthsAgo.atStartOfDay());
        long ordersOlderThanThreeMonths = orderRepository.countByCreatedAtBefore(threeMonthsAgo.atStartOfDay());
        
        return ArchiveStatistics.builder()
            .totalOrders(totalOrders)
            .ordersOlderThanOneYear(ordersOlderThanOneYear)
            .ordersOlderThanSixMonths(ordersOlderThanSixMonths)
            .ordersOlderThanThreeMonths(ordersOlderThanThreeMonths)
            .archivingEnabled(archivingEnabled)
            .retentionDays(retentionDays)
            .build();
    }
    
    /**
     * 아카이빙 통계 DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class ArchiveStatistics {
        private long totalOrders;
        private long ordersOlderThanOneYear;
        private long ordersOlderThanSixMonths;
        private long ordersOlderThanThreeMonths;
        private boolean archivingEnabled;
        private int retentionDays;
    }
}
