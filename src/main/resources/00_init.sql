-- 00_init.sql
-- 지점별 키오스크 주문 + ERP 연동 + 본사 할인 프로모션 시스템 초기화

-- 🚨 기존 테이블 강제 삭제 (데이터 초기화)
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS system_logs;
DROP TABLE IF EXISTS hourly_sales;
DROP TABLE IF EXISTS daily_sales_summary;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_item_options;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS branch_menus;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS menu_template_relations;
DROP TABLE IF EXISTS template_option_relations;
DROP TABLE IF EXISTS option_templates;
DROP TABLE IF EXISTS menu_options;
DROP TABLE IF EXISTS menus;

SET FOREIGN_KEY_CHECKS = 1;

-- 시스템 초기화 시작
SELECT '지점별 키오스크 주문 + ERP 연동 + 본사 할인 프로모션 시스템 초기화를 시작합니다...' AS message;

-- 1. 기본 테이블 구조 생성
SOURCE 01_schema.sql;
SELECT '기본 테이블 구조 생성 완료' AS message;

-- 2. 지점 정보 및 지점별 데이터베이스 설정
SOURCE 02_branch_setup.sql;
SELECT '지점 정보 및 지점별 데이터베이스 설정 완료' AS message;

-- 3. 메뉴 기본 데이터
SOURCE 03_menu_data.sql;
SELECT '메뉴 기본 데이터 입력 완료' AS message;

-- 4. 옵션 템플릿 시스템
SOURCE 04_option_templates.sql;
SELECT '옵션 템플릿 시스템 생성 완료' AS message;

-- 5. 옵션 데이터
SOURCE 05_option_data.sql;
SELECT '옵션 데이터 입력 완료' AS message;

-- 6. 재고 관리 시스템
SOURCE 06_inventory_system.sql;
SELECT '재고 관리 시스템 생성 완료' AS message;

-- 7. 할인 프로모션 시스템
SOURCE 07_discount_system.sql;
SELECT '할인 프로모션 시스템 생성 완료' AS message;

-- 8. 지점별 샘플 데이터
SOURCE 08_branch_sample_data.sql;
SELECT '지점별 샘플 데이터 입력 완료' AS message;

-- 9. 자동화 함수 및 트리거
SOURCE 09_automation_functions.sql;
SELECT '자동화 함수 및 트리거 생성 완료' AS message;

-- 초기화 완료 메시지
SELECT '🎉 지점별 키오스크 주문 + ERP 연동 + 본사 할인 프로모션 시스템 초기화가 완료되었습니다!' AS message;
SELECT '✅ 3개 지점(본사, 강남점, 홍대점)이 설정되었습니다.' AS message;
SELECT '✅ 각 지점별로 독립적인 키오스크 주문이 가능합니다.' AS message;
SELECT '✅ 본사에서 할인 프로모션을 관리할 수 있습니다.' AS message;
SELECT '✅ 실시간 재고 관리 및 매출 분석이 가능합니다.' AS message;

-- 생성된 테이블 확인
SHOW TABLES;

-- 지점별 데이터 확인
SELECT 
    b.branch_name,
    COUNT(bm.menu_id) as total_menus,
    COUNT(CASE WHEN bm.is_available = TRUE THEN 1 END) as available_menus
FROM branches b
LEFT JOIN branch_menus bm ON b.branch_id = bm.branch_id
GROUP BY b.branch_id, b.branch_name;

-- 활성화된 할인 프로모션 확인
CALL GetActivePromotions();

-- 옵션 템플릿 요약 확인
SELECT * FROM option_template_summary;
