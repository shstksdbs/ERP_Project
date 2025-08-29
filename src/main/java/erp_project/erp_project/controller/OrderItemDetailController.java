package erp_project.erp_project.controller;

import erp_project.erp_project.dto.OrderItemDetailDto;
import erp_project.erp_project.service.OrderItemDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/order-item-details")
@CrossOrigin(origins = "*")
public class OrderItemDetailController {
    
    @Autowired
    private OrderItemDetailService orderItemDetailService;
    
    // 주문 아이템 상세 정보 저장
    @PostMapping
    public ResponseEntity<OrderItemDetailDto> saveOrderItemDetail(@RequestBody OrderItemDetailDto dto) {
        try {
            OrderItemDetailDto savedDto = orderItemDetailService.saveOrderItemDetail(dto);
            return ResponseEntity.ok(savedDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 주문 아이템 ID로 상세 정보 조회
    @GetMapping("/order-item/{orderItemId}")
    public ResponseEntity<List<OrderItemDetailDto>> getDetailsByOrderItemId(@PathVariable Long orderItemId) {
        try {
            List<OrderItemDetailDto> details = orderItemDetailService.getDetailsByOrderItemId(orderItemId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 주문 ID로 모든 상세 정보 조회
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<OrderItemDetailDto>> getDetailsByOrderId(@PathVariable Long orderId) {
        try {
            List<OrderItemDetailDto> details = orderItemDetailService.getDetailsByOrderId(orderId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 세트 메뉴 구성 요소 조회
    @GetMapping("/set-components/{orderId}")
    public ResponseEntity<List<OrderItemDetailDto>> getSetComponentsByOrderId(@PathVariable Long orderId) {
        try {
            List<OrderItemDetailDto> components = orderItemDetailService.getSetComponentsByOrderId(orderId);
            return ResponseEntity.ok(components);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 변경된 메뉴 조회
    @GetMapping("/substituted")
    public ResponseEntity<List<OrderItemDetailDto>> getSubstitutedItems() {
        try {
            List<OrderItemDetailDto> items = orderItemDetailService.getSubstitutedItems();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 재료 사용 통계 조회
    @GetMapping("/ingredient-statistics")
    public ResponseEntity<List<Object[]>> getIngredientUsageStatistics() {
        try {
            List<Object[]> statistics = orderItemDetailService.getIngredientUsageStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 세트 메뉴 상세 정보 생성
    @PostMapping("/set-menu/{orderItemId}")
    public ResponseEntity<List<OrderItemDetailDto>> createSetMenuDetails(
            @PathVariable Long orderItemId,
            @RequestBody List<OrderItemDetailDto> setComponents) {
        try {
            List<OrderItemDetailDto> details = orderItemDetailService.createSetMenuDetails(orderItemId, setComponents);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 메뉴 변경 처리
    @PostMapping("/substitute")
    public ResponseEntity<OrderItemDetailDto> substituteMenuItem(
            @RequestParam Long orderItemId,
            @RequestParam Long originalMenuId,
            @RequestParam Long newMenuId,
            @RequestParam String newMenuName,
            @RequestParam BigDecimal newPrice,
            @RequestParam String reason) {
        try {
            OrderItemDetailDto dto = orderItemDetailService.substituteMenuItem(
                orderItemId, originalMenuId, newMenuId, newMenuName, newPrice, reason);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 재료 추가/제거 처리
    @PostMapping("/ingredient")
    public ResponseEntity<OrderItemDetailDto> addIngredientModification(
            @RequestParam Long orderItemId,
            @RequestParam String ingredientType,
            @RequestParam String action,
            @RequestParam BigDecimal price) {
        try {
            OrderItemDetailDto dto = orderItemDetailService.addIngredientModification(
                orderItemId, ingredientType, action, price);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 주문 아이템 상세 정보 삭제
    @DeleteMapping("/{detailId}")
    public ResponseEntity<Void> deleteOrderItemDetail(@PathVariable Long detailId) {
        try {
            orderItemDetailService.deleteOrderItemDetail(detailId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // 주문 아이템 ID로 모든 상세 정보 삭제
    @DeleteMapping("/order-item/{orderItemId}")
    public ResponseEntity<Void> deleteDetailsByOrderItemId(@PathVariable Long orderItemId) {
        try {
            orderItemDetailService.deleteDetailsByOrderItemId(orderItemId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
