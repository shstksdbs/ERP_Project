package erp_project.erp_project.service;

import erp_project.erp_project.dto.OrderItemDetailDto;
import erp_project.erp_project.entity.OrderItemDetails;
import erp_project.erp_project.entity.Menu;
import erp_project.erp_project.repository.OrderItemDetailsRepository;
import erp_project.erp_project.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;
import java.util.Optional;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
@Transactional
public class OrderItemDetailService {
    
    @Autowired
    private OrderItemDetailsRepository orderItemDetailsRepository;
    
    @Autowired
    private MenuRepository menuRepository;
    
    // 주문 아이템 상세 정보 저장
    public OrderItemDetailDto saveOrderItemDetail(OrderItemDetailDto dto) {
        OrderItemDetails entity = dto.toEntity();
        OrderItemDetails savedEntity = orderItemDetailsRepository.save(entity);
        return new OrderItemDetailDto(savedEntity);
    }
    
    // 주문 아이템 ID로 상세 정보 조회
    public List<OrderItemDetailDto> getDetailsByOrderItemId(Long orderItemId) {
        List<OrderItemDetails> entities = orderItemDetailsRepository.findByOrderItemId(orderItemId);
        return entities.stream()
                .map(OrderItemDetailDto::new)
                .collect(Collectors.toList());
    }
    
    // 주문 ID로 모든 상세 정보 조회
    public List<OrderItemDetailDto> getDetailsByOrderId(Long orderId) {
        List<OrderItemDetails> entities = orderItemDetailsRepository.findByOrderId(orderId);
        return entities.stream()
                .map(OrderItemDetailDto::new)
                .collect(Collectors.toList());
    }
    
    // 세트 메뉴 구성 요소 조회
    public List<OrderItemDetailDto> getSetComponentsByOrderId(Long orderId) {
        List<OrderItemDetails> entities = orderItemDetailsRepository.findSetComponentsByOrderId(orderId);
        return entities.stream()
                .map(OrderItemDetailDto::new)
                .collect(Collectors.toList());
    }
    
    // 변경된 메뉴 조회
    public List<OrderItemDetailDto> getSubstitutedItems() {
        List<OrderItemDetails> entities = orderItemDetailsRepository.findByIsSubstitutedTrue();
        return entities.stream()
                .map(OrderItemDetailDto::new)
                .collect(Collectors.toList());
    }
    
    // 재료 추가/제거 통계
    public List<Object[]> getIngredientUsageStatistics() {
        return orderItemDetailsRepository.getIngredientUsageStatistics();
    }
    
    // 세트 메뉴 생성 (햄버거, 사이드, 음료)
    public List<OrderItemDetailDto> createSetMenuDetails(Long orderItemId, List<OrderItemDetailDto> setComponents) {
        List<OrderItemDetails> entities = setComponents.stream()
                .map(dto -> {
                    dto.setOrderItemId(orderItemId);
                    return dto.toEntity();
                })
                .collect(Collectors.toList());
        
        List<OrderItemDetails> savedEntities = orderItemDetailsRepository.saveAll(entities);
        return savedEntities.stream()
                .map(OrderItemDetailDto::new)
                .collect(Collectors.toList());
    }
    
    // 메뉴명에서 "사이드:" 또는 "음료:" 부분을 제거하고 실제 메뉴명만 추출
    private String extractMenuName(String fullMenuName) {
        if (fullMenuName == null || fullMenuName.trim().isEmpty()) {
            return "";
        }
        
        String trimmedName = fullMenuName.trim();
        
        // "사이드:" 또는 "음료:" 부분 제거
        if (trimmedName.startsWith("사이드:")) {
            return trimmedName.substring("사이드:".length()).trim();
        } else if (trimmedName.startsWith("음료:")) {
            return trimmedName.substring("음료:".length()).trim();
        }
        
        return trimmedName;
    }
    
    // 메뉴명으로 메뉴 ID 검색
    private Long findMenuIdByName(String menuName) {
        String extractedName = extractMenuName(menuName);
        if (extractedName.isEmpty()) {
            return null;
        }
        
        // 메뉴명으로 정확히 일치하는 메뉴 검색
        Optional<Menu> menu = menuRepository.findByNameAndIsAvailableTrue(extractedName);
        
        return menu.map(Menu::getId).orElse(null);
    }
    
    // 메뉴 변경 처리 (개선된 버전)
    public OrderItemDetailDto substituteMenuItem(Long orderItemId, String fullMenuName, 
                                              String reason) {
        // 메뉴명에서 실제 메뉴명 추출
        String extractedMenuName = extractMenuName(fullMenuName);
        if (extractedMenuName.isEmpty()) {
            throw new IllegalArgumentException("유효하지 않은 메뉴명입니다: " + fullMenuName);
        }
        
        // 메뉴 ID 검색
        Long menuId = findMenuIdByName(fullMenuName);
        if (menuId == null) {
            throw new IllegalArgumentException("메뉴를 찾을 수 없습니다: " + extractedMenuName);
        }
        
        // 메뉴 정보 조회
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new IllegalArgumentException("메뉴 ID가 유효하지 않습니다: " + menuId));
        
        // 아이템 타입 결정
        String itemType = fullMenuName.startsWith("사이드:") ? "SIDE" : 
                         fullMenuName.startsWith("음료:") ? "DRINK" : "MAIN";
        
        OrderItemDetailDto dto = new OrderItemDetailDto();
        dto.setOrderItemId(orderItemId);
        dto.setItemType(itemType);
        dto.setMenuId(menuId);
        dto.setMenuName(extractedMenuName);
        dto.setUnitPrice(menu.getPrice());
        dto.setTotalPrice(menu.getPrice());
        dto.setIsSubstituted(true);
        dto.setSubstitutionReason(reason);
        dto.setQuantity(1);
        
        return saveOrderItemDetail(dto);
    }
    
    // 기존 메서드도 유지 (하위 호환성)
    public OrderItemDetailDto substituteMenuItem(Long orderItemId, Long originalMenuId, 
                                              Long newMenuId, String newMenuName, 
                                              BigDecimal newPrice, String reason) {
        OrderItemDetailDto dto = new OrderItemDetailDto();
        dto.setOrderItemId(orderItemId);
        dto.setItemType("SIDE"); // 또는 "DRINK"
        dto.setMenuId(newMenuId);
        dto.setMenuName(newMenuName);
        dto.setUnitPrice(newPrice);
        dto.setTotalPrice(newPrice);
        dto.setIsSubstituted(true);
        dto.setOriginalMenuId(originalMenuId);
        dto.setSubstitutionReason(reason);
        
        return saveOrderItemDetail(dto);
    }
    
    // 재료 추가/제거 처리
    public OrderItemDetailDto addIngredientModification(Long orderItemId, String ingredientType, 
                                                      String action, BigDecimal price) {
        OrderItemDetailDto dto = new OrderItemDetailDto();
        dto.setOrderItemId(orderItemId);
        dto.setItemType("INGREDIENT");
        dto.setIngredientType(ingredientType);
        dto.setIngredientAction(action);
        dto.setIngredientPrice(price);
        dto.setTotalPrice(price);
        dto.setQuantity(1);
        
        return saveOrderItemDetail(dto);
    }
    
    // 주문 아이템 상세 정보 삭제
    public void deleteOrderItemDetail(Long detailId) {
        orderItemDetailsRepository.deleteById(detailId);
    }
    
    // 주문 아이템 ID로 모든 상세 정보 삭제
    public void deleteDetailsByOrderItemId(Long orderItemId) {
        List<OrderItemDetails> details = orderItemDetailsRepository.findByOrderItemId(orderItemId);
        orderItemDetailsRepository.deleteAll(details);
    }
    
    // 사용 예시: 메뉴명에서 메뉴 ID 추출 테스트
    public Long testExtractMenuId(String fullMenuName) {
        return findMenuIdByName(fullMenuName);
    }
    
    // 사용 예시: 메뉴명 정리 테스트
    public String testExtractMenuName(String fullMenuName) {
        return extractMenuName(fullMenuName);
    }
    
    // 세트 메뉴 옵션을 JSON으로 변환
    public String createSetOptionsJson(String sideName, String drinkName, 
                                     List<String> addToppings, List<String> removeToppings) {
        try {
            Map<String, Object> options = new HashMap<>();
            
            // 사이드 옵션
            options.put("side", sideName);
            
            // 음료 옵션
            options.put("drink", drinkName);
            
            // 토핑 옵션
            if (addToppings != null && !addToppings.isEmpty()) {
                options.put("addToppings", addToppings);
            }
            if (removeToppings != null && !removeToppings.isEmpty()) {
                options.put("removeToppings", removeToppings);
            }
            
            // JSON으로 변환
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(options);
            
        } catch (Exception e) {
            // JSON 변환 실패 시 기본 문자열 반환
            return String.format("{\"side\":\"%s\",\"drink\":\"%s\"}", sideName, drinkName);
        }
    }
    
    // 세트 메뉴 주문 아이템 생성 (OrderItems용)
    public OrderItemDetailDto createSetOrderItem(Long orderId, Long mainMenuId, String mainMenuName,
                                              BigDecimal mainMenuPrice, String sideName, String drinkName,
                                              List<String> addToppings, List<String> removeToppings,
                                              Integer quantity) {
        // 옵션 JSON 생성
        String optionsJson = createSetOptionsJson(sideName, drinkName, addToppings, removeToppings);
        
        // 표시용 옵션 문자열 생성
        List<String> displayOptions = new ArrayList<>();
        if (addToppings != null && !addToppings.isEmpty()) {
            displayOptions.addAll(addToppings.stream().map(t -> "+" + t).collect(Collectors.toList()));
        }
        if (removeToppings != null && !removeToppings.isEmpty()) {
            displayOptions.addAll(removeToppings.stream().map(t -> "-" + t).collect(Collectors.toList()));
        }
        displayOptions.add("사이드: " + sideName);
        displayOptions.add("음료: " + drinkName);
        
        String displayOptionsStr = String.join(", ", displayOptions);
        
        // OrderItemDetailDto 생성
        OrderItemDetailDto dto = new OrderItemDetailDto();
        dto.setOrderItemId(orderId); // 임시로 orderId 사용
        dto.setItemType("SET");
        dto.setMenuId(mainMenuId);
        dto.setMenuName(mainMenuName);
        dto.setQuantity(quantity);
        dto.setUnitPrice(mainMenuPrice);
        dto.setTotalPrice(mainMenuPrice.multiply(BigDecimal.valueOf(quantity)));
        
        // 옵션 정보를 notes 필드에 임시 저장 (OrderItems에서 사용)
        dto.setNotes("OPTIONS_JSON:" + optionsJson + "|DISPLAY_OPTIONS:" + displayOptionsStr);
        
        return dto;
    }
}
