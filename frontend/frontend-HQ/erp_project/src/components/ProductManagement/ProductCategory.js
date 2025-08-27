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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // API 호출 함수들
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      // 모든 카테고리 조회 (활성/비활성 구분 없이)
      const response = await fetch('http://localhost:8080/api/menu-categories/admin');
      if (!response.ok) {
        throw new Error('카테고리 데이터를 가져오는데 실패했습니다');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
      console.error('카테고리 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/menus');
      if (!response.ok) {
        throw new Error('상품 데이터를 가져오는데 실패했습니다');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('상품 조회 오류:', err);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleAddCategory = async (newCategory) => {
    try {
      setLoading(true);
      setError('');

      // 유효성 검사
      if (!newCategory.name.trim() || !newCategory.code.trim()) {
        throw new Error('카테고리명과 코드는 필수입니다');
      }

      // 코드 중복 확인
      const existingCategory = categories.find(cat => cat.name === newCategory.code.toLowerCase());
      if (existingCategory) {
        throw new Error('이미 존재하는 코드입니다');
      }

      // 표시명 중복 확인
      const existingDisplayName = categories.find(cat => cat.displayName === newCategory.name.trim());
      if (existingDisplayName) {
        throw new Error('이미 존재하는 카테고리명입니다');
      }

      const response = await fetch('http://localhost:8080/api/menu-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategory.code.toLowerCase().trim(),
          displayName: newCategory.name.trim(),
          description: newCategory.description.trim() || null,
          displayOrder: categories.length + 1,
          isActive: newCategory.status === 'active',
          imageUrl: null,
          parentCategoryId: null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `카테고리 추가에 실패했습니다 (${response.status})`);
      }

      const createdCategory = await response.json();
      console.log('카테고리가 성공적으로 추가되었습니다:', createdCategory);

      await fetchCategories(); // 카테고리 목록 새로고침
      setShowAddCategoryModal(false);

      // 성공 메시지 표시
      setError('');
      alert('카테고리가 성공적으로 추가되었습니다!');

      // 성공 메시지만 표시 (폼 초기화는 모달 컴포넌트에서 처리)
    } catch (err) {
      setError(err.message);
      console.error('카테고리 추가 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (updatedCategory) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`http://localhost:8080/api/menu-categories/${updatedCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updatedCategory.code.toLowerCase(),
          displayName: updatedCategory.name,
          description: updatedCategory.description,
          displayOrder: updatedCategory.displayOrder || 1,
          isActive: updatedCategory.status === 'active',
          imageUrl: null,
          parentCategoryId: null
        }),
      });

      if (!response.ok) {
        throw new Error('카테고리 수정에 실패했습니다');
      }

      await fetchCategories(); // 카테고리 목록 새로고침
      setShowEditCategoryModal(false);
    } catch (err) {
      setError(err.message);
      console.error('카테고리 수정 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('정말로 이 카테고리를 삭제하시겠습니까?\n\n⚠️ 주의: 삭제된 카테고리는 복구할 수 없습니다.')) {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`http://localhost:8080/api/menu-categories/${categoryId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('카테고리 삭제에 실패했습니다');
        }

        // 성공 메시지 표시
        alert('카테고리가 성공적으로 삭제되었습니다.');
        await fetchCategories(); // 카테고리 목록 새로고침
      } catch (err) {
        setError(err.message);
        console.error('카테고리 삭제 오류:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredCategories = categories.filter(category => {
    return category.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 활성/비활성 카테고리 개수 계산
  const activeCategoriesCount = categories.filter(cat => cat.isActive).length;
  const inactiveCategoriesCount = categories.filter(cat => !cat.isActive).length;

  const getStatusText = (status) => {
    return status === 'active' ? '활성' : '비활성';
  };

  return (
    <div className={styles['product-category']}>
      <div className={styles['product-category-header']}>
        <h1>상품 카테고리 관리</h1>
        <div className={styles['category-stats']} style={{ marginTop: '8px', color: '#6b7280', fontSize: '14px' }}>
          총 {categories.length}개 카테고리 (활성: {activeCategoriesCount}개, 비활성: {inactiveCategoriesCount}개)
        </div>
        {error && (
          <div className={styles['error-message']} style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </div>
        )}
      </div>

      {/* <div className={styles['tab-container']}>
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
      </div> */}

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
            {/* <button
              className={`btn btn-secondary ${styles['refresh-button']}`}
              onClick={fetchCategories}
              disabled={loading}
              style={{ marginLeft: '10px' }}
            >
              새로고침
            </button> */}
          </div>

          <div className={styles['categories-container']}>
            {loading ? (
              <div className={styles['loading-message']} style={{ textAlign: 'center', padding: '20px' }}>
                카테고리 데이터를 불러오는 중...
              </div>
            ) : (
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
                        <td>{category.displayName}</td>
                        <td>{category.name}</td>
                        <td>{category.description}</td>
                        <td>{category.menuCount || 0}개</td>
                        <td>
                          <span className={`${styles['status-badge']} ${styles[`status-${category.isActive ? 'active' : 'inactive'}`]}`}>
                            {getStatusText(category.isActive ? 'active' : 'inactive')}
                          </span>
                        </td>
                        <td>{category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '-'}</td>
                        <td>
                          <div className={styles['action-buttons']}>
                            <button
                              className={`btn btn-primary btn-small ${styles['btn-small']}`}
                              onClick={() => {
                                setSelectedCategory({
                                  ...category,
                                  code: category.name,
                                  name: category.displayName,
                                  status: category.isActive ? 'active' : 'inactive',
                                  displayOrder: category.displayOrder
                                });
                                setShowEditCategoryModal(true);
                              }}
                            >
                              수정
                            </button>
                            <button
                              className={`btn btn-small btn-danger ${styles['btn-small']}`}
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={loading}
                              title="이 카테고리를 영구적으로 삭제합니다"
                            >
                              {loading ? '처리중...' : '삭제'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                  {category.displayName} ({category.menuCount || 0}개) {!category.isActive && '(비활성)'}
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
              <h3>{selectedCategory.displayName} 카테고리 상품 목록</h3>
              <div className={styles['products-grid']}>
                {products.filter(product => product.categoryId === selectedCategory.id).map(product => (
                  <div key={product.id} className={styles['product-card']}>
                    <div className={styles['product-info']}>
                      <h4>{product.name}</h4>
                      <p>{product.description}</p>
                      <span className={`${styles['status-badge']} ${styles[`status-${product.isAvailable ? 'active' : 'inactive'}`]}`}>
                        {getStatusText(product.isAvailable ? 'active' : 'inactive')}
                      </span>
                    </div>
                  </div>
                ))}
                {products.filter(product => product.categoryId === selectedCategory.id).length === 0 && (
                  <div className={styles['no-products-message']}>
                    <p>이 카테고리에 등록된 상품이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles['all-categories-products']}>
              {categories.map(category => (
                <div key={category.id} className={styles['category-section']}>
                  <h4 className={styles['category-title']}>
                    {category.displayName} ({category.menuCount || 0}개)
                    <span className={`${styles['status-badge']} ${styles[`status-${category.isActive ? 'active' : 'inactive'}`]}`}>
                      {getStatusText(category.isActive ? 'active' : 'inactive')}
                    </span>
                  </h4>
                  <div className={styles['products-grid']}>
                    {products.filter(product => product.categoryId === category.id).map(product => (
                      <div key={product.id} className={styles['product-card']}>
                        <div className={styles['product-info']}>
                          <h5>{product.name}</h5>
                          <p>{product.description}</p>
                          <span className={`${styles['status-badge']} ${styles[`status-${product.isAvailable ? 'active' : 'inactive'}`]}`}>
                            {getStatusText(product.isAvailable ? 'active' : 'inactive')}
                          </span>
                        </div>
                      </div>
                    ))}
                    {products.filter(product => product.categoryId === category.id).length === 0 && (
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

  // 테스트용 기본값 설정 (개발 완료 후 제거 가능)
  useEffect(() => {
    // 개발 환경에서만 기본값 설정
    if (process.env.NODE_ENV === 'development') {
      setFormData({
        name: '테스트 카테고리',
        code: 'test',
        description: '테스트용 카테고리입니다',
        status: 'active'
      });
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 입력 시 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '카테고리명을 입력해주세요';
    }

    if (!formData.code.trim()) {
      newErrors.code = '코드를 입력해주세요';
    } else if (formData.code.length < 2) {
      newErrors.code = '코드는 2자 이상이어야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onAdd(formData);
      // 성공 시 폼 초기화
      setFormData({
        name: '',
        code: '',
        description: '',
        status: 'active'
      });
      setErrors({});
    } catch (error) {
      console.error('카테고리 추가 중 오류:', error);
    } finally {
      setLoading(false);
    }
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
                className={errors.name ? styles['error-input'] : ''}
              />
              {errors.name && <span className={styles['error-text']}>{errors.name}</span>}
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
                className={errors.code ? styles['error-input'] : ''}
              />
              {errors.code && <span className={styles['error-text']}>{errors.code}</span>}
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
            <button type="button" className="btn btn-primary" onClick={onClose} disabled={loading}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '추가 중...' : '카테고리 추가'}
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
    product.categoryId !== category.id &&
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryProducts = products.filter(product =>
    product.categoryId === category.id
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
          <h2>{category.displayName} 카테고리 상품 할당</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>

        <div className={styles['assignment-content']}>
          <div className={styles['assignment-section']}>
            <h3>현재 할당된 상품</h3>
            <div className={styles['products-list']}>
              {categoryProducts.map(product => (
                <div key={product.id} className={styles['product-item']}>
                  <span>{product.name}</span>
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
            <div className={styles['search-input-container']}>
                <img
                  src={searchIcon}
                  alt="검색"
                  className={styles['search-icon']}
                />
                <input
                  type="text"
                  placeholder="상품명으로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles['search-input']}
                />
              </div>
            </div>
            <div className={styles['products-list']}>
              {availableProducts.map(product => (
                <div key={product.id} className={styles['product-item']}>
                  <span>{product.name}</span>
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