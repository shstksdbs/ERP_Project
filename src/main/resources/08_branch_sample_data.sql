-- 08_branch_sample_data.sql
-- 지점별 샘플 데이터

-- =====================================================
-- 1. 지점별 메뉴 가용성 설정 (메뉴 데이터 생성 후 실행)
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
-- 2. 샘플 주문 데이터 생성 (테스트용)
-- =====================================================

-- 강남점 샘플 주문
INSERT INTO orders (branch_id, order_number, order_status, order_type, customer_name, total_amount, discount_amount, final_amount, payment_method, payment_status, order_time) VALUES
((SELECT branch_id FROM branches WHERE branch_code = 'BR001'), 'BR001-001', 'completed', 'dine_in', '김고객', 8500, 0, 8500, 'card', 'completed', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
((SELECT branch_id FROM branches WHERE branch_code = 'BR001'), 'BR001-002', 'preparing', 'takeout', '이고객', 12000, 500, 11500, 'cash', 'completed', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
((SELECT branch_id FROM branches WHERE branch_code = 'BR001'), 'BR001-003', 'pending', 'dine_in', '박고객', 7000, 0, 7000, 'mobile', 'pending', NOW());

-- 홍대점 샘플 주문
INSERT INTO orders (branch_id, order_number, order_status, order_type, customer_name, total_amount, discount_amount, final_amount, payment_method, payment_status, order_time) VALUES
((SELECT branch_id FROM branches WHERE branch_code = 'BR002'), 'BR002-001', 'ready', 'dine_in', '최고객', 9500, 0, 9500, 'mobile', 'completed', DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
((SELECT branch_id FROM branches WHERE branch_code = 'BR002'), 'BR002-002', 'confirmed', 'takeout', '정고객', 15000, 1500, 13500, 'card', 'completed', DATE_SUB(NOW(), INTERVAL 15 MINUTE));

-- 본사점 샘플 주문
INSERT INTO orders (branch_id, order_number, order_status, order_type, customer_name, total_amount, discount_amount, final_amount, payment_method, payment_status, order_time) VALUES
((SELECT branch_id FROM branches WHERE branch_code = 'HQ001'), 'HQ001-001', 'completed', 'dine_in', '본사직원', 5000, 0, 5000, 'card', 'completed', DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- =====================================================
-- 3. 주문 상세 데이터 생성
-- =====================================================

-- 강남점 주문 상세
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
WHERE o.order_number IN ('BR001-001', 'BR001-002')
LIMIT 2;

-- 홍대점 주문 상세
INSERT INTO order_items (order_id, menu_id, menu_name, unit_price, quantity, total_price, options_json, display_name, display_options)
SELECT 
    o.order_id,
    m.id,
    m.name,
    COALESCE(bm.custom_price, m.price),
    1,
    COALESCE(bm.custom_price, m.price),
    JSON_OBJECT('addOptions', JSON_ARRAY('베이컨'), 'removeOptions', JSON_ARRAY()),
    CONCAT(m.name, ' (베이컨 추가)'),
    JSON_ARRAY('+베이컨')
FROM orders o
JOIN menus m ON m.category = 'burger'
JOIN branch_menus bm ON m.id = bm.menu_id AND bm.branch_id = o.branch_id
WHERE o.order_number IN ('BR002-001', 'BR002-002')
LIMIT 2;

-- 본사점 주문 상세
INSERT INTO order_items (order_id, menu_id, menu_name, unit_price, quantity, total_price, options_json, display_name, display_options)
SELECT 
    o.order_id,
    m.id,
    m.name,
    COALESCE(bm.custom_price, m.price),
    1,
    COALESCE(bm.custom_price, m.price),
    JSON_OBJECT('addOptions', JSON_ARRAY(), 'removeOptions', JSON_ARRAY()),
    m.name,
    JSON_ARRAY()
FROM orders o
JOIN menus m ON m.category = 'side'
JOIN branch_menus bm ON m.id = bm.menu_id AND bm.branch_id = o.branch_id
WHERE o.order_number = 'HQ001-001'
LIMIT 1;

-- =====================================================
-- 4. 결제 데이터 생성
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
-- 5. 시스템 로그 샘플 데이터
-- =====================================================

INSERT INTO system_logs (branch_id, log_level, log_category, message, details) VALUES
((SELECT branch_id FROM branches WHERE branch_code = 'BR002'), 'WARNING', 'INVENTORY', '재고 부족: 양상추', 
 JSON_OBJECT('ingredient_id', (SELECT ingredient_id FROM ingredients WHERE name = '양상추'), 'current_stock', 1800, 'min_stock', 1200, 'unit', 'g')),
((SELECT branch_id FROM branches WHERE branch_code = 'BR001'), 'INFO', 'ORDER', '새로운 주문 접수', 
 JSON_OBJECT('order_id', (SELECT order_id FROM orders WHERE order_number = 'BR001-001'), 'order_amount', 8500)),
((SELECT branch_id FROM branches WHERE branch_code = 'BR002'), 'INFO', 'PROMOTION', '할인 프로모션 적용', 
 JSON_OBJECT('promotion_id', 6, 'order_id', (SELECT order_id FROM orders WHERE order_number = 'BR002-002'), 'discount_amount', 1500)),
(NULL, 'INFO', 'SYSTEM', '데이터베이스 백업 완료', 
 JSON_OBJECT('backup_time', NOW(), 'backup_size', '256MB', 'status', 'success'));

-- =====================================================
-- 6. 매출 통계 초기 데이터
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
-- 7. 할인 프로모션 사용 내역 샘플 데이터
-- =====================================================

-- 홍대점 신규 지점 오픈 할인 사용 내역
INSERT INTO discount_usage_history (promotion_id, order_id, branch_id, applied_amount, original_amount, final_amount, customer_name, customer_phone)
SELECT 
    6,  -- 신규 지점 오픈 할인
    o.order_id,
    o.branch_id,
    o.discount_amount,
    o.total_amount,
    o.final_amount,
    o.customer_name,
    o.customer_phone
FROM orders o
WHERE o.branch_id = (SELECT branch_id FROM branches WHERE branch_code = 'BR002')
    AND o.discount_amount > 0;

-- =====================================================
-- 8. 데이터 검증 쿼리
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
    AVG(o.final_amount) as avg_order_value,
    SUM(o.discount_amount) as total_discount
FROM branches b
LEFT JOIN orders o ON b.branch_id = o.branch_id
GROUP BY b.branch_id, b.branch_name;

-- 활성화된 할인 프로모션 확인
SELECT * FROM active_promotions;

-- 지점별 적용 가능한 할인 프로모션 확인
SELECT * FROM branch_available_promotions;
