package erp_project.erp_project.service;

import erp_project.erp_project.entity.*;
import erp_project.erp_project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticsArchivingService {
    
    private final SalesStatisticsRepository salesStatisticsRepository;
    private final MenuSalesStatisticsRepository menuSalesStatisticsRepository;
    private final CategorySalesStatisticsRepository categorySalesStatisticsRepository;
    
    @Value("${app.archive.statistics.enabled:true}")
    private boolean statisticsArchivingEnabled;
    
    @Value("${app.archive.statistics.retention-days:365}")
    private int statisticsRetentionDays;
    
    @Value("${app.archive.statistics.batch-size:1000}")
    private int statisticsBatchSize;
    
    /**
     * 통계 데이터 주기적 아카이빙 (매월 1일 새벽 3시)
     */
    @Scheduled(cron = "0 0 3 1 * ?")
    public void archiveOldStatisticsData() {
        if (!statisticsArchivingEnabled) {
            log.info("통계 데이터 아카이빙이 비활성화되어 있습니다.");
            return;
        }
        
        log.info("오래된 통계 데이터 아카이빙 시작");
        
        try {
            LocalDate cutoffDate = LocalDate.now().minusDays(statisticsRetentionDays);
            
            // 1. 매출 통계 아카이빙
            archiveSalesStatistics(cutoffDate);
            
            // 2. 메뉴 통계 아카이빙
            archiveMenuSalesStatistics(cutoffDate);
            
            // 3. 카테고리 통계 아카이빙
            archiveCategorySalesStatistics(cutoffDate);
            
            log.info("통계 데이터 아카이빙 완료");
            
        } catch (Exception e) {
            log.error("통계 데이터 아카이빙 중 오류 발생", e);
        }
    }
    
    /**
     * 비동기 통계 데이터 아카이빙 (수동 호출용)
     */
    @Async
    public CompletableFuture<Void> archiveOldStatisticsDataAsync() {
        archiveOldStatisticsData();
        return CompletableFuture.completedFuture(null);
    }
    
    /**
     * 매출 통계 아카이빙
     */
    @Transactional
    private void archiveSalesStatistics(LocalDate cutoffDate) {
        log.info("매출 통계 아카이빙 시작: 기준일 {}", cutoffDate);
        
        try {
            List<SalesStatistics> oldStats = salesStatisticsRepository
                .findByStatisticDateBefore(cutoffDate);
            
            if (oldStats.isEmpty()) {
                log.info("아카이빙할 매출 통계 데이터가 없습니다.");
                return;
            }
            
            log.info("매출 통계 아카이빙 대상: {} 개", oldStats.size());
            
            // 배치 단위로 아카이빙 처리
            int totalBatches = (int) Math.ceil((double) oldStats.size() / statisticsBatchSize);
            
            for (int i = 0; i < totalBatches; i++) {
                int startIndex = i * statisticsBatchSize;
                int endIndex = Math.min(startIndex + statisticsBatchSize, oldStats.size());
                
                List<SalesStatistics> batch = oldStats.subList(startIndex, endIndex);
                processSalesStatisticsBatch(batch, i + 1, totalBatches);
            }
            
            // 아카이빙 완료 후 원본 데이터 삭제 (실제 운영에서는 주석 해제)
            // salesStatisticsRepository.deleteAll(oldStats);
            
        } catch (Exception e) {
            log.error("매출 통계 아카이빙 실패", e);
        }
    }
    
    /**
     * 메뉴 통계 아카이빙
     */
    @Transactional
    private void archiveMenuSalesStatistics(LocalDate cutoffDate) {
        log.info("메뉴 통계 아카이빙 시작: 기준일 {}", cutoffDate);
        
        try {
            List<MenuSalesStatistics> oldStats = menuSalesStatisticsRepository
                .findByStatisticDateBefore(cutoffDate);
            
            if (oldStats.isEmpty()) {
                log.info("아카이빙할 메뉴 통계 데이터가 없습니다.");
                return;
            }
            
            log.info("메뉴 통계 아카이빙 대상: {} 개", oldStats.size());
            
            // 배치 단위로 아카이빙 처리
            int totalBatches = (int) Math.ceil((double) oldStats.size() / statisticsBatchSize);
            
            for (int i = 0; i < totalBatches; i++) {
                int startIndex = i * statisticsBatchSize;
                int endIndex = Math.min(startIndex + statisticsBatchSize, oldStats.size());
                
                List<MenuSalesStatistics> batch = oldStats.subList(startIndex, endIndex);
                processMenuStatisticsBatch(batch, i + 1, totalBatches);
            }
            
            // 아카이빙 완료 후 원본 데이터 삭제 (실제 운영에서는 주석 해제)
            // menuSalesStatisticsRepository.deleteAll(oldStats);
            
        } catch (Exception e) {
            log.error("메뉴 통계 아카이빙 실패", e);
        }
    }
    
    /**
     * 카테고리 통계 아카이빙
     */
    @Transactional
    private void archiveCategorySalesStatistics(LocalDate cutoffDate) {
        log.info("카테고리 통계 아카이빙 시작: 기준일 {}", cutoffDate);
        
        try {
            List<CategorySalesStatistics> oldStats = categorySalesStatisticsRepository
                .findByStatisticDateBefore(cutoffDate);
            
            if (oldStats.isEmpty()) {
                log.info("아카이빙할 카테고리 통계 데이터가 없습니다.");
                return;
            }
            
            log.info("카테고리 통계 아카이빙 대상: {} 개", oldStats.size());
            
            // 배치 단위로 아카이빙 처리
            int totalBatches = (int) Math.ceil((double) oldStats.size() / statisticsBatchSize);
            
            for (int i = 0; i < totalBatches; i++) {
                int startIndex = i * statisticsBatchSize;
                int endIndex = Math.min(startIndex + statisticsBatchSize, oldStats.size());
                
                List<CategorySalesStatistics> batch = oldStats.subList(startIndex, endIndex);
                processCategoryStatisticsBatch(batch, i + 1, totalBatches);
            }
            
            // 아카이빙 완료 후 원본 데이터 삭제 (실제 운영에서는 주석 해제)
            // categorySalesStatisticsRepository.deleteAll(oldStats);
            
        } catch (Exception e) {
            log.error("카테고리 통계 아카이빙 실패", e);
        }
    }
    
    /**
     * 매출 통계 배치 처리
     */
    private void processSalesStatisticsBatch(List<SalesStatistics> batch, int batchNumber, int totalBatches) {
        log.info("매출 통계 배치 아카이빙 처리: {}/{}", batchNumber, totalBatches);
        
        try {
            for (SalesStatistics stat : batch) {
                // 실제 아카이빙 로직 구현
                // 예: 별도 아카이브 테이블에 저장
                // archiveSalesStatisticsToTable(stat);
                
                // 또는 파일로 저장
                // saveSalesStatisticsToFile(stat);
                
                // 현재는 로그만 출력
                log.debug("매출 통계 아카이빙: 지점={}, 날짜={}, 매출={}", 
                    stat.getBranchId(), stat.getStatisticDate(), stat.getTotalSales());
            }
            
        } catch (Exception e) {
            log.error("매출 통계 배치 {} 아카이빙 처리 실패", batchNumber, e);
        }
    }
    
    /**
     * 메뉴 통계 배치 처리
     */
    private void processMenuStatisticsBatch(List<MenuSalesStatistics> batch, int batchNumber, int totalBatches) {
        log.info("메뉴 통계 배치 아카이빙 처리: {}/{}", batchNumber, totalBatches);
        
        try {
            for (MenuSalesStatistics stat : batch) {
                // 실제 아카이빙 로직 구현
                log.debug("메뉴 통계 아카이빙: 지점={}, 메뉴={}, 날짜={}, 판매량={}", 
                    stat.getBranchId(), stat.getMenuId(), stat.getStatisticDate(), stat.getQuantitySold());
            }
            
        } catch (Exception e) {
            log.error("메뉴 통계 배치 {} 아카이빙 처리 실패", batchNumber, e);
        }
    }
    
    /**
     * 카테고리 통계 배치 처리
     */
    private void processCategoryStatisticsBatch(List<CategorySalesStatistics> batch, int batchNumber, int totalBatches) {
        log.info("카테고리 통계 배치 아카이빙 처리: {}/{}", batchNumber, totalBatches);
        
        try {
            for (CategorySalesStatistics stat : batch) {
                // 실제 아카이빙 로직 구현
                log.debug("카테고리 통계 아카이빙: 지점={}, 카테고리={}, 날짜={}, 매출={}", 
                    stat.getBranchId(), stat.getCategoryId(), stat.getStatisticDate(), stat.getTotalSales());
            }
            
        } catch (Exception e) {
            log.error("카테고리 통계 배치 {} 아카이빙 처리 실패", batchNumber, e);
        }
    }
    
    /**
     * 수동 통계 아카이빙 실행
     */
    @Async
    public CompletableFuture<String> manualStatisticsArchive(LocalDate fromDate, LocalDate toDate) {
        log.info("수동 통계 아카이빙 실행: {} ~ {}", fromDate, toDate);
        
        try {
            // 매출 통계 수동 아카이빙
            List<SalesStatistics> salesStats = salesStatisticsRepository
                .findByStatisticDateBetween(fromDate, toDate);
            
            // 메뉴 통계 수동 아카이빙
            List<MenuSalesStatistics> menuStats = menuSalesStatisticsRepository
                .findByStatisticDateBetween(fromDate, toDate);
            
            // 카테고리 통계 수동 아카이빙
            List<CategorySalesStatistics> categoryStats = categorySalesStatisticsRepository
                .findByStatisticDateBetween(fromDate, toDate);
            
            int totalArchived = salesStats.size() + menuStats.size() + categoryStats.size();
            
            if (totalArchived == 0) {
                return CompletableFuture.completedFuture("아카이빙할 통계 데이터가 없습니다.");
            }
            
            // 실제 아카이빙 처리
            processSalesStatisticsBatch(salesStats, 1, 1);
            processMenuStatisticsBatch(menuStats, 1, 1);
            processCategoryStatisticsBatch(categoryStats, 1, 1);
            
            return CompletableFuture.completedFuture(
                String.format("수동 통계 아카이빙 완료: 매출통계 %d개, 메뉴통계 %d개, 카테고리통계 %d개 처리", 
                    salesStats.size(), menuStats.size(), categoryStats.size()));
                
        } catch (Exception e) {
            log.error("수동 통계 아카이빙 실패", e);
            return CompletableFuture.completedFuture("통계 아카이빙 실패: " + e.getMessage());
        }
    }
    
    /**
     * 통계 아카이빙 통계 조회
     */
    public StatisticsArchiveInfo getStatisticsArchiveInfo() {
        LocalDate oneYearAgo = LocalDate.now().minusDays(365);
        
        long totalSalesStats = salesStatisticsRepository.count();
        long totalMenuStats = menuSalesStatisticsRepository.count();
        long totalCategoryStats = categorySalesStatisticsRepository.count();
        
        long oldSalesStats = salesStatisticsRepository.countByStatisticDateBefore(oneYearAgo);
        long oldMenuStats = menuSalesStatisticsRepository.countByStatisticDateBefore(oneYearAgo);
        long oldCategoryStats = categorySalesStatisticsRepository.countByStatisticDateBefore(oneYearAgo);
        
        return StatisticsArchiveInfo.builder()
            .totalSalesStatistics(totalSalesStats)
            .totalMenuSalesStatistics(totalMenuStats)
            .totalCategorySalesStatistics(totalCategoryStats)
            .oldSalesStatistics(oldSalesStats)
            .oldMenuSalesStatistics(oldMenuStats)
            .oldCategorySalesStatistics(oldCategoryStats)
            .archivingEnabled(statisticsArchivingEnabled)
            .retentionDays(statisticsRetentionDays)
            .build();
    }
    
    /**
     * 통계 아카이빙 정보 DTO
     */
    @lombok.Data
    @lombok.Builder
    public static class StatisticsArchiveInfo {
        private long totalSalesStatistics;
        private long totalMenuSalesStatistics;
        private long totalCategorySalesStatistics;
        private long oldSalesStatistics;
        private long oldMenuSalesStatistics;
        private long oldCategorySalesStatistics;
        private boolean archivingEnabled;
        private int retentionDays;
    }
}
