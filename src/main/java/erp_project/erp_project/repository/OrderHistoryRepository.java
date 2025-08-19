package erp_project.erp_project.repository;

import erp_project.erp_project.entity.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {
    
    // 지점별 주문이력 조회 (최신순)
    List<OrderHistory> findByBranchIdOrderByOrderTimeDesc(Long branchId);
    
    // 지점별 상태별 주문이력 조회
    List<OrderHistory> findByBranchIdAndStatusOrderByOrderTimeDesc(Long branchId, OrderHistory.OrderStatus status);
    
    // 지점별 기간별 주문이력 조회
    List<OrderHistory> findByBranchIdAndOrderTimeBetweenOrderByOrderTimeDesc(Long branchId, LocalDateTime startTime, LocalDateTime endTime);
    
    // 주문 ID로 주문이력 조회
    List<OrderHistory> findByOrderId(Long orderId);
}
