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
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [selectedQuantityItem, setSelectedQuantityItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [menuItems, setMenuItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', itemName: '' });

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
    } else if (selectedCategory === 'side' || selectedCategory === 'drink') {
      // 사이드, 음료는 개수 선택 모달 열기
      setSelectedQuantityItem(item);
      setQuantity(1); // 수량 초기화
      setIsQuantityModalOpen(true);
    }
  };

  const addToCart = (item) => {
    // 직접 추가되는 아이템은 imageUrl을 imageUrl로 복사
    const cartItem = {
      ...item,
      quantity: 1,
      imageUrl: item.imageUrl || item.menu?.imageUrl, // imageUrl을 명시적으로 복사
      name: item.name || '상품', // 이름이 없을 경우 기본값 설정
      displayOptions: [] // 기본 아이템은 옵션 없음
    };
    
    // 디버깅: 이미지 URL 확인
    console.log('addToCart - item:', item);
    console.log('addToCart - cartItem:', cartItem);
    
    setCart(prev => [...prev, cartItem]);
    
    // 알림 표시
    showNotification(`${cartItem.name}이(가) 장바구니에 담겼습니다.`);
  };

  const addToCartFromModal = (item) => {
    setCart(prev => [...prev, item]);
    
    // 알림 표시
    showNotification(`${item.displayName}이(가) 장바구니에 담겼습니다.`);
  };

  const addToCartFromSetModal = (item) => {
    setCart(prev => [...prev, item]);
    
    // 알림 표시
    showNotification(`${item.displayName}이(가) 장바구니에 담겼습니다.`);
  };

  const addToCartWithQuantity = (item, quantity) => {
    const cartItem = {
      ...item,
      quantity: quantity,
      imageUrl: item.imageUrl || item.menu?.imageUrl,
      name: item.name || '상품', // 이름이 없을 경우 기본값 설정
      displayOptions: [] // 기본 아이템은 옵션 없음
    };
    
    // 디버깅: 이미지 URL 확인
    console.log('addToCartWithQuantity - item:', item);
    console.log('addToCartWithQuantity - cartItem:', cartItem);
    
    setCart(prev => [...prev, cartItem]);
    
    // 알림 표시
    showNotification(`${cartItem.name} ${quantity}개가 장바구니에 담겼습니다.`);
    
    // 모달 닫기
    setIsQuantityModalOpen(false);
    setSelectedQuantityItem(null);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => {
      if (item.totalPrice) {
        return sum + item.totalPrice;
      }
      return sum + (item.price * item.quantity);
    }, 0);
  };

  const showNotification = (message) => {
    setNotification({ show: true, message, itemName: '' });
    
    // 3초 후 자동으로 알림 숨김
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const goToCart = () => {
    // 디버깅: 장바구니 데이터 확인
    console.log('MenuScreen - 장바구니로 이동:', cart);
    
    // 장바구니로 이동할 때 현재 장바구니 상태와 함께 이동
    navigate('/cart', { 
      state: { 
        cart,
        totalAmount: getTotalAmount(),
        itemCount: cart.length
      } 
    });
  };

  return (
    <div className={styles.menuContainer}>
      {/* 장바구니 담기 알림 */}
      {notification.show && (
        <div className={styles.notification}>
          <div className={styles.notificationContent}>
            <div className={styles.notificationIcon}>✓</div>
            <p className={styles.notificationMessage}>{notification.message}</p>
          </div>
        </div>
      )}
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
              <div className={styles.menuImageContainer}>
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl.startsWith('http') ? item.imageUrl : `http://localhost:8080${item.imageUrl}`}
                    alt={item.name} 
                    className={styles.menuImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`${styles.menuIcon} ${item.imageUrl ? styles.menuIconFallback : ''}`}>
                  {item.name.charAt(0)}
                </div>
              </div>
              <div className={styles.menuInfo}>
                <h3 className={styles.menuName}>{item.name}</h3>
                <p className={styles.menuDescription}>{item.description}</p>
                <p className={styles.menuPrice}>₩{item.price.toLocaleString()}</p>
              </div>
              {selectedCategory === 'burger' && (
                <button className={styles.addButton}>
                  옵션 선택
                </button>
              )}
              {selectedCategory === 'set' && (
                <button className={styles.addButton}>
                  옵션 선택
                </button>
              )}
              {(selectedCategory === 'side' || selectedCategory === 'drink') && (
                <button className={styles.addButton}>
                  장바구니 담기
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
              <div key={item.cartItemId || `${item.id}-${index}`} className={styles.cartPreviewItem}>
                <div className={styles.cartPreviewItemInfo}>
                  <div className={styles.cartPreviewItemImageContainer}>
                    {(item.menu?.imageUrl || item.imageUrl) ? (
                      <img 
                        src={(item.menu?.imageUrl || item.imageUrl).startsWith('http') ? 
                          (item.menu?.imageUrl || item.imageUrl) : 
                          `http://localhost:8080${item.menu?.imageUrl || item.imageUrl}`}
                        alt={item.displayName || item.menu?.name || item.name} 
                        className={styles.cartPreviewItemImage}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`${styles.cartPreviewItemIcon} ${(item.menu?.imageUrl || item.imageUrl) ? styles.cartPreviewItemIconFallback : ''}`}>
                      <div className={styles.cartPreviewItemIconText}>
                        {item.displayName ? item.displayName.charAt(0) : (item.menu?.name || item.name || 'M').charAt(0)}
                      </div>
                    </div>
                  </div>
                  <div className={styles.cartPreviewItemDetails}>
                    <h4 className={styles.cartPreviewItemName}>
                      {item.displayName || item.menu?.name || item.name}
                    </h4>
                    <p className={styles.cartPreviewItemPrice}>
                      ₩{(item.totalPrice || item.price * item.quantity).toLocaleString()}
                    </p>
                    {item.displayOptions && item.displayOptions.length > 0 && (
                      <div className={styles.cartPreviewItemOptions}>
                        {item.displayOptions.map((option, optIndex) => (
                          <span key={optIndex} className={styles.cartPreviewOption}>
                            {option}
                          </span>
                        ))}
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
              총 금액: ₩{cart.reduce((total, item) => total + (item.totalPrice || 0), 0).toLocaleString()}
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

      {/* 개수 선택 모달 */}
      {isQuantityModalOpen && selectedQuantityItem && (
        <div className={styles.modalOverlay}>
          <div className={styles.quantityModal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>수량 선택</h3>
              <button 
                className={styles.closeButton}
                onClick={() => {
                  setIsQuantityModalOpen(false);
                  setSelectedQuantityItem(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.itemPreview}>
                <div className={styles.itemImageContainer}>
                  {selectedQuantityItem.imageUrl ? (
                    <img 
                      src={selectedQuantityItem.imageUrl.startsWith('http') ? selectedQuantityItem.imageUrl : `http://localhost:8080${selectedQuantityItem.imageUrl}`}
                      alt={selectedQuantityItem.name} 
                      className={styles.itemImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`${styles.itemIconFallback} ${selectedQuantityItem.imageUrl ? styles.hidden : ''}`}>
                    <div className={styles.itemIconText}>
                      {selectedQuantityItem.name.charAt(0)}
                    </div>
                  </div>
                </div>
                <div className={styles.itemInfo}>
                  <h4 className={styles.itemName}>{selectedQuantityItem.name}</h4>
                  <p className={styles.itemPrice}>₩{selectedQuantityItem.price.toLocaleString()}</p>
                </div>
              </div>
              
              <div className={styles.quantitySelector}>
                <label className={styles.quantityLabel}>수량</label>
                <div className={styles.quantityControls}>
                  <button 
                    className={styles.quantityButton}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className={styles.quantityDisplay}>{quantity}</span>
                  <button 
                    className={styles.quantityButton}
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => {
                  setIsQuantityModalOpen(false);
                  setSelectedQuantityItem(null);
                }}
              >
                취소
              </button>
              <button 
                className={styles.addToCartButton}
                onClick={() => addToCartWithQuantity(selectedQuantityItem, quantity)}
              >
                장바구니 담기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 장바구니 아이템 옵션 렌더링 함수 (기존 구조 호환용)
const renderCartItemOptions = (item) => {
  // 새로운 구조에서는 displayOptions를 사용
  if (item.displayOptions && item.displayOptions.length > 0) {
    return (
      <div className={styles.cartPreviewOptions}>
        {item.displayOptions.map((option, index) => (
          <span key={index} className={styles.cartPreviewOption}>
            {option}
          </span>
        ))}
      </div>
    );
  }

  // 기존 구조 호환성 유지
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
