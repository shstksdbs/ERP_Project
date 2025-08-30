import React, { useState, useEffect } from 'react';
import styles from './OrderRequest.module.css';
import plusIcon from '../../assets/plus_icon.png';
import searchIcon from '../../assets/search_icon.png';
import materialService from '../../services/materialService';
import supplyRequestService from '../../services/supplyRequestService';
import stockService from '../../services/stockService';

export default function OrderRequest({ branchId, loginData }) {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState({}); // 재고 데이터
  
  // 발주 신청 폼 상태
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({
    expectedDeliveryDate: '',
    priority: 'NORMAL',
    notes: ''
  });

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (branchId) {
      loadMaterials();
      loadCategories();
      loadStockData();
    }
  }, [branchId]);

  // 원재료 데이터 로드
  const loadMaterials = async () => {
    try {
      setLoading(true);
      // 실제 원재료 API 호출
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/materials`);
      
      if (!response.ok) {
        throw new Error(`원재료 데이터를 불러오는데 실패했습니다. (${response.status})`);
      }

      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('원재료 로드 실패:', error);
      // 에러 발생 시 빈 배열로 설정
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  // 재고 데이터 로드
  const loadStockData = async () => {
    try {
      // InventoryStatus.js와 동일한 API 사용
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/material-stocks/branch/${branchId}`);
      
      if (!response.ok) {
        throw new Error(`재고 데이터를 불러오는데 실패했습니다. (${response.status})`);
      }

      const stockData = await response.json();
      
      // 재고 데이터를 materialId를 키로 하는 객체로 변환
      const stockMap = {};
      stockData.forEach(stock => {
        if (stock.material) {
          stockMap[stock.material.id] = {
            currentStock: parseFloat(stock.currentStock) || 0,
            minStock: parseFloat(stock.minStock) || 0,
            maxStock: parseFloat(stock.maxStock) || 0,
            reservedStock: parseFloat(stock.reservedStock) || 0,
            availableStock: parseFloat(stock.availableStock) || 0,
            lastUpdated: stock.lastUpdated
          };
        }
      });
      
      setStockData(stockMap);
    } catch (error) {
      console.error('재고 데이터 로드 실패:', error);
      // 에러 발생 시 빈 재고 데이터로 설정
      setStockData({});
    }
  };

  // 카테고리 데이터 로드
  const loadCategories = async () => {
    try {
      // 실제 카테고리 API 호출
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/api/materials/categories`);
      
      if (!response.ok) {
        throw new Error(`카테고리 데이터를 불러오는데 실패했습니다. (${response.status})`);
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
      // 에러 발생 시 기본 카테고리 설정
      setCategories(['빵류', '패티류', '채소류', '소스류', '치즈류', '기타']);
    }
  };

  // 검색 및 필터링
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
    // 카테고리 변경 시 원재료 다시 로드
    if (branchId) {
      loadMaterials();
    }
  };

  // 발주 상품에 추가
  const handleAddToOrder = (material) => {
    const existingMaterial = selectedMaterials.find(m => m.id === material.id);
    if (existingMaterial) {
      setSelectedMaterials(prev => 
        prev.map(m => 
          m.id === material.id 
            ? { ...m, requestedQuantity: m.requestedQuantity + 1 }
            : m
        )
      );
    } else {
      // 권장 발주 수량 계산
      const stock = stockData[material.id];
      if (stock) {
        const recommendedQuantity = Math.max(
          stock.maxStock - stock.currentStock,
          stock.minStock - stock.currentStock
        );
        
        setSelectedMaterials(prev => [...prev, { 
          ...material, 
          requestedQuantity: Math.max(recommendedQuantity, 1),
          approvedQuantity: 0,
          deliveredQuantity: 0
        }]);
      } else {
        setSelectedMaterials(prev => [...prev, { 
          ...material, 
          requestedQuantity: 1,
          approvedQuantity: 0,
          deliveredQuantity: 0
        }]);
      }
    }
  };

  // 수량 변경
  const handleQuantityChange = (materialId, quantity) => {
    if (quantity <= 0) {
      setSelectedMaterials(prev => prev.filter(m => m.id !== materialId));
    } else {
      setSelectedMaterials(prev => 
        prev.map(m => 
          m.id === materialId ? { ...m, requestedQuantity: quantity } : m
        )
      );
    }
  };

  // 발주 상품 제거
  const handleRemoveFromOrder = (materialId) => {
    setSelectedMaterials(prev => prev.filter(m => m.id !== materialId));
  };

  // 발주 신청 폼 표시
  const handleShowOrderForm = () => {
    if (selectedMaterials.length === 0) {
      alert('발주할 원재료를 선택해주세요.');
      return;
    }
    setShowOrderForm(true);
  };

  // 발주 신청 폼 제출
  const handleSubmitOrder = async () => {
    try {
      setLoading(true);
      
      const supplyRequestData = {
        requestingBranchId: branchId,
        requesterId: loginData?.userId,  // 신청자 ID 추가 (안전하게 접근)
        requesterName: loginData?.realName,  // 신청자 이름 추가
        expectedDeliveryDate: orderForm.expectedDeliveryDate,
        priority: orderForm.priority,
        notes: orderForm.notes,
        items: selectedMaterials.map(material => ({
          materialId: material.id,
          requestedQuantity: material.requestedQuantity,
          unit: material.unit,
          costPerUnit: material.costPerUnit
        }))
      };

      // SupplyRequest 생성 API 호출
      const result = await supplyRequestService.createSupplyRequest(supplyRequestData);
      
      alert('발주가 성공적으로 신청되었습니다.');
      
      // 폼 초기화
      setSelectedMaterials([]);
      setShowOrderForm(false);
      setOrderForm({
        expectedDeliveryDate: '',
        priority: 'NORMAL',
        notes: ''
      });
    } catch (error) {
      console.error('발주 신청 오류:', error);
      alert('발주 신청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 발주 신청 취소
  const handleCancelOrder = () => {
    setShowOrderForm(false);
    setOrderForm({
      expectedDeliveryDate: '',
      priority: 'NORMAL',
      notes: ''
    });
  };

  // 필터링된 원재료 목록
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 총 발주 금액 계산
  const totalAmount = selectedMaterials.reduce((sum, material) => {
    return sum + (material.costPerUnit * material.requestedQuantity);
  }, 0);

  // 재고 상태에 따른 색상 반환
  const getStockStatusColor = (materialId) => {
    const stock = stockData[materialId];
    if (!stock) return '#6b7280';
    
    if (stock.currentStock < stock.minStock) {
      return '#dc2626'; // 빨간색 - 부족
    } else if (stock.currentStock > stock.maxStock * 0.8) {
      return '#f59e0b'; // 주황색 - 과다
    } else {
      return '#059669'; // 초록색 - 적정
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>발주신청</h1>
      </div>

      <div className={styles.content}>
        {/* 원재료 선택 섹션 */}
        <div className={styles.materialSection}>
          <div className={styles.sectionHeader}>
            <h2>원재료 선택</h2>
            <div className={styles.filters}>
              <div className={styles.searchContainer}>
                <img src={searchIcon} alt="검색" className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="원재료명으로 검색"
                  value={searchTerm}
                  onChange={handleSearch}
                  className={styles.searchInput}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={handleCategoryFilter}
                className={styles.categoryFilter}
              >
                <option value="all">전체 카테고리</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>로딩 중...</div>
          ) : (
            <div className={styles.materialGrid}>
              {filteredMaterials.map((material) => {
                const stock = stockData[material.id];
                const stockColor = getStockStatusColor(material.id);
                
                return (
                  <div key={material.id} className={styles.materialCard}>
                    <div className={styles.materialInfo}>
                      <h3 className={styles.materialName}>{material.name}</h3>
                      <span className={styles.materialCategory}>{material.category}</span>
                      
                      {stock && (
                        <div className={styles.stockInfo}>
                          <span style={{ color: stockColor }}>
                            현재: {stock.currentStock}{material.unit}
                          </span>
                          <span>최소: {stock.minStock}{material.unit}</span>
                          <span>최대: {stock.maxStock}{material.unit}</span>
                          {stock.lastUpdated && (
                            <span className={styles.lastUpdated}>
                              업데이트: {new Date(stock.lastUpdated).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className={styles.costInfo}>
                        <span className={styles.cost}>{material.costPerUnit.toLocaleString()}원</span>
                        <span className={styles.unit}>/{material.unit}</span>
                      </div>
                      <div className={styles.supplierInfo}>
                        <span>공급업체: {material.supplier}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToOrder(material)}
                      className={styles.addButton}
                    >
                      <img src={plusIcon} alt="추가" className={styles.addIcon} />
                      추가
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 발주 상품 섹션 */}
        <div className={styles.orderSection}>
          <div className={styles.sectionHeader}>
            <h2>발주 상품</h2>
            {selectedMaterials.length > 0 && !showOrderForm && (
              <button
                onClick={handleShowOrderForm}
                className={styles.submitButton}
              >
                발주 신청
              </button>
            )}
          </div>

          {selectedMaterials.length === 0 ? (
            <div className={styles.emptyOrder}>
              <p>발주할 원재료를 선택해주세요.</p>
            </div>
          ) : (
            <div className={styles.orderList}>
              {selectedMaterials.map((material) => (
                <div key={material.id} className={styles.orderItem}>
                  <div className={styles.orderItemInfo}>
                    <h3 className={styles.orderItemName}>{material.name}</h3>
                    <span className={styles.orderItemCategory}>{material.category}</span>
                  </div>
                  <div className={styles.orderItemQuantity}>
                    <button
                      onClick={() => handleQuantityChange(material.id, material.requestedQuantity - 1)}
                      className={styles.quantityButton}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={material.requestedQuantity}
                      onChange={(e) => handleQuantityChange(material.id, parseInt(e.target.value) || 0)}
                      className={styles.quantityInput}
                      min="1"
                    />
                    <button
                      onClick={() => handleQuantityChange(material.id, material.requestedQuantity + 1)}
                      className={styles.quantityButton}
                    >
                      +
                    </button>
                    <span className={styles.unit}>{material.unit}</span>
                  </div>
                  <div className={styles.orderItemCost}>
                    {(material.costPerUnit * material.requestedQuantity).toLocaleString()}원
                  </div>
                  <button
                    onClick={() => handleRemoveFromOrder(material.id)}
                    className={styles.removeButton}
                  >
                    제거
                  </button>
                </div>
              ))}
              <div className={styles.orderTotal}>
                <span className={styles.totalLabel}>총 금액:</span>
                <span className={styles.totalAmount}>{totalAmount.toLocaleString()}원</span>
              </div>
            </div>
          )}
        </div>

        {/* 발주 신청 폼 */}
        {showOrderForm && (
          <div className={styles.orderFormOverlay}>
            <div className={styles.orderForm}>
              <h3>발주 신청 정보</h3>
              <div className={styles.formGroup}>
                <label>신청자:</label>
                <input
                  type="text"
                  value={loginData?.realName || ''}
                  disabled
                  className={styles.disabledInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>배송 예정일:</label>
                <input
                  type="date"
                  value={orderForm.expectedDeliveryDate}
                  onChange={(e) => setOrderForm(prev => ({...prev, expectedDeliveryDate: e.target.value}))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>우선순위:</label>
                <select
                  value={orderForm.priority}
                  onChange={(e) => setOrderForm(prev => ({...prev, priority: e.target.value}))}
                >
                  <option value="LOW">낮음</option>
                  <option value="NORMAL">보통</option>
                  <option value="HIGH">높음</option>
                  <option value="URGENT">긴급</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>비고:</label>
                <textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm(prev => ({...prev, notes: e.target.value}))}
                  placeholder="발주 관련 특이사항을 입력하세요"
                  rows="3"
                />
              </div>
              <div className={styles.formButtons}>
                <button
                  onClick={handleSubmitOrder}
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? '처리 중...' : '발주 신청'}
                </button>
                <button
                  onClick={handleCancelOrder}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
