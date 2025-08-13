-- 07_discount_system.sql
-- 본사 할인 프로모션 시스템

-- =====================================================
-- 1. 할인 프로모션 테이블 구조
-- =====================================================

-- 할인 프로모션 마스터 테이블
CREATE TABLE IF NOT EXISTS discount_promotions (
    promotion_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    promotion_name VARCHAR(100) NOT NULL COMMENT '프로모션명',
    description TEXT COMMENT '프로모션 설명',
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL DEFAULT 'percentage' COMMENT '할인 유형',
    discount_value DECIMAL(5,2) NOT NULL COMMENT '할인율(%) 또는 할인금액',
    min_order_amount DECIMAL(10,2) DEFAULT 0 COMMENT '최소 주문 금액',
    max_discount_amount DECIMAL(10,2) DEFAULT NULL COMMENT '최대 할인 금액 (할인율 적용 시)',
    start_date DATE NOT NULL COMMENT '프로모션 시작일',
    end_date DATE NOT NULL COMMENT '프로모션 종료일',
    target_branches JSON COMMENT '적용 대상 지점 (NULL이면 모든 지점)',
    target_categories JSON COMMENT '적용 대상 메뉴 카테고리 (NULL이면 모든 카테고리)',
    target_menus JSON COMMENT '적용 대상 메뉴 (NULL이면 모든 메뉴)',
    is_active BOOLEAN DEFAULT true COMMENT '활성화 여부',
    created_by VARCHAR(100) DEFAULT '본사' COMMENT '생성자',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active_dates (is_active, start_date, end_date),
    INDEX idx_target_branches (target_branches),
    INDEX idx_target_categories (target_categories)
);

-- 할인 프로모션 사용 내역 테이블
CREATE TABLE IF NOT EXISTS discount_usage_history (
    usage_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    promotion_id BIGINT NOT NULL COMMENT '프로모션 ID',
    order_id BIGINT NOT NULL COMMENT '주문 ID',
    branch_id BIGINT NOT NULL COMMENT '지점 ID',
    applied_amount DECIMAL(10,2) NOT NULL COMMENT '실제 적용된 할인 금액',
    original_amount DECIMAL(10,2) NOT NULL COMMENT '할인 전 원래 금액',
    final_amount DECIMAL(10,2) NOT NULL COMMENT '할인 후 최종 금액',
    customer_name VARCHAR(100) COMMENT '고객명',
    customer_phone VARCHAR(20) COMMENT '고객 연락처',
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '사용 시간',
    
    FOREIGN KEY (promotion_id) REFERENCES discount_promotions(promotion_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
    INDEX idx_promotion_usage (promotion_id, used_at),
    INDEX idx_branch_usage (branch_id, used_at)
);

-- =====================================================
-- 2. 할인 프로모션 데이터 삽입
-- =====================================================

-- 여름 시즌 할인 (6-8월, 25% 할인)
INSERT INTO discount_promotions (
    promotion_name, description, discount_type, discount_value, 
    min_order_amount, max_discount_amount, start_date, end_date,
    target_branches, target_categories, is_active
) VALUES (
    '여름 시즌 할인', 
    '여름 시즌 특별 할인! 모든 메뉴 25% 할인', 
    'percentage', 25.00, 
    15000.00, 5000.00, 
    '2024-06-01', '2024-08-31',
    NULL, NULL, true
);

-- 겨울 시즌 할인 (12-2월, 30% 할인)
INSERT INTO discount_promotions (
    promotion_name, description, discount_type, discount_value, 
    min_order_amount, max_discount_amount, start_date, end_date,
    target_branches, target_categories, is_active
) VALUES (
    '겨울 시즌 할인', 
    '겨울 시즌 특별 할인! 모든 메뉴 30% 할인', 
    'percentage', 30.00, 
    20000.00, 8000.00, 
    '2024-12-01', '2025-02-28',
    NULL, NULL, true
);

-- 봄 시즌 할인 (3-5월, 20% 할인)
INSERT INTO discount_promotions (
    promotion_name, description, discount_type, discount_value, 
    min_order_amount, max_discount_amount, start_date, end_date,
    target_branches, target_categories, is_active
) VALUES (
    '봄 시즌 할인', 
    '봄 시즌 특별 할인! 모든 메뉴 20% 할인', 
    'percentage', 20.00, 
    12000.00, 4000.00, 
    '2024-03-01', '2024-05-31',
    NULL, NULL, true
);

-- 가을 시즌 할인 (9-11월, 15% 할인)
INSERT INTO discount_promotions (
    promotion_name, description, discount_type, discount_value, 
    min_order_amount, max_discount_amount, start_date, end_date,
    target_branches, target_categories, is_active
) VALUES (
    '가을 시즌 할인', 
    '가을 시즌 특별 할인! 모든 메뉴 15% 할인', 
    'percentage', 15.00, 
    10000.00, 3000.00, 
    '2024-09-01', '2024-11-30',
    NULL, NULL, true
);

-- 연말연시 특별 할인 (12월 20일-1월 5일, 40% 할인)
INSERT INTO discount_promotions (
    promotion_name, description, discount_type, discount_value, 
    min_order_amount, max_discount_amount, start_date, end_date,
    target_branches, target_categories, is_active
) VALUES (
    '연말연시 특별 할인', 
    '연말연시 특별 할인! 모든 메뉴 40% 할인', 
    'percentage', 40.00, 
    25000.00, 10000.00, 
    '2024-12-20', '2025-01-05',
    NULL, NULL, true
);

-- 신규 지점 오픈 할인 (홍대점 전용, 50% 할인)
INSERT INTO discount_promotions (
    promotion_name, description, discount_type, discount_value, 
    min_order_amount, max_discount_amount, start_date, end_date,
    target_branches, target_categories, is_active
) VALUES (
    '신규 지점 오픈 할인', 
    '홍대점 오픈 기념! 모든 메뉴 50% 할인', 
    'percentage', 50.00, 
    0.00, 15000.00, 
    '2024-01-01', '2024-12-31',
    JSON_ARRAY('BR002'), NULL, true
);

-- 햄버거 카테고리 할인 (모든 지점, 20% 할인)
INSERT INTO discount_promotions (
    promotion_name, description, discount_type, discount_value, 
    min_order_amount, max_discount_amount, start_date, end_date,
    target_branches, target_categories, is_active
) VALUES (
    '햄버거 카테고리 할인', 
    '햄버거 카테고리 20% 할인!', 
    'percentage', 20.00, 
    8000.00, 3000.00, 
    '2024-01-01', '2024-12-31',
    NULL, JSON_ARRAY('burger'), true
);

-- 세트 메뉴 할인 (모든 지점, 15% 할인)
INSERT INTO discount_promotions (
    promotion_name, description, discount_type, discount_value, 
    min_order_amount, max_discount_amount, start_date, end_date,
    target_branches, target_categories, is_active
) VALUES (
    '세트 메뉴 할인', 
    '세트 메뉴 15% 할인!', 
    'percentage', 15.00, 
    10000.00, 2500.00, 
    '2024-01-01', '2024-12-31',
    NULL, JSON_ARRAY('set'), true
);

-- =====================================================
-- 3. 할인 프로모션 관리 뷰 생성
-- =====================================================

-- 활성화된 할인 프로모션 뷰
CREATE OR REPLACE VIEW active_promotions AS
SELECT 
    dp.promotion_id,
    dp.promotion_name,
    dp.description,
    dp.discount_type,
    dp.discount_value,
    dp.min_order_amount,
    dp.max_discount_amount,
    dp.start_date,
    dp.end_date,
    dp.target_branches,
    dp.target_categories,
    dp.target_menus,
    CASE 
        WHEN dp.discount_type = 'percentage' THEN CONCAT(dp.discount_value, '%')
        ELSE CONCAT(dp.discount_value, '원')
    END as discount_display,
    DATEDIFF(dp.end_date, CURDATE()) as days_remaining
FROM discount_promotions dp
WHERE dp.is_active = true 
    AND dp.start_date <= CURDATE() 
    AND dp.end_date >= CURDATE()
ORDER BY dp.discount_value DESC, dp.start_date ASC;

-- 지점별 적용 가능한 할인 프로모션 뷰
CREATE OR REPLACE VIEW branch_available_promotions AS
SELECT 
    b.branch_id,
    b.branch_code,
    b.branch_name,
    dp.promotion_id,
    dp.promotion_name,
    dp.description,
    dp.discount_type,
    dp.discount_value,
    dp.min_order_amount,
    dp.max_discount_amount,
    dp.start_date,
    dp.end_date,
    CASE 
        WHEN dp.discount_type = 'percentage' THEN CONCAT(dp.discount_value, '%')
        ELSE CONCAT(dp.discount_value, '원')
    END as discount_display
FROM branches b
CROSS JOIN discount_promotions dp
WHERE dp.is_active = true 
    AND dp.start_date <= CURDATE() 
    AND dp.end_date >= CURDATE()
    AND (
        dp.target_branches IS NULL 
        OR JSON_CONTAINS(dp.target_branches, JSON_QUOTE(b.branch_code))
    )
ORDER BY b.branch_id, dp.discount_value DESC;

-- =====================================================
-- 4. 할인 프로모션 통계 뷰 생성
-- =====================================================

-- 할인 프로모션별 사용 통계 뷰
CREATE OR REPLACE VIEW promotion_usage_stats AS
SELECT 
    dp.promotion_id,
    dp.promotion_name,
    dp.discount_type,
    dp.discount_value,
    COUNT(duh.usage_id) as total_usage,
    SUM(duh.applied_amount) as total_discount_amount,
    AVG(duh.applied_amount) as avg_discount_amount,
    COUNT(DISTINCT duh.branch_id) as used_branches,
    COUNT(DISTINCT duh.order_id) as total_orders
FROM discount_promotions dp
LEFT JOIN discount_usage_history duh ON dp.promotion_id = duh.promotion_id
WHERE dp.is_active = true
GROUP BY dp.promotion_id, dp.promotion_name, dp.discount_type, dp.discount_value
ORDER BY total_discount_amount DESC;
