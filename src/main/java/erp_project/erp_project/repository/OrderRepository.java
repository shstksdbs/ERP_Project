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
}
