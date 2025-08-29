import React, { useState, useEffect } from 'react';
import styles from './ProductLifecycle.module.css';
import searchIcon from '../../assets/search_icon.png';
import rotateIcon from '../../assets/rotate_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import downloadIcon from '../../assets/download_icon.png';

export default function ProductLifecycle() {
  const [activeTab, setActiveTab] = useState('lifecycle-management');
  const [products, setProducts] = useState([]);
  const [lifecycleStages, setLifecycleStages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddStageModal, setShowAddStageModal] = useState(false);
  const [showEditStageModal, setShowEditStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  // 실제 상품 데이터 가져오기
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 여러 API 엔드포인트 시도
      let response;
      let data;
      
      try {
        // 첫 번째 시도: api/menus
        response = await fetch('http://localhost:8080/api/menus');
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error(`API 응답 오류: ${response.status}`);
        }
      } catch (firstError) {
        console.log('첫 번째 API 시도 실패, 두 번째 시도 중...');
        try {
          // 두 번째 시도: api/menu/admin
          response = await fetch('http://localhost:8080/api/menu/admin');
          if (response.ok) {
            data = await response.json();
          } else {
            throw new Error(`두 번째 API 응답 오류: ${response.status}`);
          }
        } catch (secondError) {
          throw new Error(`모든 API 엔드포인트 시도 실패: ${firstError.message}, ${secondError.message}`);
        }
      }
      
      // 상품 데이터를 라이프사이클 형식으로 변환
      const transformedProducts = data.map(product => ({
        id: product.id,
        name: product.name,
        code: product.code || `P${product.id.toString().padStart(3, '0')}`,
        category: product.categoryName || product.category || '미분류',
        currentStage: getRandomLifecycleStage(),
        stageDuration: Math.floor(Math.random() * 400) + 30, // 30-430일 랜덤
        totalSales: Math.floor(Math.random() * 5000000) + 500000, // 50만원 ~ 550만원 랜덤
        profitMargin: Math.floor(Math.random() * 30) + 50, // 50-80% 랜덤
        status: product.status || 'active',
        launchDate: product.createdAt ? new Date(product.createdAt).toISOString().split('T')[0] : '2024-01-01',
        lastUpdated: product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : '2024-03-15'
      }));
      
      setProducts(transformedProducts);
    } catch (err) {
      setError(err.message);
      console.error('상품 조회 오류:', err);
      // 에러 발생 시 샘플 데이터 사용
      setProducts(getSampleProducts());
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 데이터 가져오기
  const fetchCategoriesData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/menu-categories/admin');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('카테고리 조회 오류:', err);
      // 에러 발생 시 기본 카테고리 설정
      setCategories([
        { id: 1, name: '음료' },
        { id: 2, name: '식품' },
        { id: 3, name: '디저트' },
        { id: 4, name: '사이드' }
      ]);
    }
  };

  // 라이프사이클 단계 초기화
  const initializeLifecycleStages = () => {
    const stages = [
      {
        id: 1,
        name: '도입기',
        description: '새로운 상품이 시장에 도입되는 단계',
        duration: 90,
        color: '#3b82f6',
        products: 0
      },
      {
        id: 2,
        name: '성장기',
        description: '상품이 빠르게 성장하고 매출이 증가하는 단계',
        duration: 180,
        color: '#10b981',
        products: 0
      },
      {
        id: 3,
        name: '성숙기',
        description: '상품이 안정적인 매출을 유지하는 단계',
        duration: 365,
        color: '#f59e0b',
        products: 0
      },
      {
        id: 4,
        name: '쇠퇴기',
        description: '상품의 매출이 감소하고 단계적 폐기 고려 단계',
        duration: 180,
        color: '#ef4444',
        products: 0
      }
    ];
    setLifecycleStages(stages);
  };

  // 랜덤 라이프사이클 단계 생성
  const getRandomLifecycleStage = () => {
    const stages = ['도입기', '성장기', '성숙기', '쇠퇴기'];
    const weights = [0.2, 0.4, 0.3, 0.1]; // 각 단계별 확률
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < weights.length; i++) {
      cumulativeWeight += weights[i];
      if (random <= cumulativeWeight) {
        return stages[i];
      }
    }
    return stages[0];
  };

  // 샘플 데이터 (API 실패 시 사용)
  const getSampleProducts = () => [
    {
      id: 1,
      name: '아메리카노',
      code: 'AM001',
      category: '음료',
      currentStage: '성장기',
      stageDuration: 180,
      totalSales: 1500000,
      profitMargin: 73.3,
      status: 'active',
      launchDate: '2023-01-15',
      lastUpdated: '2024-03-15'
    },
    {
      id: 2,
      name: '카페라떼',
      code: 'CL001',
      category: '음료',
      currentStage: '성장기',
      stageDuration: 150,
      totalSales: 2200000,
      profitMargin: 67.3,
      status: 'active',
      launchDate: '2023-02-01',
      lastUpdated: '2024-03-14'
    },
    {
      id: 3,
      name: '카푸치노',
      code: 'CP001',
      category: '음료',
      currentStage: '성숙기',
      stageDuration: 300,
      totalSales: 1800000,
      profitMargin: 65.5,
      status: 'active',
      launchDate: '2022-08-15',
      lastUpdated: '2024-03-13'
    },
    {
      id: 4,
      name: '샌드위치',
      code: 'SW001',
      category: '식품',
      currentStage: '도입기',
      stageDuration: 45,
      totalSales: 800000,
      profitMargin: 56.3,
      status: 'active',
      launchDate: '2024-02-01',
      lastUpdated: '2024-03-12'
    },
    {
      id: 5,
      name: '샐러드',
      code: 'SL001',
      category: '식품',
      currentStage: '성장기',
      stageDuration: 120,
      totalSales: 1200000,
      profitMargin: 50.0,
      status: 'active',
      launchDate: '2023-11-15',
      lastUpdated: '2024-03-11'
    }
  ];

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchProducts();
    fetchCategoriesData();
    initializeLifecycleStages();
  }, []);

  // 라이프사이클 단계별 상품 수 업데이트
  useEffect(() => {
    if (products.length > 0) {
      setLifecycleStages(prevStages => 
        prevStages.map(stage => ({
          ...stage,
          products: products.filter(product => product.currentStage === stage.name).length
        }))
      );
    }
  }, [products]);

  const handleAddStage = (newStage) => {
    setLifecycleStages([...lifecycleStages, { ...newStage, id: Date.now() }]);
    setShowAddStageModal(false);
  };

  const handleEditStage = (updatedStage) => {
    setLifecycleStages(lifecycleStages.map(stage => 
      stage.id === updatedStage.id ? updatedStage : stage
    ));
    setShowEditStageModal(false);
  };

  const handleDeleteStage = (stageId) => {
    if (window.confirm('정말로 이 라이프사이클 단계를 삭제하시겠습니까?')) {
      setLifecycleStages(lifecycleStages.filter(stage => stage.id !== stageId));
    }
  };

  const handleExportLifecycleData = () => {
    // 실제 구현에서는 Excel 또는 CSV 파일로 내보내기
    console.log('라이프사이클 데이터 내보내기');
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
    const categories = {
      '음료': '음료',
      '식품': '식품',
      '디저트': '디저트',
      '사이드': '사이드'
    };
    return categories[category] || category;
  };

  const getStageColor = (stageName) => {
    const stage = lifecycleStages.find(s => s.name === stageName);
    return stage ? stage.color : '#6b7280';
  };

  const getStageProducts = (stageName) => {
    return products.filter(product => product.currentStage === stageName);
  };

  return (
    <div className={styles['product-lifecycle']}>
      <div className={styles['product-lifecycle-header']}>
        <h1>상품 라이프사이클 관리</h1>
        <p>상품의 라이프사이클 단계를 관리하고 성과를 분석할 수 있습니다.</p>
      </div>

      <div className={styles['tab-container']}>
        <button
          className={`${styles['tab-button']} ${activeTab === 'lifecycle-management' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('lifecycle-management')}
        >
          라이프사이클 관리
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'stage-analysis' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('stage-analysis')}
        >
          단계별 분석
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'performance-tracking' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('performance-tracking')}
        >
          성과 추적
        </button>
      </div>

      {activeTab === 'lifecycle-management' && (
        <div className={styles['lifecycle-management']}>
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
            {/* <button
              className={`btn btn-primary ${styles['add-button']}`}
              onClick={() => setShowAddStageModal(true)}
            >
              <img src={plusIcon} alt="추가" className={styles['button-icon']} />
              단계 추가
            </button> */}
            <button
              className={`btn btn-primary ${styles['refresh-button']}`}
              onClick={() => {
                fetchProducts();
                fetchCategoriesData();
              }}
              disabled={loading}
            >
              <img src={rotateIcon} alt="새로고침" className={styles['button-icon']} />
              새로고침
            </button>
            <button
              className={`btn btn-primary ${styles['export-button']}`}
              onClick={handleExportLifecycleData}
            >
              <img src={downloadIcon} alt="내보내기" className={styles['button-icon']} />
              데이터 내보내기
            </button>
          </div>

                     <div className={styles['lifecycle-summary']}>
             <div className={styles['summary-card']}>
               <h3>전체 상품</h3>
               <p className={styles['summary-number']}>{filteredProducts.length}개</p>
             </div>
                           <div className={styles['summary-card']}>
                <h3>총 매출</h3>
                <p className={styles['summary-number']}>
                  {filteredProducts.length > 0 
                    ? (filteredProducts.reduce((sum, product) => sum + product.totalSales, 0) / 10000).toFixed(0)
                    : 0}만원
                </p>
              </div>
             <div className={styles['summary-card']}>
               <h3>평균 단계 기간</h3>
               <p className={styles['summary-number']}>
                 {filteredProducts.length > 0 
                   ? Math.round(filteredProducts.reduce((sum, product) => sum + product.stageDuration, 0) / filteredProducts.length)
                   : 0}일
               </p>
             </div>
             <div className={styles['summary-card']}>
               <h3>평균 마진율</h3>
               <p className={styles['summary-number']}>
                 {filteredProducts.length > 0 
                   ? (filteredProducts.reduce((sum, product) => sum + product.profitMargin, 0) / filteredProducts.length).toFixed(1)
                   : 0}%
               </p>
             </div>
           </div>

          {loading ? (
            <div className={styles['loading-container']}>
              <div className={styles['loading-spinner']}></div>
              <p>데이터를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className={styles['error-container']}>
              <p className={styles['error-message']}>{error}</p>
              <button 
                className={`btn btn-primary ${styles['retry-button']}`}
                onClick={fetchProducts}
              >
                <img src={rotateIcon} alt="재시도" className={styles['button-icon']} />
                다시 시도
              </button>
            </div>
          ) : (
            <div className={styles['products-container']}>
              <div className={styles['products-list']}>
                <table className={styles['products-table']}>
                                     <thead className={styles['products-table-header']}>
                     <tr>
                       <th>상품명</th>
                       <th>카테고리</th>
                       <th>현재 단계</th>
                       <th>단계 기간</th>
                       <th>총 매출</th>
                       <th>마진율</th>
                       <th>상태</th>
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
                        <td>
                          <span 
                            className={styles['stage-badge']}
                            style={{ backgroundColor: getStageColor(product.currentStage) }}
                          >
                            {product.currentStage}
                          </span>
                        </td>
                                                 <td>{product.stageDuration}일</td>
                         <td>{product.totalSales.toLocaleString()}원</td>
                         <td>
                           <span className={`${styles['margin-badge']} ${product.profitMargin >= 60 ? styles['high-margin'] : product.profitMargin >= 40 ? styles['medium-margin'] : styles['low-margin']}`}>
                             {product.profitMargin}%
                           </span>
                         </td>
                        <td>
                          <span className={`${styles['status-badge']} ${styles[`status-${product.status}`]}`}>
                            {getStatusText(product.status)}
                          </span>
                        </td>
                        <td>
                          <div className={styles['action-buttons']}>
                            <button
                              className={`btn btn-small btn-primary ${styles['btn-small']}`}
                              onClick={() => {
                                setSelectedStage({ name: product.currentStage, productId: product.id });
                                setShowEditStageModal(true);
                              }}
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
          )}
        </div>
      )}

      {activeTab === 'stage-analysis' && (
        <div className={styles['stage-analysis']}>
          <div className={styles['analysis-header']}>
            <h2>라이프사이클 단계별 분석</h2>
            <p>각 단계별 상품 현황과 성과를 분석합니다.</p>
          </div>

          <div className={styles['stages-grid']}>
            {lifecycleStages.map(stage => {
              const stageProducts = getStageProducts(stage.name);
              const avgMargin = stageProducts.length > 0 
                ? stageProducts.reduce((sum, product) => sum + product.profitMargin, 0) / stageProducts.length
                : 0;

              return (
                <div key={stage.id} className={styles['stage-card']}>
                  <div className={styles['stage-header']}>
                    <h3 style={{ color: stage.color }}>{stage.name}</h3>
                    <span className={styles['stage-count']}>{stageProducts.length}개 상품</span>
                  </div>
                  <div className={styles['stage-stats']}>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>평균 매출:</span>
                      <span className={styles['stat-value']}>
                        {stageProducts.length > 0 
                          ? (stageProducts.reduce((sum, product) => sum + product.totalSales, 0) / stageProducts.length).toLocaleString()
                          : 0}원
                      </span>
                    </div>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>평균 마진율:</span>
                      <span className={`${styles['stat-value']} ${avgMargin >= 60 ? styles['high-margin'] : avgMargin >= 40 ? styles['medium-margin'] : styles['low-margin']}`}>
                        {avgMargin.toFixed(1)}%
                      </span>
                    </div>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>단계 기간:</span>
                      <span className={styles['stat-value']}>{stage.duration}일</span>
                    </div>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>상품 수:</span>
                      <span className={styles['stat-value']}>{stageProducts.length}개</span>
                    </div>
                  </div>
                  <div className={styles['stage-products']}>
                    <h4>해당 단계 상품</h4>
                                         {stageProducts.map(product => (
                       <div key={product.id} className={styles['stage-product-item']}>
                         <span className={styles['product-name']}>{product.name}</span>
                         <span className={styles['product-sales']}>{product.totalSales.toLocaleString()}원</span>
                       </div>
                     ))}
                    {stageProducts.length === 0 && (
                      <div className={styles['no-products']}>
                        <p>해당 단계의 상품이 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'performance-tracking' && (
        <div className={styles['performance-tracking']}>
          <div className={styles['tracking-header']}>
            <h2>성과 추적</h2>
            <p>상품별 성과 지표와 라이프사이클 진행 상황을 추적합니다.</p>
          </div>

          <div className={styles['performance-grid']}>
            {filteredProducts.map(product => (
              <div key={product.id} className={styles['performance-card']}>
                <div className={styles['performance-header']}>
                  <h3>{product.name}</h3>
                  <span 
                    className={styles['stage-indicator']}
                    style={{ backgroundColor: getStageColor(product.currentStage) }}
                  >
                    {product.currentStage}
                  </span>
                </div>
                <div className={styles['performance-stats']}>
                  <div className={styles['stat-item']}>
                    <span className={styles['stat-label']}>총 매출:</span>
                    <span className={styles['stat-value']}>{product.totalSales.toLocaleString()}원</span>
                  </div>
                  <div className={styles['stat-item']}>
                    <span className={styles['stat-label']}>마진율:</span>
                    <span className={`${styles['stat-value']} ${product.profitMargin >= 60 ? styles['high-margin'] : product.profitMargin >= 40 ? styles['medium-margin'] : styles['low-margin']}`}>
                      {product.profitMargin}%
                    </span>
                  </div>
                  <div className={styles['stat-item']}>
                    <span className={styles['stat-label']}>단계 기간:</span>
                    <span className={styles['stat-value']}>{product.stageDuration}일</span>
                  </div>
                  <div className={styles['stat-item']}>
                    <span className={styles['stat-label']}>출시일:</span>
                    <span className={styles['stat-value']}>{product.launchDate}</span>
                  </div>
                  <div className={styles['stat-item']}>
                    <span className={styles['stat-label']}>상태:</span>
                    <span className={`${styles['stat-value']} ${styles[`status-${product.status}`]}`}>
                      {getStatusText(product.status)}
                    </span>
                  </div>
                </div>
                <div className={styles['lifecycle-progress']}>
                  <div className={styles['progress-bar']}>
                    <div 
                      className={styles['progress-fill']}
                      style={{ 
                        width: `${Math.min((product.stageDuration / 365) * 100, 100)}%`,
                        backgroundColor: getStageColor(product.currentStage)
                      }}
                    ></div>
                  </div>
                  <span className={styles['progress-text']}>
                    라이프사이클 진행률: {Math.min((product.stageDuration / 365) * 100, 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 단계 추가 모달 */}
      {showAddStageModal && (
        <AddStageModal
          onAdd={handleAddStage}
          onClose={() => setShowAddStageModal(false)}
        />
      )}

      {/* 단계 수정 모달 */}
      {showEditStageModal && selectedStage && (
        <EditStageModal
          stage={selectedStage}
          products={products}
          onUpdate={handleEditStage}
          onClose={() => setShowEditStageModal(false)}
        />
      )}
    </div>
  );
}

// 단계 추가 모달 컴포넌트
function AddStageModal({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 90,
    color: '#3b82f6'
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
    onAdd(formData);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>라이프사이클 단계 추가</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>단계명 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="예: 도입기, 성장기, 성숙기, 쇠퇴기"
              />
            </div>
            <div className={styles['form-group']}>
              <label>기간 (일)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>색상</label>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles['form-group']}>
            <label>설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="단계에 대한 설명을 입력하세요"
              rows="3"
            />
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              단계 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 단계 수정 모달 컴포넌트
function EditStageModal({ stage, products, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    ...stage,
    newStage: stage.name
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
    // 실제 구현에서는 상품의 라이프사이클 단계를 업데이트
    console.log(`상품 ${formData.productId}의 단계를 ${formData.newStage}로 변경`);
    onUpdate(formData);
  };

  const product = products.find(p => p.id === formData.productId);

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>{product?.name} 라이프사이클 단계 변경</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['product-info-display']}>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>상품명:</span>
              <span className={styles['info-value']}>{product?.name}</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>현재 단계:</span>
              <span className={styles['info-value']}>{formData.name}</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>단계 기간:</span>
              <span className={styles['info-value']}>{product?.stageDuration}일</span>
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>새 단계 *</label>
            <select
              name="newStage"
              value={formData.newStage}
              onChange={handleInputChange}
              required
            >
              <option value="">단계를 선택하세요</option>
              <option value="도입기">도입기</option>
              <option value="성장기">성장기</option>
              <option value="성숙기">성숙기</option>
              <option value="쇠퇴기">쇠퇴기</option>
            </select>
          </div>

          <div className={styles['stage-change-preview']}>
            <div className={styles['preview-item']}>
              <span className={styles['preview-label']}>변경 전:</span>
              <span 
                className={styles['preview-value']}
                style={{ color: '#6b7280' }}
              >
                {formData.name}
              </span>
            </div>
            <div className={styles['preview-item']}>
              <span className={styles['preview-label']}>변경 후:</span>
              <span 
                className={styles['preview-value']}
                style={{ color: '#3b82f6' }}
              >
                {formData.newStage}
              </span>
            </div>
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              단계 변경
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 