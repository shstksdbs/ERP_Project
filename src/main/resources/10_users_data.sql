-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(100) NOT NULL,
    branch_id BIGINT NOT NULL,
    role ENUM('ADMIN', 'MANAGER', 'STAFF') NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login DATETIME,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

-- 임시 사용자 데이터 추가
-- 비밀번호는 실제 운영환경에서는 암호화해야 합니다
INSERT INTO users (username, password, real_name, branch_id, role, email, phone, is_active, created_at) VALUES
-- 지점 1 (강남점)
('admin_gangnam', 'admin123', '김관리자', 1, 'ADMIN', 'admin.gangnam@company.com', '010-1000-0001', TRUE, NOW()),
('manager_gangnam', 'manager123', '박지점장', 1, 'MANAGER', 'manager.gangnam@company.com', '010-1000-0002', TRUE, NOW()),
('staff_gangnam1', 'staff123', '이직원1', 1, 'STAFF', 'staff1.gangnam@company.com', '010-1000-0003', TRUE, NOW()),
('staff_gangnam2', 'staff123', '최직원2', 1, 'STAFF', 'staff2.gangnam@company.com', '010-1000-0004', TRUE, NOW()),

-- 지점 2 (홍대점)
('admin_hongdae', 'admin123', '정관리자', 2, 'ADMIN', 'admin.hongdae@company.com', '010-2000-0001', TRUE, NOW()),
('manager_hongdae', 'manager123', '한지점장', 2, 'MANAGER', 'manager.hongdae@company.com', '010-2000-0002', TRUE, NOW()),
('staff_hongdae1', 'staff123', '윤직원1', 2, 'STAFF', 'staff1.hongdae@company.com', '010-2000-0003', TRUE, NOW()),
('staff_hongdae2', 'staff123', '임직원2', 2, 'STAFF', 'staff2.hongdae@company.com', '010-2000-0004', TRUE, NOW()),

-- 지점 3 (신촌점)
('admin_sinchon', 'admin123', '조관리자', 3, 'ADMIN', 'admin.sinchon@company.com', '010-3000-0001', TRUE, NOW()),
('manager_sinchon', 'manager123', '강지점장', 3, 'MANAGER', 'manager.sinchon@company.com', '010-3000-0002', TRUE, NOW()),
('staff_sinchon1', 'staff123', '서직원1', 3, 'STAFF', 'staff1.sinchon@company.com', '010-3000-0003', TRUE, NOW()),
('staff_sinchon2', 'staff123', '남직원2', 3, 'STAFF', 'staff2.sinchon@company.com', '010-3000-0004', TRUE, NOW()),

-- 지점 4 (잠실점)
('admin_jamsil', 'admin123', '배관리자', 4, 'ADMIN', 'admin.jamsil@company.com', '010-4000-0001', TRUE, NOW()),
('manager_jamsil', 'manager123', '구지점장', 4, 'MANAGER', 'manager.jamsil@company.com', '010-4000-0002', TRUE, NOW()),
('staff_jamsil1', 'staff123', '문직원1', 4, 'STAFF', 'staff1.jamsil@company.com', '010-4000-0003', TRUE, NOW()),
('staff_jamsil2', 'staff123', '양직원2', 4, 'STAFF', 'staff2.jamsil@company.com', '010-4000-0004', TRUE, NOW()),

-- 지점 5 (송파점)
('admin_songpa', 'admin123', '백관리자', 5, 'ADMIN', 'admin.songpa@company.com', '010-5000-0001', TRUE, NOW()),
('manager_songpa', 'manager123', '신지점장', 5, 'MANAGER', 'manager.songpa@company.com', '010-5000-0002', TRUE, NOW()),
('staff_songpa1', 'staff123', '오직원1', 5, 'STAFF', 'staff1.songpa@company.com', '010-5000-0003', TRUE, NOW()),
('staff_songpa2', 'staff123', '장직원2', 5, 'STAFF', 'staff2.songpa@company.com', '010-5000-0004', TRUE, NOW());

-- 본사
('admin', 'admin', '관리자',99, 'ADMIN', 'admin@company.com', '010-1111-1111', TRUE, NOW());

-- 테스트용 간단한 계정 (개발/테스트용)
INSERT INTO users (username, password, real_name, branch_id, role, email, phone, is_active, created_at) VALUES
('test1', 'test123', '테스트사용자1', 1, 'STAFF', 'test1@company.com', '010-9999-0001', TRUE, NOW()),
('test2', 'test123', '테스트사용자2', 2, 'STAFF', 'test2@company.com', '010-9999-0002', TRUE, NOW()),
('test3', 'test123', '테스트사용자3', 3, 'STAFF', 'test3@company.com', '010-9999-0003', TRUE, NOW());

-- 사용자 테이블 인덱스 생성
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_branch_id ON users(branch_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
