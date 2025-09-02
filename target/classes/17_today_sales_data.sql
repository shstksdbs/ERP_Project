-- 17_today_sales_data.sql
-- 오늘 날짜의 매출 데이터 생성

-- 오늘 날짜의 전지점 매출 데이터 삽입
INSERT INTO erp_system.sales_statistics (
  branch_id, 
  statistic_date, 
  statistic_hour, 
  total_orders, 
  total_sales, 
  total_discount, 
  net_sales, 
  cash_sales, 
  card_sales, 
  mobile_sales, 
  average_order_value,
  created_at,
  updated_at
) VALUES 
-- 지점 1: 오늘 매출 5500원, 주문 1개
(1, CURDATE(), NULL, 1, 5500.00, 0.00, 5500.00, 3000.00, 2500.00, 0.00, 5500.00, NOW(), NOW()),

-- 지점 2: 오늘 매출 6800원, 주문 1개  
(2, CURDATE(), NULL, 1, 6800.00, 0.00, 6800.00, 4000.00, 2800.00, 0.00, 6800.00, NOW(), NOW()),

-- 지점 3: 오늘 매출 8100원, 주문 1개
(3, CURDATE(), NULL, 1, 8100.00, 0.00, 8100.00, 5000.00, 3100.00, 0.00, 8100.00, NOW(), NOW());

-- 오늘 날짜의 메뉴별 매출 데이터도 생성
INSERT INTO erp_system.menu_sales_statistics (
  branch_id,
  menu_id,
  statistic_date,
  quantity_sold,
  total_sales,
  discount_amount,
  net_sales
) VALUES 
-- 지점 1의 메뉴별 매출
(1, 1, CURDATE(), 1, 5500.00, 0.00, 5500.00),

-- 지점 2의 메뉴별 매출  
(2, 2, CURDATE(), 1, 6800.00, 0.00, 6800.00),

-- 지점 3의 메뉴별 매출
(3, 3, CURDATE(), 1, 8100.00, 0.00, 8100.00);
