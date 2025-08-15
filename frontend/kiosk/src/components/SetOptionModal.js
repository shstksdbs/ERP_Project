import React, { useState, useEffect } from 'react';
import styles from './SetOptionModal.module.css';

const SetOptionModal = ({ isOpen, onClose, menuItem, onAddToCart }) => {
  const [addOptions, setAddOptions] = useState({});
  const [removeOptions, setRemoveOptions] = useState({});
  const [selectedSide, setSelectedSide] = useState('');
  const [selectedDrink, setSelectedDrink] = useState('');
  const [quantity, setQuantity] = useState(1);

  // 데이터베이스에서 가져온 옵션들
  const [toppingOptions, setToppingOptions] = useState([]);
  const [sideOptions, setSideOptions] = useState([]);
  const [drinkOptions, setDrinkOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 컴포넌트 마운트 시 옵션들을 데이터베이스에서 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchMenuOptions();
    }
  }, [isOpen]);

  // 메뉴 옵션들을 데이터베이스에서 가져오는 함수
  const fetchMenuOptions = async () => {
    try {
      setLoading(true);

      // 토핑 옵션 가져오기
      const toppingResponse = await fetch('http://localhost:8080/api/menu-options/category/topping');
      const toppingData = await toppingResponse.json();
      setToppingOptions(toppingData);

      // 사이드 옵션 가져오기
      const sideResponse = await fetch('http://localhost:8080/api/menu-options/category/side');
      const sideData = await sideResponse.json();
      setSideOptions(sideData);

      // 음료 옵션 가져오기
      const drinkResponse = await fetch('http://localhost:8080/api/menu-options/category/drink');
      const drinkData = await drinkResponse.json();
      setDrinkOptions(drinkData);

      // 기본값 설정
      if (sideData.length > 0) {
        setSelectedSide(sideData[0].id.toString());
      }
      if (drinkData.length > 0) {
        setSelectedDrink(drinkData[0].id.toString());
      }

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
      console.error('메뉴 옵션을 가져오는 중 오류가 발생했습니다:', error);
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

  const calculateTotalPrice = () => {
    const basePrice = menuItem.price || menuItem.basePrice || 0;

    // 추가 옵션만 가격에 반영 (제거 옵션은 가격에 영향 없음)
    const addOptionsPrice = Object.entries(addOptions).reduce((total, [optionId, value]) => {
      if (value) {
        const option = findOptionById(toppingOptions, optionId);
        return total + (option ? Number(option.price) : 0);
      }
      return total;
    }, 0);

    // 사이드 변경 가격
    const selectedSideOption = findOptionById(sideOptions, selectedSide);
    const sidePrice = selectedSideOption ? Number(selectedSideOption.price) : 0;

    // 음료 변경 가격
    const selectedDrinkOption = findOptionById(drinkOptions, selectedDrink);
    const drinkPrice = selectedDrinkOption ? Number(selectedDrinkOption.price) : 0;

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
      imageUrl: menuItem.imageUrl
    };

    // 선택된 옵션 정보
    const selectedOptions = {
      toppings: {
        add: Object.entries(addOptions)
          .filter(([optionId, value]) => value)
          .map(([optionId, value]) => {
            const option = findOptionById(toppingOptions, optionId);
            return {
              id: optionId,
              name: option ? option.displayName : '',
              price: option ? Number(option.price) : 0
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
      },
      side: {
        id: selectedSide,
        name: findOptionById(sideOptions, selectedSide)?.displayName || '',
        price: findOptionById(sideOptions, selectedSide) ? Number(findOptionById(sideOptions, selectedSide).price) : 0
      },
      drink: {
        id: selectedDrink,
        name: findOptionById(drinkOptions, selectedDrink)?.displayName || '',
        price: findOptionById(drinkOptions, selectedDrink) ? Number(findOptionById(drinkOptions, selectedDrink).price) : 0
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
              <div className={styles.menuIconText}>{menuItem.name ? menuItem.name.charAt(0) : 'M'}</div>
            </div>
          </div>
          <div className={styles.menuInfo}>
            <h3 className={styles.menuName}>{menuItem.name}</h3>
            <p className={styles.menuDescription}>{menuItem.description || '맛있는 세트 메뉴입니다'}</p>
            <p className={styles.basePrice}>기본 가격: ₩{(menuItem.price || menuItem.basePrice || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className={styles.optionsContainer}>
          <div className={styles.optionsSection}>
            <h3 className={styles.optionsTitle}>햄버거 토핑 옵션 선택</h3>
            <p className={styles.optionsDescription}>추가를 원하는 토핑을 선택해주세요</p>
            <div className={styles.optionsGrid}>
              {toppingOptions.map((option) => (
                <label key={option.id} className={`${styles.optionItem} ${removeOptions[option.id] ? styles.disabled : ''}`}>
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
              ))}
            </div>
          </div>

          <div className={styles.optionsSection}>
            <h3 className={styles.optionsTitle}>햄버거 토핑 제거 옵션 선택</h3>
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

          <div className={styles.optionsSection}>
            <h3 className={styles.optionsTitle}>사이드 메뉴 선택</h3>
            <p className={styles.optionsDescription}>원하는 사이드 메뉴로 변경할 수 있습니다</p>
            <div className={styles.optionsGrid}>
              {sideOptions.map((option) => (
                <label key={option.id} className={styles.optionItem}>
                  <input
                    type="radio"
                    name="side"
                    value={option.id.toString()}
                    checked={selectedSide === option.id.toString()}
                    onChange={(e) => setSelectedSide(e.target.value)}
                  />
                  <span className={styles.optionName}>{option.displayName}</span>
                  {Number(option.price) > 0 && (
                    <span className={styles.optionPrice}>+₩{Number(option.price).toLocaleString()}</span>
                  )}
                  {Number(option.price) === 0 && (
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
              {drinkOptions.map((option) => (
                <label key={option.id} className={styles.optionItem}>
                  <input
                    type="radio"
                    name="drink"
                    value={option.id.toString()}
                    checked={selectedDrink === option.id.toString()}
                    onChange={(e) => setSelectedDrink(e.target.value)}
                  />
                  <span className={styles.optionName}>{option.displayName}</span>
                  {Number(option.price) > 0 && (
                    <span className={styles.optionPrice}>+₩{Number(option.price).toLocaleString()}</span>
                  )}
                  {Number(option.price) === 0 && (
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
