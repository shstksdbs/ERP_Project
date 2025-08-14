# 메뉴 이미지 기능 가이드

## 개요
메뉴 테이블에 이미지 URL 필드를 추가하여 각 메뉴에 사진을 표시할 수 있도록 구현했습니다.

## 구현된 기능

### 1. 데이터베이스 스키마
- `menus` 테이블에 `image_url` 필드 추가
- VARCHAR(255) 타입으로 메뉴 이미지 URL 저장

### 2. 백엔드 API
- **Menu 엔티티**: `imageUrl` 필드 추가
- **MenuController**: 메뉴 이미지 업데이트 API (`PATCH /api/menus/{id}/image`)
- **MenuService**: 이미지 URL 업데이트 로직 구현

### 3. 프론트엔드 (키오스크)
- **MenuScreen**: 메뉴 카드에 이미지 표시
- **CSS 스타일링**: 이미지 컨테이너 및 이미지 스타일 적용
- **Fallback 처리**: 이미지 로딩 실패 시 텍스트 아이콘 표시

## API 사용법

### 메뉴 이미지 업데이트
```http
PATCH /api/menus/{id}/image
Content-Type: application/json

"https://example.com/menu-image.jpg"
```

### 응답 예시
```json
{
  "id": 1,
  "name": "치즈버거",
  "description": "신선한 치즈가 들어간 클래식 치즈버거",
  "price": 4500.00,
  "category": "burger",
  "imageUrl": "https://example.com/menu-image.jpg",
  "isAvailable": true,
  "displayOrder": 1
}
```

## 현재 설정된 이미지

### 햄버거 메뉴
- 치즈버거, 불고기버거, 치킨버거, 더블버거, 베이컨버거, 새우버거

### 세트 메뉴
- 치즈버거 세트, 불고기버거 세트, 치킨버거 세트, 더블버거 세트, 베이컨버거 세트, 새우버거 세트

### 사이드 메뉴
- 감자튀김, 치킨너겟, 양념감자, 치즈스틱, 어니언링, 콘샐러드, 치킨윙, 나초

### 음료
- 콜라, 사이다, 오렌지주스, 아메리카노, 제로콜라, 제로사이다, 레몬에이드, 밀크쉐이크

## 이미지 URL 형식
현재는 placeholder 이미지 서비스를 사용하여 테스트용 이미지를 생성합니다:
```
https://via.placeholder.com/300x200/f4e4c1/8b4513?text=메뉴명
```

- 크기: 300x200 픽셀
- 배경색: #f4e4c1 (연한 베이지)
- 텍스트색: #8b4513 (진한 갈색)
- 텍스트: 메뉴명

## 실제 이미지 적용 방법

### 1. 로컬 이미지 파일
```
/images/menu/cheese-burger.jpg
/images/menu/bulgogi-burger.jpg
```

### 2. 외부 이미지 호스팅
```
https://your-domain.com/images/menu/cheese-burger.jpg
https://cdn.example.com/menu-images/bulgogi-burger.jpg
```

### 3. 이미지 업로드 API 추가 (향후 구현)
- 파일 업로드 엔드포인트
- 이미지 리사이징 및 최적화
- CDN 연동

## CSS 스타일링

### 메뉴 이미지 컨테이너
```css
.menuImageContainer {
  width: 100%;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
}
```

### 이미지 스타일
```css
.menuImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(184, 134, 11, 0.2);
}
```

### Fallback 아이콘
```css
.menuIcon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #d4a574 0%, #c19a6b 100%);
  border-radius: 50%;
}
```

## 테스트 방법

### 1. 백엔드 실행
```bash
cd erp_project
mvn spring-boot:run
```

### 2. 키오스크 프론트엔드 실행
```bash
cd frontend/kiosk
npm start
```

### 3. 메뉴 이미지 확인
- 키오스크 메뉴 화면에서 각 메뉴 카드의 이미지 표시 확인
- 이미지 로딩 실패 시 fallback 아이콘 표시 확인

## 향후 개선 사항

1. **실제 이미지 파일 업로드**: MultipartFile을 사용한 이미지 업로드
2. **이미지 최적화**: 자동 리사이징 및 압축
3. **CDN 연동**: 이미지 전송 속도 향상
4. **이미지 관리**: 관리자 페이지에서 이미지 업로드/수정 기능
5. **썸네일 생성**: 다양한 크기의 썸네일 자동 생성

## 주의사항

- 이미지 URL은 255자 이내로 제한
- HTTPS URL 사용 권장 (보안)
- 이미지 크기는 300x200 픽셀 권장
- 이미지 파일 크기는 1MB 이하 권장
- 지원 형식: JPG, PNG, WebP
