-- 03_menu_data.sql
-- 메뉴 기본 데이터

-- 햄버거 메뉴
INSERT IGNORE INTO menus (name, description, price, category, base_price, is_available, display_order, image_url, created_at, updated_at) VALUES
('치즈버거', '신선한 치즈가 들어간 클래식 치즈버거', 4500.00, 'burger', 3000.00, true, 1, 'http://localhost:8080/images/menu/cheese_burger.png', NOW(), NOW()),
('불고기버거', '한국식 불고기 소스가 들어간 버거', 5500.00, 'burger', 3500.00, true, 2, 'http://localhost:8080/images/menu/bulgogi_burger.png', NOW(), NOW()),
('치킨버거', '바삭한 치킨 패티가 들어간 버거', 5000.00, 'burger', 3200.00, true, 3, 'http://localhost:8080/images/menu/chicken_burger.png', NOW(), NOW()),
('더블버거', '두 개의 패티가 들어간 든든한 더블버거', 8000.00, 'burger', 5000.00, true, 4, 'http://localhost:8080/images/menu/double_burger.png', NOW(), NOW()),
('베이컨버거', '바삭한 베이컨이 들어간 버거', 6000.00, 'burger', 3800.00, true, 5, 'http://localhost:8080/images/menu/bacon_burger.png', NOW(), NOW()),
('새우버거', '신선한 새우 패티가 들어간 버거', 6500.00, 'burger', 4000.00, true, 6, 'http://localhost:8080/images/menu/shrimp_burger.png', NOW(), NOW());

-- 세트 메뉴
INSERT IGNORE INTO menus (name, description, price, category, base_price, is_available, display_order, image_url, created_at, updated_at) VALUES
('치즈버거 세트', '치즈버거 + 감자튀김 + 음료', 7000.00, 'set', 4500.00, true, 1, 'http://localhost:8080/images/menu/cheese_set.png', NOW(), NOW()),
('불고기버거 세트', '불고기버거 + 감자튀김 + 음료', 8000.00, 'set', 5000.00, true, 2, 'http://localhost:8080/images/menu/bulgogi_set.png', NOW(), NOW()),
('치킨버거 세트', '치킨버거 + 감자튀김 + 음료', 7500.00, 'set', 4700.00, true, 3, 'http://localhost:8080/images/menu/chicken_set.png', NOW(), NOW()),
('더블버거 세트', '더블버거 + 감자튀김 + 음료', 10000.00, 'set', 6000.00, true, 4, 'http://localhost:8080/images/menu/double_set.png', NOW(), NOW()),
('베이컨버거 세트', '베이컨버거 + 감자튀김 + 음료', 8500.00, 'set', 5300.00, true, 5, 'http://localhost:8080/images/menu/bacon_set.png', NOW(), NOW()),
('새우버거 세트', '새우버거 + 감자튀김 + 음료', 9000.00, 'set', 5500.00, true, 6, 'http://localhost:8080/images/menu/shrimp_set.png', NOW(), NOW());

-- 사이드 메뉴
INSERT IGNORE INTO menus (name, description, price, category, base_price, is_available, display_order, image_url, created_at, updated_at) VALUES
('감자튀김', '바삭바삭한 감자튀김', 2000.00, 'side', 800.00, true, 1, 'http://localhost:8080/images/menu/ff.png', NOW(), NOW()),
('치킨너겟', '바삭한 치킨너겟 8개', 3000.00, 'side', 1200.00, true, 2, 'http://localhost:8080/images/menu/nugget.png', NOW(), NOW()),
('양념감자', '매콤달콤한 양념감자', 2500.00, 'side', 1000.00, true, 3, 'http://localhost:8080/images/menu/ff_hot.png', NOW(), NOW()),
('치즈스틱', '치즈가 가득한 치즈스틱 2개', 3500.00, 'side', 1400.00, true, 4, 'http://localhost:8080/images/menu/cheesestick.png', NOW(), NOW()),
('어니언링', '고소한 어니언링 6개', 2800.00, 'side', 1100.00, true, 5, 'http://localhost:8080/images/menu/onionring.png', NOW(), NOW()),
('콘샐러드', '신선한 콘샐러드', 2200.00, 'side', 900.00, true, 6, 'http://localhost:8080/images/menu/cornsalad.png', NOW(), NOW());

-- 음료
INSERT IGNORE INTO menus (name, description, price, category, base_price, is_available, display_order, image_url, created_at, updated_at) VALUES
('콜라', '시원한 콜라', 1500.00, 'drink', 300.00, true, 1, 'http://localhost:8080/images/menu/cola.png', NOW(), NOW()),
('스프라이트', '상큼한 스프라이트', 1500.00, 'drink', 300.00, true, 2, 'http://localhost:8080/images/menu/sprite.png', NOW(), NOW()),
('오렌지주스', '신선한 오렌지주스', 2000.00, 'drink', 500.00, true, 3, 'http://localhost:8080/images/menu/orangejuice.png', NOW(), NOW()),
('아메리카노', '깊은 맛의 아메리카노', 2500.00, 'drink', 400.00, true, 4, 'http://localhost:8080/images/menu/americano.png', NOW(), NOW()),
('제로콜라', '칼로리 0 콜라', 1500.00, 'drink', 300.00, true, 5, 'http://localhost:8080/images/menu/cola.png', NOW(), NOW()),
('제로스프라이트', '칼로리 0 스프라이트', 1500.00, 'drink', 300.00, true, 6, 'http://localhost:8080/images/menu/sprite.png', NOW(), NOW()),
('밀크쉐이크', '부드러운 밀크쉐이크', 3500.00, 'drink', 1200.00, true, 7, 'http://localhost:8080/images/menu/milkshake.png', NOW(), NOW());

-- 메뉴 데이터 확인
SELECT 
    category,
    COUNT(*) as total_menus,
    SUM(price) as total_price,
    AVG(price) as avg_price
FROM menus 
GROUP BY category 
ORDER BY display_order;
