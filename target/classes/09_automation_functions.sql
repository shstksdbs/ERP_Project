-- 09_automation_functions.sql
-- 자동화 함수 및 트리거

-- =====================================================
-- 1. 할인 프로모션 자동 적용 함수
-- =====================================================

-- 주문에 적용 가능한 할인 프로모션 조회 함수
DELIMITER //
CREATE PROCEDURE GetAvailablePromotions(IN order_amount DECIMAL(10,2), IN branch_code VARCHAR(10))
BEGIN
    SELECT 
        dp.promotion_id,
        dp.promotion_name,
        dp.description,
        dp.discount_type,
        dp.discount_value,
        dp.min_order_amount,
        dp.max_discount_amount,
        CASE 
            WHEN dp.discount_type = 'percentage' THEN CONCAT(dp.discount_value, '%')
            ELSE CONCAT(dp.discount_value, '원')
        END as discount_display,
        CASE 
            WHEN dp.discount_type = 'percentage' THEN 
                LEAST(order_amount * (dp.discount_value / 100), COALESCE(dp.max_discount_amount, 999999))
            ELSE dp.discount_value
        END as calculated_discount
    FROM discount_promotions dp
    WHERE dp.is_active = true
        AND dp.start_date <= CURDATE()
        AND dp.end_date >= CURDATE()
        AND order_amount >= dp.min_order_amount
        AND (
            dp.target_branches IS NULL 
            OR JSON_CONTAINS(dp.target_branches, JSON_QUOTE(branch_code))
        )
    ORDER BY dp.discount_value DESC;
END//
DELIMITER ;

-- 주문에 할인 프로모션 적용 함수
DELIMITER //
CREATE PROCEDURE ApplyPromotionToOrder(IN order_id BIGINT, IN promotion_id BIGINT)
BEGIN
    DECLARE order_amount DECIMAL(10,2);
    DECLARE discount_amount DECIMAL(10,2);
    DECLARE discount_type VARCHAR(20);
    DECLARE discount_value DECIMAL(10,2);
    DECLARE max_discount DECIMAL(10,2);
    DECLARE branch_id_val BIGINT;
    DECLARE customer_name_val VARCHAR(100);
    DECLARE customer_phone_val VARCHAR(20);
    
    -- 주문 정보 조회
    SELECT o.total_amount, o.branch_id, o.customer_name, o.customer_phone
    INTO order_amount, branch_id_val, customer_name_val, customer_phone_val
    FROM orders o WHERE o.order_id = order_id;
    
    -- 할인 프로모션 정보 조회
    SELECT dp.discount_type, dp.discount_value, dp.max_discount_amount
    INTO discount_type, discount_value, max_discount
    FROM discount_promotions dp WHERE dp.promotion_id = promotion_id;
    
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
    SET discount_amount = discount_amount,
        final_amount = total_amount - discount_amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE order_id = order_id;
    
    -- 할인 사용 내역 기록
    INSERT INTO discount_usage_history (
        promotion_id, order_id, branch_id, applied_amount, 
        original_amount, final_amount, customer_name, customer_phone
    ) VALUES (
        promotion_id, order_id, branch_id_val, discount_amount,
        order_amount, order_amount - discount_amount, customer_name_val, customer_phone_val
    );
    
    SELECT CONCAT('할인 프로모션이 적용되었습니다. 할인 금액: ', discount_amount, '원') AS message;
END//
DELIMITER ;

-- 활성화된 할인 프로모션 조회 함수
DELIMITER //
CREATE PROCEDURE GetActivePromotions()
BEGIN
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
END//
DELIMITER ;

-- =====================================================
-- 2. 주문 처리 자동화 함수
-- =====================================================

-- 주문 완료 시 매출 통계 업데이트 함수
DELIMITER //
CREATE PROCEDURE UpdateSalesStatistics(IN order_id BIGINT)
BEGIN
    DECLARE branch_id_val BIGINT;
    DECLARE order_amount DECIMAL(10,2);
    DECLARE discount_amount DECIMAL(10,2);
    DECLARE order_date DATE;
    DECLARE order_hour INT;
    
    -- 주문 정보 조회
    SELECT o.branch_id, o.final_amount, o.discount_amount, 
           DATE(o.completed_time), HOUR(o.completed_time)
    INTO branch_id_val, order_amount, discount_amount, order_date, order_hour
    FROM orders o WHERE o.order_id = order_id;
    
    -- 일별 매출 요약 업데이트
    INSERT INTO daily_sales_summary (branch_id, sale_date, total_orders, total_revenue, discount_total)
    VALUES (branch_id_val, order_date, 1, order_amount, discount_amount)
    ON DUPLICATE KEY UPDATE
        total_orders = total_orders + 1,
        total_revenue = total_revenue + order_amount,
        discount_total = discount_total + discount_amount,
        updated_at = CURRENT_TIMESTAMP;
    
    -- 시간별 매출 업데이트
    INSERT INTO hourly_sales (branch_id, sale_date, hour, order_count, revenue)
    VALUES (branch_id_val, order_date, order_hour, 1, order_amount)
    ON DUPLICATE KEY UPDATE
        order_count = order_count + 1,
        revenue = revenue + order_amount;
    
    SELECT '매출 통계가 업데이트되었습니다.' AS message;
END//
DELIMITER ;

-- 주문 완료 시 재고 자동 차감 함수
DELIMITER //
CREATE PROCEDURE UpdateInventoryAfterOrder(IN order_id BIGINT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE menu_id_val BIGINT;
    DECLARE quantity_val INT;
    DECLARE ingredient_id_val BIGINT;
    DECLARE consumption_amount DECIMAL(10,3);
    DECLARE branch_id_val BIGINT;
    
    -- 커서 선언
    DECLARE order_cursor CURSOR FOR
        SELECT oi.menu_id, oi.quantity, o.branch_id
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE oi.order_id = order_id;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- 트랜잭션 시작
    START TRANSACTION;
    
    -- 주문된 메뉴별로 재고 차감
    OPEN order_cursor;
    
    read_loop: LOOP
        FETCH order_cursor INTO menu_id_val, quantity_val, branch_id_val;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- 메뉴의 원재료 소모량 계산 및 재고 차감
        UPDATE inventory i
        JOIN menu_ingredients mi ON i.ingredient_id = mi.ingredient_id
        SET i.current_stock = i.current_stock - (mi.quantity_per_serving * quantity_val),
            i.last_updated = NOW()
        WHERE mi.menu_id = menu_id_val AND i.branch_id = branch_id_val;
        
    END LOOP;
    
    CLOSE order_cursor;
    
    -- 트랜잭션 커밋
    COMMIT;
    
    SELECT '재고가 자동으로 차감되었습니다.' AS message;
    
END//
DELIMITER ;

-- =====================================================
-- 3. 옵션 템플릿 관리 함수
-- =====================================================

-- 메뉴의 모든 옵션 조회 함수
DELIMITER //
CREATE PROCEDURE GetMenuOptions(IN menu_id BIGINT)
BEGIN
    SELECT 
        mo.name AS option_code,
        mo.display_name AS option_name,
        mo.category AS option_category,
        mo.price AS option_price,
        tor.is_default,
        tor.is_removable,
        tor.is_addable,
        tor.display_order
    FROM menus m
    JOIN menu_template_relations mtr ON m.id = mtr.menu_id
    JOIN template_option_relations tor ON mtr.template_id = tor.template_id
    JOIN menu_options mo ON tor.option_id = mo.id
    WHERE m.id = menu_id AND mo.is_available = true
    ORDER BY tor.display_order;
END//
DELIMITER ;

-- 새 옵션을 모든 관련 메뉴에 자동 추가 함수
DELIMITER //
CREATE PROCEDURE AddOptionToAllBurgers(IN option_name VARCHAR(100), IN option_display_name VARCHAR(100), 
                                      IN option_price DECIMAL(10,2), IN is_default BOOLEAN)
BEGIN
    DECLARE new_option_id BIGINT;
    
    -- 새 옵션 생성
    INSERT INTO menu_options (name, display_name, category, price, is_available, display_order, description, created_at, updated_at)
    VALUES (option_name, option_display_name, 'topping', option_price, true, 
            (SELECT COALESCE(MAX(display_order), 0) + 1 FROM menu_options), '새로 추가된 옵션', NOW(), NOW());
    
    SET new_option_id = LAST_INSERT_ID();
    
    -- 모든 버거 템플릿에 옵션 추가
    INSERT INTO template_option_relations (template_id, option_id, is_default, is_removable, is_addable, display_order)
    SELECT id, new_option_id, is_default, true, true, 
           (SELECT COALESCE(MAX(display_order), 0) + 1 FROM template_option_relations WHERE template_id = t.id)
    FROM option_templates t WHERE category = 'burger';
    
    SELECT CONCAT('새 옵션 "', option_display_name, '"이 모든 버거에 추가되었습니다.') AS message;
END//
DELIMITER ;

-- =====================================================
-- 4. 트리거 생성
-- =====================================================

-- 주문 완료 시 매출 통계 업데이트 트리거
DELIMITER //
CREATE TRIGGER after_order_completed
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.order_status = 'completed' AND OLD.order_status != 'completed' THEN
        -- 매출 통계 업데이트
        CALL UpdateSalesStatistics(NEW.order_id);
        
        -- 재고 차감
        CALL UpdateInventoryAfterOrder(NEW.order_id);
    END IF;
END//
DELIMITER ;

-- 재고 부족 시 로그 생성 트리거
DELIMITER //
CREATE TRIGGER after_inventory_low_stock
AFTER UPDATE ON inventory
FOR EACH ROW
BEGIN
    IF NEW.current_stock <= NEW.min_stock AND OLD.current_stock > OLD.min_stock THEN
        INSERT INTO system_logs (branch_id, log_level, log_category, message, details)
        VALUES (
            NEW.branch_id, 
            'WARNING', 
            'INVENTORY', 
            CONCAT('재고 부족: ', (SELECT name FROM ingredients WHERE ingredient_id = NEW.ingredient_id)),
            JSON_OBJECT(
                'ingredient_id', NEW.ingredient_id,
                'current_stock', NEW.current_stock,
                'min_stock', NEW.min_stock,
                'unit', NEW.unit
            )
        );
    END IF;
END//
DELIMITER ;

-- =====================================================
-- 5. 유틸리티 함수
-- =====================================================

-- 지점별 주문 현황 요약 함수
DELIMITER //
CREATE PROCEDURE GetBranchOrderSummary(IN days_back INT)
BEGIN
    SELECT 
        b.branch_id,
        b.branch_name,
        b.branch_code,
        COUNT(o.order_id) as total_orders,
        SUM(o.final_amount) as total_revenue,
        AVG(o.final_amount) as avg_order_value,
        COUNT(CASE WHEN o.order_status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN o.order_status = 'pending' THEN 1 END) as pending_orders,
        SUM(o.discount_amount) as total_discount
    FROM branches b
    LEFT JOIN orders o ON b.branch_id = o.branch_id 
        AND o.order_time >= DATE_SUB(CURDATE(), INTERVAL days_back DAY)
    GROUP BY b.branch_id, b.branch_name, b.branch_code
    ORDER BY total_revenue DESC;
END//
DELIMITER ;

-- 할인 프로모션 통계 조회 함수
DELIMITER //
CREATE PROCEDURE GetPromotionStatistics(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT 
        dp.promotion_name,
        dp.discount_type,
        dp.discount_value,
        COUNT(duh.usage_id) as total_usage,
        SUM(duh.applied_amount) as total_discount_amount,
        AVG(duh.applied_amount) as avg_discount_amount,
        COUNT(DISTINCT duh.branch_id) as used_branches
    FROM discount_promotions dp
    LEFT JOIN discount_usage_history duh ON dp.promotion_id = duh.promotion_id
        AND duh.used_at BETWEEN start_date AND end_date
    WHERE dp.is_active = true
    GROUP BY dp.promotion_id, dp.promotion_name, dp.discount_type, dp.discount_value
    ORDER BY total_discount_amount DESC;
END//
DELIMITER ;
