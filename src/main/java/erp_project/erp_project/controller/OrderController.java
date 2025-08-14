package erp_project.erp_project.controller;

import erp_project.erp_project.dto.CreateOrderRequest;
import erp_project.erp_project.dto.OrderResponse;
import erp_project.erp_project.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    @PostMapping("/create")
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            OrderResponse order = orderService.createOrder(request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long orderId) {
        try {
            OrderResponse order = orderService.getOrder(orderId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/branch/{branchId}")
    public ResponseEntity<?> getOrdersByBranch(@PathVariable Long branchId) {
        try {
            return ResponseEntity.ok(orderService.getOrdersByBranch(branchId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
