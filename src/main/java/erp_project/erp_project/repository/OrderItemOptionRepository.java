package erp_project.erp_project.repository;

import erp_project.erp_project.entity.OrderItemOptions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemOptionRepository extends JpaRepository<OrderItemOptions, Long> {
    
    List<OrderItemOptions> findByOrderItemId(Long orderItemId);
    
    List<OrderItemOptions> findByOptionId(Long optionId);
    
    List<OrderItemOptions> findByOrderItemIdAndOptionId(Long orderItemId, Long optionId);
}
