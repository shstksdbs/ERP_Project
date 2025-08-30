import React, { useState, useEffect } from 'react';
import styles from './OrderingStatus.module.css';
import searchIcon from '../../assets/search_icon.png';
import packageInIcon from '../../assets/packageIn_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import { regularOrderService } from '../../services/regularOrderService';
import { materialService } from '../../services/materialService';

export default function RegularOrdering({ branchId }) {
  const [regularOrders, setRegularOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingItem, setEditingItem] = useState({
    materialId: null,
    materialName: '',
    requestedQuantity: '',
    unit: '',
    costPerUnit: ''
  });
  const [loading, setLoading] = useState(false);
  const [newRegularOrder, setNewRegularOrder] = useState({
    orderName: '',
    description: '',
    cycleType: 'WEEKLY',
    cycleValue: 1,
    nextOrderDate: '',
    items: []
  });
  const [newItem, setNewItem] = useState({
    materialId: null,
    materialName: '',
    requestedQuantity: '',
    unit: '',
    costPerUnit: ''
  });

  // 원재료 관련 상태
  const [materials, setMaterials] = useState([]);
  const [materialCategories, setMaterialCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredMaterials, setFilteredMaterials] = useState([]);

  // 현재 로그인한 유저 정보
  const [currentUser, setCurrentUser] = useState(null);

  // 정기발주 데이터 로드
  useEffect(() => {
    if (branchId) {
      loadRegularOrders();
    }
  }, [branchId, selectedStatus]);

  // 원재료 데이터 로드
  useEffect(() => {
    loadMaterials();
  }, []);

  // 현재 로그인한 유저 정보 로드
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // 카테고리 변경 시 원재료 필터링
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredMaterials(materials);
    } else {
      setFilteredMaterials(materials.filter(material => material.category === selectedCategory));
    }
  }, [selectedCategory, materials]);

  const loadCurrentUser = () => {
    try {
      const loginData = localStorage.getItem('erpLoginData');
      if (loginData) {
        const userData = JSON.parse(loginData);
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('유저 정보 로드 오류:', error);
    }
  };

  const loadMaterials = async () => {
    try {
      const [materialsData, categoriesData] = await Promise.all([
        materialService.getAllMaterials(),
        materialService.getAllCategories()
      ]);
      setMaterials(materialsData);
      setMaterialCategories(categoriesData);
      setFilteredMaterials(materialsData);
    } catch (error) {
      console.error('원재료 로드 오류:', error);
      alert('원재료 데이터를 불러오는데 실패했습니다.');
    }
  };

  const loadRegularOrders = async () => {
    try {
      setLoading(true);
      let data;

      switch (selectedStatus) {
        case 'active':
          data = await regularOrderService.getActiveRegularOrders(branchId);
          break;
        case 'inactive':
          data = await regularOrderService.getInactiveRegularOrders(branchId);
          break;
        default:
          data = await regularOrderService.getAllRegularOrders(branchId);
          break;
      }

      setRegularOrders(data);
    } catch (error) {
      console.error('정기발주 로드 오류:', error);
      alert('정기발주 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const keyword = e.target.value;
    setSearchTerm(keyword);

    if (keyword.trim() === '') {
      loadRegularOrders();
    } else {
      try {
        const data = await regularOrderService.searchRegularOrders(branchId, keyword);
        setRegularOrders(data);
      } catch (error) {
        console.error('검색 오류:', error);
        alert('검색에 실패했습니다.');
      }
    }
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleAddRegularOrder = () => {
    setShowAddModal(true);
  };

  const handleEditRegularOrder = async (order) => {
    try {
      console.log('📝 수정 모달 열기 - 원본 order:', order);
      
      // 서버에서 최신 데이터를 새로 가져와서 깨끗하게 시작
      const latestOrder = await regularOrderService.getRegularOrderById(order.id);
      console.log('📡 서버에서 가져온 최신 데이터:', latestOrder);
      
      const mappedItems = latestOrder.items ? latestOrder.items.map(item => ({
        ...item,
        id: item.id || `existing_${item.materialId}_${Date.now()}`, // 기존 아이템에 더 안정적인 ID 부여
        isExisting: true // 기존 아이템 표시
      })) : [];
      
      console.log('🔄 매핑된 아이템들:', mappedItems);
      
      setEditingOrder({
        id: latestOrder.id,
        orderName: latestOrder.orderName,
        description: latestOrder.description,
        cycleType: latestOrder.cycleType,
        cycleValue: latestOrder.cycleValue,
        nextOrderDate: latestOrder.nextOrderDate,
        isActive: latestOrder.isActive,
        items: mappedItems
      });
      
      // 수정 모달용 아이템 입력 필드도 초기화
      setEditingItem({
        materialId: null,
        materialName: '',
        requestedQuantity: '',
        unit: '',
        costPerUnit: ''
      });
      
      setShowEditModal(true);
    } catch (error) {
      console.error('정기발주 데이터 로드 오류:', error);
      alert('정기발주 데이터를 불러오는데 실패했습니다.');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setNewRegularOrder({
      orderName: '',
      description: '',
      cycleType: 'WEEKLY',
      cycleValue: 1,
      nextOrderDate: '',
      items: []
    });
    setNewItem({
      materialId: null,
      materialName: '',
      requestedQuantity: '',
      unit: '',
      costPerUnit: ''
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingOrder(null);
    setEditingItem({
      materialId: null,
      materialName: '',
      requestedQuantity: '',
      unit: '',
      costPerUnit: ''
    });
    
    // 카테고리 필터도 초기화 (전체 카테고리로)
    setSelectedCategory('all');
  };

  const handleAddItem = () => {
    if (newItem.materialId === null || !newItem.requestedQuantity || !newItem.unit || !newItem.costPerUnit) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const item = {
      id: Date.now(),
      materialId: newItem.materialId,
      materialName: newItem.materialName,
      requestedQuantity: parseFloat(newItem.requestedQuantity),
      unit: newItem.unit,
      costPerUnit: parseFloat(newItem.costPerUnit),
      totalCost: parseFloat(newItem.requestedQuantity) * parseFloat(newItem.costPerUnit)
    };

    setNewRegularOrder(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    setNewItem({
      materialId: null,
      materialName: '',
      requestedQuantity: '',
      unit: '',
      costPerUnit: ''
    });
  };

  const handleRemoveItem = (itemId) => {
    setNewRegularOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // 원재료 선택 시 자동으로 정보 채우기
  const handleMaterialSelect = (materialId) => {
    const selectedMaterial = materials.find(material => material.id === parseInt(materialId));
    if (selectedMaterial) {
      setNewItem(prev => ({
        ...prev,
        materialId: selectedMaterial.id,
        materialName: selectedMaterial.name,
        unit: selectedMaterial.unit || '',
        costPerUnit: selectedMaterial.costPerUnit || 0
      }));
    }
  };

  const handleSaveRegularOrder = async () => {
    if (newRegularOrder.orderName.trim() === '') {
      alert('정기발주명을 입력해주세요.');
      return;
    }

    if (newRegularOrder.items.length === 0) {
      alert('최소 하나의 아이템을 추가해주세요.');
      return;
    }

    if (!newRegularOrder.nextOrderDate) {
      alert('다음 발주일을 선택해주세요.');
      return;
    }

    try {
      // 실제 API 호출을 위한 데이터 구조
      const orderData = {
        branchId: branchId,
        orderName: newRegularOrder.orderName,
        description: newRegularOrder.description,
        cycleType: newRegularOrder.cycleType,
        cycleValue: newRegularOrder.cycleValue,
        nextOrderDate: newRegularOrder.nextOrderDate,
        isActive: true,
        createdBy: currentUser ? currentUser.realName || currentUser.username : '알 수 없음',
        items: newRegularOrder.items.map(item => ({
          materialId: item.materialId,
          materialName: item.materialName,
          requestedQuantity: item.requestedQuantity,
          unit: item.unit,
          costPerUnit: item.costPerUnit
        }))
      };

      // 정기발주 생성 API 호출
      const createdOrder = await regularOrderService.createRegularOrder(orderData);

      // 성공 시 목록에 추가
      setRegularOrders(prev => [createdOrder, ...prev]);
      handleCloseModal();
      alert('정기발주가 추가되었습니다.');
    } catch (error) {
      console.error('정기발주 저장 오류:', error);
      alert('정기발주 저장에 실패했습니다.');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const updatedOrder = await regularOrderService.toggleRegularOrderStatus(id);
      setRegularOrders(prev =>
        prev.map(order =>
          order.id === id ? updatedOrder : order
        )
      );
    } catch (error) {
      console.error('상태 변경 오류:', error);
      alert('상태 변경에 실패했습니다.');
    }
  };

  const handleDeleteRegularOrder = async (id) => {
    if (window.confirm('정말로 이 정기발주를 삭제하시겠습니까?')) {
      try {
        await regularOrderService.deleteRegularOrder(id);
        setRegularOrders(prev => prev.filter(order => order.id !== id));
        alert('정기발주가 삭제되었습니다.');
      } catch (error) {
        console.error('정기발주 삭제 오류:', error);
        alert('정기발주 삭제에 실패했습니다.');
      }
    }
  };

  const handleUpdateRegularOrder = async (id) => {
    try {
      console.log('🚀 handleUpdateRegularOrder 호출됨');
      console.log('수정할 정기발주 ID:', id);
      console.log('현재 editingOrder:', editingOrder);
      console.log('현재 editingOrder.items:', editingOrder.items);
      
      // 모든 아이템을 전송 (백엔드에서 기존 아이템을 삭제하고 새로 저장)
      // 기존 아이템도 포함하여 전송해야 삭제 처리가 가능함
      const items = editingOrder.items.map(item => ({
        materialId: item.materialId,
        materialName: item.materialName,
        requestedQuantity: item.requestedQuantity,
        unit: item.unit,
        costPerUnit: item.costPerUnit
      }));
      
      console.log('전송할 items:', items);
      console.log('전송할 items 개수:', items.length);

      // 실제 API 호출을 위한 데이터 구조
      const orderData = {
        id: id,
        branchId: branchId,
        orderName: editingOrder.orderName,
        description: editingOrder.description,
        cycleType: editingOrder.cycleType,
        cycleValue: editingOrder.cycleValue,
        nextOrderDate: editingOrder.nextOrderDate,
        isActive: editingOrder.isActive,
        items: items
      };

      // 정기발주 수정 API 호출
      console.log('📡 API 호출 전 orderData:', orderData);
      const updatedOrder = await regularOrderService.updateRegularOrder(id, orderData);
      console.log('✅ API 응답:', updatedOrder);

      // 성공 시 목록 업데이트 (아이템 정보 포함)
      setRegularOrders(prev =>
        prev.map(order =>
          order.id === id ? {
            ...updatedOrder,
            items: editingOrder.items // 현재 수정된 아이템 정보 사용
          } : order
        )
      );
      handleCloseEditModal();
      alert('정기발주가 수정되었습니다.');
    } catch (error) {
      console.error('정기발주 수정 오류:', error);
      alert('정기발주 수정에 실패했습니다.');
    }
  };

  // 수정 모달에서 아이템 추가
  const handleAddEditingItem = () => {
    if (editingItem.materialId === null || !editingItem.requestedQuantity || !editingItem.unit || !editingItem.costPerUnit) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const item = {
      id: `new_${Date.now()}_${Math.random()}`, // 새로운 아이템 고유 ID
      materialId: editingItem.materialId,
      materialName: editingItem.materialName,
      requestedQuantity: parseFloat(editingItem.requestedQuantity),
      unit: editingItem.unit,
      costPerUnit: parseFloat(editingItem.costPerUnit),
      totalCost: parseFloat(editingItem.requestedQuantity) * parseFloat(editingItem.costPerUnit),
      isExisting: false // 새로운 아이템 표시
    };

    setEditingOrder(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    setEditingItem({
      materialId: null,
      materialName: '',
      requestedQuantity: '',
      unit: '',
      costPerUnit: ''
    });
  };

  // 수정 모달에서 아이템 제거
  const handleRemoveEditingItem = (itemId) => {
    setEditingOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // 수정 모달에서 기존 아이템 제거 (목록에서 완전히 제거)
  const handleRemoveExistingItem = (itemId) => {
    console.log('🔍 handleRemoveExistingItem 호출됨');
    console.log('삭제할 아이템 ID:', itemId);
    console.log('삭제 전 editingOrder.items:', editingOrder.items);
    
    setEditingOrder(prev => {
      const filteredItems = prev.items.filter(item => item.id !== itemId);
      console.log('삭제 후 filteredItems:', filteredItems);
      return {
        ...prev,
        items: filteredItems
      };
    });
  };

  // 수정 모달에서 원재료 선택 시 자동으로 정보 채우기
  const handleEditingMaterialSelect = (materialId) => {
    const selectedMaterial = materials.find(material => material.id === parseInt(materialId));
    if (selectedMaterial) {
      setEditingItem(prev => ({
        ...prev,
        materialId: selectedMaterial.id,
        materialName: selectedMaterial.name,
        unit: selectedMaterial.unit || '',
        costPerUnit: selectedMaterial.costPerUnit || 0
      }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getCycleText = (cycleType, cycleValue) => {
    switch (cycleType) {
      case 'DAILY':
        return `매일`;
      case 'WEEKLY':
        return `매주`;
      case 'MONTHLY':
        return `매${cycleValue}개월`;
      case 'YEARLY':
        return `매${cycleValue}년`;
      default:
        return cycleType;
    }
  };

  const getStatusText = (isActive) => {
    return isActive ? '활성' : '비활성';
  };

  const getStatusClass = (isActive) => {
    return isActive ? styles.statusApproved : styles.statusCancelled;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>정기발주 데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>정기발주 설정</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <img src={searchIcon} alt="검색" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="정기발주명으로 검색"
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
          <select
            value={selectedStatus}
            onChange={handleStatusFilter}
            className={styles.statusFilter}
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
          <button
            className={`btn btn-primary ${styles['add-button']}`}
            onClick={handleAddRegularOrder}
          >
            <img src={plusIcon} alt="추가" className={styles['button-icon']} />
            정기발주 추가
          </button>
        </div>
      </div>

      {loading && (
        <div className={styles.loading}>정기발주 데이터를 불러오는 중...</div>
      )}

      <div className={styles.content}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>정기발주명</th>
                <th>발주주기</th>
                <th>발주내용</th>
                <th>상태</th>
                <th>다음발주일</th>
                <th>마지막발주일</th>
                <th>등록자</th>
                <th>총금액</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {regularOrders.map((order) => (
                <tr key={order.id} className={styles.tableRow}>
                  <td className={styles.orderNumber}>{order.orderName}</td>
                  <td>{getCycleText(order.cycleType, order.cycleValue)}</td>
                  <td>
                    <div className={styles.orderItems}>
                      {order.items && order.items.map((item, index) => (
                        <div key={index} className={styles.orderItem}>
                          {item.materialName} x{item.requestedQuantity}{item.unit}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <select
                      value={order.isActive ? 'active' : 'inactive'}
                      onChange={() => handleToggleActive(order.id)}
                      className={`${styles.statusSelect} ${getStatusClass(order.isActive)}`}
                    >
                      <option value="active">활성</option>
                      <option value="inactive">비활성</option>
                    </select>
                  </td>
                  <td>{order.nextOrderDate}</td>
                  <td>{order.lastOrderDate || '-'}</td>
                  <td>{order.createdBy}</td>
                  <td className={styles.amount}>{formatCurrency(order.totalAmount || 0)}원</td>
                  <td className={styles.actions}>
                    <div className={styles['action-buttons']}>
                      <button
                        className={`btn btn-primary btn-small ${styles['btn-small']}`}
                        onClick={() => handleEditRegularOrder(order)}
                      >
                        수정
                      </button>
                      <button
                        className={`btn btn-small btn-danger ${styles['btn-small']}`}
                        onClick={() => handleDeleteRegularOrder(order.id)}
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

      {/* 정기발주 추가 모달 */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>정기발주 추가</h3>
              <button className={styles.closeButton} onClick={handleCloseModal}>×</button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.detailSection}>
                <h4>기본 정보</h4>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>정기발주명</label>
                    <input
                      type="text"
                      value={newRegularOrder.orderName}
                      onChange={(e) => setNewRegularOrder(prev => ({ ...prev, orderName: e.target.value }))}
                      placeholder="예: 주간 신선식재료"
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <label>설명</label>
                    <input
                      type="text"
                      value={newRegularOrder.description}
                      onChange={(e) => setNewRegularOrder(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="정기발주에 대한 설명"
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <label>발주주기</label>
                    <select className={styles.modalSelect}
                      value={newRegularOrder.cycleType}
                      onChange={(e) => setNewRegularOrder(prev => ({ ...prev, cycleType: e.target.value }))}
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    >
                      <option value="DAILY">매일</option>
                      <option value="WEEKLY">매주</option>
                      <option value="MONTHLY">매월</option>
                      <option value="YEARLY">매년</option>
                    </select>
                  </div>
                  <div className={styles.detailItem}>
                    <label>주기값</label>
                    <input
                      type="number"
                      min="1"
                      value={newRegularOrder.cycleValue}
                      onChange={(e) => setNewRegularOrder(prev => ({ ...prev, cycleValue: parseInt(e.target.value) }))}
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <label>다음발주일</label>
                    <input
                      type="date"
                      value={newRegularOrder.nextOrderDate}
                      onChange={(e) => setNewRegularOrder(prev => ({ ...prev, nextOrderDate: e.target.value }))}
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>발주 아이템</h4>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>카테고리</label>
                    <select className={styles.modalSelect}
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    >
                      <option value="all">전체 카테고리</option>
                      {materialCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.detailItem}>
                    <label>원재료 선택</label>
                    <select className={styles.modalSelect}
                      value={newItem.materialId || ''}
                      onChange={(e) => handleMaterialSelect(e.target.value)}
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    >
                      <option value="">원재료를 선택하세요</option>
                      {filteredMaterials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.name} ({material.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.detailItem}>
                    <label>재료명</label>
                    <input
                      type="text"
                      value={newItem.materialName}
                      onChange={(e) => setNewItem(prev => ({ ...prev, materialName: e.target.value }))}
                      placeholder="재료명"
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      readOnly
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <label>수량</label>
                    <input
                      type="number"
                      step="0.001"
                      value={newItem.requestedQuantity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, requestedQuantity: e.target.value }))}
                      placeholder="수량"
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <label>단위</label>
                    <input
                      type="text"
                      value={newItem.unit}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="kg, 개, 팩 등"
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      readOnly
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <label>단가</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.costPerUnit}
                      onChange={(e) => setNewItem(prev => ({ ...prev, costPerUnit: e.target.value }))}
                      placeholder="단가"
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      readOnly
                    />
                  </div>
                  
                </div>
                <div className={styles.addItemButton}>
                    <button
                      className={`btn btn-primary ${styles['add-button']}`}
                      onClick={handleAddItem}
                    >
                      아이템 추가
                    </button>
                  </div>

                {/* 추가된 아이템 목록 */}
                {newRegularOrder.items.length > 0 && (
                  <div className={styles.itemsTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>재료명</th>
                          <th>수량</th>
                          <th>단위</th>
                          <th>단가</th>
                          <th>총액</th>
                          <th>작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {newRegularOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.materialName}</td>
                            <td>{item.requestedQuantity}</td>
                            <td>{item.unit}</td>
                            <td>{formatCurrency(item.costPerUnit)}원</td>
                            <td>{formatCurrency(item.totalCost)}원</td>
                            <td>
                              <button
                                className="btn btn-danger btn-small"
                                onClick={() => handleRemoveItem(item.id)}
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                              >
                                삭제
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className="btn btn-secondary" onClick={handleCloseModal}>취소</button>
              <button
                className="btn btn-primary"
                onClick={handleSaveRegularOrder}
                style={{ marginLeft: '8px' }}
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 정기발주 수정 모달 */}
      {showEditModal && editingOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>정기발주 수정</h3>
              <button className={styles.closeButton} onClick={handleCloseEditModal}>×</button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.detailSection}>
                <h4>기본 정보</h4>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>정기발주명</label>
                    <input
                      type="text"
                      value={editingOrder.orderName}
                      onChange={(e) => setEditingOrder(prev => ({ ...prev, orderName: e.target.value }))}
                      placeholder="예: 주간 신선식재료"
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <label>설명</label>
                    <input
                      type="text"
                      value={editingOrder.description}
                      onChange={(e) => setEditingOrder(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="정기발주에 대한 설명"
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <label>발주주기</label>
                    <select className={styles.modalSelect}
                      value={editingOrder.cycleType}
                      onChange={(e) => setEditingOrder(prev => ({ ...prev, cycleType: e.target.value }))}
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    >
                      <option value="DAILY">매일</option>
                      <option value="WEEKLY">매주</option>
                      <option value="MONTHLY">매월</option>
                      <option value="YEARLY">매년</option>
                    </select>
                  </div>
                  <div className={styles.detailItem}>
                    <label>주기값</label>
                    <input
                      type="number"
                      min="1"
                      value={editingOrder.cycleValue}
                      onChange={(e) => setEditingOrder(prev => ({ ...prev, cycleValue: parseInt(e.target.value) }))}
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <label>다음발주일</label>
                    <input
                      type="date"
                      value={editingOrder.nextOrderDate}
                      onChange={(e) => setEditingOrder(prev => ({ ...prev, nextOrderDate: e.target.value }))}
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <label>상태</label>
                    <select className={styles.modalSelect}
                      value={editingOrder.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setEditingOrder(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    >
                      <option value="active">활성</option>
                      <option value="inactive">비활성</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>발주 아이템</h4>
                
                {/* 새로운 아이템 추가 폼 */}
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>카테고리</label>
                    <select className={styles.modalSelect}
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    >
                      <option value="all">전체 카테고리</option>
                      {materialCategories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.detailItem}>
                    <label>원재료 선택</label>
                    <select className={styles.modalSelect}
                      value={editingItem.materialId || ''}
                      onChange={(e) => handleEditingMaterialSelect(e.target.value)}
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    >
                      <option value="">원재료를 선택하세요</option>
                      {filteredMaterials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.name} ({material.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.detailItem}>
                    <label>재료명</label>
                    <input
                      type="text"
                      value={editingItem.materialName}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, materialName: e.target.value }))}
                      placeholder="재료명"
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      readOnly
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <label>수량</label>
                    <input
                      type="number"
                      step="0.001"
                      value={editingItem.requestedQuantity}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, requestedQuantity: e.target.value }))}
                      placeholder="수량"
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <label>단위</label>
                    <input
                      type="text"
                      value={editingItem.unit}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="kg, 개, 팩 등"
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      readOnly
                    />
                  </div>
                  <div className={styles.detailItem}>
                    <label>단가</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingItem.costPerUnit}
                      onChange={(e) => setEditingItem(prev => ({ ...prev, costPerUnit: e.target.value }))}
                      placeholder="단가"
                      style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      readOnly
                    />
                  </div>
                </div>
                
                <div className={styles.addItemButton}>
                  <button
                    className={`btn btn-primary ${styles['add-button']}`}
                    onClick={handleAddEditingItem}
                  >
                    아이템 추가
                  </button>
                </div>

                {/* 기존 아이템 목록 (수정 가능) */}
                {editingOrder.items && editingOrder.items.length > 0 && (
                  <div className={styles.itemsTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>재료명</th>
                          <th>수량</th>
                          <th>단위</th>
                          <th>단가</th>
                          <th>총액</th>
                          <th>작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editingOrder.items.map((item, index) => (
                          <tr key={item.id} style={{ 
                            backgroundColor: item.isExisting ? '#f8f9fa' : '#e8f5e8' 
                          }}>
                            <td>
                              {item.materialName}
                              {item.isExisting && <span style={{ fontSize: '11px', color: '#666', marginLeft: '5px' }}>(기존)</span>}
                              {!item.isExisting && <span style={{ fontSize: '11px', color: '#28a745', marginLeft: '5px' }}>(신규)</span>}
                            </td>
                            <td>{item.requestedQuantity}</td>
                            <td>{item.unit}</td>
                            <td>{formatCurrency(item.costPerUnit)}원</td>
                            <td>{formatCurrency(item.requestedQuantity * item.costPerUnit)}원</td>
                            <td>
                              <button
                                className="btn btn-danger btn-small"
                                onClick={() => item.isExisting ? handleRemoveExistingItem(item.id) : handleRemoveEditingItem(item.id)}
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                              >
                                삭제
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className="btn btn-secondary" onClick={handleCloseEditModal}>취소</button>
              <button
                className="btn btn-primary"
                onClick={() => handleUpdateRegularOrder(editingOrder.id)}
                style={{ marginLeft: '8px' }}
              >
                수정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
