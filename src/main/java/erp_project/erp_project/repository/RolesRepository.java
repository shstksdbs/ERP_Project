package erp_project.erp_project.repository;

import erp_project.erp_project.entity.Roles;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolesRepository extends JpaRepository<Roles, Long> {
    
    // 역할명으로 역할 찾기
    Optional<Roles> findByName(String name);
    
    // 역할명 존재 여부 확인
    boolean existsByName(String name);
}
