package erp_project.erp_project.repository;

import erp_project.erp_project.entity.RegularOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RegularOrderRepository extends JpaRepository<RegularOrder, Long> {
    
    // 지점별 정기발주 조회 (아이템 포함)
    @Query("SELECT DISTINCT ro FROM RegularOrder ro LEFT JOIN FETCH ro.items WHERE ro.branchId = :branchId ORDER BY ro.createdAt DESC")
    List<RegularOrder> findByBranchIdOrderByCreatedAtDescWithItems(@Param("branchId") Long branchId);
    
    // 지점별 활성 정기발주 조회 (아이템 포함)
    @Query("SELECT DISTINCT ro FROM RegularOrder ro LEFT JOIN FETCH ro.items WHERE ro.branchId = :branchId AND ro.isActive = true ORDER BY ro.nextOrderDate ASC")
    List<RegularOrder> findByBranchIdAndIsActiveTrueOrderByNextOrderDateAscWithItems(@Param("branchId") Long branchId);
    
    // 지점별 비활성 정기발주 조회 (아이템 포함)
    @Query("SELECT DISTINCT ro FROM RegularOrder ro LEFT JOIN FETCH ro.items WHERE ro.branchId = :branchId AND ro.isActive = false ORDER BY ro.createdAt DESC")
    List<RegularOrder> findByBranchIdAndIsActiveFalseOrderByCreatedAtDescWithItems(@Param("branchId") Long branchId);
    
    // 다음 발주일이 가까운 순으로 정렬하여 조회 (아이템 포함)
    @Query("SELECT DISTINCT ro FROM RegularOrder ro LEFT JOIN FETCH ro.items WHERE ro.branchId = :branchId AND ro.isActive = true ORDER BY ro.nextOrderDate ASC")
    List<RegularOrder> findActiveOrdersByNextOrderDateWithItems(@Param("branchId") Long branchId);
    
    // 특정 날짜에 발주 예정인 정기발주 조회 (아이템 포함)
    @Query("SELECT DISTINCT ro FROM RegularOrder ro LEFT JOIN FETCH ro.items WHERE ro.branchId = :branchId AND ro.isActive = true AND ro.nextOrderDate = :date")
    List<RegularOrder> findOrdersByNextOrderDateWithItems(@Param("branchId") Long branchId, @Param("date") LocalDate date);
    
    // 정기발주명으로 검색 (아이템 포함)
    @Query("SELECT DISTINCT ro FROM RegularOrder ro LEFT JOIN FETCH ro.items WHERE ro.branchId = :branchId AND ro.orderName LIKE %:keyword% ORDER BY ro.createdAt DESC")
    List<RegularOrder> findByOrderNameContainingWithItems(@Param("branchId") Long branchId, @Param("keyword") String keyword);
    
    // 등록자별 정기발주 조회 (아이템 포함)
    @Query("SELECT DISTINCT ro FROM RegularOrder ro LEFT JOIN FETCH ro.items WHERE ro.branchId = :branchId AND ro.createdBy = :createdBy ORDER BY ro.createdAt DESC")
    List<RegularOrder> findByBranchIdAndCreatedByOrderByCreatedAtDescWithItems(@Param("branchId") Long branchId, @Param("createdBy") String createdBy);
    
    // 기존 메서드들 (하위 호환성 유지)
    List<RegularOrder> findByBranchIdOrderByCreatedAtDesc(Long branchId);
    List<RegularOrder> findByBranchIdAndIsActiveTrueOrderByNextOrderDateAsc(Long branchId);
    List<RegularOrder> findByBranchIdAndIsActiveFalseOrderByCreatedAtDesc(Long branchId);
    List<RegularOrder> findByBranchIdAndCreatedByOrderByCreatedAtDesc(Long branchId, String createdBy);
    
    // 다음 발주일이 가까운 순으로 정렬하여 조회
    @Query("SELECT ro FROM RegularOrder ro WHERE ro.branchId = :branchId AND ro.isActive = true ORDER BY ro.nextOrderDate ASC")
    List<RegularOrder> findActiveOrdersByNextOrderDate(@Param("branchId") Long branchId);
    
    // 특정 날짜에 발주 예정인 정기발주 조회
    @Query("SELECT ro FROM RegularOrder ro WHERE ro.branchId = :branchId AND ro.isActive = true AND ro.nextOrderDate = :date")
    List<RegularOrder> findOrdersByNextOrderDate(@Param("branchId") Long branchId, @Param("date") LocalDate date);
    
    // 정기발주명으로 검색
    @Query("SELECT ro FROM RegularOrder ro WHERE ro.branchId = :branchId AND ro.orderName LIKE %:keyword% ORDER BY ro.createdAt DESC")
    List<RegularOrder> findByOrderNameContaining(@Param("branchId") Long branchId, @Param("keyword") String keyword);
}
