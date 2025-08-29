-- 03_option_data.sql
-- 옵션 데이터

-- =====================================================
-- 0. 테이블 구조 확인 및 unique key 추가
-- =====================================================

-- menu_options 테이블에 name 필드에 unique key 추가 (없는 경우)
ALTER TABLE menu_options ADD UNIQUE KEY uk_menu_options_name (name);

-- =====================================================
-- 1. 메뉴 옵션 데이터
-- =====================================================

-- 토핑 옵션
INSERT INTO menu_options (name, display_name, category, price, is_available, display_order, description, created_at, updated_at) VALUES
('tomato', '토마토', 'topping', 300.00, true, 1, '신선한 토마토 슬라이스', NOW(), NOW()),
('onion', '양파', 'topping', 300.00, true, 2, '아삭한 양파 슬라이스', NOW(), NOW()),
('lettuce', '양상추', 'topping', 300.00, true, 3, '신선한 양상추', NOW(), NOW()),
('pickle', '피클', 'topping', 300.00, true, 5, '신맛 피클', NOW(), NOW()),
('cheese', '치즈', 'topping', 500.00, true, 4, '녹는 치즈 (개수 선택 가능)', NOW(), NOW()),
('bacon', '베이컨', 'topping', 700.00, true, 6, '바삭한 베이컨 (개수 선택 가능)', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    display_name = VALUES(display_name),
    category = VALUES(category),
    price = VALUES(price),
    is_available = VALUES(is_available),
    display_order = VALUES(display_order),
    description = VALUES(description),
    updated_at = NOW();

-- 사이드 변경 옵션
INSERT INTO menu_options (name, display_name, category, price, is_available, display_order, description, created_at, updated_at) VALUES
('frenchFries', '감자튀김', 'side', 0.00, true, 1, '바삭한 프렌치프라이', NOW(), NOW()),
('seasonedFries', '양념감자', 'side', 500.00, true, 2, '매콤달콤한 양념감자', NOW(), NOW()),
('cornSalad', '콘샐러드', 'side', 700.00, true, 3, '신선한 콘샐러드', NOW(), NOW()),
('onionRings', '어니언링', 'side', 800.00, true, 4, '고소한 어니언링 6개', NOW(), NOW()),
('chickenNuggets', '치킨너겟', 'side', 1000.00, true, 5, '바삭한 치킨너겟 8개', NOW(), NOW()),
('cheeseSticks', '치즈스틱', 'side', 1500.00, true, 6, '치즈가 가득한 치즈스틱 2개', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    display_name = VALUES(display_name),
    category = VALUES(category),
    price = VALUES(price),
    is_available = VALUES(is_available),
    display_order = VALUES(display_order),
    description = VALUES(description),
    updated_at = NOW();

-- 음료 변경 옵션
INSERT INTO menu_options (name, display_name, category, price, is_available, display_order, description, created_at, updated_at) VALUES
('cola', '콜라', 'drink', 0.00, true, 1, '시원한 콜라', NOW(), NOW()),
('sprite', '스프라이트', 'drink', 0.00, true, 2, '상큼한 스프라이트', NOW(), NOW()),
('zeroCola', '제로콜라', 'drink', 0.00, true, 3, '칼로리 0 콜라', NOW(), NOW()),
('zeroSprite', '제로스프라이트', 'drink', 0.00, true, 4, '칼로리 0 스프라이트', NOW(), NOW()),
('americano', '아메리카노', 'drink', 1000.00, true, 5, '깊은 맛의 아메리카노', NOW(), NOW()),
('orangeJuice', '오렌지주스', 'drink', 1200.00, true, 6, '신선한 오렌지주스', NOW(), NOW()),
('milkShake', '밀크쉐이크', 'drink', 1800.00, true, 7, '부드러운 밀크쉐이크', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    display_name = VALUES(display_name),
    category = VALUES(category),
    price = VALUES(price),
    is_available = VALUES(is_available),
    display_order = VALUES(display_order),
    description = VALUES(description),
    updated_at = NOW();

-- -- =====================================================
-- -- 2. 템플릿-옵션 관계 데이터
-- -- =====================================================

-- -- 기본버거옵션 템플릿
-- INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order) VALUES
-- (1, 1, true, true, true, 1),   -- 토마토 (기본, 제거/추가 가능)
-- (1, 2, true, true, true, 2),   -- 양파 (기본, 제거/추가 가능)
-- (1, 3, true, true, true, 3),   -- 양상추 (기본, 제거/추가 가능)
-- (1, 4, true, true, true, 4),   -- 치즈 (기본, 제거/추가 가능)
-- (1, 5, true, true, true, 5),   -- 피클 (기본, 제거/추가 가능)
-- (1, 9, true, true, true, 6),   -- 케찹 (기본, 제거/추가 가능)
-- (1, 10, true, true, true, 7),  -- 머스타드 (기본, 제거/추가 가능)
-- (1, 6, false, true, true, 8),  -- 베이컨 (기본 아님, 추가 가능)
-- (1, 7, false, true, true, 9),  -- 계란 (기본 아님, 추가 가능)
-- (1, 8, false, true, true, 10); -- 아보카도 (기본 아님, 추가 가능)

-- -- 프리미엄버거옵션 템플릿
-- INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order) VALUES
-- (2, 1, true, true, true, 1),   -- 토마토
-- (2, 2, true, true, true, 2),   -- 양파
-- (2, 3, true, true, true, 3),   -- 양상추
-- (2, 4, true, true, true, 4),   -- 치즈
-- (2, 5, false, true, true, 5),  -- 피클
-- (2, 6, true, true, true, 6),   -- 베이컨 (기본 포함)
-- (2, 7, false, true, true, 7),  -- 계란
-- (2, 8, false, true, true, 8),  -- 아보카도
-- (2, 9, true, true, true, 9),   -- 케찹
-- (2, 10, true, true, true, 10), -- 머스타드
-- (2, 11, true, true, true, 11), -- 마요네즈
-- (2, 12, false, true, true, 12);-- BBQ소스

-- -- 치킨버거옵션 템플릿
-- INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order) VALUES
-- (3, 1, true, true, true, 1),   -- 토마토
-- (3, 2, true, true, true, 2),   -- 양파
-- (3, 3, true, true, true, 3),   -- 양상추
-- (3, 4, false, true, true, 4),  -- 치즈 (기본 아님)
-- (3, 5, false, true, true, 5),  -- 피클
-- (3, 9, true, true, true, 6),   -- 케찹
-- (3, 10, true, true, true, 7),  -- 머스타드
-- (3, 11, true, true, true, 8),  -- 마요네즈
-- (3, 12, false, true, true, 9); -- BBQ소스

-- -- 새우버거옵션 템플릿
-- INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order) VALUES
-- (4, 1, true, true, true, 1),   -- 토마토
-- (4, 2, true, true, true, 2),   -- 양파
-- (4, 3, true, true, true, 3),   -- 양상추
-- (4, 4, false, true, true, 4),  -- 치즈
-- (4, 5, false, true, true, 5),  -- 피클
-- (4, 9, true, true, true, 6),   -- 케찹
-- (4, 10, true, true, true, 7),  -- 머스타드
-- (4, 11, true, true, true, 8),  -- 마요네즈
-- (4, 13, false, true, true, 9); -- 핫소스

-- -- 세트옵션 템플릿
-- INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order) VALUES
-- (5, 17, false, true, true, 1), -- 사이즈 변경
-- (5, 18, false, true, true, 2), -- 소스 추가
-- (5, 19, false, true, true, 3), -- 치즈 추가
-- (5, 20, false, true, true, 4), -- 고기 추가
-- (5, 21, false, true, true, 5), -- 얼음 옵션
-- (5, 25, false, true, true, 6); -- 당도 옵션

-- -- 사이드옵션 템플릿
-- INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order) VALUES
-- (6, 17, false, true, true, 1), -- 사이즈 변경
-- (6, 18, false, true, true, 2); -- 소스 추가

-- -- 음료옵션 템플릿
-- INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order) VALUES
-- (7, 21, true, true, true, 1),  -- 얼음 옵션 (기본)
-- (7, 25, true, true, true, 2);  -- 당도 옵션 (기본)

-- =====================================================
-- 3. 옵션 데이터 확인
-- =====================================================

-- 옵션별 사용 현황 확인
SELECT 
    mo.category,
    COUNT(tor.option_id) as total_usage,
    SUM(CASE WHEN tor.is_default = true THEN 1 ELSE 0 END) as default_count
FROM menu_options mo
LEFT JOIN template_option_relations tor ON mo.id = tor.option_id
GROUP BY mo.category
ORDER BY mo.category;

-- =====================================================
-- 4. 데이터 무결성 확인
-- =====================================================

-- 중복된 name이 있는지 확인
SELECT name, COUNT(*) as duplicate_count
FROM menu_options 
GROUP BY name 
HAVING COUNT(*) > 1;

-- unique key 제약조건 확인
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    CONSTRAINT_TYPE
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'menu_options' 
    AND CONSTRAINT_NAME = 'uk_menu_options_name';

-- =====================================================
-- 5. 실행 후 확인사항
-- =====================================================
-- 1. unique key가 정상적으로 생성되었는지 확인
-- 2. 중복 데이터가 없는지 확인  
-- 3. 옵션 데이터가 정상적으로 삽입되었는지 확인
-- 4. 실행할 때마다 데이터가 중복으로 쌓이지 않는지 확인
