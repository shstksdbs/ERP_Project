-- 주문 관리 테이블 구조 개선
-- 기존 order_items 테이블에 새로운 컬럼 추가

-- 1. order_items 테이블에 새로운 컬럼 추가
ALTER TABLE order_items 
ADD COLUMN item_type VARCHAR(50) COMMENT '아이템 타입: SET, BURGER, SIDE, DRINK, INGREDIENT',
ADD COLUMN parent_item_id BIGINT COMMENT '상위 아이템 ID (세트의 경우)',
ADD COLUMN is_substituted BOOLEAN DEFAULT FALSE COMMENT '변경 여부',
ADD COLUMN is_set_component BOOLEAN DEFAULT FALSE COMMENT '세트 구성 요소 여부',
ADD COLUMN original_menu_id BIGINT COMMENT '원래 선택된 메뉴 ID',
ADD COLUMN actual_menu_id BIGINT COMMENT '실제 제공된 메뉴 ID',
ADD COLUMN substitution_reason VARCHAR(255) COMMENT '변경 사유',
ADD COLUMN ingredient_type VARCHAR(100) COMMENT '재료 타입',
ADD COLUMN ingredient_action VARCHAR(20) COMMENT '재료 액션: ADD, REMOVE',
ADD COLUMN ingredient_price DECIMAL(10,2) COMMENT '재료 가격';

-- 3. 외래키 제약 조건 추가
ALTER TABLE order_item_details 
ADD CONSTRAINT fk_order_item_details_order_item 
FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id) ON DELETE CASCADE;

-- 4. 기존 order_items 테이블에 인덱스 추가
ALTER TABLE order_items 
ADD INDEX idx_item_type (item_type),
ADD INDEX idx_parent_item_id (parent_item_id),
ADD INDEX idx_is_substituted (is_substituted);


-- 6. 뷰 생성 (매출 분석용)
CREATE VIEW order_analysis_view AS
SELECT 
    o.order_id,
    o.branch_id,
    o.order_status,
    o.order_type,
    o.total_amount,
    o.final_amount,
    o.order_time,
    oi.item_type,
    oi.menu_name,
    oi.quantity,
    oi.total_price,
    oi.is_substituted,
    oi.substitution_reason,
    oid.ingredient_type,
    oid.ingredient_action,
    oid.ingredient_price
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN order_item_details oid ON oi.order_item_id = oid.order_item_id;

-- 7. 재고 관리용 뷰
CREATE VIEW inventory_usage_view AS
SELECT 
    o.order_id,
    o.order_time,
    oi.item_type,
    oi.menu_id,
    oi.menu_name,
    oi.quantity,
    oid.ingredient_type,
    oid.ingredient_action,
    oid.quantity as ingredient_quantity
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN order_item_details oid ON oi.order_item_id = oid.order_item_id
WHERE o.order_status IN ('confirmed', 'preparing', 'ready', 'completed');
