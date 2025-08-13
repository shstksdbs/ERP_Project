import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CartScreen.module.css';

const CartScreen = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([
    { 
      id: 1, 
      name: '치즈버거', 
      price: 4500, 
      quantity: 2,
      selectedOptions: {
        tomato: true,
        onion: true,
        cheese: true,
        lettuce: true,
        originalSauce: true,
        spicySauce: false,
        sweetSauce: false,
        mustard: false,
        sauceNames: ['기본 소스']
      },
      totalPrice: 10000
    },
    { id: 7, name: '감자튀김', price: 2500, quantity: 1 },
    { id: 12, name: '콜라', price: 2000, quantity: 2 }
  ]);

  const updateQuantity = (id, change) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return null;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => {
      if (item.totalPrice) {
        return sum + item.totalPrice;
      }
      return sum + (item.price * item.quantity);
    }, 0);
  };

  const goBack = () => {
    navigate('/');
  };

  const proceedToPayment = () => {
    navigate('/payment');
  };

  const renderOptions = (item) => {
    if (!item.selectedOptions) return null;

    const { addOptions, removeOptions, side, drink } = item.selectedOptions;
    
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

    return (
      <div className={styles.itemOptions}>
        {addOptionsList.length > 0 && (
          <div className={styles.optionsRow}>
            <span className={styles.optionsLabel}>추가:</span>
            <span className={styles.optionsList}>{addOptionsList.map(key => getOptionName(key)).join(', ')}</span>
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
  };

  const getOptionName = (key) => {
    const optionNames = {
      tomato: '토마토',
      onion: '양파',
      cheese: '치즈',
      lettuce: '양상추',
      sauce: '소스'
    };
    return optionNames[key] || key;
  };

  const getSideName = (key) => {
    const sideNames = {
      fries: '감자튀김',
      nuggets: '치킨너겟',
      seasonedFries: '양념감자',
      cheeseSticks: '치즈스틱'
    };
    return sideNames[key] || key;
  };

  const getDrinkName = (key) => {
    const drinkNames = {
      cola: '콜라',
      sprite: '사이다',
      orangeJuice: '오렌지주스',
      americano: '아메리카노'
    };
    return drinkNames[key] || key;
  };

  if (cart.length === 0) {
    return (
      <div className={styles.cartContainer}>
        <div className={styles.cartHeader}>
          <h2 className={styles.cartTitle}>장바구니</h2>
        </div>
        <div className={styles.emptyCart}>
          <div className={styles.emptyIcon}>CART</div>
          <p className={styles.emptyText}>장바구니가 비어있습니다</p>
          <button className={styles.backButton} onClick={goBack} style={{ marginTop: '20px' }}>
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
        {cart.map(item => (
          <div key={`${item.id}-${JSON.stringify(item.selectedOptions || {})}`} className={styles.cartItem}>
            <div className={styles.itemInfo}>
              <div className={styles.itemIcon}>
                <div className={styles.itemIconText}>{item.name.charAt(0)}</div>
              </div>
              <div className={styles.itemDetails}>
                <h3 className={styles.itemName}>{item.name}</h3>
                {renderOptions(item)}
                <p className={styles.itemPrice}>
                  ₩{item.totalPrice ? item.totalPrice.toLocaleString() : (item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className={styles.quantityControl}>
              <button className={styles.quantityButton} onClick={() => updateQuantity(item.id, -1)}>
                -
              </button>
              <span className={styles.quantity}>{item.quantity}</span>
              <button className={styles.quantityButton} onClick={() => updateQuantity(item.id, 1)}>
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.totalSection}>
        <div className={styles.totalAmount}>
          총 금액: ₩{getTotalAmount().toLocaleString()}
        </div>
        <div className={styles.actionButtons}>
          <button className={styles.backButton} onClick={goBack}>
            메뉴로 돌아가기
          </button>
          <button className={styles.orderButton} onClick={proceedToPayment}>
            주문하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartScreen;
