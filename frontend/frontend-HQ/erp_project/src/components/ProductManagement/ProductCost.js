import React, { useState, useEffect } from 'react';
import styles from './ProductCost.module.css';
import searchIcon from '../../assets/search_icon.png';
import dollorIcon from '../../assets/dollor_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import downloadIcon from '../../assets/download_icon.png';

export default function ProductCost() {
  const [activeTab, setActiveTab] = useState('cost-management');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditCostModal, setShowEditCostModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [costHistory, setCostHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API 기본 URL
  const API_BASE_URL = 'http://localhost:8080/api';

  // 상품 원가 목록 조회
  const fetchProductCosts = async (category = 'all', searchTerm = '') => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/product-cost/products`;
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
        throw new Error('상품 원가 데이터를 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
      console.error('상품 원가 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리별 원가 분석 조회
  const fetchCostAnalysis = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/product-cost/analysis`);
      if (!response.ok) {
        throw new Error('원가 분석 데이터를 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      // 카테고리 정보 추출
      const categoryList = data.map(item => ({
        id: item.categoryId,
        name: item.categoryName,
        code: item.categoryCode
      }));
      setCategories(categoryList);
    } catch (err) {
      console.error('원가 분석 조회 오류:', err);
    }
  };

  // 원가 변경 이력 조회
  const fetchCostHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/product-cost/history`);
      if (!response.ok) {
        throw new Error('원가 변경 이력을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setCostHistory(data);
    } catch (err) {
      console.error('원가 변경 이력 조회 오류:', err);
    }
  };

  // 원가 수정
  const updateProductCost = async (productId, costUpdate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/product-cost/${productId}/cost`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(costUpdate),
      });

      if (!response.ok) {
        throw new Error('원가 수정에 실패했습니다.');
      }

      const updatedProduct = await response.json();
      
      // 로컬 상태 업데이트
      setProducts(products.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      ));
      
      setShowEditCostModal(false);
      setSelectedProduct(null);
      
      // 원가 변경 이력 새로고침
      fetchCostHistory();
      
      // 성공 메시지 표시 (실제로는 토스트나 알림 컴포넌트 사용)
      alert('원가가 성공적으로 수정되었습니다.');
    } catch (err) {
      setError(err.message);
      console.error('원가 수정 오류:', err);
      alert('원가 수정에 실패했습니다: ' + err.message);
    }
  };

  // 원가 데이터 내보내기
  const handleExportCostData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/product-cost/export`);
      if (!response.ok) {
        throw new Error('데이터 내보내기에 실패했습니다.');
      }
      
      const csvData = await response.text();
      
      // CSV 파일 다운로드
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `원가데이터_${new Date().toISOString().split('T')[0]}.csv`);
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
    fetchProductCosts();
    fetchCostAnalysis();
    fetchCostHistory();
  }, []);

  // 카테고리나 검색어 변경 시 데이터 재조회
  useEffect(() => {
    fetchProductCosts(selectedCategory, searchTerm);
  }, [selectedCategory, searchTerm]);

  const handleEditCost = (product) => {
    setSelectedProduct(product);
    setShowEditCostModal(true);
  };

  const handleUpdateCost = (updatedProduct) => {
    updateProductCost(updatedProduct.id, updatedProduct);
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

  if (loading && products.length === 0) {
    return <div className={styles.loading}>데이터를 불러오는 중...</div>;
  }

  if (error) {
    return <div className={styles.error}>오류: {error}</div>;
  }

  return (
    <div className={styles['product-cost']}>
      <div className={styles['product-cost-header']}>
        <h1>메뉴별 원가 설정</h1>
        <p>각 메뉴의 원가를 설정하고 마진을 관리할 수 있습니다.</p>
      </div>

      <div className={styles['tab-container']}>
        <button
          className={`${styles['tab-button']} ${activeTab === 'cost-management' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('cost-management')}
        >
          원가 관리
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'cost-history' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('cost-history')}
        >
          원가 변경 이력
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'cost-analysis' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('cost-analysis')}
        >
          원가 분석
        </button>
      </div>

      {activeTab === 'cost-management' && (
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
              onClick={handleExportCostData}
            >
              <img src={downloadIcon} alt="내보내기" className={styles['button-icon']} />
              원가 데이터 내보내기
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
                  ? (filteredProducts.reduce((sum, product) => sum + (product.margin || 0), 0) / filteredProducts.length).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className={styles['summary-card']}>
              <h3>평균 원가율</h3>
              <p className={styles['summary-number']}>
                {filteredProducts.length > 0 
                  ? (filteredProducts.reduce((sum, product) => sum + (product.costRatio || 0), 0) / filteredProducts.length).toFixed(1)
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
                  {filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td>
                        <div className={styles['product-info']}>
                          <span className={styles['product-name']}>{product.name}</span>
                        </div>
                      </td>
                      <td>{getCategoryName(product.category)}</td>
                      <td>{product.sellingPrice ? product.sellingPrice.toLocaleString() : 0}원</td>
                      <td>{product.costPrice ? product.costPrice.toLocaleString() : 0}원</td>
                      <td>
                        <span className={`${styles['margin-badge']} ${(product.margin || 0) >= 60 ? styles['high-margin'] : (product.margin || 0) >= 40 ? styles['medium-margin'] : styles['low-margin']}`}>
                          {product.margin ? product.margin.toFixed(1) : 0}%
                        </span>
                      </td>
                      <td>
                        <span className={`${styles['cost-ratio-badge']} ${(product.costRatio || 0) <= 30 ? styles['low-cost'] : (product.costRatio || 0) <= 50 ? styles['medium-cost'] : styles['high-cost']}`}>
                          {product.costRatio ? product.costRatio.toFixed(1) : 0}%
                        </span>
                      </td>
                      <td>{product.lastUpdated ? new Date(product.lastUpdated).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className={styles['action-buttons']}>
                          <button
                            className={`btn btn-primary btn-small ${styles['btn-small']}`}
                            onClick={() => handleEditCost(product)}
                          >
                            수정
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

      {activeTab === 'cost-history' && (
        <div className={styles['cost-history']}>
          <div className={styles['history-header']}>
            <h2>원가 변경 이력</h2>
            <p>메뉴별 원가 변경 내역을 확인할 수 있습니다.</p>
          </div>

          <div className={styles['history-container']}>
            {costHistory.length === 0 ? (
              <div className={styles['no-data']}>
                <p>아직 원가 변경 이력이 없습니다.</p>
                <p>메뉴의 원가를 수정하면 여기에 변경 이력이 표시됩니다.</p>
              </div>
            ) : (
              <div className={styles['history-list']}>
                <table className={styles['history-table']}>
                  <thead className={styles['history-table-header']}>
                    <tr>
                      <th>메뉴명</th>
                      <th>이전 원가</th>
                      <th>변경 원가</th>
                      <th>변경 금액</th>
                      <th>변경 사유</th>
                      <th>변경일</th>
                      <th>수정자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costHistory.map(history => (
                      <tr key={history.id}>
                        <td>{history.productName}</td>
                        <td>{history.oldCost ? history.oldCost.toLocaleString() : 0}원</td>
                        <td>{history.newCost ? history.newCost.toLocaleString() : 0}원</td>
                        <td>
                          <span className={`${styles['change-amount']} ${(history.newCost || 0) > (history.oldCost || 0) ? styles['increase'] : styles['decrease']}`}>
                            {(history.newCost || 0) > (history.oldCost || 0) ? '+' : ''}{((history.newCost || 0) - (history.oldCost || 0)).toLocaleString()}원
                          </span>
                        </td>
                        <td>{history.reason || '-'}</td>
                        <td>{history.changeDate ? new Date(history.changeDate).toLocaleDateString() : '-'}</td>
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

      {activeTab === 'cost-analysis' && (
        <div className={styles['cost-analysis']}>
          <div className={styles['analysis-header']}>
            <h2>원가 분석</h2>
            <p>카테고리별 원가 현황과 마진 분석을 확인할 수 있습니다.</p>
          </div>

          <div className={styles['analysis-grid']}>
            {categories.map(category => {
              const categoryProducts = products.filter(product => product.category === category.name);
              const avgMargin = categoryProducts.length > 0 
                ? categoryProducts.reduce((sum, product) => sum + (product.margin || 0), 0) / categoryProducts.length
                : 0;
              const avgCostRatio = categoryProducts.length > 0 
                ? categoryProducts.reduce((sum, product) => sum + (product.costRatio || 0), 0) / categoryProducts.length
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
                    {categoryProducts.map(product => (
                      <div key={product.id} className={styles['mini-product-card']}>
                        <span className={styles['mini-product-name']}>{product.name}</span>
                        <span className={styles['mini-product-margin']}>{product.margin ? product.margin.toFixed(1) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 원가 수정 모달 */}
      {showEditCostModal && selectedProduct && (
        <EditCostModal
          product={selectedProduct}
          onUpdate={handleUpdateCost}
          onClose={() => setShowEditCostModal(false)}
        />
      )}
    </div>
  );
}

// 원가 수정 모달 컴포넌트
function EditCostModal({ product, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    ...product,
    newCostPrice: product.costPrice ? product.costPrice.toString() : '0',
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
      newCostPrice: formData.newCostPrice,
      changeReason: formData.changeReason
    };
    onUpdate(updatedProduct);
  };

  const margin = product.sellingPrice && formData.newCostPrice 
    ? ((product.sellingPrice - parseFloat(formData.newCostPrice)) / product.sellingPrice * 100).toFixed(1)
    : 0;
  const costRatio = product.sellingPrice && formData.newCostPrice 
    ? (parseFloat(formData.newCostPrice) / product.sellingPrice * 100).toFixed(1)
    : 0;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>{product.name} 원가 수정</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['product-info-display']}>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>메뉴명:</span>
              <span className={styles['info-value']}>{product.name}</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>판매가:</span>
              <span className={styles['info-value']}>{product.sellingPrice ? product.sellingPrice.toLocaleString() : 0}원</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>현재 원가:</span>
              <span className={styles['info-value']}>{product.costPrice ? product.costPrice.toLocaleString() : 0}원</span>
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>새 원가 *</label>
              <input
                type="number"
                name="newCostPrice"
                value={formData.newCostPrice}
                onChange={handleInputChange}
                required
                min="0"
                placeholder="원가를 입력하세요"
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
              원가 수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 