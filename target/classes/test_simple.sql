-- test_simple.sql
-- 간단한 테스트용 SQL 파일

-- 테스트용 테이블 생성
CREATE TABLE IF NOT EXISTS test_table (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 테스트 데이터 삽입
INSERT INTO test_table (name) VALUES ('테스트1');
INSERT INTO test_table (name) VALUES ('테스트2');
INSERT INTO test_table (name) VALUES ('테스트3');
