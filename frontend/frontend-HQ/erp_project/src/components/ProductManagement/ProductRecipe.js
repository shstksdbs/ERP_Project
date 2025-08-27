import React, { useState, useEffect } from 'react';
import styles from './ProductRecipe.module.css';
import searchIcon from '../../assets/search_icon.png';
import chefIcon from '../../assets/chef_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import downloadIcon from '../../assets/download_icon.png';

export default function ProductRecipe() {
  const [activeTab, setActiveTab] = useState('recipe-management');
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [showEditRecipeModal, setShowEditRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // 샘플 데이터
  useEffect(() => {
    const sampleProducts = [
      { id: 1, name: '아메리카노', code: 'AM001', category: '음료' },
      { id: 2, name: '카페라떼', code: 'CL001', category: '음료' },
      { id: 3, name: '카푸치노', code: 'CP001', category: '음료' },
      { id: 4, name: '샌드위치', code: 'SW001', category: '식품' },
      { id: 5, name: '샐러드', code: 'SL001', category: '식품' },
      { id: 6, name: '티라미수', code: 'TR001', category: '디저트' }
    ];

    const sampleMaterials = [
      { id: 1, name: '원두', code: 'COFFEE_BEAN', unit: 'g', cost: 0.5, stock: 50000 },
      { id: 2, name: '우유', code: 'MILK', unit: 'ml', cost: 0.1, stock: 100000 },
      { id: 3, name: '설탕', code: 'SUGAR', unit: 'g', cost: 0.02, stock: 20000 },
      { id: 4, name: '빵', code: 'BREAD', unit: '개', cost: 800, stock: 100 },
      { id: 5, name: '치즈', code: 'CHEESE', unit: 'g', cost: 0.3, stock: 15000 },
      { id: 6, name: '양상추', code: 'LETTUCE', unit: 'g', cost: 0.05, stock: 8000 },
      { id: 7, name: '마스카포네', code: 'MASCARPONE', unit: 'g', cost: 0.8, stock: 5000 },
      { id: 8, name: '감자', code: 'POTATO', unit: 'g', cost: 0.1, stock: 25000 }
    ];

    const sampleRecipes = [
      {
        id: 1,
        productId: 1,
        productName: '아메리카노',
        productCode: 'AM001',
        category: '음료',
        ingredients: [
          { materialId: 1, materialName: '원두', quantity: 18, unit: 'g', cost: 9 },
          { materialId: 3, materialName: '설탕', quantity: 5, unit: 'g', cost: 0.1 }
        ],
        totalCost: 9.1,
        yield: 1,
        yieldUnit: '잔',
        instructions: '1. 원두를 그라인딩한다\n2. 핫워터로 추출한다\n3. 설탕을 추가한다',
        lastUpdated: '2024-03-15',
        status: 'active'
      },
      {
        id: 2,
        productId: 2,
        productName: '카페라떼',
        productCode: 'CL001',
        category: '음료',
        ingredients: [
          { materialId: 1, materialName: '원두', quantity: 18, unit: 'g', cost: 9 },
          { materialId: 2, materialName: '우유', quantity: 200, unit: 'ml', cost: 20 }
        ],
        totalCost: 29,
        yield: 1,
        yieldUnit: '잔',
        instructions: '1. 에스프레소를 추출한다\n2. 우유를 스팀한다\n3. 우유를 에스프레소에 부어준다',
        lastUpdated: '2024-03-14',
        status: 'active'
      },
      {
        id: 3,
        productId: 4,
        productName: '샌드위치',
        productCode: 'SW001',
        category: '식품',
        ingredients: [
          { materialId: 4, materialName: '빵', quantity: 2, unit: '개', cost: 1600 },
          { materialId: 5, materialName: '치즈', quantity: 30, unit: 'g', cost: 9 },
          { materialId: 6, materialName: '양상추', quantity: 20, unit: 'g', cost: 1 }
        ],
        totalCost: 1610,
        yield: 1,
        yieldUnit: '개',
        instructions: '1. 빵을 토스트한다\n2. 치즈를 올린다\n3. 양상추를 추가한다',
        lastUpdated: '2024-03-13',
        status: 'active'
      }
    ];

    setProducts(sampleProducts);
    setMaterials(sampleMaterials);
    setRecipes(sampleRecipes);
  }, []);

  const handleAddRecipe = (newRecipe) => {
    setRecipes([...recipes, { ...newRecipe, id: Date.now() }]);
    setShowAddRecipeModal(false);
  };

  const handleEditRecipe = (updatedRecipe) => {
    setRecipes(recipes.map(recipe => 
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    ));
    setShowEditRecipeModal(false);
  };

  const handleDeleteRecipe = (recipeId) => {
    if (window.confirm('정말로 이 레시피를 삭제하시겠습니까?')) {
      setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    }
  };

  const handleExportRecipeData = () => {
    // 실제 구현에서는 Excel 또는 CSV 파일로 내보내기
    console.log('레시피 데이터 내보내기');
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.productCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
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

  return (
    <div className={styles['product-recipe']}>
      <div className={styles['product-recipe-header']}>
        <h1>레시피/BOM 관리</h1>
        <p>각 메뉴의 레시피와 원재료 소요량을 관리할 수 있습니다.</p>
      </div>

      <div className={styles['tab-container']}>
        <button
          className={`${styles['tab-button']} ${activeTab === 'recipe-management' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('recipe-management')}
        >
          레시피 관리
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'material-management' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('material-management')}
        >
          원재료 관리
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'cost-analysis' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('cost-analysis')}
        >
          원가 분석
        </button>
      </div>

      {activeTab === 'recipe-management' && (
        <div className={styles['recipe-management']}>
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
                <option value="음료">음료</option>
                <option value="식품">식품</option>
                <option value="디저트">디저트</option>
                <option value="사이드">사이드</option>
              </select>
            </div>
            <button
              className={`btn btn-primary ${styles['add-button']}`}
              onClick={() => setShowAddRecipeModal(true)}
            >
              <img src={plusIcon} alt="추가" className={styles['button-icon']} />
              레시피 추가
            </button>
            <button
              className={`btn btn-primary ${styles['export-button']}`}
              onClick={handleExportRecipeData}
            >
              <img src={downloadIcon} alt="내보내기" className={styles['button-icon']} />
              레시피 내보내기
            </button>
          </div>

          <div className={styles['recipe-summary']}>
            <div className={styles['summary-card']}>
              <h3>전체 레시피</h3>
              <p className={styles['summary-number']}>{filteredRecipes.length}개</p>
            </div>
            <div className={styles['summary-card']}>
              <h3>평균 원재료 수</h3>
              <p className={styles['summary-number']}>
                {filteredRecipes.length > 0 
                  ? (filteredRecipes.reduce((sum, recipe) => sum + recipe.ingredients.length, 0) / filteredRecipes.length).toFixed(1)
                  : 0}개
              </p>
            </div>
            <div className={styles['summary-card']}>
              <h3>평균 원가</h3>
              <p className={styles['summary-number']}>
                {filteredRecipes.length > 0 
                  ? (filteredRecipes.reduce((sum, recipe) => sum + recipe.totalCost, 0) / filteredRecipes.length).toFixed(0)
                  : 0}원
              </p>
            </div>
          </div>

          <div className={styles['recipes-container']}>
            <div className={styles['recipes-list']}>
              <table className={styles['recipes-table']}>
                <thead className={styles['recipes-table-header']}>
                  <tr>
                    <th>메뉴명</th>
                    <th>카테고리</th>
                    <th>원재료 수</th>
                    <th>총 원가</th>
                    <th>수량</th>
                    <th>최종 수정일</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecipes.map(recipe => (
                    <tr key={recipe.id}>
                      <td>
                        <div className={styles['recipe-info']}>
                          <span className={styles['recipe-name']}>{recipe.productName}</span>
                          <span className={styles['recipe-code']}>{recipe.productCode}</span>
                        </div>
                      </td>
                      <td>{getCategoryName(recipe.category)}</td>
                      <td>{recipe.ingredients.length}개</td>
                      <td>{recipe.totalCost.toLocaleString()}원</td>
                      <td>{recipe.yield}{recipe.yieldUnit}</td>
                      <td>{recipe.lastUpdated}</td>
                      <td>
                        <div className={styles['action-buttons']}>
                          <button
                            className={`btn btn-small btn-primary ${styles['btn-small']}`}
                            onClick={() => {
                              setSelectedRecipe(recipe);
                              setShowEditRecipeModal(true);
                            }}
                          >
                            수정
                          </button>
                          <button
                            className={`btn btn-small btn-danger ${styles['btn-small']}`}
                            onClick={() => handleDeleteRecipe(recipe.id)}
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

      {activeTab === 'material-management' && (
        <div className={styles['material-management']}>
          <div className={styles['material-header']}>
            <h2>원재료 관리</h2>
            <p>레시피에 사용되는 원재료의 정보를 관리합니다.</p>
          </div>

          <div className={styles['materials-container']}>
            <div className={styles['materials-list']}>
              <table className={styles['materials-table']}>
                <thead className={styles['materials-table-header']}>
                  <tr>
                    <th>원재료명</th>
                    <th>코드</th>
                    <th>단위</th>
                    <th>단가</th>
                    <th>재고</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map(material => (
                    <tr key={material.id}>
                      <td>{material.name}</td>
                      <td>{material.code}</td>
                      <td>{material.unit}</td>
                      <td>{material.cost.toLocaleString()}원</td>
                      <td>
                        <span className={`${styles['stock-badge']} ${material.stock > 10000 ? styles['high-stock'] : material.stock > 5000 ? styles['medium-stock'] : styles['low-stock']}`}>
                          {material.stock.toLocaleString()}{material.unit}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles['status-badge']} ${styles['status-active']}`}>
                          활성
                        </span>
                      </td>
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
            <h2>레시피 원가 분석</h2>
            <p>메뉴별 레시피 원가와 원재료 소요량을 분석합니다.</p>
          </div>

          <div className={styles['analysis-grid']}>
            {filteredRecipes.map(recipe => (
              <div key={recipe.id} className={styles['analysis-card']}>
                <h3>{recipe.productName}</h3>
                <div className={styles['analysis-stats']}>
                  <div className={styles['stat-item']}>
                    <span className={styles['stat-label']}>총 원가:</span>
                    <span className={styles['stat-value']}>{recipe.totalCost.toLocaleString()}원</span>
                  </div>
                  <div className={styles['stat-item']}>
                    <span className={styles['stat-label']}>원재료 수:</span>
                    <span className={styles['stat-value']}>{recipe.ingredients.length}개</span>
                  </div>
                  <div className={styles['stat-item']}>
                    <span className={styles['stat-label']}>수량:</span>
                    <span className={styles['stat-value']}>{recipe.yield}{recipe.yieldUnit}</span>
                  </div>
                </div>
                <div className={styles['ingredients-list']}>
                  <h4>원재료 목록</h4>
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={index} className={styles['ingredient-item']}>
                      <span className={styles['ingredient-name']}>{ingredient.materialName}</span>
                      <span className={styles['ingredient-quantity']}>{ingredient.quantity}{ingredient.unit}</span>
                      <span className={styles['ingredient-cost']}>{ingredient.cost.toLocaleString()}원</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 레시피 추가 모달 */}
      {showAddRecipeModal && (
        <AddRecipeModal
          products={products}
          materials={materials}
          onAdd={handleAddRecipe}
          onClose={() => setShowAddRecipeModal(false)}
        />
      )}

      {/* 레시피 수정 모달 */}
      {showEditRecipeModal && selectedRecipe && (
        <EditRecipeModal
          recipe={selectedRecipe}
          products={products}
          materials={materials}
          onUpdate={handleEditRecipe}
          onClose={() => setShowEditRecipeModal(false)}
        />
      )}
    </div>
  );
}

// 레시피 추가 모달 컴포넌트
function AddRecipeModal({ products, materials, onAdd, onClose }) {
  const [formData, setFormData] = useState({
    productId: '',
    ingredients: [],
    yield: 1,
    yieldUnit: '잔',
    instructions: '',
    status: 'active'
  });

  const [selectedIngredients, setSelectedIngredients] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddIngredient = () => {
    const newIngredient = {
      materialId: '',
      materialName: '',
      quantity: 0,
      unit: '',
      cost: 0
    };
    setSelectedIngredients([...selectedIngredients, newIngredient]);
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...selectedIngredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };

    // 재료 선택 시 자동으로 정보 채우기
    if (field === 'materialId') {
      const material = materials.find(m => m.id === parseInt(value));
      if (material) {
        updatedIngredients[index] = {
          ...updatedIngredients[index],
          materialName: material.name,
          unit: material.unit,
          cost: material.cost
        };
      }
    }

    setSelectedIngredients(updatedIngredients);
  };

  const handleRemoveIngredient = (index) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedProduct = products.find(p => p.id === parseInt(formData.productId));
    
    const totalCost = selectedIngredients.reduce((sum, ingredient) => {
      return sum + (ingredient.quantity * ingredient.cost);
    }, 0);

    const newRecipe = {
      productId: parseInt(formData.productId),
      productName: selectedProduct.name,
      productCode: selectedProduct.code,
      category: selectedProduct.category,
      ingredients: selectedIngredients,
      totalCost: totalCost,
      yield: formData.yield,
      yieldUnit: formData.yieldUnit,
      instructions: formData.instructions,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: formData.status
    };

    onAdd(newRecipe);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>레시피 추가</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>메뉴 선택 *</label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                required
              >
                <option value="">메뉴를 선택하세요</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.code})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles['form-group']}>
              <label>수량</label>
              <input
                type="number"
                name="yield"
                value={formData.yield}
                onChange={handleInputChange}
                min="1"
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>수량 단위</label>
            <select
              name="yieldUnit"
              value={formData.yieldUnit}
              onChange={handleInputChange}
            >
              <option value="잔">잔</option>
              <option value="개">개</option>
              <option value="인분">인분</option>
              <option value="g">g</option>
            </select>
          </div>

          <div className={styles['ingredients-section']}>
            <div className={styles['ingredients-header']}>
              <h3>원재료</h3>
              <button
                type="button"
                className={`btn btn-small btn-primary ${styles['btn-small']}`}
                onClick={handleAddIngredient}
              >
                원재료 추가
              </button>
            </div>
            
            {selectedIngredients.map((ingredient, index) => (
              <div key={index} className={styles['ingredient-row']}>
                <select
                  value={ingredient.materialId}
                  onChange={(e) => handleIngredientChange(index, 'materialId', e.target.value)}
                  required
                >
                  <option value="">원재료 선택</option>
                  {materials.map(material => (
                    <option key={material.id} value={material.id}>
                      {material.name} ({material.unit})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="수량"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value))}
                  min="0"
                  step="0.1"
                  required
                />
                <span className={styles['ingredient-unit']}>{ingredient.unit}</span>
                <span className={styles['ingredient-cost']}>
                  {(ingredient.quantity * ingredient.cost).toLocaleString()}원
                </span>
                <button
                  type="button"
                  className={`btn btn-small btn-danger ${styles['btn-small']}`}
                  onClick={() => handleRemoveIngredient(index)}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>

          <div className={styles['form-group']}>
            <label>조리 방법</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              placeholder="조리 방법을 입력하세요"
              rows="4"
            />
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              레시피 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 레시피 수정 모달 컴포넌트
function EditRecipeModal({ recipe, products, materials, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    ...recipe,
    productId: recipe.productId.toString()
  });

  const [selectedIngredients, setSelectedIngredients] = useState(recipe.ingredients);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddIngredient = () => {
    const newIngredient = {
      materialId: '',
      materialName: '',
      quantity: 0,
      unit: '',
      cost: 0
    };
    setSelectedIngredients([...selectedIngredients, newIngredient]);
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...selectedIngredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };

    if (field === 'materialId') {
      const material = materials.find(m => m.id === parseInt(value));
      if (material) {
        updatedIngredients[index] = {
          ...updatedIngredients[index],
          materialName: material.name,
          unit: material.unit,
          cost: material.cost
        };
      }
    }

    setSelectedIngredients(updatedIngredients);
  };

  const handleRemoveIngredient = (index) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedProduct = products.find(p => p.id === parseInt(formData.productId));
    
    const totalCost = selectedIngredients.reduce((sum, ingredient) => {
      return sum + (ingredient.quantity * ingredient.cost);
    }, 0);

    const updatedRecipe = {
      ...recipe,
      productId: parseInt(formData.productId),
      productName: selectedProduct.name,
      productCode: selectedProduct.code,
      category: selectedProduct.category,
      ingredients: selectedIngredients,
      totalCost: totalCost,
      yield: formData.yield,
      yieldUnit: formData.yieldUnit,
      instructions: formData.instructions,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onUpdate(updatedRecipe);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>{recipe.productName} 레시피 수정</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>메뉴 선택 *</label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                required
              >
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.code})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles['form-group']}>
              <label>수량</label>
              <input
                type="number"
                name="yield"
                value={formData.yield}
                onChange={handleInputChange}
                min="1"
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>수량 단위</label>
            <select
              name="yieldUnit"
              value={formData.yieldUnit}
              onChange={handleInputChange}
            >
              <option value="잔">잔</option>
              <option value="개">개</option>
              <option value="인분">인분</option>
              <option value="g">g</option>
            </select>
          </div>

          <div className={styles['ingredients-section']}>
            <div className={styles['ingredients-header']}>
              <h3>원재료</h3>
              <button
                type="button"
                className={`btn btn-small btn-primary ${styles['btn-small']}`}
                onClick={handleAddIngredient}
              >
                원재료 추가
              </button>
            </div>
            
            {selectedIngredients.map((ingredient, index) => (
              <div key={index} className={styles['ingredient-row']}>
                <select
                  value={ingredient.materialId}
                  onChange={(e) => handleIngredientChange(index, 'materialId', e.target.value)}
                  required
                >
                  {materials.map(material => (
                    <option key={material.id} value={material.id}>
                      {material.name} ({material.unit})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="수량"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value))}
                  min="0"
                  step="0.1"
                  required
                />
                <span className={styles['ingredient-unit']}>{ingredient.unit}</span>
                <span className={styles['ingredient-cost']}>
                  {(ingredient.quantity * ingredient.cost).toLocaleString()}원
                </span>
                <button
                  type="button"
                  className={`btn btn-small btn-danger ${styles['btn-small']}`}
                  onClick={() => handleRemoveIngredient(index)}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>

          <div className={styles['form-group']}>
            <label>조리 방법</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              rows="4"
            />
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              레시피 수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 