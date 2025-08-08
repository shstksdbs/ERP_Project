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
        sellingPrice: 4500,
        costPrice: 1200,
        margin: 73.3,
        costRatio: 26.7,
        lastUpdated: '2024-03-15',
        status: 'active'
      },
      {
        id: 2,
        name: '카페라떼',
        code: 'CL001',
        category: '음료',
        sellingPrice: 5500,
        costPrice: 1800,
        margin: 67.3,
        costRatio: 32.7,
        lastUpdated: '2024-03-14',
        status: 'active'
      },
      {
        id: 3,
        name: '카푸치노',
        code: 'CP001',
        category: '음료',
        sellingPrice: 5500,
        costPrice: 1900,
        margin: 65.5,
        costRatio: 34.5,
        lastUpdated: '2024-03-13',
        status: 'active'
      },
      {
        id: 4,
        name: '샌드위치',
        code: 'SW001',
        category: '식품',
        sellingPrice: 8000,
        costPrice: 3500,
        margin: 56.3,
        costRatio: 43.7,
        lastUpdated: '2024-03-12',
        status: 'active'
      },
      {
        id: 5,
        name: '샐러드',
        code: 'SL001',
        category: '식품',
        sellingPrice: 12000,
        costPrice: 6000,
        margin: 50.0,
        costRatio: 50.0,
        lastUpdated: '2024-03-11',
        status: 'active'
      },
      {
        id: 6,
        name: '티라미수',
        code: 'TR001',
        category: '디저트',
        sellingPrice: 6500,
        costPrice: 2800,
        margin: 56.9,
        costRatio: 43.1,
        lastUpdated: '2024-03-10',
        status: 'active'
      },
      {
        id: 7,
        name: '치즈케이크',
        code: 'CK001',
        category: '디저트',
        sellingPrice: 7000,
        costPrice: 3200,
        margin: 54.3,
        costRatio: 45.7,
        lastUpdated: '2024-03-09',
        status: 'active'
      },
      {
        id: 8,
        name: '감자튀김',
        code: 'FF001',
        category: '사이드',
        sellingPrice: 4000,
        costPrice: 1500,
        margin: 62.5,
        costRatio: 37.5,
        lastUpdated: '2024-03-08',
        status: 'inactive'
      }
    ];

    const sampleCostHistory = [
      {
        id: 1,
        productId: 1,
        productName: '아메리카노',
        oldCost: 1000,
        newCost: 1200,
        changeDate: '2024-03-15',
        reason: '원두 가격 상승',
        updatedBy: '관리자'
      },
      {
        id: 2,
        productId: 2,
        productName: '카페라떼',
        oldCost: 1600,
        newCost: 1800,
        changeDate: '2024-03-14',
        reason: '우유 가격 상승',
        updatedBy: '관리자'
      }
    ];

    setCategories(sampleCategories);
    setProducts(sampleProducts);
    setCostHistory(sampleCostHistory);
  }, []);

  const handleEditCost = (product) => {
    setSelectedProduct(product);
    setShowEditCostModal(true);
  };

  const handleUpdateCost = (updatedProduct) => {
    setProducts(products.map(product => 
      product.id === updatedProduct.id ? updatedProduct : product
    ));
    setShowEditCostModal(false);
  };

  const handleExportCostData = () => {
    // 실제 구현에서는 Excel 또는 CSV 파일로 내보내기
    console.log('원가 데이터 내보내기');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
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
          원가 이력
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
                  ? (filteredProducts.reduce((sum, product) => sum + product.margin, 0) / filteredProducts.length).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className={styles['summary-card']}>
              <h3>평균 원가율</h3>
              <p className={styles['summary-number']}>
                {filteredProducts.length > 0 
                  ? (filteredProducts.reduce((sum, product) => sum + product.costRatio, 0) / filteredProducts.length).toFixed(1)
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
                          <span className={styles['product-code']}>{product.code}</span>
                        </div>
                      </td>
                      <td>{getCategoryName(product.category)}</td>
                      <td>{product.sellingPrice.toLocaleString()}원</td>
                      <td>{product.costPrice.toLocaleString()}원</td>
                      <td>
                        <span className={`${styles['margin-badge']} ${product.margin >= 60 ? styles['high-margin'] : product.margin >= 40 ? styles['medium-margin'] : styles['low-margin']}`}>
                          {product.margin}%
                        </span>
                      </td>
                      <td>
                        <span className={`${styles['cost-ratio-badge']} ${product.costRatio <= 30 ? styles['low-cost'] : product.costRatio <= 50 ? styles['medium-cost'] : styles['high-cost']}`}>
                          {product.costRatio}%
                        </span>
                      </td>
                      <td>{product.lastUpdated}</td>
                      <td>
                        <div className={styles['action-buttons']}>
                          <button
                            className={`btn btn-small ${styles['btn-small']}`}
                            onClick={() => handleEditCost(product)}
                          >
                            <img src={pencilIcon} alt="수정" className={styles['action-icon']} />
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
                      <td>{history.oldCost.toLocaleString()}원</td>
                      <td>{history.newCost.toLocaleString()}원</td>
                      <td>
                        <span className={`${styles['change-amount']} ${history.newCost > history.oldCost ? styles['increase'] : styles['decrease']}`}>
                          {history.newCost > history.oldCost ? '+' : ''}{(history.newCost - history.oldCost).toLocaleString()}원
                        </span>
                      </td>
                      <td>{history.reason}</td>
                      <td>{history.changeDate}</td>
                      <td>{history.updatedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                ? categoryProducts.reduce((sum, product) => sum + product.margin, 0) / categoryProducts.length
                : 0;
              const avgCostRatio = categoryProducts.length > 0 
                ? categoryProducts.reduce((sum, product) => sum + product.costRatio, 0) / categoryProducts.length
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
                        <span className={styles['mini-product-margin']}>{product.margin}%</span>
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
    newCostPrice: product.costPrice,
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
      costPrice: parseInt(formData.newCostPrice),
      margin: ((product.sellingPrice - parseInt(formData.newCostPrice)) / product.sellingPrice * 100).toFixed(1),
      costRatio: (parseInt(formData.newCostPrice) / product.sellingPrice * 100).toFixed(1),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    onUpdate(updatedProduct);
  };

  const margin = ((product.sellingPrice - formData.newCostPrice) / product.sellingPrice * 100).toFixed(1);
  const costRatio = (formData.newCostPrice / product.sellingPrice * 100).toFixed(1);

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
              <span className={styles['info-value']}>{product.sellingPrice.toLocaleString()}원</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>현재 원가:</span>
              <span className={styles['info-value']}>{product.costPrice.toLocaleString()}원</span>
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