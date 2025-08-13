-- 05_option_data.sql
-- 옵션 데이터

-- =====================================================
-- 1. 메뉴 옵션 데이터
-- =====================================================

-- 토핑 옵션
INSERT INTO menu_options (name, display_name, category, price, is_available, display_order, description, created_at, updated_at) VALUES
('tomato', '토마토', 'topping', 300.00, true, 1, '신선한 토마토 슬라이스', NOW(), NOW()),
('onion', '양파', 'topping', 300.00, true, 2, '아삭한 양파 슬라이스', NOW(), NOW()),
('lettuce', '양상추', 'topping', 300.00, true, 3, '신선한 양상추', NOW(), NOW()),
('cheese', '치즈', 'topping', 300.00, true, 4, '녹는 치즈 (개수 선택 가능)', NOW(), NOW()),
('pickle', '피클', 'topping', 0.00, true, 5, '신맛 피클', NOW(), NOW()),
('bacon', '베이컨', 'topping', 500.00, true, 6, '바삭한 베이컨 (개수 선택 가능)', NOW(), NOW()),
('egg', '계란', 'topping', 400.00, true, 7, '신선한 계란', NOW(), NOW()),
('avocado', '아보카도', 'topping', 800.00, true, 8, '신선한 아보카도', NOW(), NOW());

-- 소스 옵션
INSERT INTO menu_options (name, display_name, category, price, is_available, display_order, description, created_at, updated_at) VALUES
('ketchup', '케찹', 'sauce', 0.00, true, 1, '클래식 케찹', NOW(), NOW()),
('mustard', '머스타드', 'sauce', 0.00, true, 2, '매콤한 머스타드', NOW(), NOW()),
('mayo', '마요네즈', 'sauce', 0.00, true, 3, '부드러운 마요네즈', NOW(), NOW()),
('bbq', 'BBQ소스', 'sauce', 0.00, true, 4, '달콤한 BBQ소스', NOW(), NOW()),
('hot', '핫소스', 'sauce', 0.00, true, 5, '매운 핫소스', NOW(), NOW()),
('ranch', '랜치소스', 'sauce', 0.00, true, 6, '고소한 랜치소스', NOW(), NOW()),
('sweet', '스위트칠리', 'sauce', 0.00, true, 7, '달콤한 스위트칠리', NOW(), NOW()),
('garlic', '갈릭소스', 'sauce', 0.00, true, 8, '향긋한 갈릭소스', NOW(), NOW());

-- 사이드 옵션
INSERT INTO menu_options (name, display_name, category, price, is_available, display_order, description, created_at, updated_at) VALUES
('size_small', '소사이즈', 'size', -500.00, true, 1, '소사이즈 (500원 할인)', NOW(), NOW()),
('size_large', '대사이즈', 'size', 500.00, true, 2, '대사이즈 (500원 추가)', NOW(), NOW()),
('extra_sauce', '소스 추가', 'extra', 200.00, true, 3, '소스 추가', NOW(), NOW()),
('extra_cheese', '치즈 추가', 'extra', 300.00, true, 4, '치즈 추가', NOW(), NOW()),
('extra_meat', '고기 추가', 'extra', 1000.00, true, 5, '고기 패티 추가', NOW(), NOW());

-- 음료 옵션
INSERT INTO menu_options (name, display_name, category, price, is_available, display_order, description, created_at, updated_at) VALUES
('ice_none', '얼음 없음', 'ice', 0.00, true, 1, '얼음 없이', NOW(), NOW()),
('ice_less', '얼음 적게', 'ice', 0.00, true, 2, '얼음 적게', NOW(), NOW()),
('ice_normal', '얼음 보통', 'ice', 0.00, true, 3, '얼음 보통', NOW(), NOW()),
('ice_more', '얼음 많이', 'ice', 0.00, true, 4, '얼음 많이', NOW(), NOW()),
('sugar_none', '당도 0%', 'sugar', 0.00, true, 5, '당도 0%', NOW(), NOW()),
('sugar_less', '당도 30%', 'sugar', 0.00, true, 6, '당도 30%', NOW(), NOW()),
('sugar_normal', '당도 100%', 'sugar', 0.00, true, 7, '당도 100%', NOW(), NOW()),
('sugar_more', '당도 130%', 'sugar', 0.00, true, 8, '당도 130%', NOW(), NOW());

-- =====================================================
-- 2. 템플릿-옵션 관계 데이터
-- =====================================================

-- 기본버거옵션 템플릿
INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order) VALUES
(1, 1, true, true, true, 1),   -- 토마토 (기본, 제거/추가 가능)
(1, 2, true, true, true, 2),   -- 양파 (기본, 제거/추가 가능)
(1, 3, true, true, true, 3),   -- 양상추 (기본, 제거/추가 가능)
(1, 4, true, true, true, 4),   -- 치즈 (기본, 제거/추가 가능)
(1, 5, true, true, true, 5),   -- 피클 (기본, 제거/추가 가능)
(1, 9, true, true, true, 6),   -- 케찹 (기본, 제거/추가 가능)
(1, 10, true, true, true, 7),  -- 머스타드 (기본, 제거/추가 가능)
(1, 6, false, true, true, 8),  -- 베이컨 (기본 아님, 추가 가능)
(1, 7, false, true, true, 9),  -- 계란 (기본 아님, 추가 가능)
(1, 8, false, true, true, 10); -- 아보카도 (기본 아님, 추가 가능)

-- 프리미엄버거옵션 템플릿
INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order) VALUES
(2, 1, true, true, true, 1),   -- 토마토
(2, 2, true, true, true, 2),   -- 양파
(2, 3, true, true, true, 3),   -- 양상추
(2, 4, true, true, true, 4),   -- 치즈
(2, 5, false, true, true, 5),  -- 피클
(2, 6, true, true, true, 6),   -- 베이컨 (기본 포함)
(2, 7, false, true, true, 7),  -- 계란
(2, 8, false, true, true, 8),  -- 아보카도
(2, 9, true, true, true, 9),   -- 케찹
(2, 10, true, true, true, 10), -- 머스타드
(2, 11, true, true, true, 11), -- 마요네즈
(2, 12, false, true, true, 12);-- BBQ소스

-- 치킨버거옵션 템플릿
INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order) VALUES
(3, 1, true, true, true, 1),   -- 토마토
(3, 2, true, true, true, 2),   -- 양파
(3, 3, true, true, true, 3),   -- 양상추
(3, 4, false, true, true, 4),  -- 치즈 (기본 아님)
(3, 5, false, true, true, 5),  -- 피클
(3, 9, true, true, true, 6),   -- 케찹
(3, 10, true, true, true, 7),  -- 머스타드
(3, 11, true, true, true, 8),  -- 마요네즈
(3, 12, false, true, true, 9); -- BBQ소스

-- 새우버거옵션 템플릿
INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order) VALUES
(4, 1, true, true, true, 1),   -- 토마토
(4, 2, true, true, true, 2),   -- 양파
(4, 3, true, true, true, 3),   -- 양상추
(4, 4, false, true, true, 4),  -- 치즈
(4, 5, false, true, true, 5),  -- 피클
(4, 9, true, true, true, 6),   -- 케찹
(4, 10, true, true, true, 7),  -- 머스타드
(4, 11, true, true, true, 8),  -- 마요네즈
(4, 13, false, true, true, 9); -- 핫소스

-- 세트옵션 템플릿
INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order) VALUES
(5, 17, false, true, true, 1), -- 사이즈 변경
(5, 18, false, true, true, 2), -- 소스 추가
(5, 19, false, true, true, 3), -- 치즈 추가
(5, 20, false, true, true, 4), -- 고기 추가
(5, 21, false, true, true, 5), -- 얼음 옵션
(5, 25, false, true, true, 6); -- 당도 옵션

-- 사이드옵션 템플릿
INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order) VALUES
(6, 17, false, true, true, 1), -- 사이즈 변경
(6, 18, false, true, true, 2); -- 소스 추가

-- 음료옵션 템플릿
INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order) VALUES
(7, 21, true, true, true, 1),  -- 얼음 옵션 (기본)
(7, 25, true, true, true, 2);  -- 당도 옵션 (기본)

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
