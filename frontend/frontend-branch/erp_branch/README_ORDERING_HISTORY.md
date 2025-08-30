# 발주 이력 관리 기능 (OrderingHistory)

## 개요
각 지점에서 발주 요청의 이력을 조회하고 관리할 수 있는 기능입니다. 발주 상태, 우선순위, 날짜 등을 기준으로 필터링하여 발주 이력을 효율적으로 관리할 수 있습니다.

## 주요 기능

### 1. 발주 이력 조회
- 지점별 발주 요청 목록 조회
- 발주번호, 비고 내용으로 검색
- 상태별 필터링 (대기중/승인됨/배송중/배송완료/취소됨)
- 우선순위별 필터링 (낮음/보통/높음/긴급)
- 날짜 범위별 필터링

### 2. 발주 상세 정보
- 발주 요청의 상세 정보 모달 표시
- 기본 정보 (발주번호, 발주일시, 배송예정일, 상태, 우선순위, 담당자)
- 발주 상품 목록 (원재료명, 요청수량, 단가, 소계)
- 비고 사항 표시

### 3. 발주 요청 관리
- 대기중인 발주 요청 취소 기능
- 발주 상태별 작업 버튼 표시
- 실시간 상태 업데이트

### 4. 데이터 시각화
- 상태별 색상 구분
- 우선순위별 색상 구분
- 직관적인 테이블 형태로 정보 표시

## 데이터 구조

### SupplyRequest (발주 요청)
```javascript
{
  id: Long,
  orderNumber: String,              // 발주번호 (SR001, SR002 등)
  requestDate: LocalDateTime,       // 발주 요청 일시
  expectedDeliveryDate: LocalDate,  // 배송 예정일
  status: SupplyRequestStatus,      // 상태
  priority: SupplyRequestPriority,  // 우선순위
  totalCost: BigDecimal,           // 총 금액
  notes: String,                   // 비고
  requestingBranch: Branch,        // 요청 지점 정보
  items: List<SupplyRequestItem>,  // 발주 상품 목록
  employeeName: String             // 담당자명
}
```

### SupplyRequestItem (발주 상품)
```javascript
{
  material: Material,               // 원재료 정보
  requestedQuantity: BigDecimal,   // 요청 수량
  unit: String,                    // 단위
  costPerUnit: BigDecimal          // 단가
}
```

## 상태 및 우선순위

### 발주 상태 (SupplyRequestStatus)
- `PENDING` - 대기중 (노란색)
- `APPROVED` - 승인됨 (파란색)
- `IN_TRANSIT` - 배송중 (초록색)
- `DELIVERED` - 배송완료 (회색)
- `CANCELLED` - 취소됨 (빨간색)

### 우선순위 (SupplyRequestPriority)
- `LOW` - 낮음 (초록색)
- `NORMAL` - 보통 (파란색)
- `HIGH` - 높음 (주황색)
- `URGENT` - 긴급 (빨간색)

## 사용법

### 1. 컴포넌트 사용
```javascript
import OrderingHistory from './components/OrderingManagement/OrderingHistory';

// 지점 ID를 props로 전달
<OrderingHistory branchId={1} />
```

### 2. 필터링 기능
```javascript
// 상태별 필터링
const [selectedStatus, setSelectedStatus] = useState('all');

// 우선순위별 필터링
const [selectedPriority, setSelectedPriority] = useState('all');

// 날짜 범위 필터링
const [dateRange, setDateRange] = useState({ start: '', end: '' });

// 검색어 필터링
const [searchTerm, setSearchTerm] = useState('');
```

### 3. 발주 요청 취소
```javascript
const handleCancelRequest = async (requestId) => {
  if (window.confirm('정말로 이 발주 요청을 취소하시겠습니까?')) {
    try {
      await supplyRequestService.cancelSupplyRequest(requestId);
      alert('발주 요청이 취소되었습니다.');
      await loadSupplyRequests(); // 목록 새로고침
    } catch (error) {
      console.error('발주 요청 취소 실패:', error);
      alert('발주 요청 취소 중 오류가 발생했습니다.');
    }
  }
};
```

## API 연동

### 서비스 사용
```javascript
import supplyRequestService from '../../services/supplyRequestService';

// 발주 요청 목록 조회
const loadSupplyRequests = async () => {
  try {
    const data = await supplyRequestService.getSupplyRequests(branchId);
    setSupplyRequests(data);
  } catch (error) {
    console.error('발주 요청 목록 로드 실패:', error);
  }
};

// 발주 요청 취소
const result = await supplyRequestService.cancelSupplyRequest(requestId);
```

### API 엔드포인트
- `GET /api/supply-requests?branchId={branchId}` - 발주 요청 목록 조회
- `PATCH /api/supply-requests/{id}/cancel` - 발주 요청 취소

## 스타일링

### CSS 모듈 사용
- `OrderingHistory.module.css` 파일에서 스타일 정의
- 컴포넌트별로 스타일 격리
- 반응형 디자인 지원

### 주요 스타일 클래스
- `.container` - 전체 컨테이너
- `.tableContainer` - 테이블 컨테이너
- `.modalOverlay` - 모달 오버레이
- `.modal` - 모달 창
- `.status` - 상태 표시 스타일
- `.priority` - 우선순위 표시 스타일

### 상태별 색상
```css
.statusPending { background: #fef3c7; color: #92400e; }    /* 대기중 */
.statusApproved { background: #dbeafe; color: #1e40af; }   /* 승인됨 */
.statusInTransit { background: #d1fae5; color: #065f46; }  /* 배송중 */
.statusDelivered { background: #e5e7eb; color: #374151; }  /* 배송완료 */
.statusCancelled { background: #fee2e2; color: #991b1b; }  /* 취소됨 */
```

### 우선순위별 색상
```css
.priorityLow { background: #d1fae5; color: #065f46; }      /* 낮음 */
.priorityNormal { background: #dbeafe; color: #1e40af; }   /* 보통 */
.priorityHigh { background: #fef3c7; color: #92400e; }     /* 높음 */
.priorityUrgent { background: #fee2e2; color: #991b1b; }   /* 긴급 */
```

## 기능별 상세 설명

### 1. 검색 및 필터링
- **검색**: 발주번호 또는 비고 내용으로 검색 가능
- **상태 필터**: 5가지 상태 중 선택하여 필터링
- **우선순위 필터**: 4가지 우선순위 중 선택하여 필터링
- **날짜 범위**: 시작일과 종료일을 지정하여 기간별 필터링

### 2. 테이블 표시
- **발주번호**: 고유한 발주 식별자 (SR001, SR002 등)
- **발주일시**: 발주 요청을 한 정확한 날짜와 시간
- **배송예정일**: 원하는 배송 날짜
- **발주내용**: 원재료명, 수량, 단위, 비고 등
- **총 금액**: 해당 발주의 총 비용
- **상태**: 현재 발주 진행 상태
- **우선순위**: 발주의 긴급도
- **담당자**: 발주를 요청한 직원
- **작업**: 상세보기, 취소 등 가능한 작업

### 3. 상세 정보 모달
- **기본 정보 섹션**: 발주 관련 기본 정보를 그리드 형태로 표시
- **발주 상품 섹션**: 테이블 형태로 원재료별 상세 정보 표시
- **비고 섹션**: 발주 관련 특이사항 표시

### 4. 반응형 디자인
- **데스크톱**: 모든 기능을 한 화면에 표시
- **태블릿**: 필터 옵션을 세로로 배치
- **모바일**: 테이블을 가로 스크롤로 처리, 모달 크기 조정

## 에러 처리

### 네트워크 오류
- API 호출 실패 시 사용자에게 알림
- 로딩 상태 표시
- 재시도 기능 제공

### 데이터 검증
- 필수 필드 검증
- 날짜 유효성 검증
- 상태 변경 권한 검증

## 향후 개선 사항

### 1. 고급 필터링
- 공급업체별 필터링
- 금액 범위별 필터링
- 담당자별 필터링

### 2. 데이터 내보내기
- Excel/CSV 형식으로 데이터 내보내기
- PDF 형태의 발주 이력 보고서 생성

### 3. 실시간 업데이트
- WebSocket을 통한 발주 상태 실시간 업데이트
- 푸시 알림 기능

### 4. 통계 및 분석
- 발주 패턴 분석
- 월별/분기별 발주 통계
- 비용 분석 및 예측

## 문제 해결

### 일반적인 문제
1. **데이터 로딩 실패**: 네트워크 연결 및 권한 확인
2. **필터 적용 안됨**: 필터 조건 확인 및 초기화
3. **모달 표시 안됨**: z-index 및 CSS 확인

### 디버깅
- 브라우저 개발자 도구 콘솔 확인
- 네트워크 탭에서 API 요청/응답 확인
- React DevTools로 컴포넌트 상태 확인
- CSS 스타일 적용 상태 확인

## 성능 최적화

### 1. 데이터 로딩
- 필요한 데이터만 로드
- 페이지네이션 적용 고려
- 캐싱 전략 수립

### 2. 렌더링 최적화
- React.memo 사용 고려
- 불필요한 리렌더링 방지
- 가상 스크롤링 적용 고려

### 3. 메모리 관리
- 컴포넌트 언마운트 시 정리 작업
- 이벤트 리스너 정리
- 메모리 누수 방지
