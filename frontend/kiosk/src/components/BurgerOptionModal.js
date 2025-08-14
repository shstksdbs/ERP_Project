import React, { useState } from 'react';
import styles from './BurgerOptionModal.module.css';

const BurgerOptionModal = ({ isOpen, onClose, menuItem, onAddToCart }) => {
  const [addOptions, setAddOptions] = useState({
    tomato: false,
    onion: false,
    cheese: false,
    lettuce: false,
    sauce: false,
    pickle: false,
    bacon: false
  });

  const [removeOptions, setRemoveOptions] = useState({
    tomato: false,
    onion: false,
    cheese: false,
    lettuce: false,
    sauce: false,
    pickle: false,
    bacon: false
  });

  // 개수 선택 가능한 옵션들의 개수 상태
  const [optionQuantities, setOptionQuantities] = useState({
    cheese: 1,
    bacon: 1
  });

  const [quantity, setQuantity] = useState(1);

  const options = {
    tomato: { name: '토마토', price: 300, quantitySelectable: false },
    onion: { name: '양파', price: 300, quantitySelectable: false },
    pickle: { name: '피클', price: 0, quantitySelectable: false },
    lettuce: { name: '양상추', price: 300, quantitySelectable: false },
    cheese: { name: '치즈', price: 300, quantitySelectable: true, maxQuantity: 5 },
    sauce: { name: '소스', price: 0, quantitySelectable: false },
    bacon: { name: '베이컨', price: 500, quantitySelectable: true, maxQuantity: 3 }
  };

  const handleAddOptionChange = (optionName, value) => {
    setAddOptions(prev => ({ ...prev, [optionName]: value }));
    // 추가 옵션을 선택하면 제거 옵션에서 해제
    if (value) {
      setRemoveOptions(prev => ({ ...prev, [optionName]: false }));
    }
  };

  const handleRemoveOptionChange = (optionName, value) => {
    setRemoveOptions(prev => ({ ...prev, [optionName]: value }));
    // 제거 옵션을 선택하면 추가 옵션에서 해제
    if (value) {
      setAddOptions(prev => ({ ...prev, [optionName]: false }));
    }
  };

  const handleOptionQuantityChange = (optionName, newQuantity) => {
    const maxQty = options[optionName].maxQuantity;
    const clampedQuantity = Math.max(1, Math.min(maxQty, newQuantity));
    setOptionQuantities(prev => ({ ...prev, [optionName]: clampedQuantity }));
  };

  const calculateTotalPrice = () => {
    const basePrice = menuItem.price;
    // 추가 옵션만 가격에 반영 (제거 옵션은 가격에 영향 없음)
    const addOptionsPrice = Object.entries(addOptions).reduce((total, [key, value]) => {
      if (value && options[key]) {
        const optionPrice = options[key].price;
        if (options[key].quantitySelectable) {
          // 개수 선택 가능한 옵션은 개수만큼 가격 계산
          return total + (optionPrice * optionQuantities[key]);
        } else {
          // 개수 선택 불가능한 옵션은 1개 가격
          return total + optionPrice;
        }
      }
      return total;
    }, 0);
    return (basePrice + addOptionsPrice) * quantity;
  };

  const handleAddToCart = () => {
    // 기본 메뉴 정보
    const baseMenuInfo = {
      id: menuItem.id,
      name: menuItem.name,
      category: menuItem.category,
      basePrice: menuItem.price || 0,
      description: menuItem.description,
      imageUrl: menuItem.imageUrl
    };

    // 선택된 옵션 정보
    const selectedOptions = {
      toppings: {
        add: Object.entries(addOptions)
          .filter(([key, value]) => value)
          .map(([key, value]) => ({
            id: key,
            name: options[key].name,
            price: options[key].price,
            quantity: optionQuantities[key] || 1
          })),
        remove: Object.entries(removeOptions)
          .filter(([key, value]) => value)
          .map(([key, value]) => ({
            id: key,
            name: options[key].name
          }))
      }
    };

    // 가격 계산
    const optionsPrice = selectedOptions.toppings.add.reduce((total, topping) => {
      return total + (topping.price * topping.quantity);
    }, 0);
    const totalPrice = (baseMenuInfo.basePrice + optionsPrice) * quantity;

    // 장바구니 아이템 생성
    const cartItem = {
      // 기본 식별 정보
      cartItemId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // 고유 ID
      timestamp: new Date().toISOString(),
      
      // 메뉴 기본 정보
      menu: baseMenuInfo,
      
      // 수량 및 가격
      quantity: quantity,
      unitPrice: baseMenuInfo.basePrice + optionsPrice,
      totalPrice: totalPrice,
      
      // 선택된 옵션들
      options: selectedOptions,
      
      // 표시용 정보
      displayName: menuItem.name,
      displayOptions: [
        ...selectedOptions.toppings.add.map(t => `+${t.name}${t.quantity > 1 ? ` x${t.quantity}` : ''}`),
        ...selectedOptions.toppings.remove.map(t => `-${t.name}`)
      ],
      
      // 메타데이터
      metadata: {
        isSet: false,
        hasCustomOptions: selectedOptions.toppings.add.length > 0 || selectedOptions.toppings.remove.length > 0,
        originalPrice: baseMenuInfo.basePrice,
        optionsPrice: optionsPrice
      }
    };

    onAddToCart(cartItem);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{menuItem.name} 옵션 선택</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <div className={styles.menuPreview}>
          <div className={styles.menuImageContainer}>
            {menuItem.imageUrl ? (
              <img 
                src={menuItem.imageUrl.startsWith('http') ? menuItem.imageUrl : `http://localhost:8080${menuItem.imageUrl}`}
                alt={menuItem.name} 
                className={styles.menuImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`${styles.menuIcon} ${menuItem.imageUrl ? styles.menuIconFallback : ''}`}>
              <div className={styles.menuIconText}>{menuItem.name.charAt(0)}</div>
            </div>
          </div>
          <div className={styles.menuInfo}>
            <h3 className={styles.menuName}>{menuItem.name}</h3>
            <p className={styles.menuDescription}>{menuItem.description}</p>
            <p className={styles.basePrice}>기본 가격: ₩{menuItem.price.toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.optionsContainer}>
          <h3 className={styles.optionsTitle}>토핑 추가 옵션 선택</h3>
          <p className={styles.optionsDescription}>추가를 원하는 토핑을 선택해주세요</p>

          <div className={styles.optionsSection}>
            <div className={styles.optionsGrid}>
              {Object.entries(options).map(([key, option]) => (
                <div key={key} className={styles.optionItemContainer}>
                  <label className={`${styles.optionItem} ${removeOptions[key] ? styles.disabled : ''}`}>
                    <input
                      type="checkbox"
                      checked={addOptions[key]}
                      onChange={(e) => handleAddOptionChange(key, e.target.checked)}
                      disabled={removeOptions[key]}
                    />
                    <span className={styles.optionName}>{option.name}</span>
                    {option.price > 0 && (
                      <span className={styles.optionPrice}>+₩{option.price.toLocaleString()}</span>
                    )}
                  </label>
                  
                  {/* 개수 선택 가능한 옵션에만 개수 선택기 표시 */}
                  {option.quantitySelectable && addOptions[key] && (
                    <div className={styles.quantitySelector}>
                      <span className={styles.quantityLabel}>개수:</span>
                      <button
                        className={styles.quantityButton}
                        onClick={() => handleOptionQuantityChange(key, optionQuantities[key] - 1)}
                        disabled={optionQuantities[key] <= 1}
                      >
                        -
                      </button>
                      <span className={styles.optionQuantity}>{optionQuantities[key]}</span>
                      <button
                        className={styles.quantityButton}
                        onClick={() => handleOptionQuantityChange(key, optionQuantities[key] + 1)}
                        disabled={optionQuantities[key] >= option.maxQuantity}
                      >
                        +
                      </button>
                      <span className={styles.maxQuantity}>(최대 {option.maxQuantity}개)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.optionsSection}>
            <h3 className={styles.optionsTitle}>토핑 제거 옵션 선택</h3>
            <p className={styles.optionsDescription}>제거를 원하는 토핑을 선택해주세요</p>
            <div className={styles.optionsGrid}>
              {Object.entries(options).map(([key, option]) => (
                <label key={key} className={`${styles.optionItem} ${addOptions[key] ? styles.disabled : ''}`}>
                  <input
                    type="checkbox"
                    checked={removeOptions[key]}
                    onChange={(e) => handleRemoveOptionChange(key, e.target.checked)}
                    disabled={addOptions[key]}
                  />
                  <span className={styles.optionName}>{option.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.quantitySection}>
            <h4 className={styles.sectionTitle}>수량</h4>
            <div className={styles.quantityControl}>
              <button
                className={styles.quantityButton}
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className={styles.quantity}>{quantity}</span>
              <button
                className={styles.quantityButton}
                onClick={() => setQuantity(prev => prev + 1)}
              >
                +
              </button>
            </div>
            <div className={styles.quantityInfo}>
              <p className={styles.quantityText}>선택된 수량: {quantity}개</p>
              <p className={styles.quantityPrice}>개당 가격: ₩{(calculateTotalPrice() / quantity).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className={styles.totalSection}>
          <div className={styles.totalPrice}>
            총 금액: ₩{calculateTotalPrice().toLocaleString()}
          </div>
          <button className={styles.addToCartButton} onClick={handleAddToCart}>
            장바구니에 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default BurgerOptionModal;
