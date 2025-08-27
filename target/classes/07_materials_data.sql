-- 원재료 샘플 데이터
INSERT INTO materials (name, code, category, unit, cost_per_unit, min_stock, current_stock, supplier, status, created_at, updated_at) VALUES
-- 빵
('브리오슈 번', 'Brioche_Bun', '빵', '개', 1000, 30, 500, '빵공급업체', 'ACTIVE', NOW(), NOW()),

-- 패티류
('소고기 패티', 'beef_patty', '패티류', 'g', 0.20, 2000, 8000, '육류공급업체', 'ACTIVE', NOW(), NOW()),
('치킨 패티', 'chicken_patty', '패티류', 'g', 0.25, 1500, 6000, '육류공급업체', 'ACTIVE', NOW(), NOW()),
('새우 패티', 'shrimp_patty', '패티류', 'g', 0.15, 3000, 12000, '육류공급업체', 'ACTIVE', NOW(), NOW()),

-- 토핑류
('양상추', 'LETTUCE', '채소', 'g', 0.05, 2000, 8000, '채소공급업체', 'ACTIVE', NOW(), NOW()),
('토마토', 'TOMATO', '채소', 'g', 0.08, 1500, 6000, '채소공급업체', 'ACTIVE', NOW(), NOW()),
('양파', 'ONION', '채소', 'g', 0.03, 3000, 12000, '채소공급업체', 'ACTIVE', NOW(), NOW()),
('피클', 'PICKLE', '채소', 'g', 0.06, 1000, 4000, '채소공급업체', 'ACTIVE', NOW(), NOW()),
('치즈', 'CHEDDAR_CHEESE', '치즈', 'g', 0.35, 5000, 15000, '치즈공급업체', 'ACTIVE', NOW(), NOW()),
('베이컨', 'BACON', '육류', 'g', 0.25, 1500, 6000, '육류공급업체', 'ACTIVE', NOW(), NOW()),

-- 사이드류
('감자튀김', 'FRENCH_FRIES', '사이드', 'g', 0.02, 5000, 25000, '사이드공급업체', 'ACTIVE', NOW(), NOW()),
('양념감자 시즈닝', 'POTATO_SEASONING', '조미료', 'g', 0.03, 3000, 15000, '조미료공급업체', 'ACTIVE', NOW(), NOW()),
('치킨너겟', 'CHICKEN_NUGGETS', '사이드', 'g', 0.15, 2000, 10000, '사이드공급업체', 'ACTIVE', NOW(), NOW()),
('치즈스틱', 'CHEESE_STICKS', '사이드', 'g', 0.35, 5000, 15000, '사이드공급업체', 'ACTIVE', NOW(), NOW()),
('어니언링', 'ONION_RINGS', '사이드', 'g', 0.40, 4000, 12000, '사이드공급업체', 'ACTIVE', NOW(), NOW()),
('콘샐러드', 'CORN_SALAD', '사이드', 'g', 0.50, 3000, 8000, '사이드공급업체', 'ACTIVE', NOW(), NOW()),

-- 음료
('콜라', 'COLA', '음료', 'ml', 0.35, 5000, 15000, '음료공급업체', 'ACTIVE', NOW(), NOW()),
('제로 콜라', 'ZERO_COLA', '음료', 'ml', 0.40, 4000, 12000, '음료공급업체', 'ACTIVE', NOW(), NOW()),
('스프라이트', 'SPRITE', '음료', 'ml', 0.50, 3000, 8000, '음료공급업체', 'ACTIVE', NOW(), NOW()),
('제로 스프라이트', 'ZERO_SPRITE', '음료', 'ml', 0.35, 5000, 15000, '음료공급업체', 'ACTIVE', NOW(), NOW()),
('오렌지주스', 'ORANGE_JUICE', '음료', 'ml', 0.40, 4000, 12000, '음료공급업체', 'ACTIVE', NOW(), NOW()),
('밀크쉐이크', 'MILKSHAKE', '음료', 'ml', 0.50, 3000, 8000, '음료공급업체', 'ACTIVE', NOW(), NOW());



