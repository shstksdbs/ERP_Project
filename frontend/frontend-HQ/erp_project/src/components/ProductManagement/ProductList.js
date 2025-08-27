import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductList.module.css';
import searchIcon from '../../assets/search_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import productIcon from '../../assets/product_icon.png';
import dollorIcon from '../../assets/dollor_icon.png';
import percentIcon from '../../assets/percent_icon.png';

export default function ProductList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('product-list');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API 기본 URL
  const API_BASE_URL = 'http://localhost:8080/api';

  // 카테고리 목록 상태
  const [categories, setCategories] = useState([]);

  // 실제 메뉴 데이터 가져오기
  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, []);

  // 카테고리 데이터 가져오기
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const categoriesData = await response.json();
      setCategories(categoriesData);
      console.log('카테고리 데이터 로드 성공:', categoriesData);
    } catch (err) {
      console.error('카테고리 데이터 가져오기 오류:', err);
      // 오류 발생 시 기본 카테고리로 폴백
      setCategories([
        { id: 1, name: 'BURGER', displayName: 'BURGER' },
        { id: 2, name: 'SET', displayName: 'SET' },
        { id: 3, name: 'SIDE', displayName: 'SIDE' },
        { id: 4, name: 'DRINK', displayName: 'DRINK' }
      ]);
    }
  };

  // 메뉴 데이터 가져오기
  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/menus`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      let menus;
      try {
        menus = await response.json();
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        throw new Error('서버 응답을 파싱할 수 없습니다. 응답 형식을 확인해주세요.');
      }
      
      if (!Array.isArray(menus)) {
        throw new Error('메뉴 데이터 형식이 올바르지 않습니다.');
      }
      
      // Menu 엔티티 데이터를 ProductList 형식에 맞게 변환
      const transformedProducts = menus.map(menu => ({
        id: menu.id,
        name: menu.name || '이름 없음',
        code: menu.code || `MENU${menu.id}`,
        category: menu.category || '카테고리 없음',
        price: menu.price || 0,
        cost: menu.basePrice || 0,
        profit: menu.price && menu.basePrice ? 
          Math.round(((menu.price - menu.basePrice) / menu.price) * 100) : 0,
        sales: Math.floor(Math.random() * 100) + 1, // 임시 데이터
        status: menu.isAvailable !== undefined ? (menu.isAvailable ? 'active' : 'inactive') : 'active',
        image: menu.imageUrl ? (menu.imageUrl.startsWith('http') ? menu.imageUrl : `http://localhost:8080${menu.imageUrl}`) : null,
        stock: Math.floor(Math.random() * 100) + 20, // 임시 재고 데이터
        profitMargin: menu.price && menu.basePrice ? 
          Math.round(((menu.price - menu.basePrice) / menu.price) * 100) : 0,
        salesCount: Math.floor(Math.random() * 1000) + 100, // 임시 판매량
        rating: (Math.random() * 2 + 3).toFixed(1), // 임시 평점
        createdAt: menu.createdAt ? menu.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        updatedAt: menu.updatedAt ? menu.updatedAt.split('T')[0] : new Date().toISOString().split('T')[0],
        description: menu.description || '상품 설명이 없습니다.'
      }));
      
      setProducts(transformedProducts);
      console.log('메뉴 데이터 로드 성공:', transformedProducts);
    } catch (err) {
      console.error('메뉴 데이터 가져오기 오류:', err);
      
      // 네트워크 오류인지 확인
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else {
        setError(`메뉴 데이터를 가져오는데 실패했습니다: ${err.message}`);
      }
      
      // 오류 발생 시 샘플 데이터로 폴백
      setProducts(getSampleProducts());
    } finally {
      setLoading(false);
    }
  };

  // 샘플 상품 데이터 (폴백용)
  const getSampleProducts = () => [
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
    }
  ];



  // 상품 수정 (API 호출)
  const handleEditProduct = async (updatedProduct) => {
    try {
      // 카테고리 이름을 기반으로 categoryId 찾기
      const categoryObj = categories.find(cat => cat.name === updatedProduct.category);
      const categoryId = categoryObj ? categoryObj.id : null;

      const menuData = {
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        category: updatedProduct.category,
        categoryId: categoryId, // 카테고리 ID 추가
        basePrice: updatedProduct.cost,
        isAvailable: updatedProduct.status === 'active',
        displayOrder: updatedProduct.displayOrder || 0,
        imageUrl: updatedProduct.image // 기존 이미지 URL 유지
      };

      const response = await fetch(`${API_BASE_URL}/menus/${updatedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(menuData)
      });

              if (response.ok) {
          // 수정 성공 후 전체 메뉴 데이터를 다시 가져와서 이미지 데이터 유지
          await fetchMenus();
          setShowEditProductModal(false);
          alert('상품이 성공적으로 수정되었습니다.');
      } else {
        // 에러 응답 처리 개선
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.warn('에러 응답 파싱 실패:', parseError);
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('상품 수정 오류:', err);
      alert('상품 수정에 실패했습니다: ' + err.message);
    }
  };

  // 상품 삭제 (API 호출)
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/menus/${productId}`, {
          method: 'DELETE',
          mode: 'cors'
        });

        if (response.ok) {
          // 삭제 성공 후 목록 새로고침
          await fetchMenus();
          alert('상품이 성공적으로 삭제되었습니다.');
        } else {
          // 에러 응답 처리 개선
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (parseError) {
            console.warn('에러 응답 파싱 실패:', parseError);
          }
          throw new Error(errorMessage);
        }
      } catch (err) {
        console.error('상품 삭제 오류:', err);
        alert('상품 삭제에 실패했습니다: ' + err.message);
      }
    }
  };

  // API 연결 테스트
  const testApiConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/menus`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      if (response.ok) {
        alert('API 연결 성공! 백엔드 서버가 정상적으로 응답합니다.');
      } else {
        throw new Error(`API 연결 실패. HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      alert('API 연결 실패: ' + err.message);
    } finally {
      setLoading(false);
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
        {/* <div className={styles['header-buttons']}>
          <button 
            className={`btn btn-secondary ${styles['test-api-button']}`}
            onClick={testApiConnection}
            disabled={loading}
          >
            API 연결 테스트
          </button>
          <button 
            className={`btn btn-secondary ${styles['refresh-button']}`}
            onClick={fetchMenus}
            disabled={loading}
          >
            {loading ? '새로고침 중...' : '새로고침'}
          </button>
        </div> */}
      </div>

      {/* 오류 메시지 표시 */}
      {error && (
        <div className={styles['error-message']}>
          <p>⚠️ {error}</p>
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setError(null);
              fetchMenus();
            }}
          >
            다시 시도
          </button>
        </div>
      )}

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
                <div className={styles['summary-number']}>
                  {loading ? '...' : `${totalProducts}개`}
                </div>
              </div>
            </div>
            <div className={styles['summary-card']}>
              <div className={styles['summary-icon']}>
                <img src={productIcon} alt="활성 상품" />
              </div>
              <div className={styles['summary-content']}>
                <h3>활성 상품</h3>
                <div className={styles['summary-number']}>
                  {loading ? '...' : `${activeProducts}개`}
                </div>
              </div>
            </div>
            <div className={styles['summary-card']}>
              <div className={styles['summary-icon']}>
                <img src={dollorIcon} alt="총 재고 가치" />
              </div>
              <div className={styles['summary-content']}>
                <h3>총 재고 가치</h3>
                <div className={styles['summary-number']}>
                  {loading ? '...' : `${formatCurrency(totalValue)}원`}
                </div>
              </div>
            </div>
            <div className={styles['summary-card']}>
              <div className={styles['summary-icon']}>
                <img src={percentIcon} alt="평균 수익률" />
              </div>
              <div className={styles['summary-content']}>
                <h3>평균 수익률</h3>
                <div className={styles['summary-number']}>
                  {loading ? '...' : `${avgProfitMargin.toFixed(1)}%`}
                </div>
              </div>
            </div>
          </div>

          <div className={styles['search-filter-container']}>
            <div className={styles['search-filter-left']}>
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
            </div>
                                                   <button
                className={`btn btn-primary ${styles['add-button']}`}
                onClick={() => navigate('/product-register')}
              >
                <img src={plusIcon} alt="추가" className={styles['button-icon']} />
                상품 추가
              </button>
          </div>

          <div className={styles['products-container']}>
            {/* 로딩 상태 표시 */}
            {loading && (
              <div className={styles['loading-container']}>
                <div className={styles['loading-spinner']}></div>
                <p>상품 데이터를 불러오는 중...</p>
              </div>
            )}

            {/* 상품 목록 테이블 */}
            {!loading && (
              <div className={styles['products-list']}>
                {filteredProducts.length === 0 ? (
                  <div className={styles['no-products']}>
                    <p>표시할 상품이 없습니다.</p>
                    {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' ? (
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('all');
                          setSelectedStatus('all');
                        }}
                      >
                        필터 초기화
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <table className={styles['products-table']}>
                    <thead className={styles['products-table-header']}>
                      <tr>
                        <th>상품명</th>
                        <th>카테고리</th>
                        <th>판매가</th>
                        <th>원가</th>
                        <th>수익률</th>
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
                                                               {product.image && (
                                  <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className={styles['product-image']}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                               <span className={styles['product-name']}>{product.name}</span>
                             </div>
                           </td>
                          <td>
                            <span className={`${styles['category-badge']} ${styles[`category-${product.category.toLowerCase()}`]}`}>
                              {product.category}
                            </span>
                          </td>
                          <td>{formatCurrency(product.price)}원</td>
                          <td>{formatCurrency(product.cost)}원</td>
                          <td>{product.profitMargin}%</td>
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
                                className={`btn btn-primary btn-small ${styles['btn-small']}`}
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowEditProductModal(true);
                                }}
                              >
                                {/* <img src={pencilIcon} alt="수정" className={styles['action-icon']} /> */}
                                수정
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
                )}
              </div>
            )}
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



// 상품 수정 모달 컴포넌트
function EditProductModal({ product, categories, onUpdate, onClose }) {
  const [formData, setFormData] = useState(product);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (product.image) {
      // 이미지가 상대 경로인 경우 절대 경로로 변환
      let imageUrl = product.image;
      if (imageUrl && !imageUrl.startsWith('http') && imageUrl.startsWith('/uploads/')) {
        imageUrl = `http://localhost:8080${imageUrl}`;
      }
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
  }, [product.image]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 이미지가 선택된 경우 FormData로 전송
      if (selectedImage) {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('price', formData.price);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('basePrice', formData.cost);
        formDataToSend.append('isAvailable', formData.status === 'active');
        formDataToSend.append('displayOrder', formData.displayOrder || 0);
        formDataToSend.append('image', selectedImage);

        const response = await fetch(`http://localhost:8080/api/menus/${product.id}/with-image`, {
          method: 'PUT',
          mode: 'cors',
          body: formDataToSend
        });

        if (response.ok) {
          alert('상품이 성공적으로 수정되었습니다.');
          onClose();
          // 부모 컴포넌트에서 목록 새로고침
          window.location.reload();
        } else {
          throw new Error('상품 수정에 실패했습니다.');
        }
      } else {
        // 이미지가 선택되지 않은 경우 기존 방식으로 전송
        const profitMargin = ((formData.price - formData.cost) / formData.price * 100).toFixed(1);
        onUpdate({
          ...formData,
          price: parseInt(formData.price),
          cost: parseInt(formData.cost),
          profitMargin: parseFloat(profitMargin),
          updatedAt: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      alert('상품 수정 중 오류가 발생했습니다: ' + error.message);
    }
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
                    {category.displayName || category.name}
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
              <label>원가</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                disabled
                className={styles['disabled-input']}
              />
              <small className={styles['field-note']}>
                원가 수정은 '메뉴별 원가 설정' 탭에서 가능합니다.
              </small>
            </div>
          </div>



          <div className={styles['form-group']}>
            <label>상품 이미지</label>
            <div className={styles['image-upload-container']}>
              {/* 현재 이미지 표시 */}
              {imagePreview ? (
                <div className={styles['current-image']}>
                  <img 
                    src={imagePreview} 
                    alt="현재 이미지" 
                    className={styles['image-preview']}
                  />
                  <p className={styles['image-label']}>현재 이미지</p>
                </div>
              ) : (
                <div className={styles['no-image']}>
                  <span className={styles['no-image-icon']}>📷</span>
                  <p className={styles['no-image-text']}>등록된 이미지가 없습니다</p>
                </div>
              )}
              
              {/* 이미지 업로드 입력 */}
              <div className={styles['image-upload']}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles['file-input']}
                  id="image-upload"
                />
                <label htmlFor="image-upload" className={styles['file-input-label']}>
                  {selectedImage ? '이미지 변경됨' : '이미지 변경'}
                </label>
                {selectedImage && (
                  <p className={styles['selected-file']}>
                    선택된 파일: {selectedImage.name}
                  </p>
                )}
              </div>
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