package erp_project.erp_project.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;

import javax.sql.DataSource;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final List<String> sqlFiles = Arrays.asList(
        // 1단계: 기본 테이블 구조 생성
        "01_schema.sql",
        
        // 2단계: 지점 정보 및 지점별 데이터베이스 설정
        "02_branch_setup.sql",
        
        // 3단계: 메뉴 기본 데이터
        "03_menu_data.sql",
        
        // 4단계: 옵션 템플릿 시스템
        "04_option_templates.sql",
        
        // 5단계: 옵션 데이터
        "05_option_data.sql",
        
        // 6단계: 재고 관리 시스템
        "06_inventory_system.sql",
        
        // 7단계: 할인 프로모션 시스템
        "07_discount_system.sql",
        
        // 8단계: 지점별 샘플 데이터
        "08_branch_sample_data.sql",
        
        // 9단계: 자동화 함수 및 트리거
        "09_automation_functions.sql"
    );

    @EventListener(ApplicationReadyEvent.class)
    public void initializeData() throws Exception {
        // JPA가 테이블을 생성한 후에 실행
        System.out.println("🚀 지점별 키오스크 주문 + ERP 연동 + 본사 할인 프로모션 시스템 초기화를 시작합니다...");
        System.out.println("📁 실행할 SQL 파일 목록:");
        for (String file : sqlFiles) {
            System.out.println("   - " + file);
        }
        
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            System.out.println("✅ 데이터베이스 연결 성공");
            
            // 🚨 강제 데이터 초기화 (기존 데이터 삭제)
            System.out.println("🧹 기존 데이터 강제 초기화 중...");
            forceCleanupDatabase(connection);
            
            // branches 테이블이 존재하는지 확인
            if (!tableExists(connection, "branches")) {
                System.out.println("⚠️ branches 테이블이 존재하지 않습니다. 수동으로 생성합니다...");
                createBranchesTable(connection);
            }
            
            for (String sqlFile : sqlFiles) {
                try {
                    System.out.println("\n📁 " + sqlFile + " 실행 중...");
                    boolean success = executeSqlFile(connection, sqlFile);
                    if (success) {
                        System.out.println("✅ " + sqlFile + " 실행 완료");
                    } else {
                        System.err.println("⚠️ " + sqlFile + " 실행 실패 (일부만 성공)");
                    }
                } catch (Exception e) {
                    System.err.println("❌ " + sqlFile + " 실행 실패: " + e.getMessage());
                    e.printStackTrace();
                    // 에러가 발생해도 계속 진행
                }
            }
            
            connection.commit();
            System.out.println("🎉 지점별 키오스크 주문 + ERP 연동 + 본사 할인 프로모션 시스템 초기화가 완료되었습니다!");
            System.out.println("🏪 구축된 지점:");
            System.out.println("   - 본사점 (HQ001): 본사점");
            System.out.println("   - 강남점 (BR001): 강남점");
            System.out.println("   - 홍대점 (BR002): 홍대점");
            
            // 데이터 확인
            verifyData();
            
        } catch (Exception e) {
            System.err.println("❌ 데이터베이스 초기화 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private boolean executeSqlFile(Connection connection, String fileName) throws IOException, SQLException {
        ClassPathResource resource = new ClassPathResource(fileName);
        if (!resource.exists()) {
            System.err.println("❌ 파일을 찾을 수 없습니다: " + fileName);
            return false;
        }
        
        String sqlContent = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        System.out.println("   - 파일 내용 길이: " + sqlContent.length() + " 문자");
        
        // SQL 문을 더 정확하게 분리
        String[] sqlStatements = splitSqlStatements(sqlContent);
        
        int successCount = 0;
        int totalCount = 0;
        
        try (Statement statement = connection.createStatement()) {
            for (String sql : sqlStatements) {
                sql = sql.trim();
                if (!sql.isEmpty() && !sql.startsWith("--") && !sql.startsWith("/*")) {
                    totalCount++;
                    try {
                        System.out.println("     실행: " + sql.substring(0, Math.min(50, sql.length())) + "...");
                        statement.execute(sql);
                        successCount++;
                    } catch (SQLException e) {
                        // DELIMITER 관련 에러는 무시 (프로시저 생성 시)
                        if (!e.getMessage().contains("DELIMITER")) {
                            System.err.println("     SQL 실행 실패: " + e.getMessage());
                            System.err.println("     실패한 SQL: " + sql.substring(0, Math.min(100, sql.length())));
                        }
                    }
                }
            }
        }
        
        System.out.println("   - 총 " + totalCount + "개 SQL 중 " + successCount + "개 성공");
        return successCount > 0;
    }
    
    private String[] splitSqlStatements(String sqlContent) {
        // 주석 제거
        sqlContent = sqlContent.replaceAll("/\\*.*?\\*/", ""); // /* */ 주석 제거
        
        // 줄 단위로 분리
        String[] lines = sqlContent.split("\n");
        StringBuilder currentStatement = new StringBuilder();
        List<String> statements = new ArrayList<>();
        
        for (String line : lines) {
            line = line.trim();
            
            // 주석 라인 건너뛰기
            if (line.startsWith("--") || line.isEmpty()) {
                continue;
            }
            
            currentStatement.append(line).append(" ");
            
            // 세미콜론으로 끝나는지 확인
            if (line.endsWith(";")) {
                String statement = currentStatement.toString().trim();
                if (!statement.isEmpty()) {
                    statements.add(statement);
                }
                currentStatement = new StringBuilder();
            }
        }
        
        // 마지막 문장이 세미콜론으로 끝나지 않는 경우
        String lastStatement = currentStatement.toString().trim();
        if (!lastStatement.isEmpty()) {
            statements.add(lastStatement);
        }
        
        return statements.toArray(new String[0]);
    }
    
    private boolean tableExists(Connection connection, String tableName) throws SQLException {
        try (var rs = connection.getMetaData().getTables(null, null, tableName, null)) {
            return rs.next();
        }
    }
    
    private void createBranchesTable(Connection connection) throws SQLException {
        String createBranchesTable = """
            CREATE TABLE IF NOT EXISTS branches (
                branch_id BIGINT PRIMARY KEY AUTO_INCREMENT,
                branch_code VARCHAR(10) UNIQUE NOT NULL COMMENT '지점 코드 (HQ001, BR001, BR002)',
                branch_name VARCHAR(100) NOT NULL COMMENT '지점명',
                branch_type ENUM('headquarters', 'branch', 'franchise') DEFAULT 'branch' COMMENT '지점 유형',
                address TEXT COMMENT '주소',
                phone VARCHAR(20) COMMENT '연락처',
                manager_name VARCHAR(100) COMMENT '매니저명',
                status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active' COMMENT '지점 상태',
                opening_hours JSON COMMENT '영업시간 (JSON 형태)',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_branch_code (branch_code),
                INDEX idx_branch_status (status)
            )
            """;
        
        try (Statement statement = connection.createStatement()) {
            statement.execute(createBranchesTable);
            System.out.println("✅ branches 테이블 생성 완료");
        }
    }
    
    private void verifyData() {
        try {
            System.out.println("\n📊 데이터베이스 데이터 확인:");
            
            // 테이블 개수 확인
            int tableCount = jdbcTemplate.queryForObject("SHOW TABLES", Integer.class);
            System.out.println("   - 총 테이블 수: " + tableCount);
            
            // 메뉴 데이터 확인
            try {
                int menuCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM menus", Integer.class);
                System.out.println("   - 메뉴 수: " + menuCount);
            } catch (Exception e) {
                System.out.println("   - 메뉴 테이블 확인 실패: " + e.getMessage());
            }
            
            // 옵션 데이터 확인
            try {
                int optionCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM menu_options", Integer.class);
                System.out.println("   - 옵션 수: " + optionCount);
            } catch (Exception e) {
                System.out.println("   - 옵션 테이블 확인 실패: " + e.getMessage());
            }
            
            // 할인 프로모션 확인
            try {
                int discountCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM discount_promotions", Integer.class);
                System.out.println("   - 할인 프로모션 수: " + discountCount);
            } catch (Exception e) {
                System.out.println("   - 할인 프로모션 테이블 확인 실패: " + e.getMessage());
            }
            
            // 지점별 데이터 확인
            verifyBranchData();
            
        } catch (Exception e) {
            System.err.println("데이터 확인 중 오류: " + e.getMessage());
        }
    }
    
    private void verifyBranchData() {
        try {
            System.out.println("\n🏪 지점별 데이터베이스 확인:");
            
            // 지점 정보 확인
            try {
                int branchCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM branches", Integer.class);
                System.out.println("   - 지점 수: " + branchCount);
                
                if (branchCount > 0) {
                    // 지점별 상세 정보
                    jdbcTemplate.query("SELECT branch_code, branch_name, branch_type, status FROM branches", 
                        (rs, rowNum) -> {
                            System.out.println("     - " + rs.getString("branch_code") + ": " + 
                                            rs.getString("branch_name") + " (" + 
                                            rs.getString("branch_type") + ", " + 
                                            rs.getString("status") + ")");
                            return null;
                        });
                }
            } catch (Exception e) {
                System.out.println("   - 지점 테이블 확인 실패: " + e.getMessage());
            }
            
            // 지점별 메뉴 현황 확인
            try {
                jdbcTemplate.query("""
                    SELECT 
                        b.branch_name,
                        COUNT(bm.menu_id) as total_menus,
                        COUNT(CASE WHEN bm.is_available = TRUE THEN 1 END) as available_menus,
                        COUNT(CASE WHEN bm.custom_price IS NOT NULL THEN 1 END) as custom_price_menus
                    FROM branches b
                    LEFT JOIN branch_menus bm ON b.branch_id = bm.branch_id
                    GROUP BY b.branch_id, b.branch_name
                    """, 
                    (rs, rowNum) -> {
                        System.out.println("   - " + rs.getString("branch_name") + ": " +
                                        rs.getInt("total_menus") + "개 메뉴, " +
                                        rs.getInt("available_menus") + "개 판매가능, " +
                                        rs.getInt("custom_price_menus") + "개 커스텀가격");
                        return null;
                    });
            } catch (Exception e) {
                System.out.println("   - 지점별 메뉴 현황 확인 실패: " + e.getMessage());
            }
            
            // 지점별 재고 현황 확인
            try {
                jdbcTemplate.query("""
                    SELECT 
                        b.branch_name,
                        COUNT(inv.inventory_id) as total_ingredients,
                        COUNT(CASE WHEN inv.current_stock <= inv.min_stock THEN 1 END) as low_stock_items
                    FROM branches b
                    LEFT JOIN inventory inv ON b.branch_id = inv.branch_id
                    GROUP BY b.branch_id, b.branch_name
                    """, 
                    (rs, rowNum) -> {
                        System.out.println("   - " + rs.getString("branch_name") + " 재고: " +
                                        rs.getInt("total_ingredients") + "개 재료, " +
                                        rs.getInt("low_stock_items") + "개 재고부족");
                        return null;
                    });
            } catch (Exception e) {
                System.out.println("   - 지점별 재고 현황 확인 실패: " + e.getMessage());
            }
            
            // 주문 현황 확인
            try {
                jdbcTemplate.query("""
                    SELECT 
                        b.branch_name,
                        COUNT(o.order_id) as total_orders,
                        COALESCE(SUM(o.final_amount), 0) as total_revenue
                    FROM branches b
                    LEFT JOIN orders o ON b.branch_id = o.branch_id
                    GROUP BY b.branch_id, b.branch_name
                    """, 
                    (rs, rowNum) -> {
                        System.out.println("   - " + rs.getString("branch_name") + " 주문: " +
                                        rs.getInt("total_orders") + "개, " +
                                        "매출: ₩" + rs.getBigDecimal("total_revenue").toPlainString());
                        return null;
                    });
            } catch (Exception e) {
                System.out.println("   - 주문 현황 확인 실패: " + e.getMessage());
            }
            
        } catch (Exception e) {
            System.err.println("지점별 데이터 확인 중 오류: " + e.getMessage());
        }
    }
    
    /**
     * 🚨 기존 데이터베이스 데이터를 강제로 초기화
     */
    private void forceCleanupDatabase(Connection connection) throws SQLException {
        try (Statement stmt = connection.createStatement()) {
            // 외래키 제약 조건 비활성화
            stmt.execute("SET FOREIGN_KEY_CHECKS = 0");
            
            // 모든 테이블 데이터 삭제 (테이블 구조는 유지)
            String[] tables = {
                "system_logs", "hourly_sales", "daily_sales_summary", 
                "payments", "order_item_options", "order_items", 
                "orders", "branch_menus", "branches", 
                "menu_template_relations", "template_option_relations", 
                "option_templates", "menu_options", "menus"
            };
            
            for (String table : tables) {
                try {
                    stmt.execute("TRUNCATE TABLE " + table);
                    System.out.println("   ✅ " + table + " 테이블 데이터 초기화 완료");
                } catch (SQLException e) {
                    // 테이블이 존재하지 않으면 무시
                    System.out.println("   ⚠️ " + table + " 테이블이 존재하지 않음 (무시)");
                }
            }
            
            // 외래키 제약 조건 재활성화
            stmt.execute("SET FOREIGN_KEY_CHECKS = 1");
            System.out.println("🧹 데이터베이스 강제 초기화 완료");
        }
    }
}
