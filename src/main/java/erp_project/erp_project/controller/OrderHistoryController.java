package erp_project.erp_project.controller;

import erp_project.erp_project.entity.OrderHistory;
import erp_project.erp_project.entity.OrderItems;
import erp_project.erp_project.repository.OrderHistoryRepository;
import erp_project.erp_project.repository.OrderItemRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/order-history")
@CrossOrigin(origins = "*")
public class OrderHistoryController {
    
    @Autowired
    private OrderHistoryRepository orderHistoryRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // 주문이력 생성
    @PostMapping
    public ResponseEntity<?> createOrderHistory(@RequestBody Map<String, Object> request) {
        try {
            OrderHistory history = new OrderHistory();
            
            history.setOrderId(Long.valueOf(request.get("orderId").toString()));
            history.setOrderNumber((String) request.get("orderNumber"));
            history.setBranchId(Long.valueOf(request.get("branchId").toString()));
            history.setCustomerName((String) request.get("customerName"));
            history.setTotalAmount(new java.math.BigDecimal(request.get("totalAmount").toString()));
            history.setStatus(OrderHistory.OrderStatus.valueOf((String) request.get("status")));
            
            // 주문시간 파싱
            String orderDateStr = (String) request.get("orderDate");
            if (orderDateStr != null) {
                try {
                    LocalDateTime orderTime = LocalDateTime.parse(orderDateStr, 
                        DateTimeFormatter.ofPattern("yyyy. M. d. a h:mm:ss"));
                    history.setOrderTime(orderTime);
                } catch (Exception e) {
                    history.setOrderTime(LocalDateTime.now());
                }
            } else {
                history.setOrderTime(LocalDateTime.now());
            }
            
            // 완료시간 설정
            if ("completed".equals(request.get("status"))) {
                history.setCompletedTime(LocalDateTime.now());
            }
            
            // 취소시간 설정
            if ("cancelled".equals(request.get("status"))) {
                history.setCancelledTime(LocalDateTime.now());
            }
            
            // 직원 정보 설정
            if (request.get("employeeName") != null) {
                history.setEmployeeName((String) request.get("employeeName"));
            }
            
            OrderHistory savedHistory = orderHistoryRepository.save(history);
            return ResponseEntity.ok(savedHistory);
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = Map.of("error", "주문이력 생성 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // 지점별 주문이력 조회
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<List<Map<String, Object>>> getOrderHistoryByBranch(@PathVariable Long branchId) {
        try {
            List<OrderHistory> historyList = orderHistoryRepository.findByBranchIdOrderByOrderTimeDesc(branchId);
            
            List<Map<String, Object>> result = historyList.stream().map(history -> {
                Map<String, Object> historyMap = new HashMap<>();
                
                // 기본 이력 정보
                historyMap.put("id", history.getOrderId());
                historyMap.put("orderNumber", history.getOrderNumber());
                historyMap.put("customerName", history.getCustomerName());
                historyMap.put("totalAmount", history.getTotalAmount());
                historyMap.put("status", history.getStatus());
                historyMap.put("orderDate", history.getOrderTime());
                historyMap.put("completedDate", history.getCompletedTime());
                historyMap.put("cancelledDate", history.getCancelledTime());
                historyMap.put("employeeName", history.getEmployeeName());
                
                // 주문 상세 아이템 정보 가져오기
                try {
                    List<OrderItems> orderItems = orderItemRepository.findByOrderId(history.getOrderId());
                    List<String> itemStrings = orderItems.stream()
                        .map(item -> {
                            String baseItem = item.getDisplayName() + " x" + item.getQuantity();
                            
                            // display_options가 있으면 추가 정보 포함
                            String displayOptions = item.getDisplayOptions();
                            if (displayOptions != null && !displayOptions.isEmpty() && !displayOptions.equals("[]")) {
                                try {
                                    List<String> options = objectMapper.readValue(displayOptions, List.class);
                                    if (!options.isEmpty()) {
                                        String optionsText = String.join(", ", options);
                                        return baseItem + "\n" + optionsText;
                                    }
                                } catch (Exception e) {
                                    if (!displayOptions.equals("[]")) {
                                        return baseItem + "\n" + displayOptions;
                                    }
                                }
                            }
                            return baseItem;
                        })
                        .collect(Collectors.toList());
                    
                    historyMap.put("items", itemStrings);
                } catch (Exception e) {
                    historyMap.put("items", new ArrayList<>());
                }
                
                return historyMap;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 상태별 주문이력 조회
    @GetMapping("/branch/{branchId}/status/{status}")
    public ResponseEntity<List<Map<String, Object>>> getOrderHistoryByStatus(
            @PathVariable Long branchId, 
            @PathVariable String status) {
        try {
            OrderHistory.OrderStatus orderStatus = OrderHistory.OrderStatus.valueOf(status);
            List<OrderHistory> historyList = orderHistoryRepository.findByBranchIdAndStatusOrderByOrderTimeDesc(branchId, orderStatus);
            
            List<Map<String, Object>> result = historyList.stream().map(history -> {
                Map<String, Object> historyMap = new HashMap<>();
                
                // 기본 이력 정보
                historyMap.put("id", history.getOrderId());
                historyMap.put("orderNumber", history.getOrderNumber());
                historyMap.put("customerName", history.getCustomerName());
                historyMap.put("totalAmount", history.getTotalAmount());
                historyMap.put("status", history.getStatus());
                historyMap.put("orderDate", history.getOrderTime());
                historyMap.put("completedDate", history.getCompletedTime());
                historyMap.put("cancelledDate", history.getCancelledTime());
                historyMap.put("employeeName", history.getEmployeeName());
                
                // 주문 상세 아이템 정보 가져오기
                try {
                    List<OrderItems> orderItems = orderItemRepository.findByOrderId(history.getOrderId());
                    List<String> itemStrings = orderItems.stream()
                        .map(item -> {
                            String baseItem = item.getDisplayName() + " x" + item.getQuantity();
                            
                            // display_options가 있으면 추가 정보 포함
                            String displayOptions = item.getDisplayOptions();
                            if (displayOptions != null && !displayOptions.isEmpty() && !displayOptions.equals("[]")) {
                                try {
                                    List<String> options = objectMapper.readValue(displayOptions, List.class);
                                    if (!options.isEmpty()) {
                                        String optionsText = String.join(", ", options);
                                        return baseItem + "\n" + optionsText;
                                    }
                                } catch (Exception e) {
                                    if (!displayOptions.equals("[]")) {
                                        return baseItem + "\n" + displayOptions;
                                    }
                                }
                            }
                            return baseItem;
                        })
                        .collect(Collectors.toList());
                    
                    historyMap.put("items", itemStrings);
                } catch (Exception e) {
                    historyMap.put("items", new ArrayList<>());
                }
                
                return historyMap;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 기간별 주문이력 조회
    @GetMapping("/branch/{branchId}/period")
    public ResponseEntity<List<OrderHistory>> getOrderHistoryByPeriod(
            @PathVariable Long branchId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDateTime start = LocalDateTime.parse(startDate + "T00:00:00");
            LocalDateTime end = LocalDateTime.parse(endDate + "T23:59:59");
            List<OrderHistory> history = orderHistoryRepository.findByBranchIdAndOrderTimeBetweenOrderByOrderTimeDesc(branchId, start, end);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
