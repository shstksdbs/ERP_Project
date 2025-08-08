import React, { useState, useEffect } from 'react';
import styles from './OrderRequest.module.css';
import plusIcon from '../../assets/plus_icon.png';
import searchIcon from '../../assets/search_icon.png';

export default function OrderRequest({ branchId }) {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 샘플 데이터
  useEffect(() => {
    const sampleProducts = [
      {
        id: 1,
        name: '카페라떼',
        category: '음료',
        currentStock: 15,
        minStock: 20,
        maxStock: 80,
        unit: '개',
        price: 1800
      },
      {
        id: 2,
        name: '샌드위치',
        category: '식품',
        currentStock: 8,
        minStock: 10,
        maxStock: 50,
        unit: '개',
        price: 3000
      },
      {
        id: 3,
        name: '우유',
        category: '원재료',
        currentStock: 25,
        minStock: 15,
        maxStock: 60,
        unit: 'L',
        price: 2500
      },
      {
        id: 4,
        name: '커피원두',
        category: '원재료',
        currentStock: 30,
        minStock: 20,
        maxStock: 100,
        unit: 'kg',
        price: 15000
      }
    ];

    setProducts(sampleProducts);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleAddToOrder = (product) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (existingProduct) {
      setSelectedProducts(prev => 
        prev.map(p => 
          p.id === product.id 
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      );
    } else {
      setSelectedProducts(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity <= 0) {
      setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    } else {
      setSelectedProducts(prev => 
        prev.map(p => 
          p.id === productId ? { ...p, quantity } : p
        )
      );
    }
  };

  const handleSubmitOrder = () => {
    if (selectedProducts.length === 0) {
      alert('발주할 상품을 선택해주세요.');
      return;
    }

    // 발주 신청 로직
    console.log('발주 신청:', selectedProducts);
    alert('발주가 신청되었습니다.');
    setSelectedProducts([]);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalAmount = selectedProducts.reduce((sum, product) => {
    return sum + (product.price * product.quantity);
  }, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>발주신청</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.productSection}>
          <div className={styles.sectionHeader}>
            <h2>상품 선택</h2>
            <div className={styles.filters}>
              <div className={styles.searchContainer}>
                <img src={searchIcon} alt="검색" className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="상품명으로 검색"
                  value={searchTerm}
                  onChange={handleSearch}
                  className={styles.searchInput}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={handleCategoryFilter}
                className={styles.categoryFilter}
              >
                <option value="all">전체 카테고리</option>
                <option value="음료">음료</option>
                <option value="식품">식품</option>
                <option value="원재료">원재료</option>
              </select>
            </div>
          </div>

          <div className={styles.productGrid}>
            {filteredProducts.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <span className={styles.productCategory}>{product.category}</span>
                  <div className={styles.stockInfo}>
                    <span>현재: {product.currentStock}</span>
                    <span>최소: {product.minStock}</span>
                  </div>
                  <div className={styles.priceInfo}>
                    <span className={styles.price}>{product.price.toLocaleString()}원</span>
                    <span className={styles.unit}>/{product.unit}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddToOrder(product)}
                  className={styles.addButton}
                >
                  <img src={plusIcon} alt="추가" className={styles.addIcon} />
                  추가
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.orderSection}>
          <div className={styles.sectionHeader}>
            <h2>발주 상품</h2>
            {selectedProducts.length > 0 && (
              <button
                onClick={handleSubmitOrder}
                className={styles.submitButton}
              >
                발주 신청
              </button>
            )}
          </div>

          {selectedProducts.length === 0 ? (
            <div className={styles.emptyOrder}>
              <p>발주할 상품을 선택해주세요.</p>
            </div>
          ) : (
            <div className={styles.orderList}>
              {selectedProducts.map((product) => (
                <div key={product.id} className={styles.orderItem}>
                  <div className={styles.orderItemInfo}>
                    <h3 className={styles.orderItemName}>{product.name}</h3>
                    <span className={styles.orderItemCategory}>{product.category}</span>
                  </div>
                  <div className={styles.orderItemQuantity}>
                    <button
                      onClick={() => handleQuantityChange(product.id, product.quantity - 1)}
                      className={styles.quantityButton}
                    >
                      -
                    </button>
                    <span className={styles.quantity}>{product.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(product.id, product.quantity + 1)}
                      className={styles.quantityButton}
                    >
                      +
                    </button>
                  </div>
                  <div className={styles.orderItemPrice}>
                    {(product.price * product.quantity).toLocaleString()}원
                  </div>
                </div>
              ))}
              <div className={styles.orderTotal}>
                <span className={styles.totalLabel}>총 금액:</span>
                <span className={styles.totalAmount}>{totalAmount.toLocaleString()}원</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
