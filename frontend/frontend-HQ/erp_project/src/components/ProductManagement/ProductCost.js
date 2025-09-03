import React, { useState, useEffect } from 'react';
import styles from './ProductCost.module.css';
import searchIcon from '../../assets/search_icon.png';
import dollorIcon from '../../assets/dollor_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import downloadIcon from '../../assets/download_icon.png';

export default function ProductCost() {
  const [activeTab, setActiveTab] = useState('price-management');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditPriceModal, setShowEditPriceModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API 기본 URL
  const API_BASE_URL = 'http://localhost:8080/api';
  
  // 현재 로그인된 사용자 정보 가져오기
  const getCurrentUser = () => {
    try {
      const loginData = localStorage.getItem('erpLoginData');
      if (loginData) {
        const userInfo = JSON.parse(loginData);
        return userInfo.realName || userInfo.username || '관리자';
      }
      return '관리자';
    } catch (error) {
      console.error('사용자 정보 파싱 오류:', error);
      return '관리자';
    }
  };

  // 상품 판매가 목록 조회
  const fetchProductPrices = async (category = 'all', searchTerm = '') => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/menus`;
      const params = new URLSearchParams();
      if (category && category !== 'all') {
        params.append('category', category);
      }
      if (searchTerm) {
        params.append('searchTerm', searchTerm);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('상품 판매가 데이터를 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      console.log('메뉴 데이터 응답:', data);
      console.log('첫 번째 메뉴의 updatedAt:', data[0]?.updatedAt);
      
      // 각 메뉴의 updatedAt 값 확인
      data.forEach((menu, index) => {
        console.log(`메뉴 ${index + 1} (${menu.name}): updatedAt =`, menu.updatedAt, 'type:', typeof menu.updatedAt);
      });
      
      setProducts(data);
    } catch (err) {
      setError(err.message);
      console.error('상품 판매가 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리별 판매가 분석 조회
  const fetchPriceAnalysis = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-categories`);
      if (!response.ok) {
        throw new Error('판매가 분석 데이터를 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('판매가 분석 조회 오류:', err);
    }
  };

  // 판매가 변경 이력 조회
  const fetchPriceHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/menus/price-history`);
      if (!response.ok) {
        throw new Error('판매가 변경 이력을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setPriceHistory(data);
    } catch (err) {
      console.error('판매가 변경 이력 조회 오류:', err);
      // 에러가 발생해도 빈 배열로 설정
      setPriceHistory([]);
    }
  };

  // 판매가 수정
  const updateProductPrice = async (productId, priceUpdate) => {
    try {
      const requestBody = {
        price: parseFloat(priceUpdate.newPrice),
        changeReason: priceUpdate.changeReason || '',
        updatedBy: getCurrentUser()
      };
      
      console.log('판매가 수정 요청 데이터:', requestBody);
      console.log('priceUpdate 객체:', priceUpdate);
      
      const response = await fetch(`${API_BASE_URL}/menus/${productId}/price`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '판매가 수정에 실패했습니다.');
      }

      const updatedProduct = await response.json();
      
      // 로컬 상태 업데이트 - 기존 product와 병합
      setProducts(products.map(product => 
        product.id === productId ? { ...product, price: updatedProduct.price } : product
      ));
      
      setShowEditPriceModal(false);
      setSelectedProduct(null);
      
      // 이력 데이터 새로고침
      fetchPriceHistory();
      
      // 성공 메시지 표시
      alert('판매가가 성공적으로 수정되었습니다.');
    } catch (err) {
      setError(err.message);
      console.error('판매가 수정 오류:', err);
      alert('판매가 수정에 실패했습니다: ' + err.message);
    }
  };

  // 판매가 데이터 내보내기
  const handleExportPriceData = async () => {
    try {
      // CSV 데이터 생성
      const headers = ['메뉴명', '카테고리', '판매가', '원가', '마진율', '원가율'];
      const csvContent = [
        headers.join(','),
        ...products.map(product => [
          product.name,
          product.category,
          product.price || 0,
          product.basePrice || 0,
          product.price && product.basePrice ? 
            (((product.price - product.basePrice) / product.price) * 100).toFixed(1) : 0,
          product.price && product.basePrice ? 
            ((product.basePrice / product.price) * 100).toFixed(1) : 0
        ].join(','))
      ].join('\n');
      
      // CSV 파일 다운로드
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `판매가데이터_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err.message);
      console.error('데이터 내보내기 오류:', err);
      alert('데이터 내보내기에 실패했습니다: ' + err.message);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchProductPrices();
    fetchPriceAnalysis();
    fetchPriceHistory();
  }, []);

  // 카테고리나 검색어 변경 시 데이터 재조회
  useEffect(() => {
    fetchProductPrices(selectedCategory, searchTerm);
  }, [selectedCategory, searchTerm]);

  const handleEditPrice = (product) => {
    setSelectedProduct(product);
    setShowEditPriceModal(true);
  };

  const handleUpdatePrice = (updatedProduct) => {
    updateProductPrice(updatedProduct.id, updatedProduct);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusText = (status) => {
    return status === 'active' ? '활성' : '비활성';
  };

  const getCategoryName = (category) => {
    const cat = categories.find(c => c.name === category);
    return cat ? cat.name : category;
  };

  // 마진율 계산
  const calculateMargin = (price, basePrice) => {
    if (!price || !basePrice) return 0;
    return ((price - basePrice) / price) * 100;
  };

  // 원가율 계산
  const calculateCostRatio = (price, basePrice) => {
    if (!price || !basePrice) return 0;
    return (basePrice / price) * 100;
  };

  // 날짜 형식화 함수
  const formatDate = (dateInput) => {
    if (!dateInput) {
      return '-';
    }
    
    try {
      let date;
      
      // 배열 형태의 날짜인지 확인 (Java LocalDateTime 직렬화 형태)
      if (Array.isArray(dateInput) && dateInput.length >= 6) {
        // [year, month, day, hour, minute, second, nanosecond] 형태
        const [year, month, day, hour, minute, second] = dateInput;
        // Java의 month는 1-based이므로 JavaScript의 0-based로 변환
        date = new Date(year, month - 1, day, hour, minute, second);
        console.log('배열 형태 날짜 파싱:', dateInput, '->', date);
      }
      // 문자열인 경우
      else if (typeof dateInput === 'string') {
        // ISO 형식인지 확인
        if (dateInput.includes('T')) {
          date = new Date(dateInput);
        } else if (dateInput.includes('-')) {
          // 날짜만 있는 경우 시간 추가
          date = new Date(dateInput + 'T00:00:00');
        } else {
          date = new Date(dateInput);
        }
      } 
      // Date 객체인 경우
      else {
        date = new Date(dateInput);
      }
      
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateInput);
        return '-';
      }
      
      // 한국어 형식으로 포맷
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'Input:', dateInput);
      return '-';
    }
  };

  if (loading && products.length === 0) {
    return <div className={styles.loading}>데이터를 불러오는 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>오류: {error}</div>;
  }

  return (
    <div className={styles['product-cost']}>
      <div className={styles['product-cost-header']}>
        <h1>메뉴별 판매가 설정</h1>
        <p>각 메뉴의 판매가를 설정하고 마진을 관리할 수 있습니다.</p>
      </div>

      <div className={styles['tab-container']}>
        <button
          className={`${styles['tab-button']} ${activeTab === 'price-management' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('price-management')}
        >
          판매가 관리
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'price-history' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('price-history')}
        >
          판매가 변경 이력
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'price-analysis' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('price-analysis')}
        >
          판매가 분석
        </button>
      </div>

      {activeTab === 'price-management' && (
        <div className={styles['cost-management']}>
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
                  placeholder="메뉴명 또는 코드로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles['search-input']}
                />
              </div>
            </div>
            <div className={styles['filter-box']}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={styles['filter-select']}
              >
                <option value="all">전체 카테고리</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className={`btn btn-primary ${styles['export-button']}`}
              onClick={handleExportPriceData}
            >
              <img src={downloadIcon} alt="내보내기" className={styles['button-icon']} />
              판매가 데이터 내보내기
            </button>
          </div>

          <div className={styles['cost-summary']}>
            <div className={styles['summary-card']}>
              <h3>전체 메뉴</h3>
              <p className={styles['summary-number']}>{filteredProducts.length}개</p>
            </div>
            <div className={styles['summary-card']}>
              <h3>평균 마진율</h3>
              <p className={styles['summary-number']}>
                {filteredProducts.length > 0 
                  ? (filteredProducts.reduce((sum, product) => 
                      sum + calculateMargin(product.price, product.basePrice), 0) / filteredProducts.length).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className={styles['summary-card']}>
              <h3>평균 원가율</h3>
              <p className={styles['summary-number']}>
                {filteredProducts.length > 0 
                  ? (filteredProducts.reduce((sum, product) => 
                      sum + calculateCostRatio(product.price, product.basePrice), 0) / filteredProducts.length).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>

          <div className={styles['products-container']}>
            <div className={styles['products-list']}>
              <table className={styles['products-table']}>
                <thead className={styles['products-table-header']}>
                  <tr>
                    <th>메뉴명</th>
                    <th>카테고리</th>
                    <th>판매가</th>
                    <th>원가</th>
                    <th>마진</th>
                    <th>원가율</th>
                    <th>최종 수정일</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const margin = calculateMargin(product.price, product.basePrice);
                    const costRatio = calculateCostRatio(product.price, product.basePrice);
                    
                    return (
                      <tr key={product.id}>
                        <td>
                          <div className={styles['product-info']}>
                            <span className={styles['product-name']}>{product.name}</span>
                          </div>
                        </td>
                        <td>{getCategoryName(product.category)}</td>
                        <td>{product.price ? product.price.toLocaleString() : 0}원</td>
                        <td>{product.basePrice ? product.basePrice.toLocaleString() : 0}원</td>
                        <td>
                          <span className={`${styles['margin-badge']} ${margin >= 60 ? styles['high-margin'] : margin >= 40 ? styles['medium-margin'] : styles['low-margin']}`}>
                            {margin.toFixed(1)}%
                          </span>
                        </td>
                        <td>
                          <span className={`${styles['cost-ratio-badge']} ${costRatio <= 30 ? styles['low-cost'] : costRatio <= 50 ? styles['medium-cost'] : styles['high-cost']}`}>
                            {costRatio.toFixed(1)}%
                          </span>
                        </td>
                        <td>{product.updatedAt ? formatDate(product.updatedAt) : '-'}</td>
                        <td>
                          <div className={styles['action-buttons']}>
                            <button
                              className={`btn btn-primary btn-small ${styles['btn-small']}`}
                              onClick={() => handleEditPrice(product)}
                            >
                              수정
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'price-history' && (
        <div className={styles['cost-history']}>
          <div className={styles['history-header']}>
            <h2>판매가 변경 이력</h2>
            <p>메뉴별 판매가 변경 내역을 확인할 수 있습니다.</p>
          </div>

          <div className={styles['history-container']}>
            {priceHistory.length === 0 ? (
              <div className={styles['no-data']}>
                <p>아직 판매가 변경 이력이 없습니다.</p>
                <p>메뉴의 판매가를 수정하면 여기에 변경 이력이 표시됩니다.</p>
              </div>
            ) : (
              <div className={styles['history-list']}>
                <table className={styles['history-table']}>
                  <thead className={styles['history-table-header']}>
                    <tr>
                      <th>메뉴명</th>
                      <th>이전 판매가</th>
                      <th>변경 판매가</th>
                      <th>변경 금액</th>
                      <th>변경 사유</th>
                      <th>변경일</th>
                      <th>수정자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceHistory.map(history => (
                      <tr key={history.id}>
                        <td>{history.menuName || history.productName || '-'}</td>
                        <td>{history.oldPrice ? history.oldPrice.toLocaleString() : 0}원</td>
                        <td>{history.newPrice ? history.newPrice.toLocaleString() : 0}원</td>
                        <td>
                          <span className={`${styles['change-amount']} ${(history.newPrice || 0) > (history.oldPrice || 0) ? styles['increase'] : styles['decrease']}`}>
                            {(history.newPrice || 0) > (history.oldPrice || 0) ? '+' : ''}{((history.newPrice || 0) - (history.oldPrice || 0)).toLocaleString()}원
                          </span>
                        </td>
                        <td>{history.reason || '-'}</td>
                        <td>{history.changeDate ? formatDate(history.changeDate) : '-'}</td>
                        <td>{history.updatedBy || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'price-analysis' && (
        <div className={styles['cost-analysis']}>
          <div className={styles['analysis-header']}>
            <h2>판매가 분석</h2>
            <p>카테고리별 판매가 현황과 마진 분석을 확인할 수 있습니다.</p>
          </div>

          <div className={styles['analysis-grid']}>
            {categories.map(category => {
              const categoryProducts = products.filter(product => product.category === category.name);
              const avgMargin = categoryProducts.length > 0 
                ? categoryProducts.reduce((sum, product) => 
                    sum + calculateMargin(product.price, product.basePrice), 0) / categoryProducts.length
                : 0;
              const avgCostRatio = categoryProducts.length > 0 
                ? categoryProducts.reduce((sum, product) => 
                    sum + calculateCostRatio(product.price, product.basePrice), 0) / categoryProducts.length
                : 0;

              return (
                <div key={category.id} className={styles['analysis-card']}>
                  <h3>{category.name}</h3>
                  <div className={styles['analysis-stats']}>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>메뉴 수</span>
                      <span className={styles['stat-value']}>{categoryProducts.length}개</span>
                    </div>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>평균 마진율</span>
                      <span className={`${styles['stat-value']} ${avgMargin >= 60 ? styles['high-margin'] : avgMargin >= 40 ? styles['medium-margin'] : styles['low-margin']}`}>
                        {avgMargin.toFixed(1)}%
                      </span>
                    </div>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>평균 원가율</span>
                      <span className={`${styles['stat-value']} ${avgCostRatio <= 30 ? styles['low-cost'] : avgCostRatio <= 50 ? styles['medium-cost'] : styles['high-cost']}`}>
                        {avgCostRatio.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className={styles['category-products']}>
                    {categoryProducts.map(product => {
                      const margin = calculateMargin(product.price, product.basePrice);
                      return (
                        <div key={product.id} className={styles['mini-product-card']}>
                          <span className={styles['mini-product-name']}>{product.name}</span>
                          <span className={styles['mini-product-margin']}>{margin.toFixed(1)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 판매가 수정 모달 */}
      {showEditPriceModal && selectedProduct && (
        <EditPriceModal
          product={selectedProduct}
          onUpdate={handleUpdatePrice}
          onClose={() => setShowEditPriceModal(false)}
        />
      )}
    </div>
  );
}

// 판매가 수정 모달 컴포넌트
function EditPriceModal({ product, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    ...product,
    newPrice: product.price ? product.price.toString() : '0',
    changeReason: ''
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
    const updatedProduct = {
      ...product,
      newPrice: formData.newPrice,
      changeReason: formData.changeReason
    };
    
    console.log('EditPriceModal - formData:', formData);
    console.log('EditPriceModal - updatedProduct:', updatedProduct);
    
    onUpdate(updatedProduct);
  };

  const margin = product.price && formData.newPrice 
    ? ((parseFloat(formData.newPrice) - (product.basePrice || 0)) / parseFloat(formData.newPrice) * 100).toFixed(1)
    : 0;
  const costRatio = product.basePrice && formData.newPrice 
    ? ((product.basePrice || 0) / parseFloat(formData.newPrice) * 100).toFixed(1)
    : 0;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>{product.name} 판매가 수정</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['product-info-display']}>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>메뉴명:</span>
              <span className={styles['info-value']}>{product.name}</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>현재 판매가:</span>
              <span className={styles['info-value']}>{product.price ? product.price.toLocaleString() : 0}원</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>원가:</span>
              <span className={styles['info-value']}>{product.basePrice ? product.basePrice.toLocaleString() : 0}원</span>
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>새 판매가 *</label>
              <input
                type="number"
                name="newPrice"
                value={formData.newPrice}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="판매가를 입력하세요"
              />
            </div>
            <div className={styles['form-group']}>
              <label>변경 사유</label>
              <input
                type="text"
                name="changeReason"
                value={formData.changeReason}
                onChange={handleInputChange}
                placeholder="변경 사유를 입력하세요"
              />
            </div>
          </div>

          <div className={styles['cost-preview']}>
            <div className={styles['preview-item']}>
              <span className={styles['preview-label']}>예상 마진율:</span>
              <span className={`${styles['preview-value']} ${margin >= 60 ? styles['high-margin'] : margin >= 40 ? styles['medium-margin'] : styles['low-margin']}`}>
                {margin}%
              </span>
            </div>
            <div className={styles['preview-item']}>
              <span className={styles['preview-label']}>예상 원가율:</span>
              <span className={`${styles['preview-value']} ${costRatio <= 30 ? styles['low-cost'] : costRatio <= 50 ? styles['medium-cost'] : styles['high-cost']}`}>
                {costRatio}%
              </span>
            </div>
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              판매가 수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 