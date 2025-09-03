package erp_project.erp_project.repository;

import erp_project.erp_project.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Orders, Long> {
    
    List<Orders> findByBranchId(Long branchId);
    
    List<Orders> findByBranchIdOrderByOrderTimeDesc(Long branchId);
    
    // 결제 완료된 주문만 조회
    List<Orders> findByBranchIdAndPaymentStatusOrderByOrderTimeDesc(Long branchId, Orders.PaymentStatus paymentStatus);
    
    @Query("SELECT o FROM Orders o WHERE o.branchId = :branchId AND o.orderTime BETWEEN :startTime AND :endTime")
    List<Orders> findByBranchIdAndOrderTimeBetween(
        @Param("branchId") Long branchId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    List<Orders> findByOrderStatus(Orders.OrderStatus orderStatus);
    
    List<Orders> findByBranchIdAndOrderStatus(Long branchId, Orders.OrderStatus orderStatus);
    
    @Query("SELECT o FROM Orders o WHERE o.branchId = :branchId ORDER BY o.orderTime DESC")
    List<Orders> findRecentOrdersByBranch(@Param("branchId") Long branchId);
    
    // 오늘 해당 지점의 주문 수 조회
    @Query("SELECT COUNT(o) FROM Orders o WHERE o.branchId = :branchId AND o.orderTime BETWEEN :startTime AND :endTime")
    long countByBranchIdAndOrderTimeBetween(
        @Param("branchId") Long branchId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    // 주문 번호로 주문 찾기
    Orders findByOrderNumber(String orderNumber);
    
    // 특정 지점의 특정 상태 주문 수 조회 (시간 범위 포함)
    long countByBranchIdAndOrderStatusAndOrderTimeBetween(
        Long branchId, 
        Orders.OrderStatus orderStatus, 
        LocalDateTime startTime, 
        LocalDateTime endTime
    );
    
    // 전지점 오늘 총 주문 수 조회
    @Query("SELECT COUNT(o) FROM Orders o WHERE o.orderTime BETWEEN :startTime AND :endTime")
    Long countTodayOrdersByAllBranches(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    // 현재 운영하고 있는 지점 수 조회 (오늘 주문이 있는 지점)
    @Query("SELECT COUNT(DISTINCT o.branchId) FROM Orders o WHERE o.orderTime BETWEEN :startTime AND :endTime")
    Long countActiveBranches(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    // 최근 7일간 주문이 있는 활성 지점 수 조회
    @Query("SELECT COUNT(DISTINCT o.branchId) FROM Orders o WHERE o.orderTime BETWEEN :startTime AND :endTime")
    Long countActiveBranchesInPeriod(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    // 매출 데이터 최적화를 위한 메서드들
    List<Orders> findByBranchIdAndCreatedAtBetweenAndOrderStatusAndPaymentStatus(
        Long branchId, 
        LocalDateTime startTime, 
        LocalDateTime endTime,
        Orders.OrderStatus orderStatus,
        Orders.PaymentStatus paymentStatus
    );
    
    List<Orders> findByCreatedAtBefore(LocalDateTime dateTime);
    
    List<Orders> findByCreatedAtBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    long countByCreatedAtBefore(LocalDateTime dateTime);
    
    @Query("SELECT DISTINCT o.branchId FROM Orders o")
    List<Long> findDistinctBranchIds();
}
