package erp_project.erp_project.service;

import erp_project.erp_project.dto.*;
import erp_project.erp_project.entity.Orders;
import erp_project.erp_project.entity.OrderItems;
import erp_project.erp_project.entity.OrderItemDetails;
import erp_project.erp_project.repository.OrderItemDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AutomatedOrderService {
    
    @Autowired
    private OrderItemDetailsRepository orderItemDetailsRepository;
    
    /**
     * 주문 생성 시 자동으로 order_item_details 테이블에 데이터 생성
     */
    public void processOrderItemsAutomatically(Orders order, List<OrderItems> orderItems) {
        
        if (orderItems == null || orderItems.isEmpty()) {
            System.out.println("주문 아이템이 없습니다.");
            return;
        }
        
        for (OrderItems orderItem : orderItems) {
            try {
                if (orderItem == null || orderItem.getItemType() == null) {
                    System.out.println("주문 아이템 또는 아이템 타입이 null입니다.");
                    continue;
                }
                
                // 1. 세트 메뉴인 경우 - 구성 요소들을 자동으로 order_item_details에 생성
                if ("SET".equals(orderItem.getItemType().name())) {
                    createSetMenuDetailsAutomatically(orderItem);
                }
                
                // 2. 단품 버거인 경우 - 재료 변경 사항을 자동으로 order_item_details에 생성
                if ("BURGER".equals(orderItem.getItemType().name())) {
                    createIngredientModificationsAutomatically(orderItem);
                }
            } catch (Exception e) {
                System.err.println("주문 아이템 처리 중 오류 발생: " + e.getMessage());
                e.printStackTrace();
                // 개별 아이템 오류는 무시하고 계속 진행
            }
        }
    }
    
    /**
     * 세트 메뉴 구성 요소들을 자동으로 order_item_details에 생성
     */
    private void createSetMenuDetailsAutomatically(OrderItems orderItem) {
        
        // 세트 메뉴의 기본 구성 요소들을 자동 생성
        List<OrderItemDetails> setComponents = new ArrayList<>();
        
        // 1. 햄버거 구성 요소
        OrderItemDetails burgerComponent = new OrderItemDetails();
        burgerComponent.setOrderItemId(orderItem.getOrderItemId());
        burgerComponent.setItemType(OrderItemDetails.ItemType.BURGER);
        burgerComponent.setMenuId(orderItem.getMenuId());
        burgerComponent.setMenuName(orderItem.getMenuName() + " (버거)");
        burgerComponent.setUnitPrice(orderItem.getUnitPrice().multiply(new BigDecimal("0.7"))); // 세트 할인 적용
        burgerComponent.setTotalPrice(burgerComponent.getUnitPrice());
        burgerComponent.setQuantity(1);
        burgerComponent.setNotes("세트 메뉴 구성 요소");
        setComponents.add(burgerComponent);
        
        // 2. 사이드 구성 요소 - displayOptions에서 실제 선택된 사이드 확인
        OrderItemDetails sideComponent = createSideComponentFromOptions(orderItem);
        setComponents.add(sideComponent);
        
        // 3. 음료 구성 요소 - displayOptions에서 실제 선택된 음료 확인
        OrderItemDetails drinkComponent = createDrinkComponentFromOptions(orderItem);
        setComponents.add(drinkComponent);
        
        // order_item_details에 저장
        orderItemDetailsRepository.saveAll(setComponents);
    }
    
    /**
     * optionsJson에서 실제 선택된 사이드 정보 추출하여 생성
     */
    private OrderItemDetails createSideComponentFromOptions(OrderItems orderItem) {
        OrderItemDetails sideComponent = new OrderItemDetails();
        sideComponent.setOrderItemId(orderItem.getOrderItemId());
        sideComponent.setItemType(OrderItemDetails.ItemType.SIDE);
        
        // 디버깅: optionsJson 로그 출력
        System.out.println("=== 사이드 옵션 추출 디버깅 ===");
        System.out.println("주문 아이템: " + orderItem.getMenuName());
        System.out.println("OptionsJson: " + orderItem.getOptionsJson());
        
        // optionsJson에서 사이드 정보 추출 시도 (우선순위 1)
        String selectedSide = extractSelectedSideFromOptionsJson(orderItem.getOptionsJson());
        System.out.println("OptionsJson에서 추출된 사이드: " + selectedSide);
        
        if (selectedSide != null && !selectedSide.isEmpty()) {
            // 실제 선택된 사이드가 있으면 사용
            sideComponent.setMenuName(selectedSide);
            sideComponent.setNotes("사용자 선택 사이드: " + selectedSide);
            
            // optionsJson에서 실제 menu_id 가져오기
            Long actualSideMenuId = extractActualSideMenuIdFromOptionsJson(orderItem.getOptionsJson());
            if (actualSideMenuId != null) {
                sideComponent.setMenuId(actualSideMenuId);
                System.out.println("실제 사이드 menu_id 설정: " + actualSideMenuId);
            } else {
                // 기본값
                sideComponent.setMenuId(201L);
            }
            
            // 사이드 가격 설정 (실제로는 메뉴 테이블에서 조회해야 함)
            if (selectedSide.contains("감자튀김")) {
                sideComponent.setUnitPrice(new BigDecimal("1500.00"));
            } else if (selectedSide.contains("치킨너겟")) {
                sideComponent.setUnitPrice(new BigDecimal("2000.00"));
            } else if (selectedSide.contains("양념감자")) {
                sideComponent.setUnitPrice(new BigDecimal("1800.00"));
            } else {
                // 기본값
                sideComponent.setUnitPrice(new BigDecimal("1500.00"));
            }
        } else {
            // displayOptions에서 사이드 정보 추출 시도 (우선순위 2)
            selectedSide = extractSelectedSideFromOptions(orderItem.getDisplayOptions());
            System.out.println("DisplayOptions에서 추출된 사이드: " + selectedSide);
            
            if (selectedSide != null && !selectedSide.isEmpty()) {
                // 실제 선택된 사이드가 있으면 사용
                sideComponent.setMenuName(selectedSide);
                sideComponent.setNotes("사용자 선택 사이드: " + selectedSide);
                
                // 사이드 가격 설정 (실제로는 메뉴 테이블에서 조회해야 함)
                if (selectedSide.contains("감자튀김")) {
                    sideComponent.setMenuId(201L);
                    sideComponent.setUnitPrice(new BigDecimal("1500.00"));
                } else if (selectedSide.contains("치킨너겟")) {
                    sideComponent.setMenuId(202L);
                    sideComponent.setUnitPrice(new BigDecimal("2000.00"));
                } else if (selectedSide.contains("양념감자")) {
                    sideComponent.setMenuId(203L);
                    sideComponent.setUnitPrice(new BigDecimal("1800.00"));
                } else {
                    // 기본값
                    sideComponent.setMenuId(201L);
                    sideComponent.setUnitPrice(new BigDecimal("1500.00"));
                }
            } else {
                // 선택된 사이드가 없으면 기본값
                sideComponent.setMenuId(201L);
                sideComponent.setMenuName("감자튀김");
                sideComponent.setUnitPrice(new BigDecimal("1500.00"));
                sideComponent.setNotes("세트 메뉴 기본 사이드");
            }
        }
        
        sideComponent.setTotalPrice(sideComponent.getUnitPrice());
        sideComponent.setQuantity(1);
        return sideComponent;
    }
    
    /**
     * optionsJson에서 실제 선택된 음료 정보 추출하여 생성
     */
    private OrderItemDetails createDrinkComponentFromOptions(OrderItems orderItem) {
        OrderItemDetails drinkComponent = new OrderItemDetails();
        drinkComponent.setOrderItemId(orderItem.getOrderItemId());
        drinkComponent.setItemType(OrderItemDetails.ItemType.DRINK);
        
        // 디버깅: optionsJson 로그 출력
        System.out.println("=== 음료 옵션 추출 디버깅 ===");
        System.out.println("주문 아이템: " + orderItem.getMenuName());
        System.out.println("OptionsJson: " + orderItem.getOptionsJson());
        
        // optionsJson에서 음료 정보 추출 시도 (우선순위 1)
        String selectedDrink = extractSelectedDrinkFromOptionsJson(orderItem.getOptionsJson());
        System.out.println("OptionsJson에서 추출된 음료: " + selectedDrink);
        
        if (selectedDrink != null && !selectedDrink.isEmpty()) {
            // 실제 선택된 음료가 있으면 사용
            drinkComponent.setMenuName(selectedDrink);
            drinkComponent.setNotes("사용자 선택 음료: " + selectedDrink);
            
            // optionsJson에서 실제 menu_id 가져오기
            Long actualDrinkMenuId = extractActualDrinkMenuIdFromOptionsJson(orderItem.getOptionsJson());
            if (actualDrinkMenuId != null) {
                drinkComponent.setMenuId(actualDrinkMenuId);
                System.out.println("실제 음료 menu_id 설정: " + actualDrinkMenuId);
            } else {
                // 기본값
                drinkComponent.setMenuId(301L);
            }
            
            // 음료 가격 설정 (실제로는 메뉴 테이블에서 조회해야 함)
            if (selectedDrink.contains("콜라")) {
                drinkComponent.setUnitPrice(new BigDecimal("1000.00"));
            } else if (selectedDrink.contains("아메리카노")) {
                drinkComponent.setUnitPrice(new BigDecimal("1500.00"));
            } else if (selectedDrink.contains("오렌지주스")) {
                drinkComponent.setUnitPrice(new BigDecimal("1200.00"));
            } else {
                // 기본값
                drinkComponent.setUnitPrice(new BigDecimal("1000.00"));
            }
        } else {
            // displayOptions에서 음료 정보 추출 시도 (우선순위 2)
            selectedDrink = extractSelectedDrinkFromOptions(orderItem.getDisplayOptions());
            System.out.println("DisplayOptions에서 추출된 음료: " + selectedDrink);
            
            if (selectedDrink != null && !selectedDrink.isEmpty()) {
                // 실제 선택된 음료가 있으면 사용
                drinkComponent.setMenuName(selectedDrink);
                drinkComponent.setNotes("사용자 선택 음료: " + selectedDrink);
                
                // 음료 가격 설정 (실제로는 메뉴 테이블에서 조회해야 함)
                if (selectedDrink.contains("콜라")) {
                    drinkComponent.setMenuId(301L);
                    drinkComponent.setUnitPrice(new BigDecimal("1000.00"));
                } else if (selectedDrink.contains("아메리카노")) {
                    drinkComponent.setMenuId(302L);
                    drinkComponent.setUnitPrice(new BigDecimal("1500.00"));
                } else if (selectedDrink.contains("오렌지주스")) {
                    drinkComponent.setMenuId(303L);
                    drinkComponent.setUnitPrice(new BigDecimal("1200.00"));
                } else {
                    // 기본값
                    drinkComponent.setMenuId(301L);
                    drinkComponent.setUnitPrice(new BigDecimal("1000.00"));
                }
            } else {
                // 선택된 음료가 없으면 기본값
                drinkComponent.setMenuId(301L);
                drinkComponent.setMenuName("콜라");
                drinkComponent.setUnitPrice(new BigDecimal("1000.00"));
                drinkComponent.setNotes("세트 메뉴 기본 음료");
            }
        }
        
        drinkComponent.setTotalPrice(drinkComponent.getUnitPrice());
        drinkComponent.setQuantity(1);
        return drinkComponent;
    }
    
    /**
     * optionsJson에서 사이드 정보 추출 (실제 menu_id 사용)
     */
    private String extractSelectedSideFromOptionsJson(String optionsJson) {
        if (optionsJson == null || optionsJson.isEmpty()) {
            return null;
        }
        
        try {
            // JSON 파싱 시도
            if (optionsJson.startsWith("[") || optionsJson.startsWith("{")) {
                ObjectMapper objectMapper = new ObjectMapper();
                if (optionsJson.startsWith("[")) {
                    List<Map<String, Object>> options = objectMapper.readValue(optionsJson, List.class);
                    for (Map<String, Object> option : options) {
                        // optionId가 사이드 관련 ID인지 확인 (18, 19, 20 등)
                        if (option.containsKey("optionId") && option.containsKey("optionName")) {
                            Long optionId = Long.valueOf(option.get("optionId").toString());
                            String optionName = (String) option.get("optionName");
                            
                            // 사이드 관련 ID 범위 (실제 데이터베이스 ID에 맞춰 조정)
                            if (optionId >= 13 && optionId <= 18) { // 사이드 ID 범위 (13~18)
                                System.out.println("사이드 옵션 발견: ID=" + optionId + ", 이름=" + optionName);
                                return optionName;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("사이드 옵션 JSON 파싱 실패: " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * optionsJson에서 사이드의 실제 menu_id 추출
     */
    private Long extractActualSideMenuIdFromOptionsJson(String optionsJson) {
        if (optionsJson == null || optionsJson.isEmpty()) {
            return null;
        }
        
        try {
            // JSON 파싱 시도
            if (optionsJson.startsWith("[") || optionsJson.startsWith("{")) {
                ObjectMapper objectMapper = new ObjectMapper();
                if (optionsJson.startsWith("[")) {
                    List<Map<String, Object>> options = objectMapper.readValue(optionsJson, List.class);
                    for (Map<String, Object> option : options) {
                        // optionId가 사이드 관련 ID인지 확인 (18, 19, 20 등)
                        if (option.containsKey("optionId") && option.containsKey("optionName")) {
                            Long optionId = Long.valueOf(option.get("optionId").toString());
                            String optionName = (String) option.get("optionName");
                            
                            // 사이드 관련 ID 범위 (실제 데이터베이스 ID에 맞춰 조정)
                            if (optionId >= 13 && optionId <= 18) { // 사이드 ID 범위 (13~18)
                                System.out.println("사이드 실제 menu_id 발견: " + optionId + " (이름: " + optionId + ")");
                                return optionId; // 실제 menu_id 반환
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("사이드 실제 menu_id 추출 실패: " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * displayOptions에서 사이드 정보 추출
     */
    private String extractSelectedSideFromOptions(String displayOptions) {
        if (displayOptions == null || displayOptions.isEmpty()) {
            return null;
        }
        
        try {
            // JSON 파싱 시도
            if (displayOptions.startsWith("[") || displayOptions.startsWith("{")) {
                // JSON 형태인 경우 파싱
                ObjectMapper objectMapper = new ObjectMapper();
                if (displayOptions.startsWith("[")) {
                    List<Object> options = objectMapper.readValue(displayOptions, List.class);
                    for (Object option : options) {
                        if (option instanceof String) {
                            String optionStr = (String) option;
                            if (optionStr.contains("사이드") || optionStr.contains("감자") || 
                                optionStr.contains("너겟") || optionStr.contains("치킨")) {
                                return optionStr;
                            }
                        }
                    }
                }
            } else {
                // 일반 문자열인 경우
                if (displayOptions.contains("사이드") || displayOptions.contains("음료") || 
                    displayOptions.contains("감자") || displayOptions.contains("너겟") || 
                    displayOptions.contains("치킨")) {
                    return displayOptions;
                }
            }
        } catch (Exception e) {
            System.err.println("사이드 옵션 파싱 실패: " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * optionsJson에서 음료 정보 추출 (실제 menu_id 사용)
     */
    private String extractSelectedDrinkFromOptionsJson(String optionsJson) {
        if (optionsJson == null || optionsJson.isEmpty()) {
            return null;
        }
        
        try {
            // JSON 파싱 시도
            if (optionsJson.startsWith("[") || optionsJson.startsWith("{")) {
                ObjectMapper objectMapper = new ObjectMapper();
                if (optionsJson.startsWith("[")) {
                    List<Map<String, Object>> options = objectMapper.readValue(optionsJson, List.class);
                    for (Map<String, Object> option : options) {
                        // optionId가 음료 관련 ID인지 확인 (25, 26, 27 등)
                        if (option.containsKey("optionId") && option.containsKey("optionName")) {
                            Long optionId = Long.valueOf(option.get("optionId").toString());
                            String optionName = (String) option.get("optionName");
                            
                            // 음료 관련 ID 범위 (실제 데이터베이스 ID에 맞춰 조정)
                            if (optionId >= 19 && optionId <= 25) { // 음료 ID 범위 (19~25)
                                System.out.println("음료 옵션 발견: ID=" + optionId + ", 이름=" + optionName);
                                return optionName;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("음료 옵션 JSON 파싱 실패: " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * optionsJson에서 음료의 실제 menu_id 추출
     */
    private Long extractActualDrinkMenuIdFromOptionsJson(String optionsJson) {
        if (optionsJson == null || optionsJson.isEmpty()) {
            return null;
        }
        
        try {
            // JSON 파싱 시도
            if (optionsJson.startsWith("[") || optionsJson.startsWith("{")) {
                ObjectMapper objectMapper = new ObjectMapper();
                if (optionsJson.startsWith("[")) {
                    List<Map<String, Object>> options = objectMapper.readValue(optionsJson, List.class);
                    for (Map<String, Object> option : options) {
                        // optionId가 음료 관련 ID인지 확인 (25, 26, 27 등)
                        if (option.containsKey("optionId") && option.containsKey("optionName")) {
                            Long optionId = Long.valueOf(option.get("optionId").toString());
                            String optionName = (String) option.get("optionName");
                            
                            // 음료 관련 ID 범위 (실제 데이터베이스 ID에 맞춰 조정)
                            if (optionId >= 19 && optionId <= 25) { // 음료 ID 범위 (19~25)
                                System.out.println("음료 실제 menu_id 발견: " + optionId + " (이름: " + optionName + ")");
                                return optionId; // 실제 menu_id 반환
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("음료 실제 menu_id 추출 실패: " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * displayOptions에서 음료 정보 추출
     */
    private String extractSelectedDrinkFromOptions(String displayOptions) {
        if (displayOptions == null || displayOptions.isEmpty()) {
            return null;
        }
        
        try {
            // JSON 파싱 시도
            if (displayOptions.startsWith("[") || displayOptions.startsWith("{")) {
                // JSON 형태인 경우 파싱
                ObjectMapper objectMapper = new ObjectMapper();
                if (displayOptions.startsWith("[")) {
                    List<Object> options = objectMapper.readValue(displayOptions, List.class);
                    for (Object option : options) {
                        if (option instanceof String) {
                            String optionStr = (String) option;
                            if (optionStr.contains("음료") || optionStr.contains("콜라") || 
                                optionStr.contains("아메리카노") || optionStr.contains("주스")) {
                                return optionStr;
                            }
                        }
                    }
                }
            } else {
                // 일반 문자열인 경우
                if (displayOptions.contains("음료") || displayOptions.contains("콜라") || 
                    displayOptions.contains("아메리카노") || displayOptions.contains("주스")) {
                    return displayOptions;
                }
            }
        } catch (Exception e) {
            System.err.println("음료 옵션 파싱 실패: " + e.getMessage());
        }
        
        return null;
    }
    
    /**
     * 단품 버거의 재료 변경 사항을 자동으로 order_item_details에 생성
     */
    private void createIngredientModificationsAutomatically(OrderItems orderItem) {
        
        // 기본 재료들을 자동으로 생성 (실제로는 주문 요청에서 받아와야 함)
        List<OrderItemDetails> ingredientModifications = new ArrayList<>();
        
        // 1. 기본 포함 재료들
        String[] defaultIngredients = {"양상추", "토마토", "양파", "피클"};
        for (String ingredient : defaultIngredients) {
            OrderItemDetails ingredientDetail = new OrderItemDetails();
            ingredientDetail.setOrderItemId(orderItem.getOrderItemId());
            ingredientDetail.setItemType(OrderItemDetails.ItemType.INGREDIENT);
            ingredientDetail.setIngredientType(ingredient);
            ingredientDetail.setIngredientAction(OrderItemDetails.IngredientAction.ADD);
            ingredientDetail.setIngredientPrice(BigDecimal.ZERO); // 기본 재료는 추가 비용 없음
            ingredientDetail.setTotalPrice(BigDecimal.ZERO);
            ingredientDetail.setQuantity(1);
            ingredientDetail.setNotes("기본 포함 재료");
            ingredientModifications.add(ingredientDetail);
        }
        
        // 2. 추가 재료 (예: 치즈, 베이컨 등)
        String[] extraIngredients = {"치즈", "베이컨"};
        BigDecimal[] extraPrices = {new BigDecimal("500.00"), new BigDecimal("800.00")};
        
        for (int i = 0; i < extraIngredients.length; i++) {
            OrderItemDetails ingredientDetail = new OrderItemDetails();
            ingredientDetail.setOrderItemId(orderItem.getOrderItemId());
            ingredientDetail.setItemType(OrderItemDetails.ItemType.INGREDIENT);
            ingredientDetail.setIngredientType(extraIngredients[i]);
            ingredientDetail.setIngredientAction(OrderItemDetails.IngredientAction.ADD);
            ingredientDetail.setIngredientPrice(extraPrices[i]);
            ingredientDetail.setTotalPrice(extraPrices[i]);
            ingredientDetail.setQuantity(1);
            ingredientDetail.setNotes("추가 재료");
            ingredientModifications.add(ingredientDetail);
        }
        
        // order_item_details에 저장
        orderItemDetailsRepository.saveAll(ingredientModifications);
    }
    
    /**
     * 사용자 정의 세트 메뉴 구성 요소 생성
     */
    public void createCustomSetMenuDetails(Long orderItemId, List<SetComponentDto> setComponents) {
        
        List<OrderItemDetails> details = new ArrayList<>();
        
        for (SetComponentDto component : setComponents) {
            OrderItemDetails detail = new OrderItemDetails();
            detail.setOrderItemId(orderItemId);
            detail.setItemType(OrderItemDetails.ItemType.valueOf(component.getComponentType()));
            detail.setMenuId(component.getMenuId());
            detail.setMenuName(component.getMenuName());
            detail.setUnitPrice(component.getUnitPrice());
            detail.setTotalPrice(component.getUnitPrice().multiply(new BigDecimal(component.getQuantity())));
            detail.setQuantity(component.getQuantity());
            detail.setNotes(component.getNotes());
            details.add(detail);
        }
        
        orderItemDetailsRepository.saveAll(details);
    }
    
    /**
     * 사용자 정의 재료 변경 사항 생성
     */
    public void createCustomIngredientModifications(Long orderItemId, List<IngredientModificationDto> modifications) {
        
        List<OrderItemDetails> details = new ArrayList<>();
        
        for (IngredientModificationDto modification : modifications) {
            OrderItemDetails detail = new OrderItemDetails();
            detail.setOrderItemId(orderItemId);
            detail.setItemType(OrderItemDetails.ItemType.INGREDIENT);
            detail.setIngredientType(modification.getIngredientType());
            detail.setIngredientAction(OrderItemDetails.IngredientAction.valueOf(modification.getAction()));
            detail.setIngredientPrice(modification.getPrice());
            detail.setTotalPrice(modification.getPrice());
            detail.setQuantity(1);
            detail.setNotes(modification.getNotes());
            details.add(detail);
        }
        
        orderItemDetailsRepository.saveAll(details);
    }
}
