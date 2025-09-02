-- 공지사항 관련 테이블 생성

-- 1. 공지사항 테이블
CREATE TABLE IF NOT EXISTS notices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL COMMENT '공지사항 제목',
    content TEXT NOT NULL COMMENT '공지사항 내용',
    category ENUM('general', 'important', 'event', 'maintenance', 'update') DEFAULT 'general' COMMENT '카테고리',
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal' COMMENT '우선순위',
    status ENUM('draft', 'published', 'scheduled', 'archived') DEFAULT 'draft' COMMENT '상태',
    is_important BOOLEAN NOT NULL DEFAULT FALSE COMMENT '중요 공지 여부',
    is_public BOOLEAN NOT NULL DEFAULT TRUE COMMENT '공개 여부',
    author_id BIGINT NOT NULL COMMENT '작성자 ID',
    view_count INT NOT NULL DEFAULT 0 COMMENT '조회수',
    start_date DATETIME COMMENT '발행 시작일',
    end_date DATETIME COMMENT '발행 종료일',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    
    INDEX idx_notices_status (status),
    INDEX idx_notices_category (category),
    INDEX idx_notices_priority (priority),
    INDEX idx_notices_author (author_id),
    INDEX idx_notices_created_at (created_at),
    INDEX idx_notices_start_date (start_date),
    INDEX idx_notices_end_date (end_date),
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='공지사항';

-- 2. 공지사항 대상 그룹 테이블
CREATE TABLE IF NOT EXISTS notice_target_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '그룹명',
    description TEXT COMMENT '그룹 설명',
    target_branches JSON COMMENT '대상 지점 목록 (JSON 배열)',
    target_positions JSON COMMENT '대상 직급 목록 (JSON 배열)',
    member_count INT NOT NULL DEFAULT 0 COMMENT '그룹 인원수',
    status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '상태',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    
    INDEX idx_target_groups_status (status),
    INDEX idx_target_groups_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='공지사항 대상 그룹';

-- 3. 공지사항-대상 그룹 매핑 테이블
CREATE TABLE IF NOT EXISTS notice_target_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notice_id BIGINT NOT NULL COMMENT '공지사항 ID',
    target_group_id BIGINT NOT NULL COMMENT '대상 그룹 ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    
    UNIQUE KEY uk_notice_target (notice_id, target_group_id),
    INDEX idx_mappings_notice (notice_id),
    INDEX idx_mappings_target_group (target_group_id),
    
    FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE,
    FOREIGN KEY (target_group_id) REFERENCES notice_target_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='공지사항-대상 그룹 매핑';

-- 4. 공지사항 읽음 상태 테이블
CREATE TABLE IF NOT EXISTS notice_read_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notice_id BIGINT NOT NULL COMMENT '공지사항 ID',
    user_id BIGINT NOT NULL COMMENT '사용자 ID',
    is_read BOOLEAN NOT NULL DEFAULT FALSE COMMENT '읽음 여부',
    read_at DATETIME COMMENT '읽은 시간',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    
    UNIQUE KEY uk_notice_user (notice_id, user_id),
    INDEX idx_read_status_user (user_id),
    INDEX idx_read_status_notice (notice_id),
    INDEX idx_read_status_is_read (is_read),
    
    FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='공지사항 읽음 상태';

-- 기본 대상 그룹 데이터 삽입
INSERT INTO notice_target_groups (name, description, target_branches, target_positions, member_count, status) VALUES
('전체 직원', '모든 지점의 전체 직원을 대상으로 하는 공지', '[]', '[]', 0, 'active'),
('지점장급 이상', '지점장급 이상 직원 대상', '[]', '["MANAGER"]', 0, 'active'),
('서울 지점 직원', '서울 지역 지점 직원만 대상', '["서울점", "강남점", "홍대점"]', '[]', 0, 'active'),
('지점장 대상', '지점장만 대상', '[]', '["MANAGER"]', 0, 'active');

-- 샘플 공지사항 데이터 삽입
INSERT INTO notices (title, content, category, priority, status, is_important, is_public, author_id, start_date, end_date) VALUES
('시스템 점검 안내', '2024년 1월 25일 새벽 2시부터 4시까지 시스템 점검이 진행됩니다. 이 시간 동안 서비스 이용이 제한될 수 있으니 양해 부탁드립니다.', 'maintenance', 'high', 'published', TRUE, TRUE, 1, '2024-01-25 02:00:00', '2024-01-25 04:00:00'),
('신규 메뉴 출시 안내', '새로운 시즌 메뉴가 출시되었습니다. 많은 관심 부탁드립니다. 자세한 내용은 매장에서 확인하실 수 있습니다.', 'event', 'normal', 'published', FALSE, TRUE, 1, '2024-01-22 00:00:00', '2024-02-22 23:59:59'),
('직원 복지 개선 안내', '직원 복지 제도가 개선되었습니다. 자세한 내용은 인사팀에 문의하세요. 새로운 혜택들이 추가되었습니다.', 'general', 'normal', 'published', FALSE, TRUE, 1, '2024-01-15 00:00:00', NULL),
('긴급: 보안 업데이트', '보안 강화를 위한 시스템 업데이트가 완료되었습니다. 모든 직원은 새로운 보안 정책을 숙지해 주시기 바랍니다.', 'important', 'urgent', 'published', TRUE, TRUE, 1, '2024-01-10 00:00:00', NULL),
('연말연시 영업시간 안내', '연말연시 기간 중 영업시간이 변경됩니다. 참고하시기 바랍니다. 자세한 영업시간은 각 지점에 문의하세요.', 'general', 'normal', 'scheduled', FALSE, TRUE, 1, '2024-12-20 00:00:00', '2025-01-05 23:59:59');

-- 공지사항-대상 그룹 매핑 데이터 삽입
INSERT INTO notice_target_mappings (notice_id, target_group_id) VALUES
(1, 1), -- 시스템 점검 안내 -> 전체 직원
(2, 1), -- 신규 메뉴 출시 안내 -> 전체 직원
(3, 1), -- 직원 복지 개선 안내 -> 전체 직원
(4, 1), -- 긴급: 보안 업데이트 -> 전체 직원
(4, 2), -- 긴급: 보안 업데이트 -> 매니저급 이상
(5, 1); -- 연말연시 영업시간 안내 -> 전체 직원

-- 5. 공지사항 첨부파일 테이블
CREATE TABLE IF NOT EXISTS notice_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notice_id BIGINT NOT NULL COMMENT '공지사항 ID',
    original_filename VARCHAR(255) NOT NULL COMMENT '원본 파일명',
    stored_filename VARCHAR(255) NOT NULL COMMENT '저장된 파일명',
    file_path VARCHAR(500) NOT NULL COMMENT '파일 경로',
    file_size BIGINT NOT NULL COMMENT '파일 크기 (바이트)',
    file_type ENUM('image', 'document', 'video', 'audio', 'archive', 'other') DEFAULT 'other' COMMENT '파일 타입',
    mime_type VARCHAR(100) COMMENT 'MIME 타입',
    file_extension VARCHAR(10) COMMENT '파일 확장자',
    download_count INT NOT NULL DEFAULT 0 COMMENT '다운로드 수',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '활성 상태',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    
    INDEX idx_attachments_notice (notice_id),
    INDEX idx_attachments_file_type (file_type),
    INDEX idx_attachments_is_active (is_active),
    INDEX idx_attachments_created_at (created_at),
    INDEX idx_attachments_download_count (download_count),
    
    FOREIGN KEY (notice_id) REFERENCES notices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='공지사항 첨부파일';

-- 샘플 첨부파일 데이터 삽입 (실제 파일이 없으므로 예시용)
INSERT INTO notice_attachments (notice_id, original_filename, stored_filename, file_path, file_size, file_type, mime_type, file_extension, download_count, is_active) VALUES
(1, 'system_maintenance_guide.pdf', 'uuid1_timestamp.pdf', '2024/01/25/uuid1_timestamp.pdf', 1024000, 'document', 'application/pdf', 'pdf', 5, TRUE),
(2, 'new_menu_poster.jpg', 'uuid2_timestamp.jpg', '2024/01/22/uuid2_timestamp.jpg', 512000, 'image', 'image/jpeg', 'jpg', 12, TRUE),
(4, 'security_update_notice.docx', 'uuid3_timestamp.docx', '2024/01/10/uuid3_timestamp.docx', 256000, 'document', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx', 8, TRUE);
