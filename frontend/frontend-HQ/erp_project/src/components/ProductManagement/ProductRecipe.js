import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './ProductRecipe.module.css';
import searchIcon from '../../assets/search_icon.png';
import chefIcon from '../../assets/chef_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import downloadIcon from '../../assets/download_icon.png';

export default function ProductRecipe() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('recipe-management');
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [showEditRecipeModal, setShowEditRecipeModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);

  // 원재료 모달 상태
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showEditMaterialModal, setShowEditMaterialModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // API 기본 URL
  const API_BASE_URL = 'http://localhost:8080/api';

  // 원재료 데이터 불러오기
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/materials`);
      if (response.ok) {
        const data = await response.json();
        console.log('원재료 데이터 불러오기 성공:', data);
        setMaterials(data);
      } else {
        console.error('원재료 데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('원재료 데이터 요청 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  };

  // 카테고리 데이터 불러오기
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/materials/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('카테고리 데이터 요청 중 오류 발생:', error);
    }
  };

  // 공급업체 데이터 불러오기
  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/materials/suppliers`);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('공급업체 데이터 요청 중 오류 발생:', error);
    }
  };

  // 메뉴 카테고리 데이터 불러오기
  const fetchMenuCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/menu-categories`);
      if (response.ok) {
        const data = await response.json();
        console.log('메뉴 카테고리 데이터 불러오기 성공:', data);
        setCategories(data);
      } else {
        console.error('메뉴 카테고리 데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('메뉴 카테고리 데이터 요청 중 오류 발생:', error);
    }
  };

  // 원재료 삭제
  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm('정말로 이 원재료를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/materials/${materialId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setMaterials(materials.filter(material => material.id !== materialId));
          alert('원재료가 성공적으로 삭제되었습니다.');
        } else {
          alert('원재료 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('원재료 삭제 중 오류 발생:', error);
        alert('원재료 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 원재료 추가
  const handleAddMaterial = async (newMaterial) => {
    try {
      const response = await fetch(`${API_BASE_URL}/materials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMaterial),
      });

      if (response.ok) {
        const createdMaterial = await response.json();
        setMaterials([...materials, createdMaterial]);
        setShowAddMaterialModal(false);
        alert('원재료가 성공적으로 추가되었습니다.');
      } else {
        alert('원재료 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('원재료 추가 중 오류 발생:', error);
      alert('원재료 추가 중 오류가 발생했습니다.');
    }
  };

  // 원재료 수정
  const handleEditMaterial = async (updatedMaterial) => {
    try {
      const response = await fetch(`${API_BASE_URL}/materials/${updatedMaterial.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMaterial),
      });

      if (response.ok) {
        const editedMaterial = await response.json();
        setMaterials(materials.map(material =>
          material.id === editedMaterial.id ? editedMaterial : material
        ));
        setShowEditMaterialModal(false);
        alert('원재료가 성공적으로 수정되었습니다.');
      } else {
        alert('원재료 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('원재료 수정 중 오류 발생:', error);
      alert('원재료 수정 중 오류가 발생했습니다.');
    }
  };

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    if (activeTab === 'material-management') {
      fetchMaterials();
      fetchCategories();
      fetchSuppliers();
    }
  }, [activeTab]);

  // 실제 메뉴 데이터 불러오기
  const fetchMenus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/menus`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('메뉴 데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('메뉴 데이터 요청 중 오류 발생:', error);
    }
  };

  // 실제 레시피 데이터 불러오기
  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes`);
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      } else {
        console.error('레시피 데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('레시피 데이터 요청 중 오류 발생:', error);
    }
  };

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    fetchMenus();
    fetchRecipes();
    fetchMaterials(); // 원재료 데이터도 함께 불러오기
    fetchMenuCategories(); // 메뉴 카테고리 데이터도 함께 불러오기
    fetchSuppliers(); // 공급업체 데이터도 함께 불러오기
  }, []);

  // 디버깅: materials 상태 변화 추적
  useEffect(() => {
    // console.log('materials 상태 변화:', materials);
  }, [materials]);

  // 레시피 추가
  const handleAddRecipe = async (newRecipe) => {
    try {
      console.log('전송할 레시피 데이터:', newRecipe);

      const recipeData = {
        menuId: newRecipe.productId,
        name: newRecipe.productName,
        description: newRecipe.instructions,
        yieldQuantity: newRecipe.yield,
        yieldUnit: newRecipe.yieldUnit,
        instructions: newRecipe.instructions,
        preparationTime: 0,
        cookingTime: 0,
        difficulty: 'MEDIUM',
        status: 'ACTIVE',
        ingredients: newRecipe.ingredients.map(ingredient => ({
          materialId: ingredient.materialId,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          costPerUnit: ingredient.cost,
          totalCost: ingredient.quantity * ingredient.cost,
          notes: ''
        }))
      };

      console.log('API로 전송할 데이터:', recipeData);

      const response = await fetch(`${API_BASE_URL}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });

      if (response.ok) {
        const createdRecipe = await response.json();
        setRecipes([...recipes, createdRecipe]);
        setShowAddRecipeModal(false);
        alert('레시피가 성공적으로 추가되었습니다.\n메뉴의 원가도 자동으로 업데이트되었습니다.');
        
        // 데이터 다시 불러오기
        setTimeout(() => {
          fetchRecipes();
          fetchMenus();
        }, 100);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('레시피 추가 실패 - 상태 코드:', response.status);
        console.error('에러 응답:', errorData);
        
        // 중복 메뉴 에러 처리
        if (response.status === 409 || errorData.message?.includes('duplicate') || errorData.message?.includes('중복')) {
          alert(`'${newRecipe.productName}' 메뉴의 레시피가 이미 존재합니다. 기존 레시피를 수정하거나 다른 메뉴를 선택해주세요.`);
        } else {
          alert(`레시피 추가에 실패했습니다. (${response.status})`);
        }
      }
    } catch (error) {
      console.error('레시피 추가 중 오류 발생:', error);
      alert('레시피 추가 중 오류가 발생했습니다.');
    }
  };

  // 레시피 수정
  const handleEditRecipe = async (updatedRecipe) => {
    try {
      const recipeData = {
        menuId: updatedRecipe.productId,
        name: updatedRecipe.productName,
        description: updatedRecipe.instructions,
        yieldQuantity: updatedRecipe.yield,
        yieldUnit: updatedRecipe.yieldUnit,
        instructions: updatedRecipe.instructions,
        preparationTime: 0,
        cookingTime: 0,
        difficulty: 'MEDIUM',
        status: 'ACTIVE',
        ingredients: updatedRecipe.ingredients.map(ingredient => ({
          materialId: ingredient.materialId,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          costPerUnit: ingredient.cost,
          totalCost: ingredient.quantity * ingredient.cost,
          notes: ''
        }))
      };

      const response = await fetch(`${API_BASE_URL}/recipes/${updatedRecipe.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });

      if (response.ok) {
        const editedRecipe = await response.json();
        setRecipes(recipes.map(recipe =>
          recipe.id === editedRecipe.id ? editedRecipe : recipe
        ));
        setShowEditRecipeModal(false);
        alert('레시피가 성공적으로 수정되었습니다.\n메뉴의 원가도 자동으로 업데이트되었습니다.');
        
        // 데이터 다시 불러오기
        setTimeout(() => {
          fetchRecipes();
          fetchMenus();
        }, 100);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('레시피 수정 실패 - 상태 코드:', response.status);
        console.error('에러 응답:', errorData);
        alert(`레시피 수정에 실패했습니다. (${response.status})`);
      }
    } catch (error) {
      console.error('레시피 수정 중 오류 발생:', error);
      alert('레시피 수정 중 오류가 발생했습니다.');
    }
  };

  // 레시피 삭제
  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('정말로 이 레시피를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
          alert('레시피가 성공적으로 삭제되었습니다.\n메뉴의 원가도 0으로 설정되었습니다.');
          
          // 데이터 다시 불러오기
          setTimeout(() => {
            fetchRecipes();
            fetchMenus();
          }, 100);
        } else {
          alert('레시피 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('레시피 삭제 중 오류 발생:', error);
        alert('레시피 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 모든 메뉴의 원가를 레시피 원가로 일괄 업데이트하는 함수
  const handleUpdateAllMenuCosts = async () => {
    if (window.confirm('모든 메뉴의 원가를 레시피 원가로 일괄 업데이트하시겠습니까?\n이 작업은 시간이 걸릴 수 있습니다.')) {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/recipes/update-all-menu-costs`, {
          method: 'PUT',
        });

        if (response.ok) {
          const result = await response.text();
          alert(result);
          fetchMenus(); // 메뉴 데이터 다시 불러오기
          fetchRecipes(); // 레시피 데이터 다시 불러오기
        } else {
          const errorData = await response.text();
          alert(`메뉴 원가 업데이트에 실패했습니다: ${errorData}`);
        }
      } catch (error) {
        console.error('메뉴 원가 업데이트 중 오류 발생:', error);
        alert('메뉴 원가 업데이트 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };


  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.menuName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.menuCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.menuCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 원재료 필터링
  const filteredMaterials = materials.filter(material => {
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesSupplier = selectedSupplier === 'all' || material.supplier === selectedSupplier;
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSupplier && matchesSearch;
  });

  const getStatusText = (status) => {
    return status === 'ACTIVE' ? '활성' : '비활성';
  };

  const getCategoryName = (category) => {
    // 동적 카테고리 데이터에서 카테고리명 찾기
    const foundCategory = categories.find(cat => cat.name === category);
    return foundCategory ? foundCategory.name : category;
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
                 {categories.map(category => (
                   <option key={category.id} value={category.name}>
                     {category.name}
                   </option>
                 ))}
               </select>
             </div>
                         <button
               className={`btn btn-primary ${styles['add-button']}`}
               onClick={() => setShowAddRecipeModal(true)}
               title="레시피가 없는 메뉴만 선택할 수 있습니다"
             >
               <img src={plusIcon} alt="추가" className={styles['button-icon']} />
               레시피 추가
             </button>
             <button
               className={`btn btn-secondary ${styles['update-button']}`}
               onClick={handleUpdateAllMenuCosts}
               disabled={loading}
               title="모든 메뉴의 원가를 레시피 원가로 일괄 업데이트합니다"
             >
               <img src={downloadIcon} alt="업데이트" className={styles['button-icon']} />
               {loading ? '업데이트 중...' : '메뉴 원가 일괄 업데이트'}
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
                          <span className={styles['recipe-name']}>{recipe.menuName || recipe.name}</span>
                        </div>
                      </td>
                      <td>{recipe.menuCategory}</td>
                      <td>{recipe.ingredients?.length || 0}개</td>
                      <td>{recipe.totalCost ? recipe.totalCost.toLocaleString() : 0}원</td>
                      <td>{recipe.yieldQuantity}{recipe.yieldUnit}</td>
                      <td>{recipe.updatedAt ? new Date(recipe.updatedAt).toLocaleDateString() : '-'}</td>
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
                  placeholder="원재료명 또는 코드로 검색"
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
                   <option key={category.id} value={category.name}>{category.name}</option>
                 ))}
               </select>
             </div>
            <div className={styles['filter-box']}>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className={styles['filter-select']}
              >
                <option value="all">전체 공급업체</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>
            <button
              className={`btn btn-primary ${styles['add-button']}`}
              onClick={() => setShowAddMaterialModal(true)}
            >
              <img src={plusIcon} alt="추가" className={styles['button-icon']} />
              원재료 추가
            </button>
          </div>

          <div className={styles['materials-container']}>
            {loading ? (
              <div className={styles['loading']}>데이터를 불러오는 중...</div>
            ) : (
              <div className={styles['materials-list']}>
                <table className={styles['materials-table']}>
                  <thead className={styles['materials-table-header']}>
                    <tr>
                      <th>원재료명</th>
                      <th>코드</th>
                      <th>카테고리</th>
                      <th>단위</th>
                      <th>단가</th>
                      <th>공급업체</th>
                      <th>상태</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMaterials.map(material => (
                      <tr key={material.id}>
                        <td>{material.name}</td>
                        <td>{material.code}</td>
                        <td>{material.category}</td>
                        <td>{material.unit}</td>
                        <td>{material.costPerUnit ? material.costPerUnit.toLocaleString() : 0}원</td>
                        <td>{material.supplier}</td>
                        <td>
                          <span className={`${styles['status-badge']} ${material.status === 'ACTIVE' ? styles['status-active'] : styles['status-inactive']}`}>
                            {getStatusText(material.status)}
                          </span>
                        </td>
                        <td>
                          <div className={styles['action-buttons']}>
                            <button
                              className={`btn btn-small btn-primary ${styles['btn-small']}`}
                              onClick={() => {
                                setSelectedMaterial(material);
                                setShowEditMaterialModal(true);
                              }}
                            >
                              수정
                            </button>
                            <button
                              className={`btn btn-small btn-danger ${styles['btn-small']}`}
                              onClick={() => handleDeleteMaterial(material.id)}
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
            )}
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
                <h3>{recipe.menuName || recipe.name}</h3>
                <div className={styles['analysis-stats']}>
                  <div className={styles['stat-item']}>
                    <span className={styles['stat-label']}>총 원가:</span>
                    <span className={styles['stat-value']}>{recipe.totalCost ? recipe.totalCost.toLocaleString() : 0}원</span>
                  </div>
                  <div className={styles['stat-item']}>
                    <span className={styles['stat-label']}>원재료 수:</span>
                    <span className={styles['stat-value']}>{recipe.ingredients?.length || 0}개</span>
                  </div>
                  <div className={styles['stat-item']}>
                    <span className={styles['stat-label']}>수량:</span>
                    <span className={styles['stat-value']}>{recipe.yieldQuantity}{recipe.yieldUnit}</span>
                  </div>
                </div>
                <div className={styles['ingredients-list']}>
                  <h4>원재료 목록</h4>
                  {recipe.ingredients?.map((ingredient, index) => (
                    <div key={index} className={styles['ingredient-item']}>
                      <span className={styles['ingredient-name']}>{ingredient.materialName}</span>
                      <span className={styles['ingredient-quantity']}>{ingredient.quantity}{ingredient.unit}</span>
                      <span className={styles['ingredient-cost']}>{ingredient.totalCost ? ingredient.totalCost.toLocaleString() : 0}원</span>
                    </div>
                  )) || <p>원재료 정보가 없습니다.</p>}
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
           recipes={recipes}
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

      {/* 원재료 추가 모달 */}
      {showAddMaterialModal && (
        <AddMaterialModal
          categories={categories}
          suppliers={suppliers}
          onAdd={handleAddMaterial}
          onClose={() => setShowAddMaterialModal(false)}
        />
      )}

      {/* 원재료 수정 모달 */}
      {showEditMaterialModal && selectedMaterial && (
        <EditMaterialModal
          material={selectedMaterial}
          categories={categories}
          suppliers={suppliers}
          onUpdate={handleEditMaterial}
          onClose={() => setShowEditMaterialModal(false)}
        />
      )}
    </div>
  );
}

// 레시피 추가 모달 컴포넌트
function AddRecipeModal({ products, materials, recipes, onAdd, onClose }) {


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
          materialId: parseInt(value),
          materialName: material.name,
          unit: material.unit,
          cost: material.costPerUnit || 0
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

    // 중복 체크: 이미 해당 메뉴의 레시피가 존재하는지 확인
    const existingRecipe = recipes.find(recipe => recipe.menuId === parseInt(formData.productId));
    if (existingRecipe) {
      alert(`'${selectedProduct.name}' 메뉴의 레시피가 이미 존재합니다. 기존 레시피를 수정하거나 다른 메뉴를 선택해주세요.`);
      return;
    }

    // 각 재료의 totalCost를 계산하여 ingredients 배열에 추가
    const ingredientsWithTotalCost = selectedIngredients.map(ingredient => ({
      ...ingredient,
      totalCost: ingredient.quantity * ingredient.cost
    }));

    const totalCost = ingredientsWithTotalCost.reduce((sum, ingredient) => {
      return sum + ingredient.totalCost;
    }, 0);

    const newRecipe = {
      productId: parseInt(formData.productId),
      productName: selectedProduct.name,
      productCode: selectedProduct.code,
      category: selectedProduct.category?.name || selectedProduct.category,
      ingredients: ingredientsWithTotalCost,
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
                 {products.map(product => {
                   const hasRecipe = recipes.some(recipe => recipe.menuId === product.id);
                   return (
                     <option 
                       key={product.id} 
                       value={product.id}
                       disabled={hasRecipe}
                       style={hasRecipe ? { color: '#999', fontStyle: 'italic' } : {}}
                     >
                       {product.name} ({product.category?.name || product.category})
                       {hasRecipe && ' - 레시피 존재'}
                     </option>
                   );
                 })}
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

            {selectedIngredients.length === 0 && (
              <div className={styles['no-ingredients']}>
                <p>원재료를 추가해주세요. 원재료 추가 버튼을 클릭하여 레시피에 사용할 원재료를 선택하세요.</p>
              </div>
            )}
            {selectedIngredients.map((ingredient, index) => (
              <div key={index} className={styles['ingredient-row']}>
                <select className={styles['ingredient-select']}
                  value={ingredient.materialId}
                  onChange={(e) => handleIngredientChange(index, 'materialId', e.target.value)}
                  required
                >
                  <option value="" className={styles['ingredient-select-option']}>원재료를 선택하세요</option>
                  {materials && materials.length > 0 ? (
                    materials.map(material => (
                      <option key={material.id} value={material.id}>
                        {material.name} ({material.code}) 단위: {material.unit}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>원재료 데이터를 불러오는 중...</option>
                  )}
                </select>
                <input className={styles['ingredient-input']}
                  type="number"
                  placeholder="수량"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value))}
                  step="1"
                  required
                />
                <span className={styles['ingredient-unit']}>{ingredient.unit}</span>
                <span className={styles['ingredient-cost']}>
                  {(ingredient.quantity * (ingredient.cost || 0)).toLocaleString()}원
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
    productId: (recipe.productId || recipe.menuId || '').toString()
  });

  const [selectedIngredients, setSelectedIngredients] = useState(
    (recipe.ingredients || []).map(ingredient => ({
      ...ingredient,
      cost: ingredient.cost || ingredient.costPerUnit || 0
    }))
  );

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
          materialId: parseInt(value),
          materialName: material.name,
          unit: material.unit,
          cost: material.costPerUnit || 0
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

    // 각 재료의 totalCost를 계산하여 ingredients 배열에 추가
    const ingredientsWithTotalCost = selectedIngredients.map(ingredient => ({
      ...ingredient,
      totalCost: ingredient.quantity * ingredient.cost
    }));

    const totalCost = ingredientsWithTotalCost.reduce((sum, ingredient) => {
      return sum + ingredient.totalCost;
    }, 0);

    const updatedRecipe = {
      ...recipe,
      productId: parseInt(formData.productId),
      productName: selectedProduct.name,
      productCode: selectedProduct.code,
      category: selectedProduct.category?.name || selectedProduct.category,
      ingredients: ingredientsWithTotalCost,
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
          <h2>{recipe.menuName || recipe.name} 레시피 수정</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>메뉴 선택 *</label>
              <select style={{}}
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                required
              >
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.category?.name || product.category})
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

            {selectedIngredients.length === 0 && (
              <div className={styles['no-ingredients']}>
                <p>원재료를 추가해주세요. 원재료 추가 버튼을 클릭하여 레시피에 사용할 원재료를 선택하세요.</p>
              </div>
            )}
            {selectedIngredients.map((ingredient, index) => (
              <div key={index} className={styles['ingredient-row']}>
                <select className={styles['ingredient-select']}
                  value={ingredient.materialId}
                  onChange={(e) => handleIngredientChange(index, 'materialId', e.target.value)}
                  required
                >
                  {materials && materials.length > 0 ? (
                    materials.map(material => (
                      <option key={material.id} value={material.id}>
                       {material.name} ({material.code}) 단위: {material.unit}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>원재료 데이터를 불러오는 중...</option>
                  )}
                </select>
                <input className={styles['ingredient-input']}
                  type="number"
                  placeholder="수량"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value))}
                  min="0"
                  step="1"
                  required
                />
                <span className={styles['ingredient-unit']}>{ingredient.unit}</span>
                <span className={styles['ingredient-cost']}>
                  {(ingredient.quantity * (ingredient.cost || 0)).toLocaleString()}원
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

// 원재료 추가 모달 컴포넌트
function AddMaterialModal({ categories, suppliers, onAdd, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    unit: '',
    costPerUnit: 0,
    supplier: '',
    status: 'ACTIVE'
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

    const newMaterial = {
      ...formData,
      costPerUnit: parseFloat(formData.costPerUnit)
    };

    onAdd(newMaterial);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>원재료 추가</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles['add-form']}>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>원재료명 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="원재료명을 입력하세요"
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
                placeholder="코드를 입력하세요"
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
                <option value="">카테고리를 선택하세요</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className={styles['form-group']}>
              <label>단위 *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
              >
                <option value="">단위를 선택하세요</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="L">L</option>
                <option value="개">개</option>
                <option value="팩">팩</option>
                <option value="병">병</option>
              </select>
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>단가 (원) *</label>
              <input
                type="number"
                name="costPerUnit"
                value={formData.costPerUnit}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className={styles['form-group']}>
              <label>공급업체 *</label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                required
              >
                <option value="">공급업체를 선택하세요</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>상태</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
            </select>
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              원재료 추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 원재료 수정 모달 컴포넌트
function EditMaterialModal({ material, categories, suppliers, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    ...material,
    costPerUnit: material.costPerUnit || 0
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

    const updatedMaterial = {
      ...formData,
      costPerUnit: parseFloat(formData.costPerUnit)
    };

    onUpdate(updatedMaterial);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>원재료 수정</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>원재료명 *</label>
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
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className={styles['form-group']}>
              <label>단위 *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
              >
                <option value="">단위를 선택하세요</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="L">L</option>
                <option value="개">개</option>
                <option value="팩">팩</option>
                <option value="병">병</option>
              </select>
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>단가 (원) *</label>
              <input
                type="number"
                name="costPerUnit"
                value={formData.costPerUnit}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className={styles['form-group']}>
              <label>공급업체 *</label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                required
              >
                <option value="">공급업체를 선택하세요</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>상태</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
            </select>
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              원재료 수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 