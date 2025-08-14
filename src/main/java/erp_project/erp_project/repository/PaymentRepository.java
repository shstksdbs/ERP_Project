package erp_project.erp_project.repository;

import erp_project.erp_project.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByOrderId(Long orderId);
    
    List<Payment> findByPaymentStatus(Payment.PaymentStatus paymentStatus);
    
    List<Payment> findByPaymentMethod(Payment.PaymentMethod paymentStatus);
    
    List<Payment> findByOrderIdAndPaymentStatus(Long orderId, Payment.PaymentStatus paymentStatus);
}
