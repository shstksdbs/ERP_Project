import React, { useState, useEffect } from 'react';
import styles from './ProductPromotion.module.css';
import searchIcon from '../../assets/search_icon.png';
import percentIcon from '../../assets/percent_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import downloadIcon from '../../assets/download_icon.png';

export default function ProductPromotion() {
  const [activeTab, setActiveTab] = useState('promotion-management');
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddPromotionModal, setShowAddPromotionModal] = useState(false);
  const [showEditPromotionModal, setShowEditPromotionModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);

  // 샘플 데이터
  useEffect(() => {
    const sampleProducts = [
      { id: 1, name: '아메리카노', code: 'AM001', category: '음료', price: 4500 },
      { id: 2, name: '카페라떼', code: 'CL001', category: '음료', price: 5500 },
      { id: 3, name: '카푸치노', code: 'CP001', category: '음료', price: 5500 },
      { id: 4, name: '샌드위치', code: 'SW001', category: '식품', price: 8000 },
      { id: 5, name: '샐러드', code: 'SL001', category: '식품', price: 12000 },
      { id: 6, name: '티라미수', code: 'TR001', category: '디저트', price: 6500 },
      { id: 7, name: '치즈케이크', code: 'CK001', category: '디저트', price: 7000 },
      { id: 8, name: '감자튀김', code: 'FF001', category: '사이드', price: 3500 }
    ];

    const samplePromotions = [
      {
        id: 1,
        name: '신메뉴 출시 프로모션',
        type: 'discount',
        discountType: 'percentage',
        discountValue: 20,
        targetProducts: [1, 2, 3],
        startDate: '2024-03-01',
        endDate: '2024-03-31',
        status: 'active',
        totalSales: 2500000,
        totalOrders: 150,
        createdAt: '2024-02-25',
        description: '새로운 음료 메뉴 출시 기념 할인 프로모션'
      },
      {
        id: 2,
        name: '식품 카테고리 할인',
        type: 'discount',
        discountType: 'fixed',
        discountValue: 1000,
        targetProducts: [4, 5],
        startDate: '2024-03-15',
        endDate: '2024-04-15',
        status: 'active',
        totalSales: 1800000,
        totalOrders: 80,
        createdAt: '2024-03-10',
        description: '식품 카테고리 전체 할인 프로모션'
      },
      {
        id: 3,
        name: '디저트 1+1 이벤트',
        type: 'buy_one_get_one',
        discountType: 'percentage',
        discountValue: 50,
        targetProducts: [6, 7],
        startDate: '2024-03-20',
        endDate: '2024-04-20',
        status: 'active',
        totalSales: 1200000,
        totalOrders: 60,
        createdAt: '2024-03-15',
        description: '디저트 구매 시 같은 메뉴 1개 추가 증정'
      },
      {
        id: 4,
        name: '사이드 메뉴 무료 증정',
        type: 'free_item',
        discountType: 'percentage',
        discountValue: 100,
        targetProducts: [8],
        startDate: '2024-02-01',
        endDate: '2024-02-29',
        status: 'completed',
        totalSales: 800000,
        totalOrders: 120,
        createdAt: '2024-01-25',
        description: '음료 구매 시 감자튀김 무료 증정'
      },
      {
        id: 5,
        name: '첫 구매 할인',
        type: 'discount',
        discountType: 'percentage',
        discountValue: 15,
        targetProducts: [1, 2, 3, 4, 5, 6, 7, 8],
        startDate: '2024-04-01',
        endDate: '2024-04-30',
        status: 'scheduled',
        totalSales: 0,
        totalOrders: 0,
        createdAt: '2024-03-20',
        description: '첫 구매 고객 대상 전체 메뉴 할인'
      }
    ];

    setProducts(sampleProducts);
    setPromotions(samplePromotions);
  }, []);

  const handleAddPromotion = (newPromotion) => {
    setPromotions([...promotions, { ...newPromotion, id: Date.now() }]);
    setShowAddPromotionModal(false);
  };

  const handleEditPromotion = (updatedPromotion) => {
    setPromotions(promotions.map(promotion => 
      promotion.id === updatedPromotion.id ? updatedPromotion : promotion
    ));
    setShowEditPromotionModal(false);
  };

  const handleDeletePromotion = (promotionId) => {
    if (window.confirm('정말로 이 프로모션을 삭제하시겠습니까?')) {
      setPromotions(promotions.filter(promotion => promotion.id !== promotionId));
    }
  };

  const handleExportPromotionData = () => {
    // 실제 구현에서는 Excel 또는 CSV 파일로 내보내기
    console.log('프로모션 데이터 내보내기');
  };

  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      promotion.targetProducts.some(productId => {
        const product = products.find(p => p.id === productId);
        return product && product.category === selectedCategory;
      });
    return matchesSearch && matchesCategory;
  });

  const getStatusText = (status) => {
    const statusMap = {
      'active': '진행중',
      'scheduled': '예정',
      'completed': '완료',
      'paused': '일시정지'
    };
    return statusMap[status] || status;
  };

  const getCategoryName = (category) => {
    const categories = {
      '음료': '음료',
      '식품': '식품',
      '디저트': '디저트',
      '사이드': '사이드'
    };
    return categories[category] || category;
  };

  const getPromotionTypeText = (type) => {
    const typeMap = {
      'discount': '할인',
      'buy_one_get_one': '1+1',
      'free_item': '무료증정',
      'bundle': '묶음상품'
    };
    return typeMap[type] || type;
  };

  const getDiscountText = (promotion) => {
    if (promotion.discountType === 'percentage') {
      return `${promotion.discountValue}% 할인`;
    } else if (promotion.discountType === 'fixed') {
      return `${promotion.discountValue.toLocaleString()}원 할인`;
    }
    return '할인 없음';
  };

  const getTargetProducts = (promotion) => {
    return promotion.targetProducts.map(productId => {
      const product = products.find(p => p.id === productId);
      return product ? product.name : 'Unknown';
    }).join(', ');
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'active': '#10b981',
      'scheduled': '#3b82f6',
      'completed': '#6b7280',
      'paused': '#f59e0b'
    };
    return colorMap[status] || '#6b7280';
  };

  return (
    <div className={styles['product-promotion']}>
      <div className={styles['product-promotion-header']}>
        <h1>프로모션 관리</h1>
        <p>상품 프로모션을 관리하고 성과를 분석할 수 있습니다.</p>
      </div>

      <div className={styles['tab-container']}>
        <button
          className={`${styles['tab-button']} ${activeTab === 'promotion-management' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('promotion-management')}
        >
          프로모션 관리
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'performance-analysis' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('performance-analysis')}
        >
          성과 분석
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'promotion-calendar' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('promotion-calendar')}
        >
          프로모션 캘린더
        </button>
      </div>

      {activeTab === 'promotion-management' && (
        <div className={styles['promotion-management']}>
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
                  placeholder="프로모션명으로 검색"
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
                <option value="음료">음료</option>
                <option value="식품">식품</option>
                <option value="디저트">디저트</option>
                <option value="사이드">사이드</option>
              </select>
            </div>
            <button
              className={`btn btn-primary ${styles['add-button']}`}
              onClick={() => setShowAddPromotionModal(true)}
            >
              <img src={plusIcon} alt="추가" className={styles['button-icon']} />
              프로모션 추가
            </button>
            <button
              className={`btn btn-primary ${styles['export-button']}`}
              onClick={handleExportPromotionData}
            >
              <img src={downloadIcon} alt="내보내기" className={styles['button-icon']} />
              데이터 내보내기
            </button>
          </div>

          <div className={styles['promotion-summary']}>
            <div className={styles['summary-card']}>
              <h3>전체 프로모션</h3>
              <p className={styles['summary-number']}>{filteredPromotions.length}개</p>
            </div>
            <div className={styles['summary-card']}>
              <h3>진행중</h3>
              <p className={styles['summary-number']}>
                {filteredPromotions.filter(p => p.status === 'active').length}개
              </p>
            </div>
            <div className={styles['summary-card']}>
              <h3>총 매출</h3>
              <p className={styles['summary-number']}>
                {filteredPromotions.reduce((sum, p) => sum + p.totalSales, 0).toLocaleString()}원
              </p>
            </div>
          </div>

          <div className={styles['promotions-container']}>
            <div className={styles['promotions-list']}>
              <table className={styles['promotions-table']}>
                <thead className={styles['promotions-table-header']}>
                  <tr>
                    <th>프로모션명</th>
                    <th>유형</th>
                    <th>할인</th>
                    <th>대상 상품</th>
                    <th>기간</th>
                    <th>상태</th>
                    <th>매출</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPromotions.map(promotion => (
                    <tr key={promotion.id}>
                      <td>
                        <div className={styles['promotion-info']}>
                          <span className={styles['promotion-name']}>{promotion.name}</span>
                          <span className={styles['promotion-description']}>{promotion.description}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles['type-badge']}>
                          {getPromotionTypeText(promotion.type)}
                        </span>
                      </td>
                      <td>
                        <span className={styles['discount-badge']}>
                          {getDiscountText(promotion)}
                        </span>
                      </td>
                      <td>
                        <span className={styles['target-products']}>
                          {getTargetProducts(promotion)}
                        </span>
                      </td>
                      <td>
                        <div className={styles['date-range']}>
                          <span>{promotion.startDate}</span>
                          <span>~</span>
                          <span>{promotion.endDate}</span>
                        </div>
                      </td>
                      <td>
                        <span 
                          className={styles['status-badge']}
                          style={{ backgroundColor: getStatusColor(promotion.status) }}
                        >
                          {getStatusText(promotion.status)}
                        </span>
                      </td>
                      <td>{promotion.totalSales.toLocaleString()}원</td>
                      <td>
                        <div className={styles['action-buttons']}>
                          <button
                            className={`btn btn-small ${styles['btn-small']}`}
                            onClick={() => {
                              setSelectedPromotion(promotion);
                              setShowEditPromotionModal(true);
                            }}
                          >
                            <img src={pencilIcon} alt="수정" className={styles['action-icon']} />
                          </button>
                          <button
                            className={`btn btn-small btn-danger ${styles['btn-small']}`}
                            onClick={() => handleDeletePromotion(promotion.id)}
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

      {activeTab === 'performance-analysis' && (
        <div className={styles['performance-analysis']}>
          <div className={styles['analysis-header']}>
            <h2>프로모션 성과 분석</h2>
            <p>프로모션별 성과와 매출 효과를 분석합니다.</p>
          </div>

          <div className={styles['analysis-grid']}>
            {filteredPromotions.map(promotion => {
              const avgOrderValue = promotion.totalOrders > 0 
                ? promotion.totalSales / promotion.totalOrders 
                : 0;

              return (
                <div key={promotion.id} className={styles['analysis-card']}>
                  <div className={styles['analysis-header']}>
                    <h3>{promotion.name}</h3>
                    <span 
                      className={styles['status-indicator']}
                      style={{ backgroundColor: getStatusColor(promotion.status) }}
                    >
                      {getStatusText(promotion.status)}
                    </span>
                  </div>
                  <div className={styles['analysis-stats']}>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>총 매출:</span>
                      <span className={styles['stat-value']}>{promotion.totalSales.toLocaleString()}원</span>
                    </div>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>총 주문:</span>
                      <span className={styles['stat-value']}>{promotion.totalOrders}건</span>
                    </div>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>평균 주문금액:</span>
                      <span className={styles['stat-value']}>{avgOrderValue.toLocaleString()}원</span>
                    </div>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>할인:</span>
                      <span className={styles['discount-value']}>{getDiscountText(promotion)}</span>
                    </div>
                  </div>
                  <div className={styles['target-products-list']}>
                    <h4>대상 상품</h4>
                    <div className={styles['products-tags']}>
                      {promotion.targetProducts.map(productId => {
                        const product = products.find(p => p.id === productId);
                        return product ? (
                          <span key={productId} className={styles['product-tag']}>
                            {product.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'promotion-calendar' && (
        <div className={styles['promotion-calendar']}>
          <div className={styles['calendar-header']}>
            <h2>프로모션 캘린더</h2>
            <p>월별 프로모션 일정을 확인할 수 있습니다.</p>
          </div>

          <div className={styles['calendar-grid']}>
            {['1월', '2월', '3월', '4월', '5월', '6월'].map(month => (
              <div key={month} className={styles['month-card']}>
                <h3>{month}</h3>
                <div className={styles['month-promotions']}>
                  {filteredPromotions.filter(promotion => {
                    const startMonth = new Date(promotion.startDate).getMonth() + 1;
                    const monthNum = parseInt(month.replace('월', ''));
                    return startMonth === monthNum;
                  }).map(promotion => (
                    <div key={promotion.id} className={styles['calendar-promotion']}>
                      <span className={styles['promotion-title']}>{promotion.name}</span>
                      <span 
                        className={styles['promotion-status']}
                        style={{ backgroundColor: getStatusColor(promotion.status) }}
                      >
                        {getStatusText(promotion.status)}
                      </span>
                    </div>
                  ))}
                  {filteredPromotions.filter(promotion => {
                    const startMonth = new Date(promotion.startDate).getMonth() + 1;
                    const monthNum = parseInt(month.replace('월', ''));
                    return startMonth === monthNum;
                  }).length === 0 && (
                    <div className={styles['no-promotions']}>
                      <p>예정된 프로모션 없음</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 프로모션 추가 모달 */}
      {showAddPromotionModal && (
        <AddPromotionModal
          products={products}
          onAdd={handleAddPromotion}
          onClose={() => setShowAddPromotionModal(false)}
        />
      )}

      {/* 프로모션 수정 모달 */}
      {showEditPromotionModal && selectedPromotion && (
        <EditPromotionModal
          promotion={selectedPromotion}
          products={products}
          onUpdate={handleEditPromotion}
          onClose={() => setShowEditPromotionModal(false)}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />
      )}
    </div>
  );
}

// 프로모션 추가 모달 컴포넌트
function AddPromotionModal({ products, onAdd, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'discount',
    discountType: 'percentage',
    discountValue: 0,
    targetProducts: [],
    startDate: '',
    endDate: '',
    description: '',
    status: 'scheduled'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductChange = (productId, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        targetProducts: [...prev.targetProducts, parseInt(productId)]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        targetProducts: prev.targetProducts.filter(id => id !== parseInt(productId))
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPromotion = {
      ...formData,
      totalSales: 0,
      totalOrders: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    onAdd(newPromotion);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>프로모션 추가</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>프로모션명 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="프로모션명을 입력하세요"
              />
            </div>
            <div className={styles['form-group']}>
              <label>프로모션 유형 *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="discount">할인</option>
                <option value="buy_one_get_one">1+1</option>
                <option value="free_item">무료증정</option>
                <option value="bundle">묶음상품</option>
              </select>
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>할인 유형</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
              >
                <option value="percentage">퍼센트 할인</option>
                <option value="fixed">금액 할인</option>
              </select>
            </div>
            <div className={styles['form-group']}>
              <label>할인 값</label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                min="0"
                step={formData.discountType === 'percentage' ? '1' : '100'}
              />
              <span className={styles['unit-text']}>
                {formData.discountType === 'percentage' ? '%' : '원'}
              </span>
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>시작일 *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles['form-group']}>
              <label>종료일 *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>대상 상품 *</label>
            <div className={styles['products-selection']}>
              {products.map(product => (
                <label key={product.id} className={styles['product-checkbox']}>
                  <input
                    type="checkbox"
                    checked={formData.targetProducts.includes(product.id)}
                    onChange={(e) => handleProductChange(product.id, e.target.checked)}
                  />
                  <span className={styles['product-name']}>{product.name}</span>
                  <span className={styles['product-price']}>{product.price.toLocaleString()}원</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="프로모션에 대한 설명을 입력하세요"
              rows="3"
            />
          </div>

          <div className={styles['form-group']}>
            <label>상태</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="scheduled">예정</option>
              <option value="active">진행중</option>
              <option value="paused">일시정지</option>
            </select>
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              프로모션 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 프로모션 수정 모달 컴포넌트
function EditPromotionModal({ promotion, products, onUpdate, onClose, getStatusColor, getStatusText }) {
  const [formData, setFormData] = useState({
    ...promotion,
    targetProducts: [...promotion.targetProducts]
  });



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductChange = (productId, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        targetProducts: [...prev.targetProducts, parseInt(productId)]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        targetProducts: prev.targetProducts.filter(id => id !== parseInt(productId))
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>{promotion.name} 프로모션 수정</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['promotion-info-display']}>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>현재 상태:</span>
              <span 
                className={styles['info-value']}
                style={{ color: getStatusColor(promotion.status) }}
              >
                {getStatusText(promotion.status)}
              </span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>총 매출:</span>
              <span className={styles['info-value']}>{promotion.totalSales.toLocaleString()}원</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>총 주문:</span>
              <span className={styles['info-value']}>{promotion.totalOrders}건</span>
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>프로모션명 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles['form-group']}>
              <label>프로모션 유형 *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="discount">할인</option>
                <option value="buy_one_get_one">1+1</option>
                <option value="free_item">무료증정</option>
                <option value="bundle">묶음상품</option>
              </select>
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>할인 유형</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
              >
                <option value="percentage">퍼센트 할인</option>
                <option value="fixed">금액 할인</option>
              </select>
            </div>
            <div className={styles['form-group']}>
              <label>할인 값</label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                min="0"
                step={formData.discountType === 'percentage' ? '1' : '100'}
              />
              <span className={styles['unit-text']}>
                {formData.discountType === 'percentage' ? '%' : '원'}
              </span>
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>시작일 *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles['form-group']}>
              <label>종료일 *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>대상 상품 *</label>
            <div className={styles['products-selection']}>
              {products.map(product => (
                <label key={product.id} className={styles['product-checkbox']}>
                  <input
                    type="checkbox"
                    checked={formData.targetProducts.includes(product.id)}
                    onChange={(e) => handleProductChange(product.id, e.target.checked)}
                  />
                  <span className={styles['product-name']}>{product.name}</span>
                  <span className={styles['product-price']}>{product.price.toLocaleString()}원</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className={styles['form-group']}>
            <label>상태</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="scheduled">예정</option>
              <option value="active">진행중</option>
              <option value="paused">일시정지</option>
              <option value="completed">완료</option>
            </select>
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              프로모션 수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 