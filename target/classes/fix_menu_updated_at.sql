-- 메뉴 테이블의 updated_at 필드 수정
-- updated_at이 null인 경우 현재 시간으로 업데이트

UPDATE menus 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- 모든 메뉴의 updated_at을 현재 시간으로 업데이트 (선택사항)
-- UPDATE menus SET updated_at = NOW();

-- 결과 확인
SELECT 
    id,
    name,
    created_at,
    updated_at,
    CASE 
        WHEN updated_at IS NULL THEN 'NULL'
        ELSE 'OK'
    END as status
FROM menus 
ORDER BY id;
