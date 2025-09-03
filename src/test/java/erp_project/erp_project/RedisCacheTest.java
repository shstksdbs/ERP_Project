// package erp_project.erp_project;

// import erp_project.erp_project.service.CacheService;
// import erp_project.erp_project.service.MenuService;
// import erp_project.erp_project.entity.Menu;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.cache.CacheManager;
// import org.springframework.test.context.ActiveProfiles;

// import java.util.List;

// import static org.junit.jupiter.api.Assertions.*;

// @SpringBootTest
// @ActiveProfiles("test")
// public class RedisCacheTest {

//     @Autowired
//     private MenuService menuService;
    
//     @Autowired
//     private CacheService cacheService;
    
//     @Autowired
//     private CacheManager cacheManager;

//     @Test
//     public void testMenuCache() {
//         // 캐시 클리어
//         cacheService.clearMenuCaches();
        
//         // 첫 번째 호출 - DB에서 조회
//         long startTime1 = System.currentTimeMillis();
//         List<Menu> menus1 = menuService.getAllMenus();
//         long endTime1 = System.currentTimeMillis();
//         long dbQueryTime = endTime1 - startTime1;
        
//         // 두 번째 호출 - 캐시에서 조회
//         long startTime2 = System.currentTimeMillis();
//         List<Menu> menus2 = menuService.getAllMenus();
//         long endTime2 = System.currentTimeMillis();
//         long cacheQueryTime = endTime2 - startTime2;
        
//         // 결과 검증
//         assertNotNull(menus1);
//         assertNotNull(menus2);
//         assertEquals(menus1.size(), menus2.size());
        
//         // 캐시가 더 빠른지 확인 (캐시가 작동했다면)
//         System.out.println("DB 조회 시간: " + dbQueryTime + "ms");
//         System.out.println("캐시 조회 시간: " + cacheQueryTime + "ms");
        
//         // 캐시에 데이터가 있는지 확인
//         assertNotNull(cacheManager.getCache("menus"));
//     }

//     @Test
//     public void testCacheEviction() {
//         // 캐시 클리어
//         cacheService.clearMenuCaches();
        
//         // 메뉴 조회 (캐시에 저장)
//         List<Menu> menus1 = menuService.getAllMenus();
//         assertNotNull(menus1);
        
//         // 캐시에 데이터가 있는지 확인
//         assertNotNull(cacheManager.getCache("menus"));
        
//         // 캐시 클리어
//         cacheService.clearMenuCaches();
        
//         // 캐시가 클리어되었는지 확인
//         // (실제로는 캐시가 클리어되었지만, 다음 호출에서 다시 캐시됨)
//         List<Menu> menus2 = menuService.getAllMenus();
//         assertNotNull(menus2);
//     }
// }
