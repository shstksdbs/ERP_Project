-- 12_branch_database_setup.sql
-- 지점 3개를 위한 키오스크 데이터베이스 구축

-- =====================================================
-- 1. 지점 정보 테이블 생성
-- =====================================================

-- 지점 마스터 테이블
CREATE TABLE IF NOT EXISTS branches (
    branch_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    branch_code VARCHAR(10) UNIQUE NOT NULL COMMENT '지점 코드 (HQ001, BR001, BR002)',
    branch_name VARCHAR(100) NOT NULL COMMENT '지점명',
    branch_type ENUM('headquarters', 'branch', 'franchise') DEFAULT 'branch' COMMENT '지점 유형',
    address TEXT COMMENT '주소',
    phone VARCHAR(20) COMMENT '연락처',
    manager_name VARCHAR(100) COMMENT '매니저명',
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active' COMMENT '지점 상태',
    opening_hours JSON COMMENT '영업시간 (JSON 형태)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_branch_code (branch_code),
    INDEX idx_branch_status (status)
);

-- =====================================================
-- 2. 지점별 메뉴 관리 테이블
-- =====================================================

-- 지점별 메뉴 가용성 및 가격 관리
CREATE TABLE IF NOT EXISTS branch_menus (
    branch_menu_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    branch_id BIGINT NOT NULL COMMENT '지점 ID',
    menu_id BIGINT NOT NULL COMMENT '메뉴 ID',
    is_available BOOLEAN DEFAULT TRUE COMMENT '판매 가능 여부',
    custom_price DECIMAL(10,2) COMMENT '지점별 커스텀 가격 (NULL이면 기본가격 사용)',
    stock_quantity INT DEFAULT -1 COMMENT '재고 수량 (-1은 무제한)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    UNIQUE KEY unique_branch_menu (branch_id, menu_id),
    INDEX idx_branch_available (branch_id, is_available),
    INDEX idx_menu_available (menu_id, is_available)
);

-- =====================================================
-- 3. 주문 관련 테이블 (지점별)
-- =====================================================

-- 주문 마스터 테이블 (지점별)
CREATE TABLE IF NOT EXISTS orders (
    order_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    branch_id BIGINT NOT NULL COMMENT '지점 ID',
    order_number VARCHAR(20) UNIQUE NOT NULL COMMENT '주문번호 (지점별 고유)',
    order_status ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '주문 상태',
    order_type ENUM('dine_in', 'takeout') DEFAULT 'dine_in' COMMENT '주문 유형',
    customer_name VARCHAR(100) COMMENT '고객명 (선택사항)',
    customer_phone VARCHAR(20) COMMENT '고객 연락처 (선택사항)',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '총 주문 금액',
    discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '할인 금액',
    final_amount DECIMAL(10,2) NOT NULL COMMENT '최종 결제 금액',
    payment_method ENUM('cash', 'card', 'mobile') DEFAULT 'cash' COMMENT '결제 방법',
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending' COMMENT '결제 상태',
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '주문 시간',
    completed_time TIMESTAMP NULL COMMENT '완료 시간',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    INDEX idx_branch_order (branch_id, order_time),
    INDEX idx_order_status (order_status),
    INDEX idx_order_number (order_number),
    INDEX idx_order_time (order_time)
);

-- 주문 상세 테이블 (지점별)
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL COMMENT '주문 ID',
    menu_id BIGINT NOT NULL COMMENT '메뉴 ID',
    menu_name VARCHAR(100) NOT NULL COMMENT '메뉴명 (주문 시점 기준)',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '단가',
    quantity INT NOT NULL COMMENT '수량',
    total_price DECIMAL(10,2) NOT NULL COMMENT '총 가격',
    options_json JSON COMMENT '선택된 옵션들 (JSON 형태)',
    display_name VARCHAR(200) COMMENT '표시용 이름',
    display_options JSON COMMENT '표시용 옵션들',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_menu_id (menu_id)
);

-- =====================================================
-- 4. 결제 관련 테이블 (지점별)
-- =====================================================

-- 결제 정보 테이블
CREATE TABLE IF NOT EXISTS payments (
    payment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL COMMENT '주문 ID',
    payment_method ENUM('cash', 'card', 'mobile') NOT NULL COMMENT '결제 방법',
    payment_amount DECIMAL(10,2) NOT NULL COMMENT '결제 금액',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending' COMMENT '결제 상태',
    transaction_id VARCHAR(100) COMMENT '결제 거래 ID',
    card_info JSON COMMENT '카드 정보 (JSON, 암호화)',
    cash_received DECIMAL(10,2) COMMENT '현금 결제 시 받은 금액',
    cash_change DECIMAL(10,2) COMMENT '현금 결제 시 거스름돈',
    payment_time TIMESTAMP NULL COMMENT '결제 완료 시간',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_transaction_id (transaction_id)
);

-- =====================================================
-- 5. 재고 관리 테이블 (지점별)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ingredient_category (category),
    INDEX idx_ingredient_active (is_active)
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
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
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
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_menu_ingredient (menu_id, ingredient_id),
    INDEX idx_menu_id (menu_id),
    INDEX idx_ingredient_id (ingredient_id)
);

-- =====================================================
-- 6. 매출 통계 테이블 (지점별)
-- =====================================================

-- 일별 매출 요약
CREATE TABLE IF NOT EXISTS daily_sales_summary (
    summary_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    branch_id BIGINT NOT NULL COMMENT '지점 ID',
    sale_date DATE NOT NULL COMMENT '판매 날짜',
    total_orders INT NOT NULL DEFAULT 0 COMMENT '총 주문 수',
    total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '총 매출',
    total_cost DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '총 비용',
    gross_profit DECIMAL(12,2) NOT NULL DEFAULT 0 COMMENT '총 이익',
    discount_total DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '총 할인액',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    UNIQUE KEY unique_branch_date (branch_id, sale_date),
    INDEX idx_branch_date (branch_id, sale_date),
    INDEX idx_sale_date (sale_date)
);

-- 시간별 매출
CREATE TABLE IF NOT EXISTS hourly_sales (
    hourly_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    branch_id BIGINT NOT NULL COMMENT '지점 ID',
    sale_date DATE NOT NULL COMMENT '판매 날짜',
    hour INT NOT NULL COMMENT '시간 (0-23)',
    order_count INT NOT NULL DEFAULT 0 COMMENT '주문 수',
    revenue DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '매출',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE CASCADE,
    UNIQUE KEY unique_branch_date_hour (branch_id, sale_date, hour),
    INDEX idx_branch_date_hour (branch_id, sale_date, hour)
);

-- =====================================================
-- 7. 시스템 로그 테이블
-- =====================================================

-- 시스템 로그
CREATE TABLE IF NOT EXISTS system_logs (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    branch_id BIGINT COMMENT '지점 ID (NULL은 중앙 시스템)',
    log_level ENUM('INFO', 'WARNING', 'ERROR', 'CRITICAL') NOT NULL DEFAULT 'INFO',
    log_category VARCHAR(50) NOT NULL COMMENT '로그 카테고리',
    message TEXT NOT NULL COMMENT '로그 메시지',
    details JSON COMMENT '상세 정보 (JSON)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_branch_log (branch_id, created_at),
    INDEX idx_log_level (log_level),
    INDEX idx_log_category (log_category),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 8. 인덱스 및 제약조건 추가
-- =====================================================

-- 성능 향상을 위한 추가 인덱스
CREATE INDEX idx_orders_branch_status_time ON orders(branch_id, order_status, order_time);
CREATE INDEX idx_order_items_order_menu ON order_items(order_id, menu_id);
CREATE INDEX idx_payments_order_method ON payments(order_id, payment_method);
CREATE INDEX idx_inventory_branch_ingredient ON inventory(branch_id, ingredient_id);
CREATE INDEX idx_daily_sales_branch_date ON daily_sales_summary(branch_id, sale_date);
CREATE INDEX idx_hourly_sales_branch_date ON hourly_sales(branch_id, sale_date);

-- =====================================================
-- 9. 뷰 생성 (자주 사용되는 쿼리)
-- =====================================================

-- 지점별 주문 현황 뷰
CREATE OR REPLACE VIEW branch_order_summary AS
SELECT 
    b.branch_id,
    b.branch_name,
    b.branch_code,
    COUNT(o.order_id) as total_orders,
    SUM(o.final_amount) as total_revenue,
    AVG(o.final_amount) as avg_order_value,
    COUNT(CASE WHEN o.order_status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN o.order_status = 'pending' THEN 1 END) as pending_orders
FROM branches b
LEFT JOIN orders o ON b.branch_id = o.branch_id 
    AND o.order_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY b.branch_id, b.branch_name, b.branch_code;

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

-- =====================================================
-- 10. 트리거 생성
-- =====================================================

-- 주문 완료 시 매출 통계 업데이트 트리거
DELIMITER //
CREATE TRIGGER after_order_completed
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.order_status = 'completed' AND OLD.order_status != 'completed' THEN
        -- 일별 매출 요약 업데이트
        INSERT INTO daily_sales_summary (branch_id, sale_date, total_orders, total_revenue, discount_total)
        VALUES (NEW.branch_id, DATE(NEW.completed_time), 1, NEW.final_amount, NEW.discount_amount)
        ON DUPLICATE KEY UPDATE
            total_orders = total_orders + 1,
            total_revenue = total_revenue + NEW.final_amount,
            discount_total = discount_total + NEW.discount_amount,
            updated_at = CURRENT_TIMESTAMP;
        
        -- 시간별 매출 업데이트
        INSERT INTO hourly_sales (branch_id, sale_date, hour, order_count, revenue)
        VALUES (NEW.branch_id, DATE(NEW.completed_time), HOUR(NEW.completed_time), 1, NEW.final_amount)
        ON DUPLICATE KEY UPDATE
            order_count = order_count + 1,
            revenue = revenue + NEW.final_amount;
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
