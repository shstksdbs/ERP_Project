package erp_project.erp_project.service;

import erp_project.erp_project.dto.*;
import erp_project.erp_project.entity.*;
import erp_project.erp_project.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private OrderItemOptionRepository orderItemOptionRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    public OrderResponse createOrder(CreateOrderRequest request) throws Exception {
        // 1. 주문 마스터 생성
        Orders order = new Orders();
        order.setBranchId(request.getBranchId());
        order.setOrderType(Orders.OrderType.valueOf(request.getOrderType()));
        order.setCustomerName(request.getCustomerName());
        order.setCustomerPhone(request.getCustomerPhone());
        order.setOrderNumber(generateOrderNumber(request.getBranchId()));
        order.setOrderStatus(Orders.OrderStatus.pending);
        order.setPaymentMethod(Orders.PaymentMethod.valueOf(request.getPaymentMethod()));
        
        // 총 금액 계산
        BigDecimal totalAmount = request.getItems().stream()
            .map(CartItemRequest::getTotalPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        order.setTotalAmount(totalAmount);
        order.setFinalAmount(totalAmount); // 할인 없음
        
        Orders savedOrder = orderRepository.save(order);
        
        // 2. 주문 상세 아이템들 저장
        for (CartItemRequest cartItem : request.getItems()) {
            OrderItems orderItem = new OrderItems();
            orderItem.setOrderId(savedOrder.getOrderId());
            orderItem.setMenuId(cartItem.getMenuId());
            orderItem.setMenuName(cartItem.getMenuName());
            orderItem.setUnitPrice(cartItem.getUnitPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setTotalPrice(cartItem.getTotalPrice());
            orderItem.setDisplayName(cartItem.getDisplayName());
            
            // 옵션 정보를 JSON으로 저장
            if (cartItem.getDisplayOptions() != null) {
                try {
                    orderItem.setDisplayOptions(objectMapper.writeValueAsString(cartItem.getDisplayOptions()));
                } catch (JsonProcessingException e) {
                    orderItem.setDisplayOptions("[]");
                }
            }
            
            // 상세 옵션 정보를 JSON으로 저장
            if (cartItem.getOptions() != null) {
                try {
                    orderItem.setOptionsJson(objectMapper.writeValueAsString(cartItem.getOptions()));
                } catch (JsonProcessingException e) {
                    orderItem.setOptionsJson("[]");
                }
            }
            
            OrderItems savedOrderItem = orderItemRepository.save(orderItem);
            
            // 3. 주문 옵션 상세 저장
            if (cartItem.getOptions() != null) {
                for (OptionRequest option : cartItem.getOptions()) {
                    OrderItemOptions orderItemOption = new OrderItemOptions();
                    orderItemOption.setOrderItemId(savedOrderItem.getOrderItemId());
                    orderItemOption.setOptionId(option.getOptionId());
                    orderItemOption.setQuantity(option.getQuantity());
                    orderItemOption.setUnitPrice(option.getUnitPrice());
                    orderItemOption.setTotalPrice(option.getUnitPrice().multiply(new BigDecimal(option.getQuantity())));
                    
                    orderItemOptionRepository.save(orderItemOption);
                }
            }
        }
        
        // 4. 결제 정보 저장
        Payment payment = new Payment();
        payment.setOrderId(savedOrder.getOrderId());
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(request.getPaymentMethod()));
        payment.setPaymentAmount(totalAmount);
        payment.setPaymentStatus(Payment.PaymentStatus.pending);
        
        paymentRepository.save(payment);
        
        return new OrderResponse(savedOrder.getOrderId(), savedOrder.getOrderNumber());
    }
    
    public OrderResponse getOrder(Long orderId) throws Exception {
        Orders order = orderRepository.findById(orderId)
            .orElseThrow(() -> new Exception("주문을 찾을 수 없습니다."));
        
        List<OrderItems> orderItems = orderItemRepository.findByOrderId(orderId);
        List<OrderItemResponse> itemResponses = orderItems.stream()
            .map(this::convertToOrderItemResponse)
            .collect(Collectors.toList());
        
        return new OrderResponse(
            order.getOrderId(),
            order.getOrderNumber(),
            order.getOrderStatus().toString(),
            order.getOrderType().toString(),
            order.getTotalAmount(),
            order.getFinalAmount(),
            order.getPaymentMethod().toString(),
            "pending", // payment status
            order.getOrderTime(),
            itemResponses
        );
    }
    
    public List<OrderResponse> getOrdersByBranch(Long branchId) throws Exception {
        List<Orders> orders = orderRepository.findByBranchId(branchId);
        return orders.stream()
            .map(order -> new OrderResponse(order.getOrderId(), order.getOrderNumber()))
            .collect(Collectors.toList());
    }
    
    private OrderItemResponse convertToOrderItemResponse(OrderItems orderItem) {
        List<OrderItemOptions> options = orderItemOptionRepository.findByOrderItemId(orderItem.getOrderItemId());
        List<OrderItemOptionResponse> optionResponses = options.stream()
            .map(option -> new OrderItemOptionResponse(
                option.getId(),
                option.getOptionId(),
                "옵션명", // 실제로는 옵션 테이블에서 가져와야 함
                option.getQuantity(),
                option.getUnitPrice(),
                option.getTotalPrice()
            ))
            .collect(Collectors.toList());
        
        List<String> displayOptions = null;
        try {
            if (orderItem.getDisplayOptions() != null) {
                displayOptions = objectMapper.readValue(orderItem.getDisplayOptions(), List.class);
            }
        } catch (Exception e) {
            displayOptions = List.of();
        }
        
        return new OrderItemResponse(
            orderItem.getOrderItemId(),
            orderItem.getMenuId(),
            orderItem.getMenuName(),
            orderItem.getQuantity(),
            orderItem.getUnitPrice(),
            orderItem.getTotalPrice(),
            orderItem.getDisplayName(),
            displayOptions,
            optionResponses
        );
    }
    
    private String generateOrderNumber(Long branchId) {
        // 지점별 고유 주문번호 생성 (예: BR001-20241201-001)
        String date = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String sequence = String.format("%03d", getNextSequence(branchId, date));
        return String.format("BR%03d-%s-%s", branchId, date, sequence);
    }
    
    private int getNextSequence(Long branchId, String date) {
        // 해당 지점과 날짜의 주문 수를 세어서 다음 시퀀스 생성
        LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyyMMdd"));
        LocalDateTime startTime = localDate.atStartOfDay();
        LocalDateTime endTime = localDate.atTime(23, 59, 59);
        
        List<Orders> todayOrders = orderRepository.findByBranchIdAndOrderTimeBetween(
            branchId, startTime, endTime);
        return todayOrders.size() + 1;
    }
}
