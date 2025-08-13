import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MenuScreen.module.css';
import BurgerOptionModal from './BurgerOptionModal';
import SetOptionModal from './SetOptionModal';

const MenuScreen = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('burger');
  const [cart, setCart] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSetModalOpen, setIsSetModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'burger', name: '햄버거' },
    { id: 'set', name: '세트 메뉴' },
    { id: 'side', name: '사이드' },
    { id: 'drink', name: '음료' }
  ];

  // API에서 메뉴 데이터를 가져오는 함수
  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/menus');
      if (!response.ok) {
        throw new Error('메뉴 데이터를 가져오는데 실패했습니다');
      }
      const allMenus = await response.json();
      console.log(allMenus);
      // 카테고리별로 메뉴 분류
      const categorizedMenus = {
        burger: allMenus.filter(menu => menu.category === 'burger'),
        set: allMenus.filter(menu => menu.category === 'set'),
        side: allMenus.filter(menu => menu.category === 'side'),
        drink: allMenus.filter(menu => menu.category === 'drink')
      };
      
      setMenuItems(categorizedMenus);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('메뉴 데이터 로딩 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 메뉴 데이터 로드
  useEffect(() => {
    fetchMenuData();
  }, []);

  const handleMenuItemClick = (item) => {
    if (selectedCategory === 'burger') {
      setSelectedMenuItem(item);
      setIsModalOpen(true);
    } else if (selectedCategory === 'set') {
      setSelectedMenuItem(item);
      setIsSetModalOpen(true);
    } else {
      // 사이드, 음료는 바로 장바구니에 추가
      addToCart(item);
    }
  };

  const addToCart = (item) => {
    setCart(prev => [...prev, { ...item, quantity: 1 }]);
  };

  const addToCartFromModal = (item) => {
    setCart(prev => [...prev, item]);
  };

  const addToCartFromSetModal = (item) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const goToCart = () => {
    navigate('/cart', { state: { cart } });
  };

  return (
    <div className={styles.menuContainer}>
      <div className={styles.categoryTabs}>
        {categories.map(category => (
          <button
            key={category.id}
            className={`${styles.categoryTab} ${selectedCategory === category.id ? styles.active : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {loading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>메뉴를 불러오는 중...</p>
        </div>
      )}
      
      {error && (
        <div className={styles.errorContainer}>
          <p>에러: {error}</p>
          <button onClick={fetchMenuData} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      )}
      
      {!loading && !error && (
        <div className={styles.menuGrid}>
          {menuItems[selectedCategory]?.map(item => (
            <div key={item.id} className={styles.menuItem} onClick={() => handleMenuItemClick(item)}>
              <div className={styles.menuImage}>
                <div className={styles.menuIcon}>{item.name.charAt(0)}</div>
              </div>
              <div className={styles.menuInfo}>
                <h3 className={styles.menuName}>{item.name}</h3>
                <p className={styles.menuDescription}>{item.description}</p>
                <p className={styles.menuPrice}>₩{item.price.toLocaleString()}</p>
              </div>
              {(selectedCategory === 'burger' || selectedCategory === 'set') && (
                <button className={styles.addButton}>
                  옵션 선택
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 장바구니 미리보기 섹션 */}
      {cart.length > 0 && (
        <div className={styles.cartPreview}>
          <div className={styles.cartPreviewHeader}>
            <h3 className={styles.cartPreviewTitle}>장바구니 미리보기</h3>
            <span className={styles.cartPreviewCount}>{cart.length}개 상품</span>
          </div>
          <div className={styles.cartPreviewItems}>
            {cart.map((item, index) => (
              <div key={`${item.id}-${index}`} className={styles.cartPreviewItem}>
                <div className={styles.cartPreviewItemInfo}>
                  <div className={styles.cartPreviewItemIcon}>
                    <div className={styles.cartPreviewItemIconText}>
                      {item.customName ? item.customName.charAt(0) : item.name.charAt(0)}
                    </div>
                  </div>
                  <div className={styles.cartPreviewItemDetails}>
                    <h4 className={styles.cartPreviewItemName}>
                      {item.customName || item.name}
                    </h4>
                    <p className={styles.cartPreviewItemPrice}>
                      ₩{(item.totalPrice || item.price * item.quantity).toLocaleString()}
                    </p>
                    {item.selectedOptions && (
                      <div className={styles.cartPreviewItemOptions}>
                        {renderCartItemOptions(item)}
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.cartPreviewItemActions}>
                  <span className={styles.cartPreviewItemQuantity}>수량: {item.quantity}</span>
                  <button
                    className={styles.cartPreviewRemoveButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromCart(index);
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.cartPreviewFooter}>
            <div className={styles.cartPreviewTotal}>
              총 금액: ₩{cart.reduce((total, item) => total + (item.totalPrice || item.price * item.quantity), 0).toLocaleString()}
            </div>
            <button className={styles.cartPreviewOrderButton} onClick={goToCart}>
              주문하기
            </button>
          </div>
        </div>
      )}

      <div className={styles.cartButton} onClick={goToCart}>
        🛒
        {cart.length > 0 && <span className={styles.cartBadge}>{cart.length}</span>}
      </div>

      {isModalOpen && (
        <BurgerOptionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          menuItem={selectedMenuItem}
          onAddToCart={addToCartFromModal}
        />
      )}

      {isSetModalOpen && (
        <SetOptionModal
          isOpen={isSetModalOpen}
          onClose={() => setIsSetModalOpen(false)}
          menuItem={selectedMenuItem}
          onAddToCart={addToCartFromSetModal}
        />
      )}
    </div>
  );
};

// 장바구니 아이템 옵션 렌더링 함수
const renderCartItemOptions = (item) => {
  if (!item.selectedOptions) return null;

  const { addOptions, removeOptions, side, drink } = item.selectedOptions;
  
  const addOptionsList = Object.entries(addOptions || {})
    .filter(([key, value]) => value)
    .map(([key, value]) => getOptionName(key));
  
  const removeOptionsList = Object.entries(removeOptions || {})
    .filter(([key, value]) => value)
    .map(([key, value]) => getOptionName(key));

  const sideName = side ? getSideName(side) : null;
  const drinkName = drink ? getDrinkName(drink) : null;

  const options = [];
  if (addOptionsList.length > 0) options.push(`추가: ${addOptionsList.join(', ')}`);
  if (removeOptionsList.length > 0) options.push(`제거: ${removeOptionsList.join(', ')}`);
  if (sideName) options.push(`사이드: ${sideName}`);
  if (drinkName) options.push(`음료: ${drinkName}`);

  if (options.length === 0) return null;

  return (
    <div className={styles.cartPreviewOptions}>
      {options.map((option, index) => (
        <span key={index} className={styles.cartPreviewOption}>
          {option}
        </span>
      ))}
    </div>
  );
};

const getOptionName = (key) => {
  const optionNames = {
    tomato: '토마토',
    onion: '양파',
    lettuce: '양상추',
    cheese: '치즈',
    sauce: '소스',
    pickle: '피클'
  };
  return optionNames[key] || key;
};

const getSideName = (key) => {
  const sideNames = {
    fries: '감자튀김',
    nuggets: '치킨너겟',
    seasonedFries: '양념감자',
    cheeseSticks: '치즈스틱',
    onionRings: '어니언링',
    cornSalad: '콘샐러드'
  };
  return sideNames[key] || key;
};

const getDrinkName = (key) => {
  const drinkNames = {
    cola: '콜라',
    sprite: '사이다',
    orangeJuice: '오렌지주스',
    americano: '아메리카노',
    zeroCola: '제로콜라',
    zeroSprite: '제로사이다'
  };
  return drinkNames[key] || key;
};

export default MenuScreen;
