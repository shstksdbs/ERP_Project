import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './CartScreen.module.css';

const CartScreen = ({ selectedBranch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 전달받은 장바구니 데이터 또는 빈 배열
  const [cart, setCart] = useState(location.state?.cart || []);
  const [isProcessing, setIsProcessing] = useState(false);

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

  // 아이템의 타입(카테고리)을 안전하게 가져오는 함수
  const getItemType = (item) => {
    // item.category가 있는 경우 (직접 추가된 아이템: SIDE, DRINK)
    if (item.category) return item.category;
    
    // item.menu.category가 있는 경우 (옵션 모달을 통해 추가된 아이템: BURGER, SET)
    if (item.menu?.category) return item.menu.category;
    
    // 기본값으로 'BURGER' 반환
    return 'BURGER';
  };

  const goBack = () => {
    navigate('/');
  };

  // 보안 해시 생성 함수
  const generateSecurityHash = async (data) => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const proceedToPayment = async () => {
    // 지점이 선택되지 않은 경우 처리
    if (!selectedBranch) {
      alert('지점을 먼저 선택해주세요.');
      return;
    }

    setIsProcessing(true);

    // 주문 데이터 준비
    const orderData = {
      branchId: selectedBranch.id,
      totalAmount: getTotalAmount(),
      items: cart.map(item => ({
        menuId: item.menu?.id || item.menuId || (item.menu && item.menu.id) || item.id || 1,
        menuName: getItemDisplayName(item),
        quantity: item.quantity,
        unitPrice: getItemPrice(item) / item.quantity,
        totalPrice: getItemPrice(item),
        displayName: getItemDisplayName(item),
        displayOptions: item.displayOptions || [],
        options: convertOptionsToRequest(item),
        itemType: getItemType(item)
      }))
    };

    console.log('메뉴아이디:', cart.map(item => item.menuId));
    console.log('카테고리 정보:', cart.map(item => ({ 
      name: getItemDisplayName(item), 
      category: item.category, 
      menuCategory: item.menu?.category,
      finalType: getItemType(item)
    })));
    
    // 옵션 변환 결과 디버깅
    cart.forEach((item, index) => {
      console.log(`아이템 ${index} (${getItemDisplayName(item)}) 옵션 변환:`, {
        displayOptions: item.displayOptions,
        selectedOptions: item.selectedOptions,
        itemOptions: item.options,  // item.options 구조 확인
        convertedOptions: convertOptionsToRequest(item),
        menuId: item.menu?.id || item.menuId || item.id || 1
      });
    });
    
    console.log('바로 결제 진행 - 주문 데이터:', orderData);
    console.log('선택된 지점:', selectedBranch);

    try {
      // 보안 해시 생성
      const timestamp = Date.now();
      const dataToHash = orderData.branchId + 'takeout' + '손님' + '000-0000-0000' + 'card' + JSON.stringify(orderData.items);
      const securityHash = await generateSecurityHash(dataToHash + timestamp + 'your_secret_key_here_change_in_production');
      
      // 백엔드로 보낼 데이터 준비
      const requestData = {
        ...orderData,
        customerName: '손님',
        customerPhone: '000-0000-0000',
        orderType: 'takeout',
        paymentMethod: 'card',
        securityHash: securityHash,
        timestamp: timestamp
      };
      
      console.log('백엔드로 보낼 데이터:', requestData);
      
      // 백엔드에서 주문 생성
      const orderResponse = await fetch('http://localhost:8080/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!orderResponse.ok) {
        throw new Error('주문 생성에 실패했습니다.');
      }

      const orderResult = await orderResponse.json();
      
      // 토스페이먼츠 결제 요청
      if (window.TossPayments) {
        const tossPayments = window.TossPayments('test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq');
        
        tossPayments.requestPayment('card', {
          amount: orderData.totalAmount,
          orderId: orderResult.orderNumber,
          orderName: `${selectedBranch.name} - ${orderData.items[0]?.menuName || '주문'}`,
          customerName: '손님',
          customerEmail: 'customer@example.com',
          successUrl: `${window.location.origin}/payment-success`,
          failUrl: `${window.location.origin}/payment-fail`,
        });
      } else {
        throw new Error('토스페이먼츠 SDK를 찾을 수 없습니다.');
      }

    } catch (error) {
      console.error('결제 처리 중 오류:', error);
      alert('결제 처리 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 옵션 정보를 백엔드 요청 형식으로 변환
  const convertOptionsToRequest = (item) => {
    const options = [];
    
    // item.options가 있는 경우 (SetOptionModal에서 생성된 구조)
    if (item.options && item.options.drink && item.options.side) {
      console.log('=== item.options 처리 ===');
      console.log('item.options:', item.options);
      
      // 사이드 옵션 처리
      if (item.options.side && item.options.side.id) {
        options.push({
          optionId: item.options.side.id,  // 실제 menuId 사용
          optionName: item.options.side.name,
          quantity: 1,
          unitPrice: item.options.side.price || 0,
          action: "add"
        });
        console.log('사이드 옵션 추가:', item.options.side);
      }
      
      // 음료 옵션 처리
      if (item.options.drink && item.options.drink.id) {
        options.push({
          optionId: item.options.drink.id,  // 실제 menuId 사용
          optionName: item.options.drink.name,
          quantity: 1,
          unitPrice: item.options.drink.price || 0,
          action: "add"
        });
        console.log('음료 옵션 추가:', item.options.drink);
      }
      
      // 토핑 옵션들 처리
      if (item.options.toppings) {
        // 추가된 토핑
        if (item.options.toppings.add) {
          item.options.toppings.add.forEach(topping => {
            options.push({
              optionId: topping.id,
              optionName: topping.name,
              quantity: topping.quantity || 1,
              unitPrice: topping.price || 0,
              action: "add"
            });
          });
        }
        
        // 제거된 토핑
        if (item.options.toppings.remove) {
          item.options.toppings.remove.forEach(topping => {
            options.push({
              optionId: topping.id,
              optionName: topping.name,
              quantity: 1,
              unitPrice: 0,
              action: "remove"
            });
          });
        }
      }
      
      console.log('최종 변환된 options:', options);
      return options;
    }
    
    // displayOptions가 있는 경우 (새로운 구조)
    if (item.displayOptions && item.displayOptions.length > 0) {
      // displayOptions를 옵션 객체로 변환
      item.displayOptions.forEach((option) => {
        if (option.startsWith('+')) {
          // 추가된 옵션
          const optionName = option.substring(1); // '+' 제거
          options.push({
            optionId: getOptionId(optionName),
            optionName: optionName,
            quantity: 1,
            unitPrice: 0,
            action: "add"
          });
        } else if (option.startsWith('-')) {
          // 제거된 옵션
          const optionName = option.substring(1); // '-' 제거
          options.push({
            optionId: getOptionId(optionName),
            optionName: optionName,
            quantity: 1,
            unitPrice: 0,
            action: "remove"
          });
        } else if (option.includes('사이드:') || option.includes('음료:')) {
          // 사이드/음료 옵션
          const optionName = option.split(': ')[1];
          options.push({
            optionId: getOptionId(optionName),
            optionName: optionName,
            quantity: 1,
            unitPrice: 0,
            action: "add"
          });
        }
      });
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
            disabled={!selectedBranch || isProcessing}
            title={!selectedBranch ? '지점을 먼저 선택해주세요' : '결제하기'}
          >
            {selectedBranch ? (isProcessing ? '결제 처리 중...' : `결제하기`) : '지점 선택 필요'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;
