-- 05_menu_categories.sql
-- 메뉴 카테고리 테이블 생성 및 초기 데이터

-- =====================================================
-- 1. 메뉴 카테고리 테이블 생성
-- =====================================================

-- 기존 테이블이 있다면 삭제 (개발 환경용)
-- DROP TABLE IF EXISTS menu_categories;

CREATE TABLE IF NOT EXISTS menu_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE COMMENT '카테고리 식별명 (기존 메뉴의 category 필드와 매핑)',
    display_name VARCHAR(100) NOT NULL COMMENT '화면에 표시할 카테고리명',
    description TEXT COMMENT '카테고리 설명',
    display_order INT NOT NULL DEFAULT 0 COMMENT '표시 순서',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성화 여부',
    image_url VARCHAR(500) COMMENT '카테고리 이미지 URL',
    parent_category_id BIGINT COMMENT '상위 카테고리 ID (계층 구조용)',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_display_order ON menu_categories(display_order);
CREATE INDEX idx_is_active ON menu_categories(is_active);
CREATE INDEX idx_parent_category ON menu_categories(parent_category_id);
CREATE INDEX idx_name ON menu_categories(name);

-- =====================================================
-- 2. 기존 메뉴 데이터 기반으로 카테고리 생성
-- =====================================================

-- 기존 메뉴의 category 필드에서 고유한 카테고리 추출하여 삽입
INSERT INTO menu_categories (name, display_name, description, display_order, is_active, created_at, updated_at) VALUES
('BURGER', '버거', '신선한 재료로 만든 다양한 버거', 1, true, NOW(), NOW()),
('SIDE', '사이드', '버거와 함께 즐기는 사이드 메뉴', 2, true, NOW(), NOW()),
('DRINK', '음료', '시원하고 맛있는 음료', 3, true, NOW(), NOW()),
('SET', '세트', '버거 + 사이드 + 음료가 포함된 세트 메뉴', 4, true, NOW(), NOW()),
('DESSERT', '디저트', '달콤한 디저트 메뉴', 5, true, NOW(), NOW());

-- =====================================================
-- 3. 데이터 확인
-- =====================================================

-- 카테고리별 메뉴 개수 확인
SELECT 
    c.name as category_name,
    c.display_name as category_display_name,
    COUNT(m.id) as menu_count
FROM menu_categories c
LEFT JOIN menus m ON c.name = m.category
WHERE c.is_active = true
GROUP BY c.id, c.name, c.display_name
ORDER BY c.display_order;

-- 생성된 카테고리 확인
SELECT * FROM menu_categories ORDER BY display_order;

-- =====================================================
-- 4. 외래키 제약조건 (선택사항)
-- =====================================================

-- 상위 카테고리 참조를 위한 외래키 (나중에 추가 가능)
-- ALTER TABLE menu_categories ADD CONSTRAINT fk_parent_category 
--     FOREIGN KEY (parent_category_id) REFERENCES menu_categories(id) ON DELETE SET NULL;
