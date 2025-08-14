-- 01_schema.sql
-- 지점별 키오스크 주문 + ERP 연동을 위한 기본 테이블 구조

-- =====================================================
-- 1. 메뉴 관련 테이블
-- =====================================================

-- 메뉴 마스터 테이블
CREATE TABLE IF NOT EXISTS menus (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '메뉴명',
    description TEXT COMMENT '메뉴 설명',
    price DECIMAL(10,2) NOT NULL COMMENT '기본 가격',
    category VARCHAR(50) NOT NULL COMMENT '카테고리 (burger, set, side, drink)',
    base_price DECIMAL(10,2) NOT NULL COMMENT '원가 (할인 계산용)',
    is_available BOOLEAN DEFAULT true COMMENT '판매 가능 여부',
    display_order INT DEFAULT 0 COMMENT '표시 순서',
    image_url VARCHAR(255) COMMENT '메뉴 이미지 URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_available (is_available),
    INDEX idx_display_order (display_order),
    UNIQUE KEY unique_menu_name (name)
);

-- 메뉴 옵션 테이블
CREATE TABLE IF NOT EXISTS menu_options (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '옵션 코드명',
    display_name VARCHAR(100) NOT NULL COMMENT '옵션 표시명',
    category VARCHAR(50) NOT NULL COMMENT '옵션 카테고리 (topping, sauce, size 등)',
    price DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '옵션 가격',
    is_available BOOLEAN DEFAULT true COMMENT '사용 가능 여부',
    display_order INT DEFAULT 0 COMMENT '표시 순서',
    description TEXT COMMENT '옵션 설명',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_available (is_available)
);

-- =====================================================
-- 2. 옵션 템플릿 시스템
-- =====================================================

-- 옵션 템플릿 테이블
CREATE TABLE IF NOT EXISTS option_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '템플릿명 (예: 기본버거옵션)',
    description TEXT COMMENT '템플릿 설명',
    category VARCHAR(50) NOT NULL COMMENT '적용 카테고리 (burger, set 등)',
    is_active BOOLEAN DEFAULT true COMMENT '활성화 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 템플릿-옵션 관계 테이블
CREATE TABLE IF NOT EXISTS template_option_relations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    template_id BIGINT NOT NULL COMMENT '템플릿 ID',
    option_id BIGINT NOT NULL COMMENT '옵션 ID',
    is_default BOOLEAN DEFAULT false COMMENT '기본 포함 여부',
    is_removable BOOLEAN DEFAULT true COMMENT '제거 가능 여부',
    is_addable BOOLEAN DEFAULT true COMMENT '추가 가능 여부',
    display_order INT DEFAULT 0 COMMENT '표시 순서',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (template_id) REFERENCES option_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES menu_options(id) ON DELETE CASCADE,
    UNIQUE KEY unique_template_option (template_id, option_id)
);

-- 메뉴-템플릿 관계 테이블
CREATE TABLE IF NOT EXISTS menu_template_relations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    menu_id BIGINT NOT NULL COMMENT '메뉴 ID',
    template_id BIGINT NOT NULL COMMENT '템플릿 ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES option_templates(id) ON DELETE CASCADE,
    UNIQUE KEY unique_menu_template (menu_id, template_id)
);

-- =====================================================
-- 3. 지점 관리 시스템
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

-- 지점별 메뉴 관리 테이블
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
    INDEX idx_branch_available (branch_id, is_available)
);

-- =====================================================
-- 4. 주문 관리 시스템
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

-- 주문 옵션 상세 테이블
CREATE TABLE IF NOT EXISTS order_item_options (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_item_id BIGINT NOT NULL COMMENT '주문 상세 ID',
    option_id BIGINT NOT NULL COMMENT '옵션 ID',
    quantity INT NOT NULL DEFAULT 1 COMMENT '수량',
    unit_price DECIMAL(10,2) NOT NULL COMMENT '단가',
    total_price DECIMAL(10,2) NOT NULL COMMENT '총 가격',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES menu_options(id) ON DELETE CASCADE
);

-- =====================================================
-- 5. 결제 관리 시스템
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
-- 6. 매출 통계 시스템
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
    INDEX idx_branch_date (branch_id, sale_date)
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
