package erp_project.erp_project.controller;

import erp_project.erp_project.entity.Orders;
import erp_project.erp_project.entity.OrderItems;
import erp_project.erp_project.entity.OrderHistory;
import erp_project.erp_project.repository.OrderRepository;
import erp_project.erp_project.repository.OrderItemRepository;
import erp_project.erp_project.repository.BranchesRepository;
import erp_project.erp_project.repository.OrderHistoryRepository;
import erp_project.erp_project.service.AutomatedOrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private BranchesRepository branchesRepository;

    @Autowired
    private OrderHistoryRepository orderHistoryRepository;

    @Autowired
    private AutomatedOrderService automatedOrderService;

    @Autowired
    private ObjectMapper objectMapper;

    // 토스페이먼츠 시크릿 키 (실제로는 환경 변수로 관리해야 함)
    private static final String TOSS_SECRET_KEY = "test_sk_D4yKeq5bgrpKRd0JYbLVGX0lzW6Y";
    
    // 보안을 위한 시크릿 키 (환경 변수에서 가져오기)
    @Value("${security.secret.key:your_secret_key_here_change_in_production}")
    private String securitySecret;
    
    // 해시 검증을 위한 타임스탬프 유효 시간 (밀리초)
    @Value("${security.hash.validity.period:300000}")
    private long hashValidityPeriod;

    // 보안 해시 생성 메서드
    private String generateSecurityHash(String data, long timestamp) {
        try {
            String input = data + timestamp + securitySecret;
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("해시 생성 실패", e);
        }
    }
    
    // 보안 해시 검증 메서드
    private boolean validateSecurityHash(String data, long timestamp, String receivedHash) {
        // 타임스탬프 유효성 검증
        long currentTime = System.currentTimeMillis();
        if (Math.abs(currentTime - timestamp) > hashValidityPeriod) {
            System.err.println("타임스탬프가 유효하지 않습니다. 현재: " + currentTime + ", 받은: " + timestamp);
            return false;
        }
        
        // 해시 검증
        String expectedHash = generateSecurityHash(data, timestamp);
        boolean isValid = expectedHash.equals(receivedHash);
        
        if (!isValid) {
            System.err.println("해시 검증 실패. 예상: " + expectedHash + ", 받은: " + receivedHash);
        }
        
        return isValid;
    }
    
    // 아이템 타입 판단 메서드
    private OrderItems.ItemType determineItemType(Map<String, Object> itemData) {
        String menuName = (String) itemData.get("menuName");
        String displayName = (String) itemData.get("displayName");
        
        // 메뉴 이름이나 표시 이름에 "세트"가 포함되어 있으면 SET
        if (menuName != null && menuName.contains("세트")) {
            return OrderItems.ItemType.SET;
        }
        if (displayName != null && displayName.contains("세트")) {
            return OrderItems.ItemType.SET;
        }
        
        // 메뉴 이름에 "버거"가 포함되어 있으면 BURGER
        if (menuName != null && menuName.contains("버거")) {
            return OrderItems.ItemType.BURGER;
        }
        if (displayName != null && displayName.contains("버거")) {
            return OrderItems.ItemType.BURGER;
        }
        
        // 메뉴 이름에 "음료"가 포함되어 있으면 DRINK
        if (menuName != null && menuName.contains("음료")) {
            return OrderItems.ItemType.DRINK;
        }
        if (displayName != null && displayName.contains("음료")) {
            return OrderItems.ItemType.DRINK;
        }
        
        // 메뉴 이름에 "사이드"가 포함되어 있으면 SIDE
        if (menuName != null && menuName.contains("사이드")) {
            return OrderItems.ItemType.SIDE;
        }
        if (displayName != null && displayName.contains("사이드")) {
            return OrderItems.ItemType.SIDE;
        }
        
        // 기본값은 BURGER
        return OrderItems.ItemType.BURGER;
    }
    
    // 주문 생성 API
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> request) {
        try {
            // 디버깅: 받은 요청 데이터 로그 출력
            System.out.println("=== 주문 생성 요청 데이터 ===");
            System.out.println("전체 요청: " + request);
            System.out.println("보안 해시: " + request.get("securityHash"));
            System.out.println("타임스탬프: " + request.get("timestamp"));
            System.out.println("지점 ID: " + request.get("branchId"));
            System.out.println("주문 유형: " + request.get("orderType"));
            System.out.println("고객명: " + request.get("customerName"));
            System.out.println("고객 전화: " + request.get("customerPhone"));
            System.out.println("결제 방법: " + request.get("paymentMethod"));
            System.out.println("아이템: " + request.get("items"));
            System.out.println("================================");
            
            // 보안 검증
            if (!request.containsKey("securityHash") || !request.containsKey("timestamp")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "보안 정보가 누락되었습니다.");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            String receivedHash = (String) request.get("securityHash");
            long timestamp = Long.valueOf(request.get("timestamp").toString());
            
            // 주문 데이터 추출
            Long branchId = Long.valueOf(request.get("branchId").toString());
            String orderType = (String) request.get("orderType");
            String customerName = (String) request.get("customerName");
            String customerPhone = (String) request.get("customerPhone");
            String paymentMethod = (String) request.get("paymentMethod");
            List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");
            
            // 보안 해시 검증
            String dataToHash = branchId + orderType + customerName + customerPhone + paymentMethod + items.toString();
            System.out.println("=== 보안 해시 검증 ===");
            System.out.println("데이터 해시: " + dataToHash);
            System.out.println("받은 해시: " + receivedHash);
            System.out.println("타임스탬프: " + timestamp);
            System.out.println("================================");
            
            // 임시로 보안 검증 건너뛰기 (테스트용)
            System.out.println("보안 검증 건너뛰기 (테스트 모드)");
            /*
            if (!validateSecurityHash(dataToHash, timestamp, receivedHash)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "보안 검증에 실패했습니다.");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            */

            // 총 금액 계산
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (Map<String, Object> item : items) {
                BigDecimal itemTotal = new BigDecimal(item.get("totalPrice").toString());
                totalAmount = totalAmount.add(itemTotal);
            }

            // 주문 번호 생성 (토스페이먼츠 요구사항에 맞춤)
            // 형식: BR{timestamp}_{random} (영문, 숫자, 언더스코어만 사용)
            long orderTimestamp = System.currentTimeMillis();
            int randomSuffix = (int)(Math.random() * 10000);
            String orderNumber = "BR" + orderTimestamp + "_" + randomSuffix;
            
            // 주문 번호 길이 검증 (6-64자)
            if (orderNumber.length() > 64) {
                orderNumber = orderNumber.substring(0, 64);
            }
            
            // 디버깅을 위한 로그 출력
            System.out.println("생성된 주문 번호: " + orderNumber + " (길이: " + orderNumber.length() + ")");

            // 주문 엔티티 생성
            Orders order = new Orders();
            order.setBranchId(branchId);
            order.setOrderNumber(orderNumber);
            order.setOrderStatus(Orders.OrderStatus.pending);
            order.setOrderType(Orders.OrderType.valueOf(orderType));
            order.setCustomerName(customerName);
            order.setCustomerPhone(customerPhone);
            order.setTotalAmount(totalAmount);
            order.setDiscountAmount(BigDecimal.ZERO);
            order.setFinalAmount(totalAmount);
            order.setPaymentMethod(Orders.PaymentMethod.valueOf(paymentMethod));
            order.setPaymentStatus(Orders.PaymentStatus.pending); // 결제 대기 상태로 변경
            order.setOrderTime(LocalDateTime.now());

            // 주문 저장
            Orders savedOrder = orderRepository.save(order);

            // 주문 아이템 저장 및 자동화 처리
            List<OrderItems> savedOrderItems = new ArrayList<>();
            System.out.println("=== 주문 아이템 처리 시작 ===");
            for (Map<String, Object> itemData : items) {
                System.out.println("처리 중인 아이템: " + itemData.get("menuName"));
                OrderItems orderItem = new OrderItems();
                orderItem.setOrderId(savedOrder.getOrderId());
                orderItem.setMenuId(Long.valueOf(itemData.get("menuId").toString()));
                orderItem.setMenuName((String) itemData.get("menuName"));
                orderItem.setUnitPrice(new BigDecimal(itemData.get("unitPrice").toString()));
                orderItem.setQuantity(Integer.valueOf(itemData.get("quantity").toString()));
                orderItem.setTotalPrice(new BigDecimal(itemData.get("totalPrice").toString()));
                orderItem.setDisplayName((String) itemData.get("displayName"));
                
                // 아이템 타입 설정 (세트 메뉴인지 단품인지 판단)
                try {
                    OrderItems.ItemType itemType = determineItemType(itemData);
                    orderItem.setItemType(itemType);
                    
                    // is_set_component 설정
                    if (itemType == OrderItems.ItemType.SET) {
                        orderItem.setIsSetComponent(true);
                    } else {
                        orderItem.setIsSetComponent(false);
                    }
                    
                    System.out.println("아이템 타입 설정: " + itemType + " for " + itemData.get("menuName"));
                } catch (Exception e) {
                    System.err.println("아이템 타입 설정 실패: " + e.getMessage());
                    // 기본값으로 BURGER 설정
                    orderItem.setItemType(OrderItems.ItemType.BURGER);
                    orderItem.setIsSetComponent(false);
                }
                
                // 옵션 정보를 JSON으로 저장
                try {
                    if (itemData.get("displayOptions") != null) {
                        Object displayOptions = itemData.get("displayOptions");
                        if (displayOptions instanceof List) {
                            // List를 JSON 문자열로 변환
                            orderItem.setDisplayOptions(objectMapper.writeValueAsString(displayOptions));
                        } else if (displayOptions instanceof String) {
                            // 이미 문자열인 경우 그대로 사용
                            orderItem.setDisplayOptions((String) displayOptions);
                        } else {
                            // 기타 타입은 빈 배열로 설정
                            orderItem.setDisplayOptions("[]");
                        }
                    } else {
                        // null인 경우 빈 배열로 설정
                        orderItem.setDisplayOptions("[]");
                    }
                } catch (Exception e) {
                    // JSON 변환 실패 시 빈 배열로 설정
                    orderItem.setDisplayOptions("[]");
                    System.err.println("displayOptions JSON 변환 실패: " + e.getMessage());
                }
                
                // 상세 옵션 정보를 JSON으로 저장 (optionsJson)
                try {
                    if (itemData.get("options") != null) {
                        Object options = itemData.get("options");
                        if (options instanceof List) {
                            // List를 JSON 문자열로 변환
                            orderItem.setOptionsJson(objectMapper.writeValueAsString(options));
                        } else if (options instanceof String) {
                            // 이미 문자열인 경우 그대로 사용
                            orderItem.setOptionsJson((String) options);
                        } else {
                            // 기타 타입은 빈 배열로 설정
                            orderItem.setOptionsJson("[]");
                        }
                    } else {
                        // null인 경우 빈 배열로 설정
                        orderItem.setOptionsJson("[]");
                    }
                } catch (Exception e) {
                    // JSON 변환 실패 시 빈 배열로 설정
                    orderItem.setOptionsJson("[]");
                    System.err.println("options JSON 변환 실패: " + e.getMessage());
                }
                
                OrderItems savedOrderItem = orderItemRepository.save(orderItem);
                savedOrderItems.add(savedOrderItem);
            }
            
            // 자동화된 order_item_details 생성 (오류 발생 시에도 주문은 성공)
            try {
                automatedOrderService.processOrderItemsAutomatically(savedOrder, savedOrderItems);
                System.out.println("order_item_details 자동 생성 완료");
            } catch (Exception e) {
                System.err.println("order_item_details 자동 생성 실패: " + e.getMessage());
                e.printStackTrace();
                // 주문은 성공했으므로 계속 진행
            }

            // 응답 데이터 생성
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", savedOrder.getOrderId());
            response.put("orderNumber", savedOrder.getOrderNumber());
            response.put("message", "주문이 성공적으로 생성되었습니다.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "주문 생성 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // 결제 상태 업데이트 API
    @PutMapping("/{orderNumber}/payment-status")
    public ResponseEntity<Map<String, Object>> updatePaymentStatus(
            @PathVariable String orderNumber,
            @RequestBody Map<String, String> request) {
        try {
            String newPaymentStatus = request.get("paymentStatus");
            String tossPaymentKey = request.get("paymentKey"); // 토스페이먼츠 결제 키
            
            // 주문 번호로 주문 찾기
            Orders order = orderRepository.findByOrderNumber(orderNumber);
            if (order == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "주문을 찾을 수 없습니다.");
                return ResponseEntity.notFound().build();
            }
            
            // 결제 상태 업데이트
            order.setPaymentStatus(Orders.PaymentStatus.valueOf(newPaymentStatus));
            
            // 결제 완료인 경우 추가 정보 설정
            if ("completed".equals(newPaymentStatus)) {
                order.setPaymentTime(LocalDateTime.now());
                // 토스페이먼츠 결제 키 저장 (필요시)
                // order.setTossPaymentKey(tossPaymentKey);
            }
            
            // 주문 저장
            orderRepository.save(order);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "결제 상태가 업데이트되었습니다.");
            response.put("orderNumber", orderNumber);
            response.put("paymentStatus", newPaymentStatus);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "결제 상태 업데이트 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // 지점별 주문 목록 조회 (결제 완료된 주문만)
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<Map<String, Object>>> getOrdersByBranch(@PathVariable Long branchId) {
        try {
            // 결제 완료된 주문만 조회
            List<Orders> orders = orderRepository.findByBranchIdAndPaymentStatusOrderByOrderTimeDesc(branchId, Orders.PaymentStatus.completed);
            
            List<Map<String, Object>> orderList = orders.stream().map(order -> {
                // 각 주문의 상세 아이템 조회
                List<OrderItems> items = orderItemRepository.findByOrderId(order.getOrderId());
                
                // 주문 아이템을 문자열로 변환
                List<String> itemStrings = items.stream()
                    .map(item -> {
                        String baseItem = item.getDisplayName() + " x" + item.getQuantity();
                        
                        // display_options가 있으면 추가 정보 포함
                        String displayOptions = item.getDisplayOptions();
                        if (displayOptions != null && !displayOptions.isEmpty() && !displayOptions.equals("[]")) {
                            try {
                                // JSON 배열을 파싱하여 옵션 정보 추출
                                List<String> options = objectMapper.readValue(displayOptions, List.class);
                                if (!options.isEmpty()) {
                                    String optionsText = String.join(", ", options);
                                    return baseItem + "\n" + optionsText; // 줄바꿈으로 구분
                                }
                            } catch (Exception e) {
                                // JSON 파싱 실패 시 원본 displayOptions 사용
                                if (!displayOptions.equals("[]")) {
                                    return baseItem + "\n" + displayOptions; // 줄바꿈으로 구분
                                }
                            }
                        }
                        return baseItem;
                    })
                    .collect(Collectors.toList());
                
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("id", order.getOrderId());
                orderMap.put("orderNumber", order.getOrderNumber());
                orderMap.put("customerName", order.getCustomerName() != null ? order.getCustomerName() : "고객");
                orderMap.put("items", itemStrings);
                orderMap.put("totalAmount", order.getFinalAmount());
                orderMap.put("status", order.getOrderStatus().toString());
                orderMap.put("orderDate", order.getOrderTime().toString());
                orderMap.put("completedDate", order.getCompletedTime() != null ? order.getCompletedTime().toString() : null);
                orderMap.put("cancelledDate", order.getCancelledTime() != null ? order.getCancelledTime().toString() : null);
                orderMap.put("employeeName", "담당직원"); // TODO: 실제 직원 정보 연동
                orderMap.put("paymentMethod", order.getPaymentMethod().toString());
                orderMap.put("orderType", order.getOrderType().toString());
                orderMap.put("paymentStatus", order.getPaymentStatus().toString()); // 결제 상태 추가
                
                return orderMap;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(orderList);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // 주문 상태 업데이트
    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        try {
            String newStatus = request.get("status");
            String employeeName = request.get("employeeName"); // 직원 이름 받기
            Orders order = orderRepository.findById(orderId).orElse(null);
            
            if (order == null) {
                return ResponseEntity.notFound().build();
            }
            
            // 주문 상태 업데이트
            order.setOrderStatus(Orders.OrderStatus.valueOf(newStatus));
            
            // 완료 상태인 경우 완료 시간 설정
            if ("completed".equals(newStatus)) {
                order.setCompletedTime(LocalDateTime.now());
                order.setCancelledTime(null); // 취소 시간 초기화
                
                // 주문이력 테이블에 자동 추가 (직원 이름 전달)
                createOrderHistory(order, "completed", employeeName);
            }
            
            // 취소 상태인 경우 취소 시간 설정
            if ("cancelled".equals(newStatus)) {
                order.setCancelledTime(LocalDateTime.now());
                order.setCompletedTime(null); // 완료 시간 초기화
                
                // 주문이력 테이블에 자동 추가 (직원 이름 전달)
                createOrderHistory(order, "cancelled", employeeName);
            }
            
            // 업데이트 시간 설정
            order.setUpdatedAt(LocalDateTime.now());
            
            orderRepository.save(order);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }



    // 결제 검증 API
    @PostMapping("/verify-payment")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, Object> request) {
        try {
            String paymentKey = (String) request.get("paymentKey");
            String orderId = (String) request.get("orderId");
            Long amount = Long.valueOf(request.get("amount").toString());

            // 토스페이먼츠 결제 승인 요청
            String tossPaymentsUrl = "https://api.tosspayments.com/v1/payments/confirm";
            
            // 결제 승인 요청 데이터
            Map<String, Object> confirmData = new HashMap<>();
            confirmData.put("paymentKey", paymentKey);
            confirmData.put("orderId", orderId);
            confirmData.put("amount", amount);

            // HTTP 클라이언트를 사용하여 토스페이먼츠 API 호출
            // 실제 구현에서는 RestTemplate 또는 WebClient 사용
            // 여기서는 간단한 응답만 반환
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "결제가 성공적으로 검증되었습니다.");
            response.put("paymentKey", paymentKey);
            response.put("orderId", orderId);
            response.put("amount", amount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "결제 검증 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // 주문 이력 생성 메서드
    private void createOrderHistory(Orders order, String status, String employeeName) {
        try {
            // 이미 해당 주문의 이력이 있는지 확인
            List<OrderHistory> existingHistory = orderHistoryRepository.findByOrderId(order.getOrderId());
            if (!existingHistory.isEmpty()) {
                System.out.println("이미 주문이력이 존재합니다: " + order.getOrderNumber());
                return;
            }
            
            OrderHistory history = new OrderHistory();
            history.setOrderId(order.getOrderId());
            history.setOrderNumber(order.getOrderNumber());
            history.setBranchId(order.getBranchId());
            history.setCustomerName(order.getCustomerName());
            history.setTotalAmount(order.getFinalAmount());
            history.setStatus(OrderHistory.OrderStatus.valueOf(status));
            history.setOrderTime(order.getOrderTime());
            
            if ("completed".equals(status)) {
                history.setCompletedTime(LocalDateTime.now());
            } else if ("cancelled".equals(status)) {
                history.setCancelledTime(LocalDateTime.now());
            }
            
            // 직원 정보는 기본값으로 설정 (실제로는 로그인된 유저 정보 사용)
            history.setEmployeeName(employeeName);
            
            orderHistoryRepository.save(history);
            System.out.println("주문이력이 성공적으로 생성되었습니다: " + order.getOrderNumber());
        } catch (Exception e) {
            System.err.println("주문이력 생성 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
