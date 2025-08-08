import React, { useState, useEffect } from 'react';
import styles from './ProductCategory.module.css';
import searchIcon from '../../assets/search_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';

export default function ProductCategory() {
  const [activeTab, setActiveTab] = useState('category-management');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showAssignProductsModal, setShowAssignProductsModal] = useState(false);

  // 샘플 데이터
  useEffect(() => {
    const sampleCategories = [
      {
        id: 1,
        name: '음료',
        code: 'BEVERAGE',
        description: '커피, 차, 주스 등 음료류',
        productCount: 8,
        status: 'active',
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        name: '식품',
        code: 'FOOD',
        description: '샌드위치, 샐러드 등 식품류',
        productCount: 12,
        status: 'active',
        createdAt: '2024-01-20'
      },
      {
        id: 3,
        name: '디저트',
        code: 'DESSERT',
        description: '케이크, 쿠키 등 디저트류',
        productCount: 6,
        status: 'active',
        createdAt: '2024-02-01'
      },
      {
        id: 4,
        name: '사이드',
        code: 'SIDE',
        description: '사이드 메뉴류',
        productCount: 4,
        status: 'inactive',
        createdAt: '2024-02-05'
      }
    ];

    const sampleProducts = [
      { id: 1, name: '아메리카노', code: 'AM001', category: '음료', status: 'active' },
      { id: 2, name: '카페라떼', code: 'CL001', category: '음료', status: 'active' },
      { id: 3, name: '카푸치노', code: 'CP001', category: '음료', status: 'active' },
      { id: 4, name: '샌드위치', code: 'SW001', category: '식품', status: 'active' },
      { id: 5, name: '샐러드', code: 'SL001', category: '식품', status: 'active' },
      { id: 6, name: '티라미수', code: 'TR001', category: '디저트', status: 'active' },
      { id: 7, name: '치즈케이크', code: 'CK001', category: '디저트', status: 'active' },
      { id: 8, name: '감자튀김', code: 'FF001', category: '사이드', status: 'inactive' }
    ];

    setCategories(sampleCategories);
    setProducts(sampleProducts);
  }, []);

  const handleAddCategory = (newCategory) => {
    setCategories([...categories, { ...newCategory, id: Date.now() }]);
    setShowAddCategoryModal(false);
  };

  const handleEditCategory = (updatedCategory) => {
    setCategories(categories.map(cat => 
      cat.id === updatedCategory.id ? updatedCategory : cat
    ));
    setShowEditCategoryModal(false);
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('정말로 이 카테고리를 삭제하시겠습니까?')) {
      setCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  const filteredCategories = categories.filter(category => {
    return category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusText = (status) => {
    return status === 'active' ? '활성' : '비활성';
  };

  return (
    <div className={styles['product-category']}>
      <div className={styles['product-category-header']}>
        <h1>상품 카테고리 관리</h1>
      </div>

      <div className={styles['tab-container']}>
        <button
          className={`${styles['tab-button']} ${activeTab === 'category-management' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('category-management')}
        >
          카테고리 관리
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'product-assignment' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('product-assignment')}
        >
          상품 할당
        </button>
      </div>

      {activeTab === 'category-management' && (
        <div className={styles['category-management']}>
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
                  placeholder="카테고리명 또는 코드로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles['search-input']}
                />
              </div>
            </div>
            <button
              className={`btn btn-primary ${styles['add-button']}`}
              onClick={() => setShowAddCategoryModal(true)}
            >
              <img src={plusIcon} alt="추가" className={styles['button-icon']} />
              카테고리 추가
            </button>
          </div>

          <div className={styles['categories-container']}>
            <div className={styles['categories-list']}>
              <table className={styles['categories-table']}>
                <thead className={styles['categories-table-header']}>
                  <tr>
                    <th>카테고리명</th>
                    <th>코드</th>
                    <th>설명</th>
                    <th>상품 수</th>
                    <th>상태</th>
                    <th>등록일</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map(category => (
                    <tr key={category.id}>
                      <td>{category.name}</td>
                      <td>{category.code}</td>
                      <td>{category.description}</td>
                      <td>{category.productCount}개</td>
                      <td>
                        <span className={`${styles['status-badge']} ${styles[`status-${category.status}`]}`}>
                          {getStatusText(category.status)}
                        </span>
                      </td>
                      <td>{category.createdAt}</td>
                      <td>
                        <div className={styles['action-buttons']}>
                          <button
                            className={`btn btn-small ${styles['btn-small']}`}
                            onClick={() => {
                              setSelectedCategory(category);
                              setShowEditCategoryModal(true);
                            }}
                          >
                            <img src={pencilIcon} alt="수정" className={styles['action-icon']} />
                          </button>
                          <button
                            className={`btn btn-small btn-danger ${styles['btn-small']}`}
                            onClick={() => handleDeleteCategory(category.id)}
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

      {activeTab === 'product-assignment' && (
        <div className={styles['product-assignment']}>
          <div className={styles['assignment-header']}>
            <h2>카테고리별 상품 할당</h2>
            <p>카테고리를 선택하여 해당 카테고리에 상품을 추가하거나 제거할 수 있습니다.</p>
          </div>

          <div className={styles['category-selection']}>
            <label htmlFor="category-select">카테고리 선택</label>
            <select
              id="category-select"
              value={selectedCategory?.id || ''}
              onChange={(e) => {
                const category = categories.find(cat => cat.id === parseInt(e.target.value));
                setSelectedCategory(category);
              }}
              className={styles['category-select']}
            >
              <option value="">전체 카테고리 보기</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.productCount}개)
                </option>
              ))}
            </select>
            {selectedCategory && (
              <button
                className={`btn btn-primary ${styles['assign-button']}`}
                onClick={() => setShowAssignProductsModal(true)}
              >
                상품 할당 관리
              </button>
            )}
          </div>

          {selectedCategory ? (
            <div className={styles['category-products']}>
              <h3>{selectedCategory.name} 카테고리 상품 목록</h3>
              <div className={styles['products-grid']}>
                {products.filter(product => product.category === selectedCategory.name).map(product => (
                  <div key={product.id} className={styles['product-card']}>
                    <div className={styles['product-info']}>
                      <h4>{product.name}</h4>
                      <p>{product.code}</p>
                      <span className={`${styles['status-badge']} ${styles[`status-${product.status}`]}`}>
                        {getStatusText(product.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles['all-categories-products']}>
              {categories.map(category => (
                <div key={category.id} className={styles['category-section']}>
                  <h4 className={styles['category-title']}>
                    {category.name} ({category.productCount}개)
                    <span className={`${styles['status-badge']} ${styles[`status-${category.status}`]}`}>
                      {getStatusText(category.status)}
                    </span>
                  </h4>
                  <div className={styles['products-grid']}>
                    {products.filter(product => product.category === category.name).map(product => (
                      <div key={product.id} className={styles['product-card']}>
                        <div className={styles['product-info']}>
                          <h5>{product.name}</h5>
                          <p>{product.code}</p>
                          <span className={`${styles['status-badge']} ${styles[`status-${product.status}`]}`}>
                            {getStatusText(product.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {products.filter(product => product.category === category.name).length === 0 && (
                      <div className={styles['no-products-message']}>
                        <p>이 카테고리에 등록된 상품이 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 카테고리 추가 모달 */}
      {showAddCategoryModal && (
        <AddCategoryModal
          onAdd={handleAddCategory}
          onClose={() => setShowAddCategoryModal(false)}
        />
      )}

      {/* 카테고리 수정 모달 */}
      {showEditCategoryModal && selectedCategory && (
        <EditCategoryModal
          category={selectedCategory}
          onUpdate={handleEditCategory}
          onClose={() => setShowEditCategoryModal(false)}
        />
      )}

      {/* 상품 할당 모달 */}
      {showAssignProductsModal && selectedCategory && (
        <AssignProductsModal
          category={selectedCategory}
          products={products}
          onClose={() => setShowAssignProductsModal(false)}
        />
      )}
    </div>
  );
}

// 카테고리 추가 모달 컴포넌트
function AddCategoryModal({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
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
    onAdd(formData);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>카테고리 추가</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>카테고리명 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="카테고리명을 입력하세요"
              />
            </div>
            <div className={styles['form-group']}>
              <label>코드 *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                placeholder="카테고리 코드를 입력하세요"
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="카테고리에 대한 설명을 입력하세요"
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
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              카테고리 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 카테고리 수정 모달 컴포넌트
function EditCategoryModal({ category, onUpdate, onClose }) {
  const [formData, setFormData] = useState(category);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>카테고리 수정</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>카테고리명 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles['form-group']}>
              <label>코드 *</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
              />
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
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
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

// 상품 할당 모달 컴포넌트
function AssignProductsModal({ category, products, onClose }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const availableProducts = products.filter(product => 
    product.category !== category.name &&
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryProducts = products.filter(product => 
    product.category === category.name
  );

  const handleAssignProduct = (productId) => {
    // 실제 구현에서는 API 호출로 상품을 카테고리에 할당
    console.log(`상품 ${productId}를 ${category.name} 카테고리에 할당`);
  };

  const handleRemoveProduct = (productId) => {
    // 실제 구현에서는 API 호출로 상품을 카테고리에서 제거
    console.log(`상품 ${productId}를 ${category.name} 카테고리에서 제거`);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>{category.name} 카테고리 상품 할당</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <div className={styles['assignment-content']}>
          <div className={styles['assignment-section']}>
            <h3>현재 할당된 상품</h3>
            <div className={styles['products-list']}>
              {categoryProducts.map(product => (
                <div key={product.id} className={styles['product-item']}>
                  <span>{product.name} ({product.code})</span>
                  <button
                    className={`btn btn-small btn-danger ${styles['btn-small']}`}
                    onClick={() => handleRemoveProduct(product.id)}
                  >
                    제거
                  </button>
                </div>
              ))}
              {categoryProducts.length === 0 && (
                <p className={styles['no-products']}>할당된 상품이 없습니다.</p>
              )}
            </div>
          </div>

          <div className={styles['assignment-section']}>
            <h3>할당 가능한 상품</h3>
            <div className={styles['search-box']}>
              <input
                type="text"
                placeholder="상품명으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles['search-input']}
              />
            </div>
            <div className={styles['products-list']}>
              {availableProducts.map(product => (
                <div key={product.id} className={styles['product-item']}>
                  <span>{product.name} ({product.code})</span>
                  <button
                    className={`btn btn-small btn-primary ${styles['btn-small']}`}
                    onClick={() => handleAssignProduct(product.id)}
                  >
                    할당
                  </button>
                </div>
              ))}
              {availableProducts.length === 0 && (
                <p className={styles['no-products']}>할당 가능한 상품이 없습니다.</p>
              )}
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