-- 주문이력 테이블 생성 및 기존 테이블 스키마 업데이트
-- 파일명: 11_order_history_schema.sql

-- 1. orders 테이블에 cancelled_time 컬럼 추가 (이미 있는 경우 무시)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_time DATETIME NULL;

-- 2. 주문이력 테이블 생성
CREATE TABLE IF NOT EXISTS order_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    branch_id BIGINT NOT NULL,
    customer_name VARCHAR(100),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    order_time DATETIME NOT NULL,
    completed_time DATETIME NULL,
    cancelled_time DATETIME NULL,
    employee_id BIGINT,
    employee_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_branch_id (branch_id),
    INDEX idx_status (status),
    INDEX idx_order_time (order_time),
    INDEX idx_order_id (order_id)
);

-- 3. 기존 완료/취소된 주문 데이터를 주문이력 테이블로 마이그레이션
INSERT INTO order_history (
    order_id, 
    order_number, 
    branch_id, 
    customer_name, 
    total_amount, 
    status, 
    order_time, 
    completed_time, 
    cancelled_time, 
    employee_name
)
SELECT 
    order_id,
    order_number,
    branch_id,
    customer_name,
    final_amount,
    order_status,
    order_time,
    completed_time,
    cancelled_time,
    '담당직원' as employee_name
FROM orders 
WHERE order_status IN ('completed', 'cancelled')
AND NOT EXISTS (
    SELECT 1 FROM order_history oh WHERE oh.order_id = orders.order_id
);

-- 4. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_orders_completed_time ON orders(completed_time);
CREATE INDEX IF NOT EXISTS idx_orders_cancelled_time ON orders(cancelled_time);

-- 5. 테이블 정보 확인
SELECT 
    'orders' as table_name,
    COUNT(*) as total_orders,
    SUM(CASE WHEN order_status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
    SUM(CASE WHEN order_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
FROM orders
UNION ALL
SELECT 
    'order_history' as table_name,
    COUNT(*) as total_orders,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders
FROM order_history;
