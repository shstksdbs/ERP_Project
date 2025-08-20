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
    
    // 사용자명과 지점 ID로 사용자 조회
    Optional<Users> findByUsernameAndBranchIdAndIsActiveTrue(String username, Long branchId);
    
    // 사용자명으로 사용자 조회 (중복 확인용)
    Optional<Users> findByUsername(String username);
    
    // 지점 ID로 활성 사용자 목록 조회
    @Query("SELECT u FROM Users u WHERE u.branchId = :branchId AND u.isActive = true")
    java.util.List<Users> findActiveUsersByBranchId(@Param("branchId") Long branchId);
    
    // 사용자명, 지점 ID, 비밀번호로 로그인 검증
    @Query("SELECT u FROM Users u WHERE u.username = :username AND u.branchId = :branchId AND u.password = :password AND u.isActive = true")
    Optional<Users> findByUsernameAndBranchIdAndPassword(
        @Param("username") String username, 
        @Param("branchId") Long branchId, 
        @Param("password") String password
    );
    
    // 지점 ID로 사용자 목록 조회
    List<Users> findByBranchId(Long branchId);
    
    // 활성 사용자만 조회
    List<Users> findByIsActiveTrue();
    
    // 이메일로 사용자 찾기
    Optional<Users> findByEmail(String email);
}
