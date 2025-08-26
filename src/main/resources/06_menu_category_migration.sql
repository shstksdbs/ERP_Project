-- 06_menu_category_migration.sql
-- 메뉴와 카테고리 테이블 연동 마이그레이션

-- =====================================================
-- 1. 메뉴 테이블에 category_id 컬럼 추가
-- =====================================================

-- category_id 컬럼 추가
ALTER TABLE menus ADD COLUMN category_id BIGINT AFTER category;

-- =====================================================
-- 2. 기존 메뉴 데이터의 category를 category_id로 매핑
-- =====================================================

-- 버거 카테고리 매핑
UPDATE menus SET category_id = (SELECT id FROM menu_categories WHERE name = 'burger') 
WHERE category = 'burger';

-- 사이드 카테고리 매핑
UPDATE menus SET category_id = (SELECT id FROM menu_categories WHERE name = 'side') 
WHERE category = 'side';

-- 음료 카테고리 매핑
UPDATE menus SET category_id = (SELECT id FROM menu_categories WHERE name = 'drink') 
WHERE category = 'drink';

-- 세트 카테고리 매핑
UPDATE menus SET category_id = (SELECT id FROM menu_categories WHERE name = 'set') 
WHERE category = 'set';

-- 디저트 카테고리 매핑
UPDATE menus SET category_id = (SELECT id FROM menu_categories WHERE name = 'dessert') 
WHERE category = 'dessert';

-- =====================================================
-- 3. 매핑 결과 확인
-- =====================================================

-- 카테고리별 메뉴 개수 확인
SELECT 
    c.name as category_name,
    c.display_name as category_display_name,
    COUNT(m.id) as menu_count
FROM menu_categories c
LEFT JOIN menus m ON c.id = m.category_id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.display_name
ORDER BY c.display_order;

-- 매핑되지 않은 메뉴 확인
SELECT 
    m.id,
    m.name as menu_name,
    m.category as old_category,
    m.category_id as new_category_id
FROM menus m
WHERE m.category_id IS NULL;

-- =====================================================
-- 4. 인덱스 추가 (성능 향상)
-- =====================================================

-- category_id에 인덱스 추가
CREATE INDEX idx_menus_category_id ON menus(category_id);

-- =====================================================
-- 5. 외래키 제약조건 추가 (선택사항)
-- =====================================================

-- 메뉴의 category_id가 카테고리 테이블의 id를 참조하도록 제약조건 추가
-- ALTER TABLE menus ADD CONSTRAINT fk_menus_category_id 
--     FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE SET NULL;

-- =====================================================
-- 6. 테스트 데이터 확인
-- =====================================================

-- 카테고리별 메뉴 상세 정보
SELECT 
    c.display_name as category_name,
    m.name as menu_name,
    m.price,
    m.is_available
FROM menu_categories c
JOIN menus m ON c.id = m.category_id
WHERE c.is_active = true AND m.is_available = true
ORDER BY c.display_order, m.display_order;
