import React, { useState, useEffect } from 'react';
import styles from './BurgerOptionModal.module.css';

const BurgerOptionModal = ({ isOpen, onClose, menuItem, onAddToCart }) => {
  const [addOptions, setAddOptions] = useState({});
  const [removeOptions, setRemoveOptions] = useState({});

  // 개수 선택 가능한 옵션들의 개수 상태
  const [optionQuantities, setOptionQuantities] = useState({
    cheese: 1,
    bacon: 1
  });

  const [quantity, setQuantity] = useState(1);

  // 데이터베이스에서 가져온 토핑 옵션들
  const [toppingOptions, setToppingOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 토핑 옵션들을 데이터베이스에서 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchToppingOptions();
    }
  }, [isOpen]);

  // 토핑 옵션들을 데이터베이스에서 가져오는 함수
  const fetchToppingOptions = async () => {
    try {
      setLoading(true);

      // 토핑 옵션 가져오기
      const toppingResponse = await fetch('http://localhost:8080/api/menu-options/category/topping');
      const toppingData = await toppingResponse.json();
      setToppingOptions(toppingData);

      // 토핑 옵션들의 초기 상태 설정
      const initialAddOptions = {};
      const initialRemoveOptions = {};
      toppingData.forEach(option => {
        initialAddOptions[option.id] = false;
        initialRemoveOptions[option.id] = false;
      });
      setAddOptions(initialAddOptions);
      setRemoveOptions(initialRemoveOptions);

    } catch (error) {
      console.error('토핑 옵션을 가져오는 중 오류가 발생했습니다:', error);
    } finally {
      setLoading(false);
    }
  };

  // 옵션 ID로 옵션 정보를 찾는 함수
  const findOptionById = (options, id) => {
    return options.find(option => option.id.toString() === id);
  };

  const handleAddOptionChange = (optionId, value) => {
    setAddOptions(prev => ({ ...prev, [optionId]: value }));
    // 추가 옵션을 선택하면 제거 옵션에서 해제
    if (value) {
      setRemoveOptions(prev => ({ ...prev, [optionId]: false }));
    }
  };

  const handleRemoveOptionChange = (optionId, value) => {
    setRemoveOptions(prev => ({ ...prev, [optionId]: value }));
    // 제거 옵션을 선택하면 추가 옵션에서 해제
    if (value) {
      setAddOptions(prev => ({ ...prev, [optionId]: false }));
    }
  };

  const handleOptionQuantityChange = (optionName, newQuantity) => {
    const maxQty = optionName === 'cheese' ? 5 : 3; // 치즈는 최대 5장, 베이컨은 최대 3장
    const clampedQuantity = Math.max(1, Math.min(maxQty, newQuantity));
    setOptionQuantities(prev => ({ ...prev, [optionName]: clampedQuantity }));
  };

  const calculateTotalPrice = () => {
    const basePrice = menuItem.price || menuItem.basePrice || 0;

    // 추가 옵션만 가격에 반영 (제거 옵션은 가격에 영향 없음)
    const addOptionsPrice = Object.entries(addOptions).reduce((total, [optionId, value]) => {
      if (value) {
        const option = findOptionById(toppingOptions, optionId);
        if (option) {
          const optionPrice = Number(option.price);
          // 치즈와 베이컨은 개수만큼 가격 계산
          if (option.displayName === '치즈' || option.displayName === '베이컨') {
            const optionName = option.displayName === '치즈' ? 'cheese' : 'bacon';
            return total + (optionPrice * optionQuantities[optionName]);
          } else {
            // 기타 옵션은 1개 가격
            return total + optionPrice;
          }
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
          .filter(([optionId, value]) => value)
          .map(([optionId, value]) => {
            const option = findOptionById(toppingOptions, optionId);
            const optionName = option ? option.displayName : '';
            // 치즈와 베이컨은 개수만큼 가격 계산
            let finalPrice = option ? Number(option.price) : 0;
            if (optionName === '치즈' || optionName === '베이컨') {
              const key = optionName === '치즈' ? 'cheese' : 'bacon';
              finalPrice = finalPrice * optionQuantities[key];
            }
            return {
              id: optionId,
              name: optionName,
              price: finalPrice,
              quantity: optionName === '치즈' || optionName === '베이컨' 
                ? optionQuantities[optionName === '치즈' ? 'cheese' : 'bacon'] 
                : 1
            };
          }),
        remove: Object.entries(removeOptions)
          .filter(([optionId, value]) => value)
          .map(([optionId, value]) => {
            const option = findOptionById(toppingOptions, optionId);
            return {
              id: optionId,
              name: option ? option.displayName : ''
            };
          })
      }
    };

    // 가격 계산
    const optionsPrice = selectedOptions.toppings.add.reduce((total, topping) => total + topping.price, 0);
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

  if (loading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.loadingMessage}>옵션을 불러오는 중...</div>
        </div>
      </div>
    );
  }

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
          <div className={styles.optionsSection}>
            <h3 className={styles.optionsTitle}>토핑 추가 옵션 선택</h3>
            <p className={styles.optionsDescription}>추가를 원하는 토핑을 선택해주세요</p>
            <div className={styles.optionsGrid}>
              {toppingOptions.map((option) => (
                <div key={option.id} className={styles.optionItemContainer}>
                  <label className={`${styles.optionItem} ${removeOptions[option.id] ? styles.disabled : ''}`}>
                    <input
                      type="checkbox"
                      checked={addOptions[option.id] || false}
                      onChange={(e) => handleAddOptionChange(option.id.toString(), e.target.checked)}
                      disabled={removeOptions[option.id]}
                    />
                    <span className={styles.optionName}>{option.displayName}</span>
                    {Number(option.price) > 0 && (
                      <span className={styles.optionPrice}>+₩{Number(option.price).toLocaleString()}</span>
                    )}
                  </label>

                  {/* 치즈와 베이컨은 개수 선택 가능 */}
                  {(option.displayName === '치즈' || option.displayName === '베이컨') && addOptions[option.id] && (
                    <div className={styles.quantitySelector}>
                      <span className={styles.quantityLabel}>개수:</span>
                      <button
                        className={styles.quantityButton}
                        onClick={() => {
                          const optionName = option.displayName === '치즈' ? 'cheese' : 'bacon';
                          handleOptionQuantityChange(optionName, optionQuantities[optionName] - 1);
                        }}
                        disabled={optionQuantities[option.displayName === '치즈' ? 'cheese' : 'bacon'] <= 1}
                      >
                        -
                      </button>
                      <span className={styles.optionQuantity}>
                        {optionQuantities[option.displayName === '치즈' ? 'cheese' : 'bacon']}
                      </span>
                      <button
                        className={styles.quantityButton}
                        onClick={() => {
                          const optionName = option.displayName === '치즈' ? 'cheese' : 'bacon';
                          handleOptionQuantityChange(optionName, optionQuantities[optionName] + 1);
                        }}
                        disabled={optionQuantities[option.displayName === '치즈' ? 'cheese' : 'bacon'] >= (option.displayName === '치즈' ? 5 : 3)}
                      >
                        +
                      </button>
                      <span className={styles.maxQuantity}>
                        (최대 {option.displayName === '치즈' ? 5 : 3}장)
                      </span>
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
              {toppingOptions.map((option) => (
                <label key={option.id} className={`${styles.optionItem} ${addOptions[option.id] ? styles.disabled : ''}`}>
                  <input
                    type="checkbox"
                    checked={removeOptions[option.id] || false}
                    onChange={(e) => handleRemoveOptionChange(option.id.toString(), e.target.checked)}
                    disabled={addOptions[option.id]}
                  />
                  <span className={styles.optionName}>{option.displayName}</span>
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
