-- notice_target_groups 테이블에서 type 컬럼 제거
-- 엔티티에서 type 필드를 제거했으므로 데이터베이스 테이블도 맞춰서 수정

-- 1. 기존 데이터 백업 (필요시)
-- CREATE TABLE notice_target_groups_backup AS SELECT * FROM notice_target_groups;

-- 2. 외래키 제약조건 비활성화
SET FOREIGN_KEY_CHECKS = 0;

-- 3. type 컬럼 제거
ALTER TABLE notice_target_groups DROP COLUMN type;

-- 4. 기존 인덱스 제거 (type 컬럼 관련)
DROP INDEX IF EXISTS idx_target_groups_type;

-- 5. 외래키 제약조건 다시 활성화
SET FOREIGN_KEY_CHECKS = 1;

-- 6. 테이블 구조 확인
DESCRIBE notice_target_groups;
