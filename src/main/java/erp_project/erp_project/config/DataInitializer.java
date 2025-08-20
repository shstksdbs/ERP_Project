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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import java.io.InputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Map;

@Component
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 실행할 SQL 파일 목록 (순서 중요!)
    private final List<String> sqlFiles = Arrays.asList(
        "01_schema.sql",           // 1. 기본 테이블 구조 생성 (카테고리 테이블 포함)
        "13_category_data.sql",    // 2. 카테고리 데이터 생성 (메뉴보다 먼저)
        "02_branch_setup.sql",     // 3. 지점 정보 및 설정
        "03_menu_data.sql",        // 4. 메뉴 기본 데이터 (카테고리 참조)
        "04_option_templates.sql", // 5. 옵션 템플릿 시스템
        "05_option_data.sql",      // 6. 옵션 데이터
        "06_inventory_system.sql"  // 7. 재고 관리 시스템
    );

    @EventListener(ApplicationReadyEvent.class)
    public void initializeData() {
        log.info("데이터베이스 초기화를 시작합니다...");
        
        try {
            // SQL 파일들을 순서대로 실행 (실제 존재하는 파일들만)
            String[] sqlFiles = {
                "01_schema.sql",
                "10_users_data.sql", 
                "03_menu_data.sql"
            };
            
            for (String sqlFile : sqlFiles) {
                log.info("SQL 파일 실행 중: {}", sqlFile);
                Resource resource = new ClassPathResource(sqlFile);
                
                if (!resource.exists()) {
                    log.warn("SQL 파일이 존재하지 않습니다: {}", sqlFile);
                    continue;
                }
                
                try (InputStream inputStream = resource.getInputStream();
                     BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                    
                    StringBuilder sql = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        sql.append(line).append("\n");
                    }
                    
                    String[] statements = sql.toString().split(";");
                    for (String statement : statements) {
                        statement = statement.trim();
                        if (!statement.isEmpty() && !statement.startsWith("--")) {
                            try {
                                jdbcTemplate.execute(statement);
                                log.debug("SQL 실행 완료: {}", statement.substring(0, Math.min(50, statement.length())));
                            } catch (Exception e) {
                                log.warn("SQL 실행 실패 (무시됨): {}", e.getMessage());
                            }
                        }
                    }
                }
            }
            
            log.info("데이터베이스 초기화가 완료되었습니다.");
            
            // 데이터 검증
            verifyData();
            
        } catch (Exception e) {
            log.error("데이터베이스 초기화 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * SQL 파일 실행
     */
    private boolean executeSqlFile(Connection connection, String fileName) throws IOException, SQLException {
        ClassPathResource resource = new ClassPathResource(fileName);
        if (!resource.exists()) {
            System.err.println("❌ 파일을 찾을 수 없습니다: " + fileName);
            return false;
        }
        
        String sqlContent = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        System.out.println("   - 파일 내용 길이: " + sqlContent.length() + " 문자");
        
        // SQL 문을 정확하게 분리
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
    
    /**
     * SQL 문을 개별 문장으로 분리
     */
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
    
    private void verifyData() {
        log.info("데이터 검증을 시작합니다...");
        
        try {
            // 메뉴 데이터 확인
            Integer menuCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM menus", Integer.class);
            log.info("메뉴 데이터: {}개", menuCount);
            
            if (menuCount > 0) {
                List<Map<String, Object>> sampleMenus = jdbcTemplate.queryForList(
                    "SELECT name, price, category FROM menus LIMIT 5"
                );
                log.info("샘플 메뉴: {}", sampleMenus);
            }
            
            // 사용자 데이터 확인
            Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
            log.info("사용자 데이터: {}개", userCount);
            
            // 재고 데이터 확인
            Integer inventoryCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM inventory", Integer.class);
            log.info("재고 데이터: {}개", inventoryCount);
            
            log.info("데이터 검증이 완료되었습니다.");
            
        } catch (Exception e) {
            log.error("데이터 검증 중 오류가 발생했습니다.", e);
        }
    }
}
