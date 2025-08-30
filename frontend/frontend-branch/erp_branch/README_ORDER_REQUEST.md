# 발주 신청 기능 (OrderRequest)

## 개요
각 지점에서 원재료 발주를 신청할 수 있는 기능입니다. 재고 현황을 확인하고 필요한 원재료를 선택하여 발주 요청을 생성할 수 있습니다.

## 주요 기능

### 1. 원재료 선택
- 원재료 목록 조회 및 검색
- 카테고리별 필터링
- 재고 현황 표시 (현재/최소/최대 재고)
- 재고 부족 시 경고 표시
- 공급업체 정보 표시

### 2. 발주 상품 관리
- 선택한 원재료를 발주 목록에 추가
- 수량 조정 (증가/감소)
- 총 발주 금액 계산
- 발주 상품 제거

### 3. 발주 신청
- 배송 예정일 설정
- 우선순위 선택 (낮음/보통/높음/긴급)
- 비고 사항 입력
- 발주 신청 제출

### 4. 발주 요청 히스토리
- 지점별 발주 요청 내역 조회
- 발주 상태 표시 (대기중/승인됨/배송중/배송완료/취소됨)
- 우선순위별 색상 구분
- 배송 예정일 및 총 금액 정보

## 데이터 구조

### SupplyRequest (발주 요청)
```javascript
{
  id: Long,
  requestingBranchId: Long,        // 요청 지점 ID
  requestDate: LocalDateTime,      // 요청 일시
  expectedDeliveryDate: LocalDate, // 배송 예정일
  status: SupplyRequestStatus,     // 상태
  priority: SupplyRequestPriority, // 우선순위
  totalCost: BigDecimal,          // 총 금액
  notes: String,                  // 비고
  items: List<SupplyRequestItem>, // 발주 상품 목록
  createdAt: LocalDateTime,       // 생성 일시
  updatedAt: LocalDateTime        // 수정 일시
}
```

### SupplyRequestItem (발주 상품)
```javascript
{
  id: Long,
  supplyRequestId: Long,           // 발주 요청 ID
  materialId: Long,                // 원재료 ID
  requestedQuantity: BigDecimal,   // 요청 수량
  approvedQuantity: BigDecimal,    // 승인 수량
  deliveredQuantity: BigDecimal,   // 배송 수량
  unit: String,                    // 단위
  costPerUnit: BigDecimal,         // 단가
  totalCost: BigDecimal,           // 총 금액
  status: SupplyRequestItemStatus, // 상태
  notes: String,                   // 비고
  createdAt: LocalDateTime,        // 생성 일시
  updatedAt: LocalDateTime         // 수정 일시
}
```

### StockMovement (재고 이동)
```javascript
{
  id: Long,
  materialId: Long,                // 원재료 ID
  branchId: Long,                  // 지점 ID
  movementType: MovementType,      // 이동 유형
  quantity: BigDecimal,            // 수량 (양수: 입고, 음수: 출고)
  unit: String,                    // 단위
  costPerUnit: BigDecimal,         // 단가
  totalCost: BigDecimal,           // 총 금액
  referenceId: Long,               // 참조 ID (order_id, supply_request_id 등)
  referenceType: String,           // 참조 유형
  notes: String,                   // 비고
  movementDate: LocalDateTime,     // 이동 일시
  createdAt: LocalDateTime         // 생성 일시
}
```

## API 엔드포인트

### 원재료 관련
- `GET /api/materials` - 원재료 목록 조회
- `GET /api/materials/{id}` - 원재료 상세 조회
- `GET /api/materials/categories` - 카테고리 목록 조회
- `GET /api/materials/{id}/stock` - 재고 현황 조회
- `PATCH /api/materials/{id}/stock` - 재고 업데이트
- `GET /api/materials/search` - 원재료 검색

### 발주 요청 관련
- `GET /api/supply-requests` - 발주 요청 목록 조회
- `POST /api/supply-requests` - 발주 요청 생성
- `GET /api/supply-requests/{id}` - 발주 요청 상세 조회
- `PATCH /api/supply-requests/{id}/status` - 상태 업데이트
- `PATCH /api/supply-requests/{id}/cancel` - 발주 요청 취소

## 사용법

### 1. 컴포넌트 사용
```javascript
import OrderRequest from './components/OrderingManagement/OrderRequest';

// 지점 ID를 props로 전달
<OrderRequest branchId={1} />
```

### 2. 서비스 사용
```javascript
import materialService from './services/materialService';
import supplyRequestService from './services/supplyRequestService';

// 원재료 목록 조회
const materials = await materialService.getMaterials(branchId);

// 발주 요청 생성
const result = await supplyRequestService.createSupplyRequest(supplyRequestData);
```

## 스타일링

### CSS 모듈 사용
- `OrderRequest.module.css` 파일에서 스타일 정의
- 컴포넌트별로 스타일 격리
- 반응형 디자인 지원

### 주요 스타일 클래스
- `.container` - 전체 컨테이너
- `.materialSection` - 원재료 선택 섹션
- `.orderSection` - 발주 상품 섹션
- `.historySection` - 히스토리 섹션
- `.orderFormOverlay` - 발주 신청 폼 오버레이

## 환경 설정

### 환경 변수
```bash
REACT_APP_API_BASE_URL=http://localhost:8080
```

### 백엔드 요구사항
- Spring Boot 3.x
- Java 17+
- MySQL/PostgreSQL 데이터베이스
- JPA/Hibernate

## 에러 처리

### 네트워크 오류
- API 호출 실패 시 사용자에게 알림
- 로딩 상태 표시
- 재시도 기능 제공

### 데이터 검증
- 필수 필드 검증
- 수량 범위 검증
- 날짜 유효성 검증

## 향후 개선 사항

### 1. 실시간 알림
- WebSocket을 통한 발주 상태 실시간 업데이트
- 푸시 알림 기능

### 2. 고급 기능
- 자동 발주 설정 (재고 임계값 기반)
- 발주 패턴 분석 및 예측
- 공급업체별 가격 비교

### 3. 모바일 지원
- 반응형 디자인 개선
- 터치 인터페이스 최적화
- PWA 지원

## 문제 해결

### 일반적인 문제
1. **API 연결 실패**: 백엔드 서버 상태 확인
2. **데이터 로딩 실패**: 네트워크 연결 및 권한 확인
3. **스타일 적용 안됨**: CSS 모듈 번들링 확인

### 디버깅
- 브라우저 개발자 도구 콘솔 확인
- 네트워크 탭에서 API 요청/응답 확인
- React DevTools로 컴포넌트 상태 확인
