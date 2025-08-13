-- 02_branch_setup.sql
-- 지점 정보 및 지점별 데이터베이스 설정

-- =====================================================
-- 1. 지점 정보 데이터 삽입
-- =====================================================

-- 본사 (Headquarters)
INSERT INTO branches (branch_code, branch_name, branch_type, address, phone, manager_name, status, opening_hours) VALUES
('HQ001', '버거킹 본사점', 'headquarters', '서울특별시 강남구 테헤란로 123', '02-1234-5678', '김본사', 'active', 
 JSON_OBJECT(
   'monday', JSON_OBJECT('open', '09:00', 'close', '18:00'),
   'tuesday', JSON_OBJECT('open', '09:00', 'close', '18:00'),
   'wednesday', JSON_OBJECT('open', '09:00', 'close', '18:00'),
   'thursday', JSON_OBJECT('open', '09:00', 'close', '18:00'),
   'friday', JSON_OBJECT('open', '09:00', 'close', '18:00'),
   'saturday', JSON_OBJECT('open', '10:00', 'close', '16:00'),
   'sunday', JSON_OBJECT('open', 'closed', 'close', 'closed')
 ));

-- 지점 1 (Branch 1)
INSERT INTO branches (branch_code, branch_name, branch_type, address, phone, manager_name, status, opening_hours) VALUES
('BR001', '강남점', 'branch', '서울특별시 강남구 역삼동 456', '02-2345-6789', '이강남', 'active',
 JSON_OBJECT(
   'monday', JSON_OBJECT('open', '07:00', 'close', '23:00'),
   'tuesday', JSON_OBJECT('open', '07:00', 'close', '23:00'),
   'wednesday', JSON_OBJECT('open', '07:00', 'close', '23:00'),
   'thursday', JSON_OBJECT('open', '07:00', 'close', '23:00'),
   'friday', JSON_OBJECT('open', '07:00', 'close', '23:00'),
   'saturday', JSON_OBJECT('open', '08:00', 'close', '23:00'),
   'sunday', JSON_OBJECT('open', '08:00', 'close', '22:00')
 ));

-- 지점 2 (Branch 2)
INSERT INTO branches (branch_code, branch_name, branch_type, address, phone, manager_name, status, opening_hours) VALUES
('BR002', '홍대점', 'branch', '서울특별시 마포구 홍대입구 789', '02-3456-7890', '박홍대', 'active',
 JSON_OBJECT(
   'monday', JSON_OBJECT('open', '08:00', 'close', '24:00'),
   'tuesday', JSON_OBJECT('open', '08:00', 'close', '24:00'),
   'wednesday', JSON_OBJECT('open', '08:00', 'close', '24:00'),
   'thursday', JSON_OBJECT('open', '08:00', 'close', '24:00'),
   'friday', JSON_OBJECT('open', '08:00', 'close', '24:00'),
   'saturday', JSON_OBJECT('open', '08:00', 'close', '24:00'),
   'sunday', JSON_OBJECT('open', '08:00', 'close', '24:00')
 ));

-- =====================================================
-- 2. 지점별 메뉴 가용성 설정
-- =====================================================

-- 본사점 메뉴 설정 (모든 메뉴 사용 가능)
INSERT INTO branch_menus (branch_id, menu_id, is_available, custom_price, stock_quantity)
SELECT 
    (SELECT branch_id FROM branches WHERE branch_code = 'HQ001'),
    id,
    TRUE,
    NULL,
    -1
FROM menus;

-- 강남점 메뉴 설정 (일부 메뉴 커스텀 가격)
INSERT INTO branch_menus (branch_id, menu_id, is_available, custom_price, stock_quantity)
SELECT 
    (SELECT branch_id FROM branches WHERE branch_code = 'BR001'),
    id,
    TRUE,
    CASE 
        WHEN category = 'burger' THEN price * 1.1  -- 햄버거 10% 가격 인상
        WHEN category = 'set' THEN price * 1.05   -- 세트 5% 가격 인상
        ELSE NULL                                 -- 나머지는 기본 가격
    END,
    -1
FROM menus;

-- 홍대점 메뉴 설정 (일부 메뉴 커스텀 가격)
INSERT INTO branch_menus (branch_id, menu_id, is_available, custom_price, stock_quantity)
SELECT 
    (SELECT branch_id FROM branches WHERE branch_code = 'BR002'),
    id,
    TRUE,
    CASE 
        WHEN category = 'burger' THEN price * 0.95  -- 햄버거 5% 가격 할인
        WHEN category = 'set' THEN price * 0.98    -- 세트 2% 가격 할인
        ELSE NULL                                  -- 나머지는 기본 가격
    END,
    -1
FROM menus;

-- =====================================================
-- 3. 지점별 데이터 확인 쿼리
-- =====================================================

-- 지점별 메뉴 현황 확인
SELECT 
    b.branch_name,
    COUNT(bm.menu_id) as total_menus,
    COUNT(CASE WHEN bm.is_available = TRUE THEN 1 END) as available_menus,
    COUNT(CASE WHEN bm.custom_price IS NOT NULL THEN 1 END) as custom_price_menus
FROM branches b
LEFT JOIN branch_menus bm ON b.branch_id = bm.branch_id
GROUP BY b.branch_id, b.branch_name;
