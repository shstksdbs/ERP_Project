package erp_project.erp_project.repository;

import erp_project.erp_project.entity.OrderItemDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemDetailsRepository extends JpaRepository<OrderItemDetails, Long> {
    
    // 주문 아이템 ID로 상세 정보 조회
    List<OrderItemDetails> findByOrderItemId(Long orderItemId);
    
    // 아이템 타입으로 조회
    List<OrderItemDetails> findByItemType(OrderItemDetails.ItemType itemType);
    
    // 변경된 메뉴 조회
    List<OrderItemDetails> findByIsSubstitutedTrue();
    
    // 특정 메뉴 ID로 조회
    List<OrderItemDetails> findByMenuId(Long menuId);
    
    // 재료 추가/제거 조회
    List<OrderItemDetails> findByIngredientAction(OrderItemDetails.IngredientAction action);
    
    // 특정 재료 타입으로 조회
    List<OrderItemDetails> findByIngredientType(String ingredientType);
    
    // 주문 ID로 모든 상세 정보 조회 (JOIN을 위한 커스텀 쿼리)
    @Query("SELECT oid FROM OrderItemDetails oid " +
           "JOIN OrderItems oi ON oid.orderItemId = oi.orderItemId " +
           "WHERE oi.orderId = :orderId")
    List<OrderItemDetails> findByOrderId(@Param("orderId") Long orderId);
    
    // 세트 메뉴의 구성 요소 조회
    @Query("SELECT oid FROM OrderItemDetails oid " +
           "JOIN OrderItems oi ON oid.orderItemId = oi.orderItemId " +
           "WHERE oi.orderId = :orderId AND oi.itemType = 'SET'")
    List<OrderItemDetails> findSetComponentsByOrderId(@Param("orderId") Long orderId);
    
    // 변경된 메뉴 통계
    @Query("SELECT COUNT(oid) FROM OrderItemDetails oid WHERE oid.isSubstituted = true")
    Long countSubstitutedItems();
    
    // 재료 추가/제거 통계
    @Query("SELECT oid.ingredientType, oid.ingredientAction, COUNT(oid) " +
           "FROM OrderItemDetails oid " +
           "WHERE oid.itemType = 'INGREDIENT' " +
           "GROUP BY oid.ingredientType, oid.ingredientAction")
    List<Object[]> getIngredientUsageStatistics();
}
