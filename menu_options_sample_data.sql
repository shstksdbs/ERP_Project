-- 메뉴 옵션 테이블에 샘플 데이터 추가
-- 토핑 옵션들
INSERT INTO menu_options (name, display_name, category, price, is_available, display_order, description, created_at, updated_at) VALUES
('tomato', '토마토', 'topping', 300.00, true, 1, '신선한 토마토 슬라이스', NOW(), NOW()),
('onion', '양파', 'topping', 300.00, true, 2, '맛있는 양파 링', NOW(), NOW()),
('cheese', '치즈', 'topping', 500.00, true, 3, '고소한 치즈 슬라이스', NOW(), NOW()),
('lettuce', '양상추', 'topping', 300.00, true, 4, '신선한 양상추', NOW(), NOW()),
('sauce', '소스', 'topping', 300.00, true, 5, '특제 소스', NOW(), NOW()),
('bacon', '베이컨', 'topping', 800.00, true, 6, '바삭한 베이컨', NOW(), NOW()),
('pickle', '피클', 'topping', 200.00, true, 7, '새콤달콤한 피클', NOW(), NOW()),
('jalapeno', '할라피뇨', 'topping', 400.00, true, 8, '매콤한 할라피뇨', NOW(), NOW());

-- 사이드 메뉴 옵션들
INSERT INTO menu_options (name, display_name, category, price, is_available, display_order, description, created_at, updated_at) VALUES
('fries', '감자튀김', 'side', 0.00, true, 1, '기본 사이드 메뉴', NOW(), NOW()),
('nuggets', '치킨너겟', 'side', 1000.00, true, 2, '바삭한 치킨너겟', NOW(), NOW()),
('seasoned_fries', '양념감자', 'side', 500.00, true, 3, '양념이 된 감자튀김', NOW(), NOW()),
('cheese_sticks', '치즈스틱', 'side', 1500.00, true, 4, '치즈가 듬뿍 들어간 치즈스틱', NOW(), NOW()),
('onion_rings', '어니언링', 'side', 800.00, true, 5, '바삭한 어니언링', NOW(), NOW()),
('corn_salad', '콘샐러드', 'side', 200.00, true, 6, '신선한 콘샐러드', NOW(), NOW()),
('mozzarella_sticks', '모짜렐라 스틱', 'side', 1200.00, true, 7, '치즈가 쭉 늘어나는 모짜렐라 스틱', NOW(), NOW()),
('potato_wedges', '감자 웨지', 'side', 600.00, true, 8, '겉은 바삭하고 속은 부드러운 감자 웨지', NOW(), NOW());

-- 음료 옵션들
INSERT INTO menu_options (name, display_name, category, price, is_available, display_order, description, created_at, updated_at) VALUES
('cola', '콜라', 'drink', 0.00, true, 1, '기본 음료', NOW(), NOW()),
('sprite', '사이다', 'drink', 0.00, true, 2, '상쾌한 사이다', NOW(), NOW()),
('orange_juice', '오렌지주스', 'drink', 500.00, true, 3, '신선한 오렌지주스', NOW(), NOW()),
('americano', '아메리카노', 'drink', 1000.00, true, 4, '깊은 맛의 아메리카노', NOW(), NOW()),
('zero_cola', '제로콜라', 'drink', 0.00, true, 5, '칼로리 0 콜라', NOW(), NOW()),
('zero_sprite', '제로사이다', 'drink', 0.00, true, 6, '칼로리 0 사이다', NOW(), NOW()),
('lemonade', '레몬에이드', 'drink', 800.00, true, 7, '상큼한 레몬에이드', NOW(), NOW()),
('iced_tea', '아이스티', 'drink', 600.00, true, 8, '시원한 아이스티', NOW(), NOW());
