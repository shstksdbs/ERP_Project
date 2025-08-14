# 메뉴 옵션 시스템 설정 가이드

## 개요
이 가이드는 하드코딩된 메뉴 옵션들을 데이터베이스 기반 시스템으로 변경하는 방법을 설명합니다.

## 변경 사항

### 1. 백엔드 API 추가
- `MenuOptionController`: 메뉴 옵션 조회 API
- `MenuOptionService`: 메뉴 옵션 비즈니스 로직
- `MenuOptionRepository`: 메뉴 옵션 데이터 접근

### 2. 프론트엔드 수정
- `SetOptionModal.js`: 하드코딩된 옵션들을 API 호출로 변경
- 데이터베이스에서 실시간으로 옵션 정보 가져오기
- 로딩 상태 처리 추가

## 설정 단계

### 1. 데이터베이스 테이블 생성
`menu_options` 테이블이 이미 존재해야 합니다. 테이블 구조는 다음과 같습니다:

```sql
CREATE TABLE menu_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    description TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME
);
```

### 2. 샘플 데이터 추가
`menu_options_sample_data.sql` 파일을 실행하여 샘플 옵션 데이터를 추가합니다:

```bash
mysql -u username -p database_name < menu_options_sample_data.sql
```

### 3. 백엔드 서버 재시작
Spring Boot 애플리케이션을 재시작하여 새로운 컨트롤러와 서비스를 활성화합니다.

### 4. 프론트엔드 테스트
키오스크에서 메뉴 옵션을 선택할 때 데이터베이스에서 옵션들이 로드되는지 확인합니다.

## API 엔드포인트

### 메뉴 옵션 조회
- `GET /api/menu-options`: 모든 메뉴 옵션 조회
- `GET /api/menu-options/category/{category}`: 카테고리별 옵션 조회
- `GET /api/menu-options/available`: 사용 가능한 옵션만 조회
- `GET /api/menu-options/{id}`: 특정 옵션 조회

### 카테고리
- `topping`: 토핑 옵션 (토마토, 양파, 치즈 등)
- `side`: 사이드 메뉴 (감자튀김, 치킨너겟 등)
- `drink`: 음료 (콜라, 사이다, 아메리카노 등)

## 장점

1. **동적 관리**: 관리자가 웹 인터페이스를 통해 옵션을 추가/수정/삭제 가능
2. **실시간 반영**: 옵션 변경사항이 즉시 키오스크에 반영
3. **확장성**: 새로운 옵션 카테고리나 옵션을 쉽게 추가 가능
4. **일관성**: 모든 옵션 정보가 중앙 데이터베이스에서 관리됨

## 주의사항

1. **데이터베이스 연결**: 백엔드 서버가 실행 중이어야 함
2. **네트워크 오류 처리**: API 호출 실패 시 적절한 오류 처리 필요
3. **성능**: 옵션이 많아질 경우 페이지네이션 고려
4. **캐싱**: 자주 변경되지 않는 옵션은 프론트엔드에서 캐싱 고려

## 문제 해결

### 옵션이 로드되지 않는 경우
1. 백엔드 서버가 실행 중인지 확인
2. 데이터베이스 연결 상태 확인
3. 브라우저 개발자 도구에서 네트워크 오류 확인
4. API 엔드포인트가 올바른지 확인

### 옵션 가격이 표시되지 않는 경우
1. 데이터베이스의 price 필드에 올바른 값이 있는지 확인
2. 프론트엔드에서 Number() 변환이 올바르게 되는지 확인
