# 대시보드 설정 가이드

## 🚀 백엔드 서버 실행

대시보드의 실제 데이터를 보려면 백엔드 서버를 실행해야 합니다.

### 1. 백엔드 서버 실행
```bash
cd /c/erp-project
mvn spring-boot:run
```

### 2. 프론트엔드 서버 실행 (새 터미널에서)
```bash
cd /c/erp-project/frontend/frontend-branch/erp_branch
npm start
```

## 📊 대시보드 기능

### KPI 카드 (5개)
1. **오늘 매출** - 오늘의 총 매출액 (전일 대비 증감률 포함)
2. **오늘 주문 수** - 오늘 완료된 주문 건수 (전일 대비 증감률 포함)
3. **발주 대기** - 승인 대기 중인 발주 요청 수
4. **재고 부족** - 최소 재고량 이하인 재료 수
5. **읽지 않은 알림** - 미읽은 공지사항 수

### API 엔드포인트
- `GET /api/dashboard/today-sales?branchId={id}` - 오늘 매출
- `GET /api/dashboard/today-orders?branchId={id}` - 오늘 주문 수
- `GET /api/dashboard/pending-supply-requests?branchId={id}` - 발주 대기 수
- `GET /api/dashboard/low-stock?branchId={id}` - 재고 부족 수
- `GET /api/dashboard/unread-notifications?branchId={id}` - 읽지 않은 알림 수

## 🔧 문제 해결

### 백엔드 서버가 실행되지 않는 경우
- 대시보드에 기본값(0)이 표시됩니다
- 콘솔에 "API 응답 실패" 경고 메시지가 표시됩니다
- 실제 데이터를 보려면 백엔드 서버를 실행해야 합니다

### 데이터베이스 연결 오류
- `application.properties`에서 데이터베이스 설정을 확인하세요
- 데이터베이스 서버가 실행 중인지 확인하세요

## 📝 참고사항

- 대시보드는 5분마다 자동으로 데이터를 새로고침합니다
- 각 KPI 카드는 색상으로 구분되어 가독성을 높였습니다
- 로딩 상태와 에러 처리가 포함되어 있습니다
