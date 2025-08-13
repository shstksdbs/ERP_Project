import React, { useState } from 'react';
import styles from './SetOptionModal.module.css';

const SetOptionModal = ({ isOpen, onClose, menuItem, onAddToCart }) => {
  const [addOptions, setAddOptions] = useState({
    tomato: false,
    onion: false,
    cheese: false,
    lettuce: false,
    sauce: false
  });

  const [removeOptions, setRemoveOptions] = useState({
    tomato: false,
    onion: false,
    cheese: false,
    lettuce: false,
    sauce: false
  });

  const [selectedSide, setSelectedSide] = useState('fries');
  const [selectedDrink, setSelectedDrink] = useState('cola');
  const [quantity, setQuantity] = useState(1);

  const options = {
    tomato: { name: '토마토', price: 300 },
    onion: { name: '양파', price: 300 },
    cheese: { name: '치즈', price: 500 },
    lettuce: { name: '양상추', price: 300 },
    sauce: { name: '소스', price: 300 }
  };

  const sideOptions = {
    fries: { name: '감자튀김', price: 0 },
    nuggets: { name: '치킨너겟', price: 1000 },
    seasonedFries: { name: '양념감자', price: 500 },
    cheeseSticks: { name: '치즈스틱', price: 1500 },
    onionRings: { name: '어니언링', price: 800 },
    cornSalad: { name: '콘샐러드', price: 200 }
  };

  const drinkOptions = {
    cola: { name: '콜라', price: 0 },
    sprite: { name: '사이다', price: 0 },
    orangeJuice: { name: '오렌지주스', price: 500 },
    americano: { name: '아메리카노', price: 1000 },
    zeroCola: { name: '제로콜라', price: 0 },
    zeroSprite: { name: '제로사이다', price: 0 }
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

  const calculateTotalPrice = () => {
    const basePrice = menuItem.price || menuItem.basePrice || 0;
    // 추가 옵션만 가격에 반영 (제거 옵션은 가격에 영향 없음)
    const addOptionsPrice = Object.entries(addOptions).reduce((total, [key, value]) => {
      if (value && options[key]) {
        return total + options[key].price;
      }
      return total;
    }, 0);

    // 사이드 변경 가격
    const sidePrice = sideOptions[selectedSide].price;
    
    // 음료 변경 가격
    const drinkPrice = drinkOptions[selectedDrink].price;

    return (basePrice + addOptionsPrice + sidePrice + drinkPrice) * quantity;
  };

  const handleAddToCart = () => {
    // 기본 메뉴 정보
    const baseMenuInfo = {
      id: menuItem.id,
      name: menuItem.name,
      category: menuItem.category,
      basePrice: menuItem.price || menuItem.basePrice || 0,
      description: menuItem.description,
      image: menuItem.image
    };

    // 선택된 옵션 정보
    const selectedOptions = {
      toppings: {
        add: Object.entries(addOptions)
          .filter(([key, value]) => value)
          .map(([key, value]) => ({
            id: key,
            name: options[key].name,
            price: options[key].price
          })),
        remove: Object.entries(removeOptions)
          .filter(([key, value]) => value)
          .map(([key, value]) => ({
            id: key,
            name: options[key].name
          }))
      },
      side: {
        id: selectedSide,
        name: sideOptions[selectedSide].name,
        price: sideOptions[selectedSide].price
      },
      drink: {
        id: selectedDrink,
        name: drinkOptions[selectedDrink].name,
        price: drinkOptions[selectedDrink].price
      }
    };

    // 가격 계산
    const optionsPrice = selectedOptions.toppings.add.reduce((total, topping) => total + topping.price, 0);
    const sidePrice = selectedOptions.side.price;
    const drinkPrice = selectedOptions.drink.price;
    const totalPrice = (baseMenuInfo.basePrice + optionsPrice + sidePrice + drinkPrice) * quantity;

    // 장바구니 아이템 생성
    const cartItem = {
      // 기본 식별 정보
      cartItemId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // 고유 ID
      timestamp: new Date().toISOString(),
      
      // 메뉴 기본 정보
      menu: baseMenuInfo,
      
      // 수량 및 가격
      quantity: quantity,
      unitPrice: baseMenuInfo.basePrice + optionsPrice + sidePrice + drinkPrice,
      totalPrice: totalPrice,
      
      // 선택된 옵션들
      options: selectedOptions,
      
      // 표시용 정보
      displayName: `${menuItem.name} 세트 (${selectedOptions.side.name}, ${selectedOptions.drink.name})`,
      displayOptions: [
        ...selectedOptions.toppings.add.map(t => `+${t.name}`),
        ...selectedOptions.toppings.remove.map(t => `-${t.name}`),
        `사이드: ${selectedOptions.side.name}`,
        `음료: ${selectedOptions.drink.name}`
      ],
      
      // 메타데이터
      metadata: {
        isSet: true,
        hasCustomOptions: selectedOptions.toppings.add.length > 0 || selectedOptions.toppings.remove.length > 0,
        originalPrice: baseMenuInfo.basePrice,
        optionsPrice: optionsPrice,
        sidePrice: sidePrice,
        drinkPrice: drinkPrice
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
          <div className={styles.menuIcon}>
            <div className={styles.menuIconText}>{menuItem.name ? menuItem.name.charAt(0) : 'M'}</div>
          </div>
          <div className={styles.menuInfo}>
            <h3 className={styles.menuName}>{menuItem.name}</h3>
            <p className={styles.menuDescription}>{menuItem.description || '맛있는 세트 메뉴입니다'}</p>
            <p className={styles.basePrice}>기본 가격: ₩{(menuItem.price || menuItem.basePrice || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.optionsContainer}>
          <h3 className={styles.optionsTitle}>햄버거 토핑 옵션 선택</h3>
          <p className={styles.optionsDescription}>추가를 원하는 토핑을 선택해주세요</p>

          <div className={styles.optionsSection}>
            <div className={styles.optionsGrid}>
              {Object.entries(options).map(([key, option]) => (
                <label key={key} className={`${styles.optionItem} ${removeOptions[key] ? styles.disabled : ''}`}>
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
              ))}
            </div>
          </div>

          <div className={styles.optionsSection}>
            <h3 className={styles.optionsTitle}>햄버거 토핑 제거 옵션 선택</h3>
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

          <div className={styles.optionsSection}>
            <h3 className={styles.optionsTitle}>사이드 메뉴 선택</h3>
            <p className={styles.optionsDescription}>원하는 사이드 메뉴로 변경할 수 있습니다</p>
            <div className={styles.optionsGrid}>
              {Object.entries(sideOptions).map(([key, option]) => (
                <label key={key} className={styles.optionItem}>
                  <input
                    type="radio"
                    name="side"
                    value={key}
                    checked={selectedSide === key}
                    onChange={(e) => setSelectedSide(e.target.value)}
                  />
                  <span className={styles.optionName}>{option.name}</span>
                  {option.price > 0 && (
                    <span className={styles.optionPrice}>+₩{option.price.toLocaleString()}</span>
                  )}
                  {option.price === 0 && (
                    <span className={styles.optionNote}>기본</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.optionsSection}>
            <h3 className={styles.optionsTitle}>음료 선택</h3>
            <p className={styles.optionsDescription}>원하는 음료로 변경할 수 있습니다</p>
            <div className={styles.optionsGrid}>
              {Object.entries(drinkOptions).map(([key, option]) => (
                <label key={key} className={styles.optionItem}>
                  <input
                    type="radio"
                    name="drink"
                    value={key}
                    checked={selectedDrink === key}
                    onChange={(e) => setSelectedDrink(e.target.value)}
                  />
                  <span className={styles.optionName}>{option.name}</span>
                  {option.price > 0 && (
                    <span className={styles.optionPrice}>+₩{option.price.toLocaleString()}</span>
                  )}
                  {option.price === 0 && (
                    <span className={styles.optionNote}>기본</span>
                  )}
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

export default SetOptionModal;
