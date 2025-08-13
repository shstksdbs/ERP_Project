import React, { useState } from 'react';
import styles from './BurgerOptionModal.module.css';

const BurgerOptionModal = ({ isOpen, onClose, menuItem, onAddToCart }) => {
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

  const [quantity, setQuantity] = useState(1);

  const options = {
    tomato: { name: '토마토', price: 300 },
    onion: { name: '양파', price: 300 },
    pickle: { name: '피클', price: 300 },
    lettuce: { name: '양상추', price: 300 },
    cheese: { name: '치즈', price: 500 },
    sauce: { name: '소스', price: 300 }
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
    const basePrice = menuItem.price;
    // 추가 옵션만 가격에 반영 (제거 옵션은 가격에 영향 없음)
    const addOptionsPrice = Object.entries(addOptions).reduce((total, [key, value]) => {
      if (value && options[key]) {
        return total + options[key].price;
      }
      return total;
    }, 0);
    return (basePrice + addOptionsPrice) * quantity;
  };

  const handleAddToCart = () => {
    const cartItem = {
      ...menuItem,
      quantity,
      selectedOptions: {
        addOptions,
        removeOptions
      },
      totalPrice: calculateTotalPrice()
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
            <div className={styles.menuIconText}>{menuItem.name.charAt(0)}</div>
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
