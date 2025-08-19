-- 06_inventory_system.sql
-- 재고 관리 시스템

-- =====================================================
-- 1. 재료 정보 테이블 생성
-- =====================================================

-- 재료 마스터 테이블
CREATE TABLE IF NOT EXISTS ingredients (
    ingredient_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '재료명',
    category VARCHAR(50) NOT NULL COMMENT '재료 카테고리',
    unit VARCHAR(20) NOT NULL COMMENT '단위 (kg, 개, L 등)',
    cost_per_unit DECIMAL(10,2) NOT NULL COMMENT '단위당 비용',
    supplier VARCHAR(100) COMMENT '공급업체',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성화 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 지점별 재고 현황
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    branch_id BIGINT NOT NULL COMMENT '지점 ID',
    ingredient_id BIGINT NOT NULL COMMENT '재료 ID',
    current_stock DECIMAL(10,3) DEFAULT 0 COMMENT '현재 재고량',
    unit VARCHAR(20) NOT NULL COMMENT '단위',
    min_stock DECIMAL(10,3) DEFAULT 0 COMMENT '최소 재고량',
    max_stock DECIMAL(10,3) DEFAULT 0 COMMENT '최대 재고량',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    UNIQUE KEY unique_branch_ingredient (branch_id, ingredient_id),
    INDEX idx_branch_stock (branch_id, current_stock),
    INDEX idx_low_stock (current_stock, min_stock)
);

-- 메뉴별 재료 소요량
CREATE TABLE IF NOT EXISTS menu_ingredients (
    menu_ingredient_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    menu_id BIGINT NOT NULL COMMENT '메뉴 ID',
    ingredient_id BIGINT NOT NULL COMMENT '재료 ID',
    quantity_per_serving DECIMAL(10,3) NOT NULL COMMENT '1인분당 소요량',
    unit VARCHAR(20) NOT NULL COMMENT '단위',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
    UNIQUE KEY unique_menu_ingredient (menu_id, ingredient_id),
    INDEX idx_menu_id (menu_id),
    INDEX idx_ingredient_id (ingredient_id)
);

-- =====================================================
-- 2. 재료 데이터 삽입
-- =====================================================

-- 빵류
INSERT INTO ingredients (name, category, unit, cost_per_unit, supplier, is_active) VALUES
('브리오슈번', 'bread', '개', 400, '신성제과', TRUE);

-- 패티류
INSERT INTO ingredients (name, category, unit, cost_per_unit, supplier, is_active) VALUES
('소고기패티', 'patty', '개', 800, '한우공장', TRUE),
('치킨패티', 'patty', '개', 600, '닭고기공장', TRUE),
('새우패티', 'patty', '개', 900, '수산물공장', TRUE);

-- 채소류
INSERT INTO ingredients (name, category, unit, cost_per_unit, supplier, is_active) VALUES
('양상추', 'vegetable', 'g', 0.5, '농협', TRUE),
('토마토', 'vegetable', '개', 150, '농협', TRUE),
('양파', 'vegetable', 'g', 0.3, '농협', TRUE),
('피클', 'vegetable', 'g', 0.8, '농협', TRUE);

-- 치즈류
INSERT INTO ingredients (name, category, unit, cost_per_unit, supplier, is_active) VALUES
('치즈', 'cheese', '장', 200, '서울우유', TRUE);

-- 고기류
INSERT INTO ingredients (name, category, unit, cost_per_unit, supplier, is_active) VALUES
('베이컨', 'meat', 'g', 0.5, '농심', TRUE);

-- 소스류
INSERT INTO ingredients (name, category, unit, cost_per_unit, supplier, is_active) VALUES
('케찹', 'sauce', 'ml', 0.1, '오리온', TRUE),
('불고기소스', 'sauce', 'ml', 0.1, '오리온', TRUE),
('머스타드', 'sauce', 'ml', 0.2, '오리온', TRUE),
('마요네즈', 'sauce', 'ml', 0.15, '오리온', TRUE);

-- 사이드류
INSERT INTO ingredients (name, category, unit, cost_per_unit, supplier, is_active) VALUES
('감자튀김', 'side', 'g', 0.8, '농심', TRUE),
('치킨너겟', 'side', '개', 300, '교촌', TRUE),
('치즈스틱', 'side', '개', 400, '교촌', TRUE),
('어니언링', 'side', '개', 200, '농심', TRUE),
('콘샐러드', 'side', 'g', 0.5, '농심', TRUE),
('양념감자 시즈닝', 'side', 'g', 0.5, '농심', TRUE);

-- 음료류
INSERT INTO ingredients (name, category, unit, cost_per_unit, supplier, is_active) VALUES
('콜라', 'drink', 'ml', 0.05, '코카콜라', TRUE),
('제로콜라', 'drink', 'ml', 0.05, '코카콜라', TRUE),
('스프라이트', 'drink', 'ml', 0.05, '칠성', TRUE),
('제로스프라이트', 'drink', 'ml', 0.05, '칠성', TRUE),
('오렌지주스', 'drink', 'ml', 0.1, '델몬트', TRUE),
('아메리카노', 'drink', 'ml', 0.08, '스타벅스', TRUE),
('밀크쉐이크', 'drink', 'ml', 0.1, '델몬트', TRUE);

-- =====================================================
-- 3. 메뉴별 재료 소요량 설정
-- =====================================================

-- 치즈버거 재료 소요량
INSERT INTO menu_ingredients (menu_id, ingredient_id, quantity_per_serving, unit) VALUES
(1, 1, 1, '개'),      -- 번 1개
(1, 2, 1, '개'),      -- 소고기패티 1개
(1, 9, 1, '장'),      -- 체다치즈 1장
(1, 8, 30, 'g'),      -- 양상추 30g
(1, 9, 0.2, '개'),    -- 토마토 0.5개
(1, 10, 15, 'g'),     -- 양파 15g
(1, 12, 15, 'ml'),    -- 케찹 15ml
(1, 13, 10, 'ml');    -- 머스타드 10ml

-- 불고기버거 재료 소요량
INSERT INTO menu_ingredients (menu_id, ingredient_id, quantity_per_serving, unit) VALUES
(2, 1, 1, '개'),      -- 번 1개
(2, 4, 1, '개'),      -- 소고기패티 1개
(2, 7, 1, '장'),      -- 체다치즈 1장
(2, 8, 30, 'g'),      -- 양상추 30g
(2, 9, 0.5, '개'),    -- 토마토 0.5개
(2, 10, 15, 'g'),     -- 양파 15g
(2, 12, 15, 'ml'),    -- 케찹 15ml
(2, 13, 10, 'ml');    -- 머스타드 10ml

-- 치킨버거 재료 소요량
INSERT INTO menu_ingredients (menu_id, ingredient_id, quantity_per_serving, unit) VALUES
(3, 1, 1, '개'),      -- 번 1개
(3, 5, 1, '개'),      -- 치킨패티 1개
(3, 8, 30, 'g'),      -- 양상추 30g
(3, 9, 0.5, '개'),    -- 토마토 0.5개
(3, 10, 15, 'g'),     -- 양파 15g
(3, 12, 15, 'ml'),    -- 케찹 15ml
(3, 13, 10, 'ml');    -- 머스타드 10ml

-- 더블버거 재료 소요량
INSERT INTO menu_ingredients (menu_id, ingredient_id, quantity_per_serving, unit) VALUES
(4, 1, 1, '개'),      -- 번 1개
(4, 4, 2, '개'),      -- 소고기패티 2개
(4, 7, 2, '장'),      -- 체다치즈 2장
(4, 8, 40, 'g'),      -- 양상추 40g
(4, 9, 0.7, '개'),    -- 토마토 0.7개
(4, 10, 20, 'g'),     -- 양파 20g
(4, 12, 20, 'ml'),    -- 케찹 20ml
(4, 13, 15, 'ml');    -- 머스타드 15ml

-- 베이컨버거 재료 소요량
INSERT INTO menu_ingredients (menu_id, ingredient_id, quantity_per_serving, unit) VALUES
(5, 1, 1, '개'),      -- 번 1개
(5, 4, 1, '개'),      -- 소고기패티 1개
(5, 7, 1, '장'),      -- 체다치즈 1장
(5, 8, 30, 'g'),      -- 양상추 30g
(5, 9, 0.5, '개'),    -- 토마토 0.5개
(5, 10, 15, 'g'),     -- 양파 15g
(5, 12, 15, 'ml'),    -- 케찹 15ml
(5, 13, 10, 'ml');    -- 머스타드 10ml

-- 새우버거 재료 소요량
INSERT INTO menu_ingredients (menu_id, ingredient_id, quantity_per_serving, unit) VALUES
(6, 1, 1, '개'),      -- 번 1개
(6, 6, 1, '개'),      -- 새우패티 1개
(6, 8, 30, 'g'),      -- 양상추 30g
(6, 9, 0.5, '개'),    -- 토마토 0.5개
(6, 10, 15, 'g'),     -- 양파 15g
(6, 12, 15, 'ml'),    -- 케찹 15ml
(6, 13, 10, 'ml');    -- 머스타드 10ml

-- =====================================================
-- 4. 지점별 초기 재고 설정
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
-- 5. 재고 부족 알림 뷰 생성
-- =====================================================

-- 지점별 재고 부족 알림 뷰
CREATE OR REPLACE VIEW low_stock_alert AS
SELECT 
    b.branch_id,
    b.branch_name,
    i.name as ingredient_name,
    inv.current_stock,
    inv.min_stock,
    inv.unit,
    CASE 
        WHEN inv.current_stock <= inv.min_stock THEN 'CRITICAL'
        WHEN inv.current_stock <= inv.min_stock * 1.2 THEN 'WARNING'
        ELSE 'OK'
    END as stock_status
FROM branches b
JOIN inventory inv ON b.branch_id = inv.branch_id
JOIN ingredients i ON inv.ingredient_id = i.ingredient_id
WHERE inv.current_stock <= inv.min_stock * 1.2
ORDER BY b.branch_id, stock_status DESC, inv.current_stock ASC;
