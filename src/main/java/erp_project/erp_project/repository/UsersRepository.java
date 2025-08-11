package erp_project.erp_project.repository;

import erp_project.erp_project.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {
    
    // 사용자명으로 사용자 찾기
    Optional<Users> findByUsername(String username);
    
    // 이메일로 사용자 찾기
    Optional<Users> findByEmail(String email);
    
    // 지점별 사용자 목록
    List<Users> findByBranchId(Long branchId);
    
    // 역할별 사용자 목록
    List<Users> findByRoleId(Long roleId);
    
    // 상태별 사용자 목록
    List<Users> findByStatus(Users.UserStatus status);
    
    // 지점과 상태로 사용자 찾기
    List<Users> findByBranchIdAndStatus(Long branchId, Users.UserStatus status);
    
    // 사용자명 또는 이메일로 검색
    @Query("SELECT u FROM Users u WHERE u.username LIKE %:keyword% OR u.name LIKE %:keyword% OR u.email LIKE %:keyword%")
    List<Users> findByKeyword(@Param("keyword") String keyword);
    
    // 활성 사용자만 조회
    @Query("SELECT u FROM Users u WHERE u.status = 'ACTIVE'")
    List<Users> findActiveUsers();
    
    // 지점별 활성 사용자 수
    @Query("SELECT COUNT(u) FROM Users u WHERE u.branch.id = :branchId AND u.status = 'ACTIVE'")
    long countActiveUsersByBranch(@Param("branchId") Long branchId);
}
