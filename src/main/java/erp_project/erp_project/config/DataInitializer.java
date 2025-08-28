package erp_project.erp_project.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
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
import jakarta.annotation.PostConstruct;

@Component
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 실행할 SQL 파일 목록 (순서 중요!)
    private final List<String> sqlFiles = Arrays.asList(
        "02_branch_setup.sql",     // 1. 지점 정보 및 설정
        "05_menu_categories.sql",  // 2. 메뉴 카테고리 데이터
        "01_menu_data.sql",        // 2. 메뉴 기본 데이터    
        "06_menu_category_migration.sql",  // 2. 메뉴 카테고리 데이터
        "03_option_data.sql",      // 3. 메뉴 옵션 데이터  
        "04_users_data.sql",       // 4. 사용자 데이터
        "07_materials_data.sql",    // 5. 원재료 데이터
        "08_recipes_data.sql",
        "09_recipe_ingredients_data.sql",
        "10_sales_statistics_tables.sql"
    );

    @PostConstruct
    public void initializeData() {
        log.info("=== 데이터베이스 초기화를 시작합니다 ===");
        
        try {
            // 1단계: 데이터베이스 연결 확인
            log.info("1단계: 데이터베이스 연결 확인 중...");
            testDatabaseConnection();
            
            // 2단계: JPA 테이블 생성 완료 대기
            log.info("2단계: JPA 엔티티 기반 테이블 생성 완료를 기다리는 중...");
            Thread.sleep(5000); // 더 긴 대기 시간
            waitForTablesToBeCreated();
            
            // 3단계: 데이터 삽입
            log.info("3단계: 데이터 삽입을 시작합니다...");
            
            // SQL 파일들을 순서대로 실행
            for (int i = 0; i < sqlFiles.size(); i++) {
                String sqlFile = sqlFiles.get(i);
                log.info("SQL 파일 실행 중: {} ({}/{})", sqlFile, i + 1, sqlFiles.size());
                executeSqlFile(sqlFile);
            }
            
            log.info("=== 데이터베이스 초기화가 완료되었습니다 ===");
            
            // 데이터 검증
            verifyData();
            
        } catch (Exception e) {
            log.error("데이터베이스 초기화 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 데이터베이스 연결 테스트
     */
    private void testDatabaseConnection() {
        try {
            // JdbcTemplate을 사용한 연결 테스트
            String result = jdbcTemplate.queryForObject("SELECT 'OK' as status", String.class);
            log.info("데이터베이스 연결 성공: {}", result);
            
            // 현재 데이터베이스 정보 확인
            String dbName = jdbcTemplate.queryForObject("SELECT DATABASE()", String.class);
            log.info("현재 데이터베이스: {}", dbName);
            
        } catch (Exception e) {
            log.error("데이터베이스 연결 실패: {}", e.getMessage());
            throw new RuntimeException("데이터베이스 연결을 확인할 수 없습니다.", e);
        }
    }
    
    /**
     * SQL 파일 실행 (개선된 버전)
     */
    private void executeSqlFile(String fileName) {
        log.info("=== SQL 파일 실행 시작: {} ===", fileName);
        Resource resource = new ClassPathResource(fileName);
        
        if (!resource.exists()) {
            log.error("SQL 파일이 존재하지 않습니다: {}", fileName);
            return;
        }
        
        try (InputStream inputStream = resource.getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            
            StringBuilder sql = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sql.append(line).append("\n");
            }
            
            String sqlContent = sql.toString();
            log.info("SQL 파일 내용 길이: {} 문자", sqlContent.length());
            
            // 프로시저/트리거 파일인지 확인
            if (fileName.contains("sales_statistics_tables")) {
                executeProcedureAndTriggerFile(sqlContent);
            } else {
                // 일반 테이블 생성 SQL 실행
                executeRegularSqlFile(sqlContent, fileName);
            }
            
        } catch (Exception e) {
            log.error("SQL 파일 {} 읽기/실행 중 오류 발생", fileName, e);
        }
    }
    
    /**
     * 프로시저와 트리거를 포함한 파일 실행
     */
    private void executeProcedureAndTriggerFile(String sqlContent) {
        log.info("프로시저/트리거 파일 실행 시작");
        
        try (Connection connection = dataSource.getConnection()) {
            // 자동 커밋 비활성화
            connection.setAutoCommit(false);
            
            try (Statement statement = connection.createStatement()) {
                // DELIMITER 제거하고 프로시저/트리거 생성
                String[] procedures = extractProceduresAndTriggers(sqlContent);
                
                for (String procedure : procedures) {
                    if (!procedure.trim().isEmpty()) {
                        try {
                            log.info("프로시저/트리거 실행: {}", procedure.substring(0, Math.min(100, procedure.length())));
                            statement.execute(procedure);
                            log.info("프로시저/트리거 생성 성공");
                        } catch (SQLException e) {
                            log.error("프로시저/트리거 생성 실패: {}", e.getMessage());
                            // 이미 존재하는 경우 무시
                            if (!e.getMessage().contains("already exists")) {
                                throw e;
                            }
                        }
                    }
                }
                
                connection.commit();
                log.info("프로시저/트리거 파일 실행 완료");
                
            } catch (SQLException e) {
                connection.rollback();
                throw e;
            }
            
        } catch (Exception e) {
            log.error("프로시저/트리거 실행 중 오류: {}", e.getMessage());
        }
    }
    
    /**
     * 프로시저와 트리거 SQL 추출 (완전히 새로 작성)
     */
    private String[] extractProceduresAndTriggers(String sqlContent) {
        log.info("프로시저/트리거 SQL 추출 시작");
        
        // DELIMITER 제거
        sqlContent = sqlContent.replaceAll("DELIMITER\\s+[^\\s]+;?", "");
        
        // 프로시저와 트리거를 개별적으로 분리
        List<String> procedures = new ArrayList<>();
        
        try {
            // CREATE PROCEDURE 찾기
            String[] procedureParts = sqlContent.split("CREATE PROCEDURE");
            log.info("CREATE PROCEDURE 개수: {}", procedureParts.length - 1);
            
            for (int i = 1; i < procedureParts.length; i++) {
                String procedure = "CREATE PROCEDURE" + procedureParts[i];
                
                // END// 까지 포함하되, // 제거
                int endIndex = procedure.indexOf("END//");
                if (endIndex > 0) {
                    // END//를 END로 변경
                    procedure = procedure.substring(0, endIndex) + "END";
                    
                    // 세미콜론으로 끝나지 않으면 추가
                    if (!procedure.trim().endsWith(";")) {
                        procedure = procedure + ";";
                    }
                    
                    procedures.add(procedure);
                    log.info("프로시저 {} 추출 완료 (길이: {})", i, procedure.length());
                    log.debug("프로시저 내용: {}...", procedure.substring(0, Math.min(300, procedure.length())));
                } else {
                    log.warn("프로시저 {}에서 END//를 찾을 수 없음", i);
                }
            }
            
            // CREATE TRIGGER 찾기
            String[] triggerParts = sqlContent.split("CREATE TRIGGER");
            log.info("CREATE TRIGGER 개수: {}", triggerParts.length - 1);
            
            for (int i = 1; i < triggerParts.length; i++) {
                String trigger = "CREATE TRIGGER" + triggerParts[i];
                
                // END// 까지 포함하되, // 제거
                int endIndex = trigger.indexOf("END//");
                if (endIndex > 0) {
                    // END//를 END로 변경
                    trigger = trigger.substring(0, endIndex) + "END";
                    
                    // 세미콜론으로 끝나지 않으면 추가
                    if (!trigger.trim().endsWith(";")) {
                        trigger = trigger + ";";
                    }
                    
                    procedures.add(trigger);
                    log.info("트리거 {} 추출 완료 (길이: {})", i, trigger.length());
                    log.debug("트리거 내용: {}...", trigger.substring(0, Math.min(300, trigger.length())));
                } else {
                    log.warn("트리거 {}에서 END//를 찾을 수 없음", i);
                }
            }
            
            log.info("총 {}개의 프로시저/트리거 추출 완료", procedures.size());
            
        } catch (Exception e) {
            log.error("프로시저/트리거 추출 중 오류: {}", e.getMessage());
        }
        
        return procedures.toArray(new String[0]);
    }
    
    /**
     * 일반 SQL 파일 실행
     */
    private void executeRegularSqlFile(String sqlContent, String fileName) {
        // 개선된 SQL 분리 로직 사용
        String[] statements = splitSqlStatements(sqlContent);
        int successCount = 0;
        int totalCount = 0;
        int errorCount = 0;
        
        log.info("SQL 파일 {}에서 {}개의 문장을 찾았습니다.", fileName, statements.length);
        
        for (int i = 0; i < statements.length; i++) {
            String statement = statements[i].trim();
            if (!statement.isEmpty() && !statement.startsWith("--") && !statement.startsWith("/*")) {
                totalCount++;
                log.debug("문장 {} 실행 중: {}", i + 1, statement.substring(0, Math.min(100, statement.length())));
                
                try {
                    // SELECT 문은 건너뛰기 (데이터 삽입이 아니므로)
                    if (statement.trim().toUpperCase().startsWith("SELECT")) {
                        log.info("SELECT 문 건너뛰기: {}", statement.substring(0, Math.min(100, statement.length())));
                        continue;
                    }
                    
                    // INSERT 문의 경우 영향받은 행 수를 확인
                    int result = jdbcTemplate.update(statement);
                    log.info("SQL 실행 성공 [{}]: {} (영향받은 행: {})", 
                             i + 1, statement.substring(0, Math.min(100, statement.length())), result);
                    successCount++;
                } catch (Exception e) {
                    errorCount++;
                    log.error("SQL 실행 실패 [{}] ({}): {}", i + 1, fileName, e.getMessage());
                    log.debug("실패한 SQL: {}", statement);
                    
                    // 특정 에러는 무시 (예: 중복 키 에러)
                    if (e.getMessage().contains("Duplicate entry") || 
                        e.getMessage().contains("already exists")) {
                        log.info("중복 데이터로 인한 에러 무시: {}", e.getMessage());
                        successCount++; // 중복 에러는 성공으로 간주
                    }
                }
            }
        }
        
        log.info("=== SQL 파일 {} 실행 결과: 총 {}개 중 {}개 성공, {}개 실패 ===", 
                fileName, totalCount, successCount, errorCount);
    }
    
    /**
     * SQL 파일 실행 (기존 메서드)
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
    
    /**
     * JPA 테이블 생성 완료를 기다리는 메서드 (개선된 버전)
     */
    private void waitForTablesToBeCreated() {
        log.info("JPA 테이블 생성 완료를 기다리는 중...");
        
        int maxAttempts = 30; // 최대 30초 대기 (줄임)
        int attempt = 0;
        
        while (attempt < maxAttempts) {
            try {
                // 기본 테이블들이 존재하는지 확인
                List<String> requiredTables = Arrays.asList("branches", "users", "menus", "menu_options");
                boolean allTablesExist = true;
                
                for (String tableName : requiredTables) {
                    try {
                        jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + tableName, Integer.class);
                        log.debug("테이블 {} 확인 완료", tableName);
                    } catch (Exception e) {
                        log.debug("테이블 {} 아직 생성되지 않음: {}", tableName, e.getMessage());
                        allTablesExist = false;
                        break;
                    }
                }
                
                if (allTablesExist) {
                    log.info("모든 필요한 테이블이 생성되었습니다.");
                    return;
                }
                
            } catch (Exception e) {
                log.debug("테이블 확인 중 예외 발생: {}", e.getMessage());
            }
            
            attempt++;
            log.info("테이블 생성 대기 중... (시도 {}/{})", attempt, maxAttempts);
            
            try {
                Thread.sleep(1000); // 1초 대기
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                log.warn("테이블 대기 중 인터럽트 발생");
                break;
            }
        }
        
        log.warn("테이블 생성 완료를 기다리는 시간이 초과되었습니다. 계속 진행합니다.");
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
            
            // 지점 데이터 확인
            Integer branchCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM branches", Integer.class);
            log.info("지점 데이터: {}개", branchCount);
            
            log.info("데이터 검증이 완료되었습니다.");
            
        } catch (Exception e) {
            log.error("데이터 검증 중 오류가 발생했습니다.", e);
        }
    }
}
