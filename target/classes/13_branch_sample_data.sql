-- 13_branch_sample_data.sql
-- 지점 3개를 위한 샘플 데이터 생성

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
-- 3. 재료 정보 데이터 삽입
-- =====================================================

INSERT INTO ingredients (name, category, unit, cost_per_unit, supplier, is_active) VALUES
-- 빵류
('번', 'bread', '개', 200, '신성제과', TRUE),
('통밀번', 'bread', '개', 300, '신성제과', TRUE),
('브리오슈번', 'bread', '개', 400, '신성제과', TRUE),

-- 패티류
('소고기패티', 'patty', '개', 800, '한우공장', TRUE),
('치킨패티', 'patty', '개', 600, '닭고기공장', TRUE),
('돈까스패티', 'patty', '개', 700, '돈까스공장', TRUE),

-- 채소류
('양상추', 'vegetable', 'g', 0.5, '농협', TRUE),
('토마토', 'vegetable', '개', 150, '농협', TRUE),
('양파', 'vegetable', 'g', 0.3, '농협', TRUE),
('피클', 'vegetable', 'g', 0.8, '농협', TRUE),

-- 치즈류
('체다치즈', 'cheese', '장', 200, '서울우유', TRUE),
('모짜렐라치즈', 'cheese', '장', 250, '서울우유', TRUE),

-- 소스류
('케찹', 'sauce', 'ml', 0.1, '오리온', TRUE),
('머스타드', 'sauce', 'ml', 0.2, '오리온', TRUE),
('마요네즈', 'sauce', 'ml', 0.15, '오리온', TRUE),

-- 사이드류
('감자튀김', 'side', 'g', 0.8, '농심', TRUE),
('치킨너겟', 'side', '개', 300, '교촌', TRUE),
('치즈스틱', 'side', '개', 400, '교촌', TRUE),

-- 음료류
('콜라', 'drink', 'ml', 0.05, '코카콜라', TRUE),
('사이다', 'drink', 'ml', 0.05, '칠성', TRUE),
('오렌지주스', 'drink', 'ml', 0.1, '델몬트', TRUE);

-- =====================================================
-- 4. 지점별 재고 현황 설정
-- =====================================================

-- 본사점 재고 (충분한 재고)
INSERT INTO inventory (branch_id, ingredient_id, current_stock, unit, min_stock, max_stock)
SELECT 
    (SELECT branch_id FROM branches WHERE branch_code = 'HQ001'),
    ingredient_id,
    max_stock * 0.8,  -- 80% 수준의 재고
    unit,
    min_stock,
    max_stock
FROM (
    SELECT 
        ingredient_id,
        unit,
        CASE 
            WHEN unit = '개' THEN 100
            WHEN unit = 'g' THEN 10000
            WHEN unit = 'ml' THEN 50000
            WHEN unit = '장' THEN 200
        END as max_stock,
        CASE 
            WHEN unit = '개' THEN 20
            WHEN unit = 'g' THEN 2000
            WHEN unit = 'ml' THEN 10000
            WHEN unit = '장' THEN 40
        END as min_stock
    FROM ingredients
) stock_info;

-- 강남점 재고 (보통 수준의 재고)
INSERT INTO inventory (branch_id, ingredient_id, current_stock, unit, min_stock, max_stock)
SELECT 
    (SELECT branch_id FROM branches WHERE branch_code = 'BR001'),
    ingredient_id,
    max_stock * 0.6,  -- 60% 수준의 재고
    unit,
    min_stock,
    max_stock
FROM (
    SELECT 
        ingredient_id,
        unit,
        CASE 
            WHEN unit = '개' THEN 80
            WHEN unit = 'g' THEN 8000
            WHEN unit = 'ml' THEN 40000
            WHEN unit = '장' THEN 150
        END as max_stock,
        CASE 
            WHEN unit = '개' THEN 15
            WHEN unit = 'g' THEN 1500
            WHEN unit = 'ml' THEN 8000
            WHEN unit = '장' THEN 30
        END as min_stock
    FROM ingredients
) stock_info;

-- 홍대점 재고 (낮은 수준의 재고 - 일부 부족 상황 시연용)
INSERT INTO inventory (branch_id, ingredient_id, current_stock, unit, min_stock, max_stock)
SELECT 
    (SELECT branch_id FROM branches WHERE branch_code = 'BR002'),
    ingredient_id,
    CASE 
        WHEN name IN ('양상추', '토마토') THEN max_stock * 0.3  -- 채소류는 30%로 낮게 설정
        ELSE max_stock * 0.5  -- 나머지는 50% 수준
    END,
    unit,
    min_stock,
    max_stock
FROM (
    SELECT 
        i.ingredient_id,
        i.name,
        i.unit,
        CASE 
            WHEN i.unit = '개' THEN 60
            WHEN i.unit = 'g' THEN 6000
            WHEN i.unit = 'ml' THEN 30000
            WHEN i.unit = '장' THEN 100
        END as max_stock,
        CASE 
            WHEN i.unit = '개' THEN 12
            WHEN i.unit = 'g' THEN 1200
            WHEN i.unit = 'ml' THEN 6000
            WHEN i.unit = '장' THEN 20
        END as min_stock
    FROM ingredients i
) stock_info;

-- =====================================================
-- 5. 메뉴별 재료 소요량 설정
-- =====================================================

-- 햄버거 메뉴 재료 소요량
INSERT INTO menu_ingredients (menu_id, ingredient_id, quantity_per_serving, unit)
SELECT 
    m.id,
    i.ingredient_id,
    CASE 
        WHEN i.name = '번' THEN 2
        WHEN i.name = '소고기패티' THEN 1
        WHEN i.name = '양상추' THEN 30
        WHEN i.name = '토마토' THEN 0.5
        WHEN i.name = '양파' THEN 20
        WHEN i.name = '체다치즈' THEN 1
        WHEN i.name = '케찹' THEN 15
        WHEN i.name = '머스타드' THEN 10
        WHEN i.name = '마요네즈' THEN 10
        ELSE 0
    END,
    i.unit
FROM menus m
CROSS JOIN ingredients i
WHERE m.category = 'burger' 
    AND i.name IN ('번', '소고기패티', '양상추', '토마토', '양파', '체다치즈', '케찹', '머스타드', '마요네즈')
    AND CASE 
        WHEN i.name = '번' THEN 2
        WHEN i.name = '소고기패티' THEN 1
        WHEN i.name = '양상추' THEN 30
        WHEN i.name = '토마토' THEN 0.5
        WHEN i.name = '양파' THEN 20
        WHEN i.name = '체다치즈' THEN 1
        WHEN i.name = '케찹' THEN 15
        WHEN i.name = '머스타드' THEN 10
        WHEN i.name = '마요네즈' THEN 10
        ELSE 0
    END > 0;

-- 세트 메뉴 재료 소요량
INSERT INTO menu_ingredients (menu_id, ingredient_id, quantity_per_serving, unit)
SELECT 
    m.id,
    i.ingredient_id,
    CASE 
        WHEN i.name = '감자튀김' THEN 100
        WHEN i.name = '콜라' THEN 500
        ELSE 0
    END,
    i.unit
FROM menus m
CROSS JOIN ingredients i
WHERE m.category = 'set' 
    AND i.name IN ('감자튀김', '콜라')
    AND CASE 
        WHEN i.name = '감자튀김' THEN 100
        WHEN i.name = '콜라' THEN 500
        ELSE 0
    END > 0;

-- =====================================================
-- 6. 샘플 주문 데이터 생성 (테스트용)
-- =====================================================

-- 강남점 샘플 주문
INSERT INTO orders (branch_id, order_number, order_status, order_type, customer_name, total_amount, discount_amount, final_amount, payment_method, payment_status, order_time) VALUES
((SELECT branch_id FROM branches WHERE branch_code = 'BR001'), 'BR001-001', 'completed', 'dine_in', '김고객', 8500, 0, 8500, 'card', 'completed', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
((SELECT branch_id FROM branches WHERE branch_code = 'BR001'), 'BR001-002', 'preparing', 'takeout', '이고객', 12000, 500, 11500, 'cash', 'completed', DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- 홍대점 샘플 주문
INSERT INTO orders (branch_id, order_number, order_status, order_type, customer_name, total_amount, discount_amount, final_amount, payment_method, payment_status, order_time) VALUES
((SELECT branch_id FROM branches WHERE branch_code = 'BR002'), 'BR002-001', 'ready', 'dine_in', '박고객', 9500, 0, 9500, 'mobile', 'completed', DATE_SUB(NOW(), INTERVAL 30 MINUTE));

-- 주문 상세 데이터
INSERT INTO order_items (order_id, menu_id, menu_name, unit_price, quantity, total_price, options_json, display_name, display_options)
SELECT 
    o.order_id,
    m.id,
    m.name,
    COALESCE(bm.custom_price, m.price),
    1,
    COALESCE(bm.custom_price, m.price),
    JSON_OBJECT('addOptions', JSON_ARRAY('치즈'), 'removeOptions', JSON_ARRAY('양파')),
    CONCAT(m.name, ' (치즈 추가, 양파 제거)'),
    JSON_ARRAY('+치즈', '-양파')
FROM orders o
JOIN menus m ON m.category = 'burger'
JOIN branch_menus bm ON m.id = bm.menu_id AND bm.branch_id = o.branch_id
WHERE o.order_number IN ('BR001-001', 'BR001-002', 'BR002-001')
LIMIT 3;

-- =====================================================
-- 7. 결제 데이터 생성
-- =====================================================

INSERT INTO payments (order_id, payment_method, payment_amount, payment_status, transaction_id, payment_time)
SELECT 
    order_id,
    payment_method,
    final_amount,
    payment_status,
    CONCAT('TXN-', LPAD(order_id, 6, '0')),
    order_time
FROM orders
WHERE payment_status = 'completed';

-- =====================================================
-- 8. 시스템 로그 샘플 데이터
-- =====================================================

INSERT INTO system_logs (branch_id, log_level, log_category, message, details) VALUES
((SELECT branch_id FROM branches WHERE branch_code = 'BR002'), 'WARNING', 'INVENTORY', '재고 부족: 양상추', 
 JSON_OBJECT('ingredient_id', (SELECT ingredient_id FROM ingredients WHERE name = '양상추'), 'current_stock', 1800, 'min_stock', 1200, 'unit', 'g')),
((SELECT branch_id FROM branches WHERE branch_code = 'BR001'), 'INFO', 'ORDER', '새로운 주문 접수', 
 JSON_OBJECT('order_id', (SELECT order_id FROM orders WHERE order_number = 'BR001-001'), 'order_amount', 8500)),
(NULL, 'INFO', 'SYSTEM', '데이터베이스 백업 완료', 
 JSON_OBJECT('backup_time', NOW(), 'backup_size', '256MB', 'status', 'success'));

-- =====================================================
-- 9. 매출 통계 초기 데이터
-- =====================================================

-- 어제 매출 데이터
INSERT INTO daily_sales_summary (branch_id, sale_date, total_orders, total_revenue, total_cost, gross_profit, discount_total)
SELECT 
    b.branch_id,
    DATE_SUB(CURDATE(), INTERVAL 1 DAY),
    FLOOR(RAND() * 50) + 20,  -- 20-70개 주문
    FLOOR(RAND() * 500000) + 200000,  -- 20만-70만원 매출
    FLOOR(RAND() * 300000) + 150000,  -- 15만-45만원 비용
    FLOOR(RAND() * 200000) + 50000,   -- 5만-25만원 이익
    FLOOR(RAND() * 50000) + 10000     -- 1만-6만원 할인
FROM branches b
WHERE b.branch_type = 'branch';

-- 시간별 매출 데이터 (어제)
INSERT INTO hourly_sales (branch_id, sale_date, hour, order_count, revenue)
SELECT 
    b.branch_id,
    DATE_SUB(CURDATE(), INTERVAL 1 DAY),
    h.hour,
    FLOOR(RAND() * 10) + 1,  -- 1-10개 주문
    FLOOR(RAND() * 50000) + 10000  -- 1만-6만원 매출
FROM branches b
CROSS JOIN (
    SELECT 0 as hour UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
    SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION
    SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION
    SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION SELECT 22 UNION SELECT 23
) h
WHERE b.branch_type = 'branch' AND h.hour BETWEEN 7 AND 23;  -- 영업시간만

-- =====================================================
-- 10. 데이터 검증 쿼리
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

-- 지점별 재고 현황 확인
SELECT 
    b.branch_name,
    COUNT(inv.inventory_id) as total_ingredients,
    COUNT(CASE WHEN inv.current_stock <= inv.min_stock THEN 1 END) as low_stock_items,
    COUNT(CASE WHEN inv.current_stock = 0 THEN 1 END) as out_of_stock_items
FROM branches b
LEFT JOIN inventory inv ON b.branch_id = inv.branch_id
GROUP BY b.branch_id, b.branch_name;

-- 지점별 주문 현황 확인
SELECT 
    b.branch_name,
    COUNT(o.order_id) as total_orders,
    SUM(o.final_amount) as total_revenue,
    AVG(o.final_amount) as avg_order_value
FROM branches b
LEFT JOIN orders o ON b.branch_id = o.branch_id
GROUP BY b.branch_id, b.branch_name;
