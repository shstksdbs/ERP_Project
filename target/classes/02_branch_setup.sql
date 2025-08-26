-- 02_branch_setup.sql
-- 지점 정보 및 지점별 데이터베이스 설정

-- =====================================================
-- 1. 지점 정보 데이터 삽입
-- =====================================================

-- 지점 1 (강남점)
INSERT IGNORE INTO branches (branch_code, branch_name, branch_type, address, phone, manager_name, status, opening_hours, opening_date) VALUES
('GN001', '강남점', 'branch', '서울특별시 강남구 역삼동 456', '02-2345-6789', '박지점장', 'active', '{"open": "07:00", "close": "23:00"}', '2023-03-15');

-- 지점 2 (홍대점)
INSERT IGNORE INTO branches (branch_code, branch_name, branch_type, address, phone, manager_name, status, opening_hours, opening_date) VALUES
('HD001', '홍대점', 'branch', '서울특별시 마포구 홍대입구 789', '02-3456-7890', '한지점장', 'active', '{"open": "08:00", "close": "24:00"}', '2023-06-22');

-- 지점 3 (신촌점)
INSERT IGNORE INTO branches (branch_code, branch_name, branch_type, address, phone, manager_name, status, opening_hours, opening_date) VALUES
('SC001', '신촌점', 'branch', '서울특별시 서대문구 신촌동 101', '02-4567-8901', '강지점장', 'active', '{"open": "07:30", "close": "22:30"}', '2023-09-08');

-- 지점 4 (잠실점)
INSERT IGNORE INTO branches (branch_code, branch_name, branch_type, address, phone, manager_name, status, opening_hours, opening_date) VALUES
('JS001', '잠실점', 'branch', '서울특별시 송파구 잠실동 202', '02-5678-9012', '구지점장', 'active', '{"open": "08:00", "close": "23:00"}', '2024-01-12');

-- 지점 5 (송파점)
INSERT IGNORE INTO branches (branch_code, branch_name, branch_type, address, phone, manager_name, status, opening_hours, opening_date) VALUES
('SP001', '송파점', 'branch', '서울특별시 송파구 송파동 303', '02-6789-0123', '신지점장', 'active', '{"open": "07:00", "close": "22:00"}', '2024-04-05');

-- 본사 지점 추가
INSERT IGNORE INTO branches (id, branch_code, branch_name, branch_type, address, phone, manager_name, status, opening_hours, opening_date) VALUES
(99, 'HQ001', '본사', 'headquarters', '서울특별시 강남구 테헤란로 123', '02-1234-5678', '본사관리자', 'active', '{"open": "09:00", "close": "18:00"}', '2023-01-01');

-- =====================================================
-- 2. 지점별 데이터 확인 쿼리
-- =====================================================

-- 지점별 사용자 현황 확인 (users 테이블과 연동)
SELECT 
    b.branch_name,
    b.branch_code,
    COUNT(u.id) as total_users,
    COUNT(CASE WHEN u.is_active = TRUE THEN 1 END) as active_users,
    COUNT(CASE WHEN u.role = 'ADMIN' THEN 1 END) as admin_count,
    COUNT(CASE WHEN u.role = 'MANAGER' THEN 1 END) as manager_count,
    COUNT(CASE WHEN u.role = 'STAFF' THEN 1 END) as staff_count
FROM branches b
LEFT JOIN users u ON b.branch_id = u.branch_id
GROUP BY b.branch_id, b.branch_name, b.branch_code
ORDER BY b.branch_id;
