import React, { useState, useEffect } from 'react';
import styles from './ProductList.module.css';
import searchIcon from '../../assets/search_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import productIcon from '../../assets/product_icon.png';
import dollorIcon from '../../assets/dollor_icon.png';
import percentIcon from '../../assets/percent_icon.png';

export default function ProductList() {
  const [activeTab, setActiveTab] = useState('product-list');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);

  // 샘플 데이터
  useEffect(() => {
    const sampleCategories = [
      { id: 1, name: '음료', code: 'BEVERAGE' },
      { id: 2, name: '식품', code: 'FOOD' },
      { id: 3, name: '디저트', code: 'DESSERT' },
      { id: 4, name: '사이드', code: 'SIDE' }
    ];

    const sampleProducts = [
      {
        id: 1,
        name: '아메리카노',
        code: 'AM001',
        category: '음료',
        price: 4500,
        cost: 1500,
        profitMargin: 66.7,
        stock: 100,
        status: 'active',
        description: '깔끔한 아메리카노',
        image: null,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        salesCount: 1250,
        rating: 4.5
      },
      {
        id: 2,
        name: '카페라떼',
        code: 'CL001',
        category: '음료',
        price: 5500,
        cost: 1800,
        profitMargin: 67.3,
        stock: 80,
        status: 'active',
        description: '부드러운 카페라떼',
        image: null,
        createdAt: '2024-01-16',
        updatedAt: '2024-01-25',
        salesCount: 980,
        rating: 4.8
      },
      {
        id: 3,
        name: '카푸치노',
        code: 'CP001',
        category: '음료',
        price: 5500,
        cost: 1800,
        profitMargin: 67.3,
        stock: 75,
        status: 'active',
        description: '크림이 풍부한 카푸치노',
        image: null,
        createdAt: '2024-01-17',
        updatedAt: '2024-01-22',
        salesCount: 720,
        rating: 4.6
      },
      {
        id: 4,
        name: '샌드위치',
        code: 'SW001',
        category: '식품',
        price: 8000,
        cost: 3000,
        profitMargin: 62.5,
        stock: 50,
        status: 'active',
        description: '신선한 샌드위치',
        image: null,
        createdAt: '2024-01-18',
        updatedAt: '2024-01-28',
        salesCount: 450,
        rating: 4.3
      },
      {
        id: 5,
        name: '샐러드',
        code: 'SL001',
        category: '식품',
        price: 12000,
        cost: 4500,
        profitMargin: 62.5,
        stock: 30,
        status: 'active',
        description: '건강한 샐러드',
        image: null,
        createdAt: '2024-01-19',
        updatedAt: '2024-01-30',
        salesCount: 280,
        rating: 4.7
      },
      {
        id: 6,
        name: '티라미수',
        code: 'TR001',
        category: '디저트',
        price: 6500,
        cost: 2200,
        profitMargin: 66.2,
        stock: 40,
        status: 'active',
        description: '이탈리안 디저트',
        image: null,
        createdAt: '2024-01-20',
        updatedAt: '2024-02-01',
        salesCount: 320,
        rating: 4.9
      },
      {
        id: 7,
        name: '치즈케이크',
        code: 'CK001',
        category: '디저트',
        price: 7000,
        cost: 2500,
        profitMargin: 64.3,
        stock: 35,
        status: 'active',
        description: '부드러운 치즈케이크',
        image: null,
        createdAt: '2024-01-21',
        updatedAt: '2024-02-02',
        salesCount: 290,
        rating: 4.4
      },
      {
        id: 8,
        name: '감자튀김',
        code: 'FF001',
        category: '사이드',
        price: 3500,
        cost: 1200,
        profitMargin: 65.7,
        stock: 60,
        status: 'inactive',
        description: '바삭한 감자튀김',
        image: null,
        createdAt: '2024-01-22',
        updatedAt: '2024-02-03',
        salesCount: 180,
        rating: 4.2
      }
    ];

    setCategories(sampleCategories);
    setProducts(sampleProducts);
  }, []);

  const handleAddProduct = (newProduct) => {
    setProducts([...products, { ...newProduct, id: Date.now() }]);
    setShowAddProductModal(false);
  };

  const handleEditProduct = (updatedProduct) => {
    setProducts(products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
    setShowEditProductModal(false);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      setProducts(products.filter(product => product.id !== productId));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getStatusText = (status) => {
    return status === 'active' ? '활성' : '비활성';
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const avgProfitMargin = products.reduce((sum, p) => sum + p.profitMargin, 0) / products.length;

  return (
    <div className={styles['product-list']}>
      <div className={styles['product-list-header']}>
        <h1>상품 목록</h1>
      </div>

      <div className={styles['tab-container']}>
        <button
          className={`${styles['tab-button']} ${activeTab === 'product-list' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('product-list')}
        >
          상품 목록
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'product-analytics' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('product-analytics')}
        >
          상품 분석
        </button>
      </div>

      {activeTab === 'product-list' && (
        <div className={styles['product-management']}>
          {/* 요약 카드 */}
          <div className={styles['summary-cards']}>
            <div className={styles['summary-card']}>
              <div className={styles['summary-icon']}>
                <img src={productIcon} alt="총 상품" />
              </div>
              <div className={styles['summary-content']}>
                <h3>총 상품</h3>
                <div className={styles['summary-number']}>{totalProducts}개</div>
              </div>
            </div>
            <div className={styles['summary-card']}>
              <div className={styles['summary-icon']}>
                <img src={productIcon} alt="활성 상품" />
              </div>
              <div className={styles['summary-content']}>
                <h3>활성 상품</h3>
                <div className={styles['summary-number']}>{activeProducts}개</div>
              </div>
            </div>
            <div className={styles['summary-card']}>
              <div className={styles['summary-icon']}>
                <img src={dollorIcon} alt="총 재고 가치" />
              </div>
              <div className={styles['summary-content']}>
                <h3>총 재고 가치</h3>
                <div className={styles['summary-number']}>{formatCurrency(totalValue)}원</div>
              </div>
            </div>
            <div className={styles['summary-card']}>
              <div className={styles['summary-icon']}>
                <img src={percentIcon} alt="평균 수익률" />
              </div>
              <div className={styles['summary-content']}>
                <h3>평균 수익률</h3>
                <div className={styles['summary-number']}>{avgProfitMargin.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          <div className={styles['search-filter-container']}>
            <div className={styles['search-box']}>
              <div className={styles['search-input-container']}>
                <img 
                  src={searchIcon} 
                  alt="검색" 
                  className={styles['search-icon']}
                />
                <input
                  type="text"
                  placeholder="상품명 또는 코드로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles['search-input']}
                />
              </div>
            </div>
            <div className={styles['filter-box']}>
              <select
                className={styles['filter-select']}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">전체 카테고리</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles['filter-box']}>
              <select
                className={styles['filter-select']}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">전체 상태</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
            <button
              className={`btn btn-primary ${styles['add-button']}`}
              onClick={() => setShowAddProductModal(true)}
            >
              <img src={plusIcon} alt="추가" className={styles['button-icon']} />
              상품 추가
            </button>
          </div>

          <div className={styles['products-container']}>
            <div className={styles['products-list']}>
              <table className={styles['products-table']}>
                <thead className={styles['products-table-header']}>
                  <tr>
                    <th>상품명</th>
                    <th>코드</th>
                    <th>카테고리</th>
                    <th>판매가</th>
                    <th>원가</th>
                    <th>수익률</th>
                    <th>재고</th>
                    <th>판매량</th>
                    <th>상태</th>
                    <th>등록일</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className={styles['product-info']}>
                          <span className={styles['product-name']}>{product.name}</span>
                        </div>
                      </td>
                      <td>{product.code}</td>
                      <td>
                        <span className={`${styles['category-badge']} ${styles[`category-${product.category.toLowerCase()}`]}`}>
                          {product.category}
                        </span>
                      </td>
                      <td>{formatCurrency(product.price)}원</td>
                      <td>{formatCurrency(product.cost)}원</td>
                      <td>{product.profitMargin}%</td>
                      <td>
                        <span className={`${styles['stock-badge']} ${product.stock < 20 ? styles['low-stock'] : ''}`}>
                          {product.stock}개
                        </span>
                      </td>
                      <td>{formatCurrency(product.salesCount)}개</td>
                      <td>
                        <span className={`${styles['status-badge']} ${styles[`status-${product.status}`]}`}>
                          {getStatusText(product.status)}
                        </span>
                      </td>
                      <td>{product.createdAt}</td>
                      <td>
                        <div className={styles['action-buttons']}>
                          <button
                            className={`btn btn-small ${styles['btn-small']}`}
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowProductDetailModal(true);
                            }}
                          >
                            상세
                          </button>
                          <button
                            className={`btn btn-small ${styles['btn-small']}`}
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowEditProductModal(true);
                            }}
                          >
                            <img src={pencilIcon} alt="수정" className={styles['action-icon']} />
                          </button>
                          <button
                            className={`btn btn-small btn-danger ${styles['btn-small']}`}
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'product-analytics' && (
        <div className={styles['product-analytics']}>
          <div className={styles['analytics-header']}>
            <h2>상품 분석</h2>
            <p>상품별 매출, 수익률, 재고 현황을 분석할 수 있습니다.</p>
          </div>

          <div className={styles['analytics-grid']}>
            <div className={styles['analytics-card']}>
              <h3>카테고리별 상품 분포</h3>
              <div className={styles['category-distribution']}>
                {categories.map(category => {
                  const count = products.filter(p => p.category === category.name).length;
                  return (
                    <div key={category.id} className={styles['category-item']}>
                      <span className={styles['category-name']}>{category.name}</span>
                      <span className={styles['category-count']}>{count}개</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles['analytics-card']}>
              <h3>수익률 순위</h3>
              <div className={styles['profit-ranking']}>
                {[...products]
                  .sort((a, b) => b.profitMargin - a.profitMargin)
                  .slice(0, 5)
                  .map((product, index) => (
                    <div key={product.id} className={styles['ranking-item']}>
                      <span className={styles['ranking-number']}>{index + 1}</span>
                      <span className={styles['product-name']}>{product.name}</span>
                      <span className={styles['profit-margin']}>{product.profitMargin}%</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className={styles['analytics-card']}>
              <h3>재고 부족 상품</h3>
              <div className={styles['low-stock-list']}>
                {products
                  .filter(p => p.stock < 20)
                  .map(product => (
                    <div key={product.id} className={styles['stock-item']}>
                      <span className={styles['product-name']}>{product.name}</span>
                      <span className={styles['stock-count']}>{product.stock}개</span>
                    </div>
                  ))}
                {products.filter(p => p.stock < 20).length === 0 && (
                  <p className={styles['no-data']}>재고 부족 상품이 없습니다.</p>
                )}
              </div>
            </div>

            <div className={styles['analytics-card']}>
              <h3>판매량 순위</h3>
              <div className={styles['sales-ranking']}>
                {[...products]
                  .sort((a, b) => b.salesCount - a.salesCount)
                  .slice(0, 5)
                  .map((product, index) => (
                    <div key={product.id} className={styles['ranking-item']}>
                      <span className={styles['ranking-number']}>{index + 1}</span>
                      <span className={styles['product-name']}>{product.name}</span>
                      <span className={styles['sales-count']}>{formatCurrency(product.salesCount)}개</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상품 추가 모달 */}
      {showAddProductModal && (
        <AddProductModal
          categories={categories}
          onAdd={handleAddProduct}
          onClose={() => setShowAddProductModal(false)}
        />
      )}

      {/* 상품 수정 모달 */}
      {showEditProductModal && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          categories={categories}
          onUpdate={handleEditProduct}
          onClose={() => setShowEditProductModal(false)}
        />
      )}

      {/* 상품 상세 모달 */}
      {showProductDetailModal && selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setShowProductDetailModal(false)}
        />
      )}
    </div>
  );
}

// 상품 추가 모달 컴포넌트
function AddProductModal({ categories, onAdd, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    description: '',
    status: 'active'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const profitMargin = ((formData.price - formData.cost) / formData.price * 100).toFixed(1);
    onAdd({
      ...formData,
      price: parseInt(formData.price),
      cost: parseInt(formData.cost),
      stock: parseInt(formData.stock),
      profitMargin: parseFloat(profitMargin),
      salesCount: 0,
      rating: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>상품 추가</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>상품명 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="상품명을 입력하세요"
              />
            </div>
            <div className={styles['form-group']}>
              <label>상품 코드 *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                placeholder="상품 코드를 입력하세요"
              />
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>카테고리 *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles['form-group']}>
              <label>상태</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>판매가 *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                placeholder="판매가를 입력하세요"
              />
            </div>
            <div className={styles['form-group']}>
              <label>원가 *</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                required
                placeholder="원가를 입력하세요"
              />
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>재고 *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
                placeholder="재고 수량을 입력하세요"
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>상품 설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="상품에 대한 설명을 입력하세요"
              rows="3"
            />
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              상품 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 상품 수정 모달 컴포넌트
function EditProductModal({ product, categories, onUpdate, onClose }) {
  const [formData, setFormData] = useState(product);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const profitMargin = ((formData.price - formData.cost) / formData.price * 100).toFixed(1);
    onUpdate({
      ...formData,
      price: parseInt(formData.price),
      cost: parseInt(formData.cost),
      stock: parseInt(formData.stock),
      profitMargin: parseFloat(profitMargin),
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>상품 수정</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>상품명 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles['form-group']}>
              <label>상품 코드 *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>카테고리 *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles['form-group']}>
              <label>상태</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>판매가 *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles['form-group']}>
              <label>원가 *</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>재고 *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>상품 설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              수정 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 상품 상세 모달 컴포넌트
function ProductDetailModal({ product, onClose }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>상품 상세 정보</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <div className={styles['product-detail']}>
          <div className={styles['detail-section']}>
            <h3>기본 정보</h3>
            <div className={styles['detail-grid']}>
              <div className={styles['detail-item']}>
                <label>상품명</label>
                <span>{product.name}</span>
              </div>
              <div className={styles['detail-item']}>
                <label>상품 코드</label>
                <span>{product.code}</span>
              </div>
              <div className={styles['detail-item']}>
                <label>카테고리</label>
                <span className={`${styles['category-badge']} ${styles[`category-${product.category.toLowerCase()}`]}`}>
                  {product.category}
                </span>
              </div>
              <div className={styles['detail-item']}>
                <label>상태</label>
                <span className={`${styles['status-badge']} ${styles[`status-${product.status}`]}`}>
                  {product.status === 'active' ? '활성' : '비활성'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles['detail-section']}>
            <h3>가격 정보</h3>
            <div className={styles['detail-grid']}>
              <div className={styles['detail-item']}>
                <label>판매가</label>
                <span>{formatCurrency(product.price)}원</span>
              </div>
              <div className={styles['detail-item']}>
                <label>원가</label>
                <span>{formatCurrency(product.cost)}원</span>
              </div>
              <div className={styles['detail-item']}>
                <label>수익률</label>
                <span>{product.profitMargin}%</span>
              </div>
            </div>
          </div>

          <div className={styles['detail-section']}>
            <h3>재고 및 판매 정보</h3>
            <div className={styles['detail-grid']}>
              <div className={styles['detail-item']}>
                <label>현재 재고</label>
                <span className={`${styles['stock-badge']} ${product.stock < 20 ? styles['low-stock'] : ''}`}>
                  {product.stock}개
                </span>
              </div>
              <div className={styles['detail-item']}>
                <label>총 판매량</label>
                <span>{formatCurrency(product.salesCount)}개</span>
              </div>
              <div className={styles['detail-item']}>
                <label>평점</label>
                <span className={styles['rating']}>⭐ {product.rating}</span>
              </div>
            </div>
          </div>

          <div className={styles['detail-section']}>
            <h3>상품 설명</h3>
            <p className={styles['description']}>{product.description}</p>
          </div>

          <div className={styles['detail-section']}>
            <h3>등록 정보</h3>
            <div className={styles['detail-grid']}>
              <div className={styles['detail-item']}>
                <label>등록일</label>
                <span>{product.createdAt}</span>
              </div>
              <div className={styles['detail-item']}>
                <label>최종 수정일</label>
                <span>{product.updatedAt}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles['modal-actions']}>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
} 