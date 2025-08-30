# SupplyRequest 엔티티 업데이트

## 개요
발주 신청 시 신청자 정보를 저장할 수 있도록 SupplyRequest 엔티티를 업데이트했습니다.

## 변경 사항

### 1. 엔티티 수정 (SupplyRequest.java)
- `requesterId` 필드 추가: 신청자 ID 저장
- `requesterName` 필드 추가: 신청자 이름 저장

### 2. DTO 수정 (SupplyRequestController.java)
- `SupplyRequestCreateRequest`에 `requesterName` 필드 추가
- getter/setter 메서드 추가

### 3. 컨트롤러 수정
- `createSupplyRequest` 메서드에서 `requesterName` 설정 추가

### 4. 프론트엔드 수정
- `OrderRequest.js`에서 `requesterName` 전송 추가

## 데이터베이스 마이그레이션

### 실행 방법
```bash
# MySQL에 접속
mysql -u root -p

# 데이터베이스 선택
USE your_database_name;

# 마이그레이션 스크립트 실행
source 13_supply_request_requester_update.sql;
```

### 마이그레이션 내용
1. `requester_id` 컬럼 추가 (BIGINT)
2. `requester_name` 컬럼 추가 (VARCHAR(100))

## API 요청 예시

### 발주 신청 요청
```json
{
  "requestingBranchId": 1,
  "requesterId": 123,
  "requesterName": "홍길동",
  "expectedDeliveryDate": "2024-01-20",
  "priority": "NORMAL",
  "notes": "긴급 발주",
  "items": [
    {
      "materialId": 1,
      "requestedQuantity": 10,
      "unit": "kg",
      "costPerUnit": 5000
    }
  ]
}
```

## 주의사항

1. **백업 필수**: 마이그레이션 실행 전 데이터베이스 백업
2. **기존 데이터**: 기존 발주 신청 데이터는 `requester_id`와 `requester_name`이 NULL
3. **테스트**: 개발/테스트 환경에서 먼저 실행 후 운영 환경 적용

## 검증 방법

### 1. 컬럼 추가 확인
```sql
DESCRIBE supply_requests;
```

### 2. 데이터 확인
```sql
SELECT id, requesting_branch_id, requester_id, requester_name, request_date 
FROM supply_requests 
LIMIT 10;
```

### 3. API 테스트
- 발주 신청 API 호출하여 신청자 정보 저장 확인
- 발주 조회 API에서 신청자 정보 반환 확인
