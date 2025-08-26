-- 00_drop_all_tables.sql
-- 모든 테이블을 삭제하는 스크립트

-- 외래 키 제약 조건 비활성화
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. 외래 키를 참조하는 테이블들을 먼저 삭제
-- =====================================================

-- 주문 관련 테이블 (메뉴를 참조)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS discount_usage_history;
DROP TABLE IF EXISTS orders;

-- 메뉴 옵션 관련 테이블 (메뉴를 참조)
DROP TABLE IF EXISTS menu_options;
DROP TABLE IF EXISTS menu_option_groups;
DROP TABLE IF EXISTS menu_ingredients;

-- 공급업체 상품 테이블 (공급업체를 참조)
DROP TABLE IF EXISTS supplier_items;

-- 할인/프로모션 관련 테이블
DROP TABLE IF EXISTS branch_available_promotions;
DROP TABLE IF EXISTS active_promotions;
DROP TABLE IF EXISTS discount_promotions;

-- 재고 관련 테이블
DROP TABLE IF EXISTS inventory_transactions;
DROP TABLE IF EXISTS inventory_alerts;

-- 매출 관련 테이블
DROP TABLE IF EXISTS hourly_sales;
DROP TABLE IF EXISTS daily_sales_summary;

-- =====================================================
-- 2. 기본 테이블들을 삭제
-- =====================================================

-- 메뉴 테이블
DROP TABLE IF EXISTS menus;

-- 재고 테이블
DROP TABLE IF EXISTS inventory;

-- 지점 테이블
DROP TABLE IF EXISTS branches;

-- 사용자 관련 테이블
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS users;

-- 카테고리 테이블
DROP TABLE IF EXISTS categories;

-- 직원 테이블
DROP TABLE IF EXISTS employees;

-- 매출 테이블
DROP TABLE IF EXISTS sales;

-- 공급업체 테이블
DROP TABLE IF EXISTS suppliers;

-- 시스템 관련 테이블
DROP TABLE IF EXISTS system_logs;
DROP TABLE IF EXISTS system_settings;

-- =====================================================
-- 3. 뷰 삭제
-- =====================================================
DROP VIEW IF EXISTS menu_with_options_view;
DROP VIEW IF EXISTS order_summary_view;
DROP VIEW IF EXISTS inventory_status_view;

-- =====================================================
-- 4. 프로시저 삭제
-- =====================================================
DROP PROCEDURE IF EXISTS UpdateInventoryStock;
DROP PROCEDURE IF EXISTS ProcessOrder;
DROP PROCEDURE IF EXISTS GenerateDailyReport;

-- =====================================================
-- 5. 함수 삭제
-- =====================================================
DROP FUNCTION IF EXISTS CalculateDiscount;
DROP FUNCTION IF EXISTS GetInventoryStatus;

-- =====================================================
-- 6. 트리거 삭제
-- =====================================================
DROP TRIGGER IF EXISTS update_inventory_after_order;
DROP TRIGGER IF EXISTS log_user_activity;
DROP TRIGGER IF EXISTS update_menu_availability;

-- 외래 키 제약 조건 활성화
SET FOREIGN_KEY_CHECKS = 1;

-- 삭제 완료 메시지
SELECT '모든 테이블이 성공적으로 삭제되었습니다.' as message;
