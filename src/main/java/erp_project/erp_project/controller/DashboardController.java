package erp_project.erp_project.controller;

import erp_project.erp_project.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DashboardController {
    
    private final DashboardService dashboardService;
    
    /**
     * 지점 대시보드 KPI 데이터 조회
     * GET /api/dashboard/kpis?branchId={branchId}
     */
    @GetMapping("/kpis")
    public ResponseEntity<Map<String, Object>> getDashboardKpis(@RequestParam Long branchId) {
        log.info("대시보드 KPI 조회 요청: branchId={}", branchId);
        
        try {
            Map<String, Object> kpis = dashboardService.getDashboardKpis(branchId);
            return ResponseEntity.ok(kpis);
        } catch (Exception e) {
            log.error("대시보드 KPI 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "대시보드 데이터 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 오늘 매출 조회
     * GET /api/dashboard/today-sales?branchId={branchId}
     */
    @GetMapping("/today-sales")
    public ResponseEntity<Map<String, Object>> getTodaySales(@RequestParam Long branchId) {
        log.info("오늘 매출 조회 요청: branchId={}", branchId);
        
        try {
            Map<String, Object> sales = dashboardService.getTodaySales(branchId);
            return ResponseEntity.ok(sales);
        } catch (Exception e) {
            log.error("오늘 매출 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "매출 데이터 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 오늘 주문 수 조회
     * GET /api/dashboard/today-orders?branchId={branchId}
     */
    @GetMapping("/today-orders")
    public ResponseEntity<Map<String, Object>> getTodayOrders(@RequestParam Long branchId) {
        log.info("오늘 주문 수 조회 요청: branchId={}", branchId);
        
        try {
            Map<String, Object> orders = dashboardService.getTodayOrders(branchId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            log.error("오늘 주문 수 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "주문 데이터 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 발주 대기 수 조회
     * GET /api/dashboard/pending-supply-requests?branchId={branchId}
     */
    @GetMapping("/pending-supply-requests")
    public ResponseEntity<Map<String, Object>> getPendingSupplyRequests(@RequestParam Long branchId) {
        log.info("발주 대기 수 조회 요청: branchId={}", branchId);
        
        try {
            Map<String, Object> requests = dashboardService.getPendingSupplyRequests(branchId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            log.error("발주 대기 수 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "발주 데이터 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 재고 부족 수 조회
     * GET /api/dashboard/low-stock?branchId={branchId}
     */
    @GetMapping("/low-stock")
    public ResponseEntity<Map<String, Object>> getLowStockItems(@RequestParam Long branchId) {
        log.info("재고 부족 수 조회 요청: branchId={}", branchId);
        
        try {
            Map<String, Object> lowStock = dashboardService.getLowStockItems(branchId);
            return ResponseEntity.ok(lowStock);
        } catch (Exception e) {
            log.error("재고 부족 수 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "재고 데이터 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 읽지 않은 알림 수 조회
     * GET /api/dashboard/unread-notifications?branchId={branchId}
     */
    @GetMapping("/unread-notifications")
    public ResponseEntity<Map<String, Object>> getUnreadNotifications(@RequestParam Long branchId) {
        log.info("읽지 않은 알림 수 조회 요청: branchId={}", branchId);
        
        try {
            Map<String, Object> notifications = dashboardService.getUnreadNotifications(branchId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("읽지 않은 알림 수 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "알림 데이터 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 주간 매출 추이 조회 (오늘 제외, 최근 7일)
     * GET /api/dashboard/weekly-sales-trend?branchId={branchId}
     */
    @GetMapping("/weekly-sales-trend")
    public ResponseEntity<Map<String, Object>> getWeeklySalesTrend(@RequestParam Long branchId) {
        log.info("주간 매출 추이 조회 요청: branchId={}", branchId);
        
        try {
            Map<String, Object> trend = dashboardService.getWeeklySalesTrend(branchId);
            return ResponseEntity.ok(trend);
        } catch (Exception e) {
            log.error("주간 매출 추이 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "매출 추이 데이터 조회 중 오류가 발생했습니다."));
        }
    }
    
    /**
     * 인기 상품 5개 조회 (오늘 제외, 최근 7일)
     * GET /api/dashboard/top-products?branchId={branchId}
     */
    @GetMapping("/top-products")
    public ResponseEntity<Map<String, Object>> getTopProducts(@RequestParam Long branchId) {
        log.info("인기 상품 5개 조회 요청: branchId={}", branchId);
        
        try {
            Map<String, Object> topProducts = dashboardService.getTopProducts(branchId);
            return ResponseEntity.ok(topProducts);
        } catch (Exception e) {
            log.error("인기 상품 조회 실패: branchId={}, error={}", branchId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", "인기 상품 데이터 조회 중 오류가 발생했습니다."));
        }
    }
}
