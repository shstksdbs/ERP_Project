package erp_project.erp_project.controller;

import erp_project.erp_project.entity.Orders;
import erp_project.erp_project.entity.OrderItems;
import erp_project.erp_project.entity.OrderHistory;
import erp_project.erp_project.repository.OrderRepository;
import erp_project.erp_project.repository.OrderItemRepository;
import erp_project.erp_project.repository.BranchesRepository;
import erp_project.erp_project.repository.OrderHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

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
    private ObjectMapper objectMapper;

    // 주문 생성 API
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> request) {
        try {
            // 주문 데이터 추출
            Long branchId = Long.valueOf(request.get("branchId").toString());
            String orderType = (String) request.get("orderType");
            String customerName = (String) request.get("customerName");
            String customerPhone = (String) request.get("customerPhone");
            String paymentMethod = (String) request.get("paymentMethod");
            List<Map<String, Object>> items = (List<Map<String, Object>>) request.get("items");

            // 총 금액 계산
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (Map<String, Object> item : items) {
                BigDecimal itemTotal = new BigDecimal(item.get("totalPrice").toString());
                totalAmount = totalAmount.add(itemTotal);
            }

            // 주문 번호 생성 (지점코드 + 날짜 + 순번)
            String branchCode = branchesRepository.findById(branchId)
                .map(branch -> branch.getBranchCode())
                .orElse("BR");
            
            // 오늘 날짜 기준으로 순번 생성
            String today = LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("MMdd"));
            
            // 오늘 해당 지점의 주문 수 조회하여 순번 생성
            long todayOrderCount = orderRepository.countByBranchIdAndOrderTimeBetween(
                branchId,
                LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0),
                LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999)
            );
            
            String orderNumber = branchCode + today + String.format("%03d", todayOrderCount + 1);

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
            order.setPaymentStatus(Orders.PaymentStatus.completed);
            order.setOrderTime(LocalDateTime.now());

            // 주문 저장
            Orders savedOrder = orderRepository.save(order);

            // 주문 아이템 저장
            for (Map<String, Object> itemData : items) {
                OrderItems orderItem = new OrderItems();
                orderItem.setOrderId(savedOrder.getOrderId());
                orderItem.setMenuId(Long.valueOf(itemData.get("menuId").toString()));
                orderItem.setMenuName((String) itemData.get("menuName"));
                orderItem.setUnitPrice(new BigDecimal(itemData.get("unitPrice").toString()));
                orderItem.setQuantity(Integer.valueOf(itemData.get("quantity").toString()));
                orderItem.setTotalPrice(new BigDecimal(itemData.get("totalPrice").toString()));
                orderItem.setDisplayName((String) itemData.get("displayName"));
                
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
                
                orderItemRepository.save(orderItem);
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

    // 지점별 주문 목록 조회
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<Map<String, Object>>> getOrdersByBranch(@PathVariable Long branchId) {
        try {
            List<Orders> orders = orderRepository.findByBranchIdOrderByOrderTimeDesc(branchId);
            
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
