import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './CartScreen.module.css';

const CartScreen = ({ selectedBranch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 전달받은 장바구니 데이터 또는 빈 배열
  const [cart, setCart] = useState(location.state?.cart || []);

  // 디버깅: 장바구니 데이터 확인
  console.log('CartScreen - location.state:', location.state);
  console.log('CartScreen - cart:', cart);
  console.log('CartScreen - selectedBranch:', selectedBranch);

  const updateQuantity = (index, change) => {
    setCart(prev => prev.map((item, i) => {
      if (i === index) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return null;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => {
      return sum + getItemPrice(item);
    }, 0);
  };

  // 아이템의 표시 이름을 안전하게 가져오는 함수
  const getItemDisplayName = (item) => {
    if (item.displayName) return item.displayName;
    if (item.name) return item.name;
    if (item.menu?.name) return item.menu.name;
    return '상품';
  };

  // 아이템의 가격을 안전하게 가져오는 함수
  const getItemPrice = (item) => {
    if (item.totalPrice) return item.totalPrice;
    if (item.price && item.quantity) return item.price * item.quantity;
    if (item.price) return item.price;
    if (item.basePrice) return item.basePrice;
    return 0;
  };

  const goBack = () => {
    navigate('/');
  };

  const proceedToPayment = async () => {
    // 지점이 선택되지 않은 경우 처리
    if (!selectedBranch) {
      alert('지점을 먼저 선택해주세요.');
      return;
    }

    try {
      // 주문 데이터 준비
      const orderData = {
        branchId: selectedBranch.id, // 선택된 지점 ID
        orderType: "takeout", // 기본값: 포장
        customerName: "고객", // 기본값 (실제로는 입력받아야 함)
        customerPhone: "010-0000-0000", // 기본값 (실제로는 입력받아야 함)
        paymentMethod: "card", // 기본값: 카드
        items: cart.map(item => ({
          menuId: item.menuId || item.id || 1, // 메뉴 ID
          menuName: getItemDisplayName(item), // 메뉴 이름
          quantity: item.quantity, // 수량
          unitPrice: getItemPrice(item) / item.quantity, // 단가
          totalPrice: getItemPrice(item), // 총 가격
          displayName: getItemDisplayName(item), // 표시 이름
          displayOptions: item.displayOptions || [], // 표시 옵션
          options: convertOptionsToRequest(item) // 상세 옵션 정보
        }))
      };

      console.log('주문 데이터:', orderData);
      console.log('선택된 지점:', selectedBranch);
      console.log('displayOptions 예시:', cart[0]?.displayOptions);
      console.log('displayOptions 타입:', typeof cart[0]?.displayOptions);

      // 백엔드 API 호출
      const response = await fetch('http://localhost:8080/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('주문 생성 성공:', result);
        
        // 주문 완료 화면으로 이동
        navigate('/order-complete', { 
          state: { 
            orderId: result.orderId,
            orderNumber: result.orderNumber,
            totalAmount: getTotalAmount()
          } 
        });
      } else {
        const errorData = await response.json();
        console.error('주문 생성 실패:', response.status, errorData);
        alert(`주문 생성에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('주문 생성 중 오류:', error);
      alert('주문 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 옵션 정보를 백엔드 요청 형식으로 변환
  const convertOptionsToRequest = (item) => {
    const options = [];
    
    // displayOptions가 있는 경우 (새로운 구조)
    if (item.displayOptions && item.displayOptions.length > 0) {
      // displayOptions는 이미 문자열 배열이므로 별도 변환 불필요
      return options;
    }
    
    // selectedOptions가 있는 경우 (기존 구조)
    if (item.selectedOptions) {
      const { addOptions, removeOptions, side, drink, optionQuantities } = item.selectedOptions;
      
      // 추가된 옵션들
      if (addOptions) {
        Object.entries(addOptions).forEach(([key, value]) => {
          if (value) {
            options.push({
              optionId: getOptionId(key), // 옵션 ID (실제로는 매핑 필요)
              optionName: key,
              quantity: optionQuantities?.[key] || 1,
              unitPrice: 0, // 기본 옵션은 추가 비용 없음
              action: "add"
            });
          }
        });
      }
      
      // 제거된 옵션들
      if (removeOptions) {
        Object.entries(removeOptions).forEach(([key, value]) => {
          if (value) {
            options.push({
              optionId: getOptionId(key),
              optionName: key,
              quantity: 1,
              unitPrice: 0,
              action: "remove"
            });
          }
        });
      }
      
      // 사이드 옵션
      if (side) {
        options.push({
          optionId: getOptionId(side),
          optionName: getSideName(side),
          quantity: 1,
          unitPrice: 0,
          action: "add"
        });
      }
      
      // 음료 옵션
      if (drink) {
        options.push({
          optionId: getOptionId(drink),
          optionName: getDrinkName(drink),
          quantity: 1,
          unitPrice: 0,
          action: "add"
        });
      }
    }
    
    return options;
  };

  // 옵션 ID 매핑 (실제로는 데이터베이스의 옵션 ID와 매핑해야 함)
  const getOptionId = (optionName) => {
    const optionMap = {
      '양상추': 1, '토마토': 2, '양파': 3, '피클': 4, '치즈': 5,
      '베이컨': 6, '소고기': 7, '닭고기': 8, '돼지고기': 9,
      '감자튀김': 10, '치킨너겟': 11, '콜라': 12, '사이다': 13, '물': 14
    };
    return optionMap[optionName] || 1;
  };

  // 사이드 이름 가져오기
  const getSideName = (sideId) => {
    const sideMap = {
      'fries': '감자튀김',
      'nuggets': '치킨너겟',
      'onion_rings': '어니언링'
    };
    return sideMap[sideId] || sideId;
  };

  // 음료 이름 가져오기
  const getDrinkName = (drinkId) => {
    const drinkMap = {
      'cola': '콜라',
      'sprite': '사이다',
      'water': '물'
    };
    return drinkMap[drinkId] || drinkId;
  };

  const renderOptions = (item) => {
    // 옵션이 없는 경우 null 반환
    if (!item.selectedOptions && !item.displayOptions) return null;

    // 새로운 구조 (displayOptions) 사용
    if (item.displayOptions && item.displayOptions.length > 0) {
      return (
        <div className={styles.itemOptions}>
          {item.displayOptions.map((option, index) => (
            <span key={index} className={styles.optionTag}>
              {option}
            </span>
          ))}
        </div>
      );
    }

    // 기존 구조 (selectedOptions) 사용
    if (item.selectedOptions) {
      const { addOptions, removeOptions, side, drink, optionQuantities } = item.selectedOptions;
      
      // 햄버거 옵션들
      const addOptionsList = Object.entries(addOptions || {})
        .filter(([key, value]) => value)
        .map(([key, value]) => key);
      
      const removeOptionsList = Object.entries(removeOptions || {})
        .filter(([key, value]) => value)
        .map(([key, value]) => key);

      // 사이드와 음료 옵션 (세트 메뉴인 경우)
      const sideName = side ? getSideName(side) : null;
      const drinkName = drink ? getDrinkName(drink) : null;

      if (addOptionsList.length === 0 && removeOptionsList.length === 0 && !sideName && !drinkName) {
        return null;
      }

      // 개수 정보가 있는 옵션들을 표시
      const renderAddOptionsWithQuantity = () => {
        return addOptionsList.map(key => {
          const optionName = getOptionName(key);
          const quantity = optionQuantities && optionQuantities[key];
          
          if (quantity && quantity > 1) {
            return `${optionName} ${quantity}개`;
          }
          return optionName;
        }).join(', ');
      };

      return (
        <div className={styles.itemOptions}>
          {addOptionsList.length > 0 && (
            <div className={styles.optionsRow}>
              <span className={styles.optionsLabel}>추가:</span>
              <span className={styles.optionsList}>{renderAddOptionsWithQuantity()}</span>
            </div>
          )}
          {removeOptionsList.length > 0 && (
            <div className={styles.optionsRow}>
              <span className={styles.optionsLabel}>제거:</span>
              <span className={styles.optionsList}>{removeOptionsList.map(key => getOptionName(key)).join(', ')}</span>
            </div>
          )}
          {sideName && (
            <div className={styles.optionsRow}>
              <span className={styles.optionsLabel}>사이드:</span>
              <span className={styles.optionsList}>{sideName}</span>
            </div>
          )}
          {drinkName && (
            <div className={styles.optionsRow}>
              <span className={styles.optionsLabel}>음료:</span>
              <span className={styles.optionsList}>{drinkName}</span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const getOptionName = (key) => {
    const optionNames = {
      tomato: '토마토',
      onion: '양파',
      cheese: '치즈',
      lettuce: '양상추',
      sauce: '소스',
      pickle: '피클',
      bacon: '베이컨'
    };
    return optionNames[key] || key;
  };



  if (cart.length === 0) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.cartHeader}>
          <h2 className={styles.cartTitle}>장바구니</h2>
        </div>
        <div className={styles.emptyCart}>
          <div className={styles.emptyImageContainer}>
            <div className={styles.emptyIcon}>CART</div>
          </div>
          <p className={styles.emptyText}>장바구니가 비어있습니다</p>
          <button className={styles.backButton} onClick={goBack}>
            메뉴로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartHeader}>
        <h2 className={styles.cartTitle}>장바구니</h2>
      </div>

      <div className={styles.cartList}>
        {cart.map((item, index) => {
          
          return (
            <div key={`${item.id}-${index}-${JSON.stringify(item.selectedOptions || {})}`} className={styles.cartItem}>
              <div className={styles.itemInfo}>
                <div className={styles.itemImageContainer}>
                  {(item.menu?.imageUrl || item.imageUrl) ? (
                    <img 
                      src={(item.menu?.imageUrl || item.imageUrl).startsWith('http') ? 
                        (item.menu?.imageUrl || item.imageUrl) : 
                        `http://localhost:8080${item.menu?.imageUrl || item.imageUrl}`}
                      alt={getItemDisplayName(item)} 
                      className={styles.itemImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`${styles.itemIconFallback} ${(item.menu?.imageUrl || item.imageUrl) ? styles.hidden : ''}`}>
                    <div className={styles.itemIconText}>
                      {getItemDisplayName(item).charAt(0)}
                    </div>
                  </div>
                </div>
                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>{getItemDisplayName(item)}</h3>
                  {renderOptions(item)}
                  <p className={styles.itemPrice}>
                    ₩{getItemPrice(item).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className={styles.quantityControl}>
                <button className={styles.quantityButton} onClick={() => updateQuantity(index, -1)}>
                  -
                </button>
                <span className={styles.quantity}>{item.quantity}</span>
                <button className={styles.quantityButton} onClick={() => updateQuantity(index, 1)}>
                  +
                </button>
                <button className={styles.removeButton} onClick={() => removeItem(index)}>
                  삭제
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.totalSection}>
        <div className={styles.totalAmount}>
          총 금액: ₩{getTotalAmount().toLocaleString()}
        </div>
        <div className={styles.actionButtons}>
          <button className={styles.backButton} onClick={goBack}>
            메뉴로 돌아가기
          </button>
          <button 
            className={`${styles.orderButton} ${!selectedBranch ? styles.disabled : ''}`} 
            onClick={proceedToPayment}
            disabled={!selectedBranch}
            title={!selectedBranch ? '지점을 먼저 선택해주세요' : '주문하기'}
          >
            {selectedBranch ? `주문하기 (${selectedBranch.name})` : '지점 선택 필요'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;
