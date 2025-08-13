-- 03_menu_data.sql
-- 메뉴 기본 데이터

-- 햄버거 메뉴
INSERT INTO menus (name, description, price, category, base_price, is_available, display_order, created_at, updated_at) VALUES
('치즈버거', '신선한 치즈가 들어간 클래식 치즈버거', 4500.00, 'burger', 3000.00, true, 1, NOW(), NOW()),
('불고기버거', '한국식 불고기 소스가 들어간 버거', 5500.00, 'burger', 3500.00, true, 2, NOW(), NOW()),
('치킨버거', '바삭한 치킨 패티가 들어간 버거', 5000.00, 'burger', 3200.00, true, 3, NOW(), NOW()),
('더블버거', '두 개의 패티가 들어간 든든한 더블버거', 8000.00, 'burger', 5000.00, true, 4, NOW(), NOW()),
('베이컨버거', '바삭한 베이컨이 들어간 버거', 6000.00, 'burger', 3800.00, true, 5, NOW(), NOW()),
('새우버거', '신선한 새우 패티가 들어간 버거', 6500.00, 'burger', 4000.00, true, 6, NOW(), NOW());

-- 세트 메뉴
INSERT INTO menus (name, description, price, category, base_price, is_available, display_order, created_at, updated_at) VALUES
('치즈버거 세트', '치즈버거 + 감자튀김 + 음료', 7000.00, 'set', 4500.00, true, 1, NOW(), NOW()),
('불고기버거 세트', '불고기버거 + 감자튀김 + 음료', 8000.00, 'set', 5000.00, true, 2, NOW(), NOW()),
('치킨버거 세트', '치킨버거 + 감자튀김 + 음료', 7500.00, 'set', 4700.00, true, 3, NOW(), NOW()),
('더블버거 세트', '더블버거 + 감자튀김 + 음료', 10000.00, 'set', 6000.00, true, 4, NOW(), NOW()),
('베이컨버거 세트', '베이컨버거 + 감자튀김 + 음료', 8500.00, 'set', 5300.00, true, 5, NOW(), NOW()),
('새우버거 세트', '새우버거 + 감자튀김 + 음료', 9000.00, 'set', 5500.00, true, 6, NOW(), NOW());

-- 사이드 메뉴
INSERT INTO menus (name, description, price, category, base_price, is_available, display_order, created_at, updated_at) VALUES
('감자튀김', '바삭바삭한 감자튀김', 2000.00, 'side', 800.00, true, 1, NOW(), NOW()),
('치킨너겟', '바삭한 치킨너겟 6개', 3000.00, 'side', 1200.00, true, 2, NOW(), NOW()),
('양념감자', '매콤달콤한 양념감자', 2500.00, 'side', 1000.00, true, 3, NOW(), NOW()),
('치즈스틱', '치즈가 가득한 치즈스틱 4개', 3500.00, 'side', 1400.00, true, 4, NOW(), NOW()),
('어니언링', '고소한 어니언링 8개', 2800.00, 'side', 1100.00, true, 5, NOW(), NOW()),
('콘샐러드', '신선한 콘샐러드', 2200.00, 'side', 900.00, true, 6, NOW(), NOW()),
('치킨윙', '매콤달콤한 치킨윙 4개', 4000.00, 'side', 1600.00, true, 7, NOW(), NOW()),
('나초', '바삭한 나초', 1800.00, 'side', 700.00, true, 8, NOW(), NOW());

-- 음료
INSERT INTO menus (name, description, price, category, base_price, is_available, display_order, created_at, updated_at) VALUES
('콜라', '시원한 콜라', 1500.00, 'drink', 300.00, true, 1, NOW(), NOW()),
('사이다', '상큼한 사이다', 1500.00, 'drink', 300.00, true, 2, NOW(), NOW()),
('오렌지주스', '신선한 오렌지주스', 2000.00, 'drink', 500.00, true, 3, NOW(), NOW()),
('아메리카노', '깊은 맛의 아메리카노', 2500.00, 'drink', 400.00, true, 4, NOW(), NOW()),
('제로콜라', '칼로리 0% 콜라', 1500.00, 'drink', 300.00, true, 5, NOW(), NOW()),
('제로사이다', '칼로리 0% 사이다', 1500.00, 'drink', 300.00, true, 6, NOW(), NOW()),
('레몬에이드', '상큼한 레몬에이드', 2200.00, 'drink', 600.00, true, 7, NOW(), NOW()),
('밀크쉐이크', '부드러운 밀크쉐이크', 3500.00, 'drink', 1200.00, true, 8, NOW(), NOW());

-- 메뉴 데이터 확인
SELECT 
    category,
    COUNT(*) as total_menus,
    SUM(price) as total_price,
    AVG(price) as avg_price
FROM menus 
GROUP BY category 
ORDER BY display_order;
