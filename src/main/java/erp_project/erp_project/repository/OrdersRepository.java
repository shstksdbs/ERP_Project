package erp_project.erp_project.repository;

import erp_project.erp_project.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, Long> {
    Optional<Orders> findById(Long orderId);
    List<Orders> findByBranchId(Long branchId);
    List<Orders> findByOrderStatus(Orders.OrderStatus orderStatus);
    List<Orders> findByPaymentStatus(Orders.PaymentStatus paymentStatus);
    List<Orders> findByBranchIdAndOrderStatus(Long branchId, Orders.OrderStatus orderStatus);
    List<Orders> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Orders> findByBranchIdAndCreatedAtBetween(Long branchId, LocalDateTime startDate, LocalDateTime endDate);
}
