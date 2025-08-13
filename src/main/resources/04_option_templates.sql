-- 04_option_templates.sql
-- 옵션 템플릿 시스템

-- =====================================================
-- 1. 옵션 템플릿 데이터
-- =====================================================

-- 버거용 옵션 템플릿
INSERT INTO option_templates (name, description, category) VALUES
('기본버거옵션', '치즈버거, 불고기버거 등 기본 버거용 옵션', 'burger'),
('프리미엄버거옵션', '더블버거, 베이컨버거 등 프리미엄 버거용 옵션', 'burger'),
('치킨버거옵션', '치킨버거 전용 옵션', 'burger'),
('새우버거옵션', '새우버거 전용 옵션', 'burger');

-- 세트용 옵션 템플릿
INSERT INTO option_templates (name, description, category) VALUES
('세트옵션', '세트 메뉴 전용 옵션 (사이드, 음료 변경)', 'set');

-- 사이드용 옵션 템플릿
INSERT INTO option_templates (name, description, category) VALUES
('사이드옵션', '사이드 메뉴 전용 옵션 (소스, 크기 등)', 'side');

-- 음료용 옵션 템플릿
INSERT INTO option_templates (name, description, category) VALUES
('음료옵션', '음료 전용 옵션 (얼음, 당도 등)', 'drink');

-- =====================================================
-- 2. 메뉴-템플릿 관계 설정
-- =====================================================

-- 버거 메뉴에 템플릿 적용
INSERT INTO menu_template_relations (menu_id, template_id) VALUES
-- 기본버거옵션 적용
(1, 1),   -- 치즈버거
(2, 1),   -- 불고기버거

-- 프리미엄버거옵션 적용
(4, 2),   -- 더블버거
(5, 2),   -- 베이컨버거

-- 치킨버거옵션 적용
(3, 3),   -- 치킨버거

-- 새우버거옵션 적용
(6, 4);   -- 새우버거

-- 세트 메뉴에 템플릿 적용
INSERT INTO menu_template_relations (menu_id, template_id) VALUES
(7, 5),   -- 치즈버거 세트
(8, 5),   -- 불고기버거 세트
(9, 5),   -- 치킨버거 세트
(10, 5),  -- 더블버거 세트
(11, 5),  -- 베이컨버거 세트
(12, 5);  -- 새우버거 세트

-- 사이드 메뉴에 템플릿 적용
INSERT INTO menu_template_relations (menu_id, template_id) VALUES
(13, 6),  -- 감자튀김
(14, 6),  -- 치킨너겟
(15, 6),  -- 양념감자
(16, 6),  -- 치즈스틱
(17, 6),  -- 어니언링
(18, 6),  -- 콘샐러드
(19, 6),  -- 치킨윙
(20, 6);  -- 나초

-- 음료 메뉴에 템플릿 적용
INSERT INTO menu_template_relations (menu_id, template_id) VALUES
(21, 7),  -- 콜라
(22, 7),  -- 사이다
(23, 7),  -- 오렌지주스
(24, 7),  -- 아메리카노
(25, 7),  -- 제로콜라
(26, 7),  -- 제로사이다
(27, 7),  -- 레몬에이드
(28, 7);  -- 밀크쉐이크

-- =====================================================
-- 3. 옵션 템플릿 요약 뷰 생성
-- =====================================================

-- 옵션 템플릿 요약 뷰
CREATE OR REPLACE VIEW option_template_summary AS
SELECT 
    ot.id AS template_id,
    ot.name AS template_name,
    ot.description,
    ot.category,
    COUNT(tor.option_id) AS total_options,
    SUM(CASE WHEN tor.is_default = true THEN 1 ELSE 0 END) AS default_options,
    SUM(CASE WHEN tor.is_removable = true THEN 1 ELSE 0 END) AS removable_options,
    SUM(CASE WHEN tor.is_addable = true THEN 1 ELSE 0 END) AS addable_options,
    COUNT(mtr.menu_id) AS applied_menus
FROM option_templates ot
LEFT JOIN template_option_relations tor ON ot.id = tor.template_id
LEFT JOIN menu_template_relations mtr ON ot.id = mtr.template_id
WHERE ot.id IS NOT NULL
GROUP BY ot.id, ot.name, ot.description, ot.category
ORDER BY ot.category, ot.name;
