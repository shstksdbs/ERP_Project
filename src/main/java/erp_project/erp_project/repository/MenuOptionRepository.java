package erp_project.erp_project.repository;

import erp_project.erp_project.entity.MenuOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuOptionRepository extends JpaRepository<MenuOption, Long> {
    
    // 카테고리별로 정렬된 메뉴 옵션 조회
    List<MenuOption> findByCategoryOrderByDisplayOrderAsc(String category);
    
    // 사용 가능한 메뉴 옵션을 정렬 순서대로 조회
    List<MenuOption> findByIsAvailableTrueOrderByDisplayOrderAsc();
}
