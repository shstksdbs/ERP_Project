-- 10_discount_functions.sql
-- 간단한 할인 자동 계산 함수들 (시간대별 할인 제외)

-- 주문에 적용 가능한 할인 규칙 조회 함수
CREATE PROCEDURE GetAvailableDiscounts(IN order_amount DECIMAL(10,2), IN customer_type VARCHAR(20), IN order_date DATE)
BEGIN
    SELECT 
        dr.id,
        dr.name,
        dr.description,
        dr.discount_type,
        dr.discount_value,
        dr.min_order_amount,
        dr.max_discount_amount,
        dc.name AS category_name
    FROM discount_rules dr
    JOIN discount_categories dc ON dr.category_id = dc.id
    WHERE dr.is_active = true
        AND dc.is_active = true
        AND dr.start_date <= order_date
        AND dr.end_date >= order_date
        AND (dr.customer_type = 'all' OR dr.customer_type = customer_type)
        AND order_amount >= dr.min_order_amount
        AND (dr.total_usage_limit IS NULL OR dr.total_usage_limit > 
             (SELECT COUNT(*) FROM discount_usage_history WHERE discount_rule_id = dr.id))
    ORDER BY dr.discount_value DESC;
END;

-- 주문에 할인 적용 함수
CREATE PROCEDURE ApplyDiscountToOrder(IN order_id BIGINT, IN discount_rule_id BIGINT, IN customer_id VARCHAR(100))
BEGIN
    DECLARE order_amount DECIMAL(10,2);
    DECLARE discount_amount DECIMAL(10,2);
    DECLARE discount_type VARCHAR(20);
    DECLARE discount_value DECIMAL(10,2);
    DECLARE max_discount DECIMAL(10,2);
    
    -- 주문 금액 조회
    SELECT total_amount INTO order_amount FROM orders WHERE id = order_id;
    
    -- 할인 규칙 정보 조회
    SELECT dr.discount_type, dr.discount_value, dr.max_discount_amount
    INTO discount_type, discount_value, max_discount
    FROM discount_rules dr WHERE dr.id = discount_rule_id;
    
    -- 할인 금액 계산
    IF discount_type = 'percentage' THEN
        SET discount_amount = order_amount * (discount_value / 100);
        IF max_discount IS NOT NULL AND discount_amount > max_discount THEN
            SET discount_amount = max_discount;
        END IF;
    ELSEIF discount_type = 'fixed_amount' THEN
        SET discount_amount = discount_value;
    ELSE
        SET discount_amount = 0;
    END IF;
    
    -- 주문에 할인 적용
    UPDATE orders 
    SET discount_rule_id = discount_rule_id,
        discount_amount = discount_amount,
        final_amount = total_amount - discount_amount,
        original_total_amount = total_amount
    WHERE id = order_id;
    
    -- 할인 사용 내역 기록
    INSERT INTO discount_usage_history (order_id, discount_rule_id, applied_amount, original_amount, final_amount, customer_id)
    VALUES (order_id, discount_rule_id, discount_amount, order_amount, order_amount - discount_amount, customer_id);
    
    SELECT CONCAT('할인이 적용되었습니다. 할인 금액: ', discount_amount, '원') AS message;
END;

-- 할인 통계 조회 함수
CREATE PROCEDURE GetDiscountStatistics(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT 
        dc.name AS category_name,
        COUNT(duh.id) AS total_usage,
        SUM(duh.applied_amount) AS total_discount_amount,
        AVG(duh.applied_amount) AS avg_discount_amount,
        COUNT(DISTINCT duh.order_id) AS total_orders
    FROM discount_categories dc
    LEFT JOIN discount_rules dr ON dc.id = dr.category_id
    LEFT JOIN discount_usage_history duh ON dr.id = duh.discount_rule_id
    WHERE (duh.used_at BETWEEN start_date AND end_date) OR duh.used_at IS NULL
    GROUP BY dc.id, dc.name
    ORDER BY total_discount_amount DESC;
END;

-- 특정 메뉴/카테고리에 할인 적용 함수
CREATE PROCEDURE ApplyDiscountToMenu(IN discount_rule_id BIGINT, IN target_type VARCHAR(20), IN target_name VARCHAR(100))
BEGIN
    INSERT INTO discount_targets (discount_rule_id, target_type, target_name)
    VALUES (discount_rule_id, target_type, target_name);
    
    SELECT CONCAT('할인 규칙이 ', target_name, '에 적용되었습니다.') AS message;
END;

-- 활성화된 할인 규칙 조회 함수
CREATE PROCEDURE GetActiveDiscounts()
BEGIN
    SELECT 
        dr.id,
        dr.name,
        dr.description,
        dr.discount_type,
        dr.discount_value,
        dr.min_order_amount,
        dr.max_discount_amount,
        dr.start_date,
        dr.end_date,
        dc.name AS category_name
    FROM discount_rules dr
    JOIN discount_categories dc ON dr.category_id = dc.id
    WHERE dr.is_active = true 
        AND dc.is_active = true
        AND dr.start_date <= CURDATE()
        AND dr.end_date >= CURDATE()
    ORDER BY dc.name, dr.discount_value DESC;
END;
