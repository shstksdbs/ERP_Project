# 주문 관리 시스템 개선 사항

## 개요
기존 주문 시스템을 확장하여 세트 메뉴의 개별 구성 요소와 재료 변경 사항을 상세하게 추적할 수 있도록 개선했습니다.

## 🚀 **자동화된 주문 처리**

### ✅ **자동 생성되는 데이터**
주문이 생성되면 **자동으로** `order_item_details` 테이블에 다음 데이터들이 생성됩니다:

1. **세트 메뉴 주문 시:**
   - 햄버거 구성 요소 (자동 감지)
   - 기본 사이드 (감자튀김)
   - 기본 음료 (콜라)

2. **단품 버거 주문 시:**
   - 기본 포함 재료 (양상추, 토마토, 양파, 피클)
   - 추가 재료 (치즈, 베이컨)

### 🔄 **자동화 프로세스**
```
주문 생성 → OrderController → AutomatedOrderService → order_item_details 자동 생성
```

## 주요 기능

### 1. 세트 메뉴 관리
- **햄버거, 사이드, 음료를 개별적으로 추적**
- **사이드/음료 변경 시 원본과 변경된 정보 모두 저장**
- **각 구성 요소별 재고 차감 및 매출 분석**

### 2. 단품 버거 재료 관리
- **재료 추가/제거 사항 추적**
- **재료별 비용 계산**
- **재료별 재고 관리**

### 3. 매출 분석
- **세트 구성 요소별 매출 통계**
- **재료 추가/제거에 따른 매출 영향 분석**
- **변경 옵션별 인기도 분석**

### 4. 재고 관리
- **정확한 재료 소모량 계산**
- **변경된 메뉴에 대한 재고 영향 분석**
- **예측 재고 관리**

## 데이터베이스 구조

### order_items 테이블 (기존 + 확장)
```sql
-- 기존 컬럼들...
item_type VARCHAR(50)           -- 아이템 타입: SET, BURGER, SIDE, DRINK, INGREDIENT
parent_item_id BIGINT           -- 상위 아이템 ID (세트의 경우)
is_substituted BOOLEAN          -- 변경 여부
original_menu_id BIGINT         -- 원래 선택된 메뉴 ID
actual_menu_id BIGINT           -- 실제 제공된 메뉴 ID
substitution_reason VARCHAR(255) -- 변경 사유
ingredient_type VARCHAR(100)    -- 재료 타입
ingredient_action VARCHAR(20)   -- 재료 액션: ADD, REMOVE
ingredient_price DECIMAL(10,2)  -- 재료 가격
```

### order_item_details 테이블 (신규)
```sql
detail_id BIGINT PRIMARY KEY
order_item_id BIGINT            -- order_items 참조
item_type VARCHAR(50)           -- 아이템 타입
menu_id BIGINT                  -- 메뉴 ID
menu_name VARCHAR(255)          -- 메뉴 이름
quantity INT                     -- 수량
unit_price DECIMAL(10,2)        -- 단가
total_price DECIMAL(10,2)       -- 총 가격
is_substituted BOOLEAN          -- 변경 여부
original_menu_id BIGINT         -- 원래 메뉴 ID
substitution_reason VARCHAR(255) -- 변경 사유
ingredient_type VARCHAR(100)    -- 재료 타입
ingredient_action VARCHAR(20)   -- 재료 액션
ingredient_price DECIMAL(10,2)  -- 재료 가격
notes TEXT                      -- 비고
```

## 🎯 **자동화된 주문 처리 예시**

### 1. 세트 메뉴 주문 시 자동 생성
```json
{
  "menuName": "치즈버거 세트",
  "itemType": "SET"
}
```

**자동으로 생성되는 order_item_details:**
- `BURGER`: 치즈버거 (버거)
- `SIDE`: 감자튀김 (기본 사이드)
- `DRINK`: 콜라 (기본 음료)

### 2. 단품 버거 주문 시 자동 생성
```json
{
  "menuName": "불고기버거",
  "itemType": "BURGER"
}
```

**자동으로 생성되는 order_item_details:**
- `INGREDIENT`: 양상추 (ADD, 0원)
- `INGREDIENT`: 토마토 (ADD, 0원)
- `INGREDIENT`: 양파 (ADD, 0원)
- `INGREDIENT`: 피클 (ADD, 0원)
- `INGREDIENT`: 치즈 (ADD, 500원)
- `INGREDIENT`: 베이컨 (ADD, 800원)

## API 엔드포인트

### OrderController (자동화 통합)
- `POST /api/orders/create` - 주문 생성 (자동으로 order_item_details 생성)

### OrderItemDetailController
- `POST /api/order-item-details` - 상세 정보 저장
- `GET /api/order-item-details/order-item/{orderItemId}` - 주문 아이템별 상세 정보
- `GET /api/order-item-details/order/{orderId}` - 주문별 모든 상세 정보
- `GET /api/order-item-details/set-components/{orderId}` - 세트 구성 요소 조회
- `GET /api/order-item-details/substituted` - 변경된 메뉴 조회
- `GET /api/order-item-details/ingredient-statistics` - 재료 사용 통계
- `POST /api/order-item-details/set-menu/{orderItemId}` - 세트 메뉴 상세 정보 생성
- `POST /api/order-item-details/substitute` - 메뉴 변경 처리
- `POST /api/order-item-details/ingredient` - 재료 추가/제거 처리

## 🧪 **테스트 방법**

### 1. 샘플 주문 데이터 사용
```bash
# sample_order_data.json 파일을 사용하여 테스트
curl -X POST http://localhost:8080/api/orders/create \
  -H "Content-Type: application/json" \
  -d @sample_order_data.json
```

### 2. 자동 생성 확인
```bash
# 생성된 order_item_details 확인
curl http://localhost:8080/api/order-item-details/order/{orderId}
```

## 사용 예시

### 1. 세트 메뉴 주문 생성 (자동화)
```java
// 주문 요청 시 자동으로 처리됨
OrderRequestDto request = new OrderRequestDto();
request.setItems(Arrays.asList(
    new OrderItemRequestDto("치즈버거 세트", "SET", 8500.00)
));

// 자동으로 order_item_details에 생성됨:
// - BURGER: 치즈버거
// - SIDE: 감자튀김  
// - DRINK: 콜라
```

### 2. 단품 버거 주문 생성 (자동화)
```java
// 주문 요청 시 자동으로 처리됨
OrderRequestDto request = new OrderRequestDto();
request.setItems(Arrays.asList(
    new OrderItemRequestDto("불고기버거", "BURGER", 5500.00)
));

// 자동으로 order_item_details에 생성됨:
// - INGREDIENT: 양상추 (ADD, 0원)
// - INGREDIENT: 토마토 (ADD, 0원)
// - INGREDIENT: 치즈 (ADD, 500원)
// - INGREDIENT: 베이컨 (ADD, 800원)
```

## 매출 분석 예시

### 세트 메뉴 구성 요소별 매출
```java
Map<String, Object> analysis = orderAnalyticsService.getSetMenuSalesAnalysis(orderId);
// 결과:
// {
//   "categorySales": {"BURGER": 6000.00, "SIDE": 1500.00, "DRINK": 1000.00},
//   "categoryCount": {"BURGER": 1, "SIDE": 1, "DRINK": 1},
//   "totalComponents": 3
// }
```

### 재료 사용 통계
```java
Map<String, Object> stats = orderAnalyticsService.getIngredientUsageAnalysis();
// 결과:
// {
//   "ingredientAdditions": {"양상추": 15, "치즈": 8},
//   "ingredientRemovals": {"토마토": 12, "양파": 5},
//   "totalIngredients": 4
// }
```

## 재고 관리

### 재료 소모량 예측
```java
Map<String, Object> forecast = orderAnalyticsService.getInventoryConsumptionForecast();
// 결과:
// {
//   "ingredientConsumption": {"양상추": 15, "치즈": 8, "토마토": 12},
//   "menuConsumption": {"치즈버거": 25, "불고기버거": 18},
//   "totalIngredientsUsed": 35,
//   "totalMenusOrdered": 43
// }
```

## 데이터베이스 마이그레이션

1. **기존 테이블 수정**
```sql
-- src/main/resources/11_order_management_tables.sql 실행
```

2. **새로운 테이블 생성**
```sql
-- order_item_details 테이블 자동 생성
```

3. **인덱스 및 제약 조건 추가**
```sql
-- 외래키 및 인덱스 자동 생성
```

## 주의사항

1. **기존 데이터**: 기존 주문 데이터는 새로운 필드들이 NULL로 설정됩니다.
2. **데이터 무결성**: 외래키 제약 조건으로 데이터 일관성을 보장합니다.
3. **성능**: 인덱스를 통해 조회 성능을 최적화했습니다.
4. **확장성**: 향후 새로운 아이템 타입이나 재료를 쉽게 추가할 수 있습니다.
5. **자동화**: 주문 생성 시 자동으로 order_item_details가 생성되므로 별도 API 호출 불필요

## 향후 개선 사항

1. **실시간 재고 모니터링**: 현재 재고와 예상 소모량을 실시간으로 비교
2. **자동 발주 시스템**: 재고 임계값 도달 시 자동 발주 알림
3. **고급 분석**: 머신러닝을 활용한 수요 예측 및 최적 재고량 계산
4. **대시보드**: 실시간 매출 및 재고 현황을 시각화하는 관리자 대시보드
5. **사용자 정의 옵션**: 고객이 선택한 구체적인 사이드/음료 옵션을 order_item_details에 반영
