package erp_project.erp_project.repository;

import erp_project.erp_project.entity.OrderItems;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItems, Long> {
    
    List<OrderItems> findByOrderId(Long orderId);
    
    List<OrderItems> findByMenuId(Long menuId);
    
    List<OrderItems> findByOrderIdAndMenuId(Long orderId, Long menuId);
    
    /**
     * 특정 기간 동안 상품별 매출 통계 조회 (상위 5개)
     */
    @Query("SELECT oi.menuName as menuName, " +
           "SUM(oi.totalPrice) as totalSales, " +
           "SUM(oi.quantity) as totalQuantity " +
           "FROM OrderItems oi " +
           "INNER JOIN Orders o ON oi.orderId = o.orderId " +
           "WHERE o.branchId = :branchId " +
           "AND o.orderTime BETWEEN :startTime AND :endTime " +
           "AND o.paymentStatus = 'COMPLETED' " +
           "GROUP BY oi.menuName " +
           "ORDER BY totalSales DESC")
    List<Object[]> findTopProductsBySales(
        @Param("branchId") Long branchId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}
