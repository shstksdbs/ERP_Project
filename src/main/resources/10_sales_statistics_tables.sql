-- 매출 분석을 위한 테이블 생성
-- 이 파일은 기존 주문, 결제 시스템과 연동되어 매출 통계를 자동으로 수집합니다.

-- 4. 매출 통계 자동 업데이트를 위한 트리거
DELIMITER //

-- 주문 완료 + 결제 완료 시 매출 통계 업데이트 트리거
CREATE TRIGGER IF NOT EXISTS after_order_completed
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    -- 주문 상태가 completed이고, 결제 상태도 completed일 때만 매출 통계 업데이트
    IF NEW.order_status = 'completed' AND OLD.order_status != 'completed' AND 
       NEW.payment_status = 'completed' THEN
        CALL UpdateSalesStatistics(NEW.order_id);
    END IF;
END//

DELIMITER ;

-- 5. 매출 통계 업데이트 프로시저들
DELIMITER //

-- 매출 통계 업데이트 메인 프로시저
CREATE PROCEDURE IF NOT EXISTS UpdateSalesStatistics(IN p_order_id BIGINT)
BEGIN
    DECLARE v_branch_id BIGINT;
    DECLARE v_order_date DATE;
    DECLARE v_order_hour INT;
    DECLARE v_total_amount DECIMAL(10,2);
    DECLARE v_discount_amount DECIMAL(10,2);
    DECLARE v_payment_method VARCHAR(20);
    
    -- 주문 정보 조회
    SELECT 
        o.branch_id,
        DATE(o.created_at),
        HOUR(o.created_at),
        o.total_amount,
        COALESCE(o.discount_amount, 0),
        p.payment_method
    INTO v_branch_id, v_order_date, v_order_hour, v_total_amount, v_discount_amount, v_payment_method
    FROM orders o
    LEFT JOIN payments p ON o.order_id = p.order_id
    WHERE o.order_id = p_order_id;
    
    -- 일별 통계 업데이트 (statistic_hour = NULL)
    INSERT INTO sales_statistics (branch_id, statistic_date, total_orders, total_sales, total_discount, net_sales)
    VALUES (v_branch_id, v_order_date, 1, v_total_amount, v_discount_amount, v_total_amount - v_discount_amount)
    ON DUPLICATE KEY UPDATE
        total_orders = total_orders + 1,
        total_sales = total_sales + v_total_amount,
        total_discount = total_discount + v_discount_amount,
        net_sales = net_sales + (v_total_amount - v_discount_amount),
        updated_at = CURRENT_TIMESTAMP;
    
    -- 시간별 통계 업데이트
    INSERT INTO sales_statistics (branch_id, statistic_date, statistic_hour, total_orders, total_sales, total_discount, net_sales)
    VALUES (v_branch_id, v_order_date, v_order_hour, 1, v_total_amount, v_discount_amount, v_total_amount - v_discount_amount)
    ON DUPLICATE KEY UPDATE
        total_orders = total_orders + 1,
        total_sales = total_sales + v_total_amount,
        total_discount = total_discount + v_discount_amount,
        net_sales = net_sales + (v_total_amount - v_discount_amount),
        updated_at = CURRENT_TIMESTAMP;
    
    -- 결제 방법별 매출 업데이트
    IF v_payment_method = 'cash' THEN
        UPDATE sales_statistics 
        SET cash_sales = cash_sales + (v_total_amount - v_discount_amount)
        WHERE branch_id = v_branch_id AND statistic_date = v_order_date AND statistic_hour IS NULL;
    ELSEIF v_payment_method = 'card' THEN
        UPDATE sales_statistics 
        SET card_sales = card_sales + (v_total_amount - v_discount_amount)
        WHERE branch_id = v_branch_id AND statistic_date = v_order_date AND statistic_hour IS NULL;
    ELSEIF v_payment_method = 'mobile' THEN
        UPDATE sales_statistics 
        SET mobile_sales = mobile_sales + (v_total_amount - v_discount_amount)
        WHERE branch_id = v_branch_id AND statistic_date = v_order_date AND statistic_hour IS NULL;
    END IF;
    
    -- 메뉴별 및 카테고리별 통계 업데이트
    CALL UpdateMenuSalesStatistics(p_order_id);
    CALL UpdateCategorySalesStatistics(p_order_id);
END//

-- 메뉴별 매출 통계 업데이트 프로시저
CREATE PROCEDURE IF NOT EXISTS UpdateMenuSalesStatistics(IN p_order_id BIGINT)
BEGIN
    DECLARE v_branch_id BIGINT;
    DECLARE v_order_date DATE;
    DECLARE v_menu_id BIGINT;
    DECLARE v_quantity INT;
    DECLARE v_total_price DECIMAL(10,2);
    DECLARE v_discount_amount DECIMAL(10,2);
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE order_cursor CURSOR FOR
        SELECT 
            o.branch_id,
            DATE(o.created_at),
            oi.menu_id,
            oi.quantity,
            oi.total_price,
            COALESCE(o.discount_amount * (oi.total_price / o.total_amount), 0) as item_discount
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE o.order_id = p_order_id;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN order_cursor;
    
    read_loop: LOOP
        FETCH order_cursor INTO v_branch_id, v_order_date, v_menu_id, v_quantity, v_total_price, v_discount_amount;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        INSERT INTO menu_sales_statistics (branch_id, menu_id, statistic_date, quantity_sold, total_sales, discount_amount, net_sales)
        VALUES (v_branch_id, v_menu_id, v_order_date, v_quantity, v_total_price, v_discount_amount, v_total_price - v_discount_amount)
        ON DUPLICATE KEY UPDATE
            quantity_sold = quantity_sold + v_quantity,
            total_sales = total_sales + v_total_price,
            discount_amount = discount_amount + v_discount_amount,
            net_sales = net_sales + (v_total_price - v_discount_amount),
            updated_at = CURRENT_TIMESTAMP;
    END LOOP;
    
    CLOSE order_cursor;
END//

-- 카테고리별 매출 통계 업데이트 프로시저
CREATE PROCEDURE IF NOT EXISTS UpdateCategorySalesStatistics(IN p_order_id BIGINT)
BEGIN
    DECLARE v_branch_id BIGINT;
    DECLARE v_order_date DATE;
    DECLARE v_category_id BIGINT;
    DECLARE v_quantity INT;
    DECLARE v_total_price DECIMAL(10,2);
    DECLARE v_discount_amount DECIMAL(10,2);
    DECLARE done INT DEFAULT FALSE;
    
    DECLARE category_cursor CURSOR FOR
        SELECT 
            o.branch_id,
            DATE(o.created_at),
            m.category_id,
            oi.quantity,
            oi.total_price,
            COALESCE(o.discount_amount * (oi.total_price / o.total_amount), 0) as item_discount
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        JOIN menus m ON oi.menu_id = m.id
        WHERE o.order_id = p_order_id;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN category_cursor;
    
    read_loop: LOOP
        FETCH category_cursor INTO v_branch_id, v_order_date, v_category_id, v_quantity, v_total_price, v_discount_amount;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        INSERT INTO category_sales_statistics (branch_id, category_id, statistic_date, quantity_sold, total_sales, discount_amount, net_sales)
        VALUES (v_branch_id, v_category_id, v_order_date, v_quantity, v_total_price, v_discount_amount, v_total_price - v_discount_amount)
        ON DUPLICATE KEY UPDATE
            quantity_sold = quantity_sold + v_quantity,
            total_sales = total_sales + v_total_price,
            discount_amount = discount_amount + v_discount_amount,
            net_sales = net_sales + (v_total_price - v_discount_amount),
            updated_at = CURRENT_TIMESTAMP;
    END LOOP;
    
    CLOSE category_cursor;
END//

DELIMITER ;

-- 6. 매출 분석을 위한 뷰들
-- 일별 매출 요약 뷰
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
    s.statistic_date,
    b.branch_name,
    s.total_orders,
    s.total_sales,
    s.total_discount,
    s.net_sales,
    s.cash_sales,
    s.card_sales,
    s.mobile_sales,
    ROUND((s.total_discount / s.total_sales) * 100, 2) as discount_rate,
    ROUND(s.net_sales / s.total_orders, 2) as avg_order_value
FROM sales_statistics s
JOIN branches b ON s.branch_id = b.branch_id
WHERE s.statistic_hour IS NULL
ORDER BY s.statistic_date DESC, b.branch_name;

-- 시간별 매출 분석 뷰
CREATE OR REPLACE VIEW hourly_sales_analysis AS
SELECT 
    s.statistic_date,
    s.statistic_hour,
    b.branch_name,
    s.total_orders,
    s.net_sales,
    ROUND(s.net_sales / s.total_orders, 2) as avg_order_value
FROM sales_statistics s
JOIN branches b ON s.branch_id = b.branch_id
WHERE s.statistic_hour IS NOT NULL
ORDER BY s.statistic_date DESC, s.statistic_hour, b.branch_name;

-- 메뉴별 매출 분석 뷰
CREATE OR REPLACE VIEW menu_sales_analysis AS
SELECT 
    ms.statistic_date,
    b.branch_name,
    m.menu_name,
    mc.category_name,
    ms.quantity_sold,
    ms.net_sales,
    ROUND(ms.net_sales / ms.quantity_sold, 2) as avg_price,
    ROUND((ms.discount_amount / ms.total_sales) * 100, 2) as discount_rate
FROM menu_sales_statistics ms
JOIN branches b ON ms.branch_id = b.branch_id
JOIN menus m ON ms.menu_id = m.id
JOIN menu_categories mc ON m.category_id = mc.category_id
ORDER BY ms.statistic_date DESC, b.branch_name, mc.category_name, ms.net_sales DESC;

-- 7. 샘플 데이터 삽입 (테스트용)
-- 실제 운영 시에는 주문 완료 시 자동으로 생성되므로 불필요
-- INSERT INTO sales_statistics (branch_id, statistic_date, total_orders, total_sales, net_sales) VALUES
-- (1, '2024-01-01', 10, 150000.00, 150000.00),
-- (2, '2024-01-01', 8, 120000.00, 120000.00),
-- (3, '2024-01-01', 12, 180000.00, 180000.00);

-- 8. 인덱스 최적화
-- 이미 위에서 생성했지만, 추가 최적화가 필요한 경우
-- CREATE INDEX idx_sales_branch_date_hour ON sales_statistics(branch_id, statistic_date, statistic_hour);
-- CREATE INDEX idx_menu_sales_branch_date ON menu_sales_statistics(branch_id, statistic_date);
-- CREATE INDEX idx_category_sales_branch_date ON category_sales_statistics(branch_id, statistic_date);

-- 9. 테이블 정보 확인
-- SHOW TABLES LIKE '%sales%';
-- DESCRIBE sales_statistics;
-- DESCRIBE menu_sales_statistics;
-- DESCRIBE category_sales_statistics;
