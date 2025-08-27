-- 원재료 샘플 데이터
INSERT INTO materials (name, code, category, unit, cost_per_unit, min_stock, current_stock, supplier, status, created_at, updated_at) VALUES
-- 빵
('브리오슈 번', 'Brioche_Bun', '빵류', '개', 1200, 30, 500, '빵공급업체', 'ACTIVE', NOW(), NOW()),

-- 패티류
('소고기 패티', 'beef_patty', '패티류', 'g', 8.50, 2000, 8000, '육류공급업체', 'ACTIVE', NOW(), NOW()),
('치킨 패티', 'chicken_patty', '패티류', 'g', 6.80, 1500, 6000, '육류공급업체', 'ACTIVE', NOW(), NOW()),
('새우 패티', 'shrimp_patty', '패티류', 'g', 12.50, 3000, 12000, '육류공급업체', 'ACTIVE', NOW(), NOW()),

-- 토핑류
('양상추', 'LETTUCE', '채소', 'g', 2.80, 2000, 8000, '채소공급업체', 'ACTIVE', NOW(), NOW()),
('토마토', 'TOMATO', '채소', 'g', 4.20, 1500, 6000, '채소공급업체', 'ACTIVE', NOW(), NOW()),
('양파', 'ONION', '채소', 'g', 1.50, 3000, 12000, '채소공급업체', 'ACTIVE', NOW(), NOW()),
('피클', 'PICKLE', '채소', 'g', 3.80, 1000, 4000, '채소공급업체', 'ACTIVE', NOW(), NOW()),
('치즈', 'CHEDDAR_CHEESE', '치즈', '개', 70, 200, 2000, '치즈공급업체', 'ACTIVE', NOW(), NOW()),
('베이컨', 'BACON', '육류', '개', 170, 150, 600, '육류공급업체', 'ACTIVE', NOW(), NOW()),

-- 소스류
('마요네즈', 'MAYO_SAUCE', '소스류', 'ml', 2.50, 4000, 12000, '소스공급업체', 'ACTIVE', NOW(), NOW()),
('케찹', 'KETCHUP', '소스류', 'ml', 1.80, 3000, 8000, '소스공급업체', 'ACTIVE', NOW(), NOW()),
('불고기소스', 'BULGOGI_SAUCE', '소스류', 'ml', 3.20, 5000, 15000, '소스공급업체', 'ACTIVE', NOW(), NOW()),
('타르타르소스', 'TARTAR_SAUCE', '소스류', 'ml', 4.50, 5000, 15000, '소스공급업체', 'ACTIVE', NOW(), NOW()),

-- 사이드류
('감자튀김', 'FRENCH_FRIES', '사이드', 'g', 1.20, 5000, 25000, '사이드공급업체', 'ACTIVE', NOW(), NOW()),
('양념감자 시즈닝', 'POTATO_SEASONING', '조미료', '개', 30, 300, 1500, '조미료공급업체', 'ACTIVE', NOW(), NOW()),
('치킨너겟', 'CHICKEN_NUGGETS', '사이드', 'g', 6.80, 2000, 10000, '사이드공급업체', 'ACTIVE', NOW(), NOW()),
('치즈스틱', 'CHEESE_STICKS', '사이드', 'g', 12.50, 5000, 15000, '사이드공급업체', 'ACTIVE', NOW(), NOW()),
('어니언링', 'ONION_RINGS', '사이드', 'g', 8.20, 4000, 12000, '사이드공급업체', 'ACTIVE', NOW(), NOW()),
('콘샐러드', 'CORN_SALAD', '사이드', '개', 700, 30, 80, '사이드공급업체', 'ACTIVE', NOW(), NOW()),

-- 음료
('콜라', 'COLA', '음료', 'ml', 0.85, 5000, 15000, '음료공급업체', 'ACTIVE', NOW(), NOW()),
('제로 콜라', 'ZERO_COLA', '음료', 'ml', 0.95, 4000, 12000, '음료공급업체', 'ACTIVE', NOW(), NOW()),
('스프라이트', 'SPRITE', '음료', 'ml', 0.90, 3000, 8000, '음료공급업체', 'ACTIVE', NOW(), NOW()),
('제로 스프라이트', 'ZERO_SPRITE', '음료', 'ml', 1.00, 5000, 15000, '음료공급업체', 'ACTIVE', NOW(), NOW()),
('오렌지주스', 'ORANGE_JUICE', '음료', 'ml', 2.50, 4000, 12000, '음료공급업체', 'ACTIVE', NOW(), NOW()),
('아메리카노', 'AMERICANO', '음료', 'ml', 1.80, 3000, 8000, '음료공급업체', 'ACTIVE', NOW(), NOW()),
('밀크쉐이크', 'MILKSHAKE', '음료', 'ml', 4.80, 3000, 8000, '음료공급업체', 'ACTIVE', NOW(), NOW());



