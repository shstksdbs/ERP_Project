-- 02_branch_setup.sql
-- 지점 정보 및 지점별 데이터베이스 설정

-- =====================================================
-- 1. 지점 정보 데이터 삽입
-- =====================================================

-- 지점 1 (강남점)
INSERT INTO branches (branch_code, branch_name, branch_type, address, phone, manager_name, status, opening_hours, opening_date) VALUES
('GN001', '강남점', 'branch', '서울특별시 강남구 역삼동 456', '02-2345-6789', '박지점장', 'active', '07:00 - 23:00', '2023-03-15');

-- 지점 2 (홍대점)
INSERT INTO branches (branch_code, branch_name, branch_type, address, phone, manager_name, status, opening_hours, opening_date) VALUES
('HD001', '홍대점', 'branch', '서울특별시 마포구 홍대입구 789', '02-3456-7890', '한지점장', 'active', '08:00 - 24:00', '2023-06-22');

-- 지점 3 (신촌점)
INSERT INTO branches (branch_code, branch_name, branch_type, address, phone, manager_name, status, opening_hours, opening_date) VALUES
('SC001', '신촌점', 'branch', '서울특별시 서대문구 신촌동 101', '02-4567-8901', '강지점장', 'active', '07:30 - 22:30', '2023-09-08');

-- 지점 4 (잠실점)
INSERT INTO branches (branch_code, branch_name, branch_type, address, phone, manager_name, status, opening_hours, opening_date) VALUES
('JS001', '잠실점', 'branch', '서울특별시 송파구 잠실동 202', '02-5678-9012', '구지점장', 'active', '08:00 - 23:00', '2024-01-12');

-- 지점 5 (송파점)
INSERT INTO branches (branch_code, branch_name, branch_type, address, phone, manager_name, status, opening_hours, opening_date) VALUES
('SP001', '송파점', 'branch', '서울특별시 송파구 송파동 303', '02-6789-0123', '신지점장', 'active', '07:00 - 22:00', '2024-04-05');

-- =====================================================
-- 2. 지점별 메뉴 가용성 설정
-- =====================================================

-- 강남점 메뉴 설정 (일부 메뉴 커스텀 가격)
INSERT INTO branch_menus (branch_id, menu_id, is_available, custom_price, stock_quantity)
SELECT 
    (SELECT branch_id FROM branches WHERE branch_code = 'GN001'),
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
    (SELECT branch_id FROM branches WHERE branch_code = 'HD001'),
    id,
    TRUE,
    CASE 
        WHEN category = 'burger' THEN price * 0.95  -- 햄버거 5% 가격 할인
        WHEN category = 'set' THEN price * 0.98    -- 세트 2% 가격 할인
        ELSE NULL                                  -- 나머지는 기본 가격
    END,
    -1
FROM menus;

-- 신촌점 메뉴 설정 (기본 가격)
INSERT INTO branch_menus (branch_id, menu_id, is_available, custom_price, stock_quantity)
SELECT 
    (SELECT branch_id FROM branches WHERE branch_code = 'SC001'),
    id,
    TRUE,
    NULL,  -- 기본 가격 사용
    -1
FROM menus;

-- 잠실점 메뉴 설정 (일부 메뉴 커스텀 가격)
INSERT INTO branch_menus (branch_id, menu_id, is_available, custom_price, stock_quantity)
SELECT 
    (SELECT branch_id FROM branches WHERE branch_code = 'JS001'),
    id,
    TRUE,
    CASE 
        WHEN category = 'drink' THEN price * 1.05  -- 음료 5% 가격 인상
        ELSE NULL                                 -- 나머지는 기본 가격
    END,
    -1
FROM menus;

-- 송파점 메뉴 설정 (기본 가격)
INSERT INTO branch_menus (branch_id, menu_id, is_available, custom_price, stock_quantity)
SELECT 
    (SELECT branch_id FROM branches WHERE branch_code = 'SP001'),
    id,
    TRUE,
    NULL,  -- 기본 가격 사용
    -1
FROM menus;

-- =====================================================
-- 3. 지점별 데이터 확인 쿼리
-- =====================================================

-- 지점별 메뉴 현황 확인
SELECT 
    b.branch_name,
    b.branch_code,
    COUNT(bm.menu_id) as total_menus,
    COUNT(CASE WHEN bm.is_available = TRUE THEN 1 END) as available_menus,
    COUNT(CASE WHEN bm.custom_price IS NOT NULL THEN 1 END) as custom_price_menus
FROM branches b
LEFT JOIN branch_menus bm ON b.branch_id = bm.branch_id
GROUP BY b.branch_id, b.branch_name, b.branch_code
ORDER BY b.branch_id;

-- 지점별 사용자 현황 확인 (users 테이블과 연동)
SELECT 
    b.branch_name,
    b.branch_code,
    COUNT(u.id) as total_users,
    COUNT(CASE WHEN u.is_active = TRUE THEN 1 END) as active_users,
    COUNT(CASE WHEN u.role = 'ADMIN' THEN 1 END) as admin_count,
    COUNT(CASE WHEN u.role = 'MANAGER' THEN 1 END) as manager_count,
    COUNT(CASE WHEN u.role = 'STAFF' THEN 1 END) as staff_count
FROM branches b
LEFT JOIN users u ON b.branch_id = u.branch_id
GROUP BY b.branch_id, b.branch_name, b.branch_code
ORDER BY b.branch_id;
