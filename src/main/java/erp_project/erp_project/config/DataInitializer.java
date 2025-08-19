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

    // 실행할 SQL 파일 목록 (순서 중요!)
    private final List<String> sqlFiles = Arrays.asList(
        "01_schema.sql",           // 1. 기본 테이블 구조 생성
        "02_branch_setup.sql",    // 2. 지점 정보 및 설정
        "03_menu_data.sql",       // 3. 메뉴 기본 데이터
        "04_option_templates.sql", // 4. 옵션 템플릿 시스템
        "05_option_data.sql",     // 5. 옵션 데이터
        "06_inventory_system.sql" // 6. 재고 관리 시스템
    );

    @EventListener(ApplicationReadyEvent.class)
    public void initializeData() {
        System.out.println("🚀 SQL 파일 기반 데이터베이스 초기화를 시작합니다...");
        System.out.println("📁 실행할 SQL 파일 목록:");
        for (String file : sqlFiles) {
            System.out.println("   - " + file);
        }
        
        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            System.out.println("✅ 데이터베이스 연결 성공");
            
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
            System.out.println("🎉 데이터베이스 초기화가 완료되었습니다!");
            
            // 데이터 확인
            verifyData();
            
        } catch (Exception e) {
            System.err.println("❌ 데이터베이스 초기화 실패: " + e.getMessage());
            e.printStackTrace();
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
    
    /**
     * 데이터 확인
     */
    private void verifyData() {
        try {
            System.out.println("\n📊 데이터베이스 데이터 확인:");
            
            // 테이블 개수 확인
            int tableCount = jdbcTemplate.queryForObject("SHOW TABLES", Integer.class);
            System.out.println("   - 총 테이블 수: " + tableCount);
            
            // 지점 데이터 확인
            try {
                int branchCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM branches", Integer.class);
                System.out.println("   - 지점 수: " + branchCount);
                
                if (branchCount > 0) {
                    // 지점별 상세 정보
                    jdbcTemplate.query("SELECT branch_code, branch_name, branch_type, status, opening_hours FROM branches", 
                        (rs, rowNum) -> {
                            System.out.println("     - " + rs.getString("branch_code") + ": " + 
                                            rs.getString("branch_name") + " (" + 
                                            rs.getString("branch_type") + ", " + 
                                            rs.getString("status") + ") - " +
                                            rs.getString("opening_hours"));
                            return null;
                        });
                }
            } catch (Exception e) {
                System.out.println("   - 지점 테이블 확인 실패: " + e.getMessage());
            }
            
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
            
        } catch (Exception e) {
            System.err.println("데이터 확인 중 오류: " + e.getMessage());
        }
    }
}
