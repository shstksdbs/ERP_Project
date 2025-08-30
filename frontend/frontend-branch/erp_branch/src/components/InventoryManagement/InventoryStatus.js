import React, { useState, useEffect } from 'react';
import styles from './InventoryStatus.module.css';
import searchIcon from '../../assets/search_icon.png';
import warehouseIcon from '../../assets/warehouse_icon.png';

export default function InventoryStatus({ branchId }) {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  // 지점별 재고 데이터 조회
  useEffect(() => {
    if (branchId) {
      fetchInventoryData();
    }
  }, [branchId]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      console.log('재고 데이터 조회 시작 - 지점 ID:', branchId);
      console.log('API URL:', `${API_BASE_URL}/api/material-stocks/branch/${branchId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/material-stocks/branch/${branchId}`);
      
      console.log('API 응답 상태:', response.status);
      console.log('API 응답 헤더:', response.headers);
      console.log('응답 Content-Type:', response.headers.get('content-type'));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 오류 응답:', errorText);
        throw new Error(`재고 데이터를 불러오는데 실패했습니다. (${response.status})`);
      }

      const data = await response.json();
      console.log('받은 데이터:', data);
      console.log('데이터 타입:', typeof data);
      console.log('데이터 개수:', Array.isArray(data) ? data.length : '배열이 아님');
      
      if (Array.isArray(data)) {
        console.log('첫 번째 항목 구조:', data[0]);
        console.log('첫 번째 항목의 material 객체:', data[0]?.material);
        console.log('첫 번째 항목의 branch 객체:', data[0]?.branch);
      }
      
      if (!Array.isArray(data) || data.length === 0) {
        console.warn('데이터가 비어있거나 배열이 아닙니다. 샘플 데이터로 대체합니다.');
        setSampleData();
        return;
      }
      
      // 재고 상태 계산 및 데이터 가공
      const processedData = data.map((stock, index) => {
        //console.log(`처리 중인 재고 데이터 ${index}:`, stock);
        
        // material 객체가 null인지 확인
        if (!stock.material) {
          console.warn(`material 객체가 null입니다 (인덱스 ${index}):`, stock);
          return null;
        }
        
        const status = calculateStockStatus(stock);
        const processedItem = {
          id: stock.id || 0,
          name: stock.material.name || '이름 없음',
          category: stock.material.category || '카테고리 없음',
          currentStock: parseFloat(stock.currentStock) || 0,
          minStock: parseFloat(stock.minStock) || 0,
          maxStock: parseFloat(stock.maxStock) || 0,
          reservedStock: parseFloat(stock.reservedStock) || 0,
          availableStock: parseFloat(stock.availableStock) || 0,
          unit: stock.material.unit || '단위 없음',
          lastUpdated: formatDateTime(stock.lastUpdated),
          status: status,
          costPerUnit: parseFloat(stock.material.costPerUnit) || 0,
          supplier: stock.material.supplier || '공급업체 없음'
        };
        
        //console.log(`가공된 항목 ${index}:`, processedItem);
        return processedItem;
      }).filter(item => item !== null); // null 항목 제거
      
      console.log('최종 가공된 데이터:', processedData);
      console.log('가공된 데이터 개수:', processedData.length);
      
      setInventory(processedData);
      setError(null);
    } catch (err) {
      console.error('재고 데이터 조회 오류:', err);
      console.error('오류 상세 정보:', {
        message: err.message,
        stack: err.stack,
        branchId: branchId,
        apiUrl: `${API_BASE_URL}/api/material-stocks/branch/${branchId}`
      });
      setError(err.message);
      // 에러 발생 시 샘플 데이터로 대체
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  // 샘플 데이터 설정 (API 오류 시 대체)
  const setSampleData = () => {
    const sampleInventory = [
      {
        id: 1,
        name: '브리오슈 번',
        category: '빵류',
        currentStock: 120,
        minStock: 30,
        maxStock: 500,
        unit: '개',
        lastUpdated: '2024-01-15 14:30',
        status: 'low'
      },
      {
        id: 2,
        name: '소고기 패티',
        category: '패티류',
        currentStock: 1500,
        minStock: 2000,
        maxStock: 8000,
        unit: 'g',
        lastUpdated: '2024-01-15 14:30',
        status: 'critical'
      },
      {
        id: 3,
        name: '양상추',
        category: '채소',
        currentStock: 1500,
        minStock: 2000,
        maxStock: 8000,
        unit: 'g',
        lastUpdated: '2024-01-15 14:30',
        status: 'low'
      },
      {
        id: 4,
        name: '치즈',
        category: '치즈',
        currentStock: 400,
        minStock: 200,
        maxStock: 2000,
        unit: '개',
        lastUpdated: '2024-01-15 14:30',
        status: 'normal'
      }
    ];
    setInventory(sampleInventory);
  };

  // 재고 상태 계산
  const calculateStockStatus = (stock) => {
    const current = parseFloat(stock.currentStock) || 0;
    const min = parseFloat(stock.minStock) || 0;
    const max = parseFloat(stock.maxStock) || 0;
    
    if (current <= min) {
      return 'critical'; // 위험 (최소 재고 이하)
    } else if (current <= min * 1.2) {
      return 'low'; // 부족 (최소 재고의 1.2배 이하)
    } else if (current <= min * 1.5) {
      return 'warning'; // 주의 (최소 재고의 1.5배 이하)
    } else if (current >= max * 0.8) {
      return 'excess'; // 과다 (최대 재고의 80% 이상)
    } else {
      return 'normal'; // 정상
    }
  };

  // 날짜 포맷팅
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'normal':
        return '정상';
      case 'warning':
        return '주의';
      case 'low':
        return '부족';
      case 'critical':
        return '위험';
      case 'excess':
        return '과다';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'normal':
        return styles.statusNormal;
      case 'warning':
        return styles.statusWarning;
      case 'low':
        return styles.statusLow;
      case 'critical':
        return styles.statusCritical;
      case 'excess':
        return styles.statusExcess;
      default:
        return '';
    }
  };

  const getStockPercentage = (current, max) => {
    if (!current || !max || max === 0 || typeof current !== 'number' || typeof max !== 'number') {
      return 0;
    }
    return Math.round((current / max) * 100);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>재고 데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>오류가 발생했습니다: {error}</p>
          <p>샘플 데이터로 표시됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>재고현황</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <img src={searchIcon} alt="검색" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="상품명으로 검색"
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
            <option value="빵류">빵류</option>
            <option value="패티류">패티류</option>
            <option value="채소">채소</option>
            <option value="치즈">치즈</option>
            <option value="육류">육류</option>
            <option value="소스류">소스류</option>
            <option value="사이드">사이드</option>
            <option value="음료">음료</option>
            <option value="조미료">조미료</option>
          </select>
          <select
            value={selectedStatus}
            onChange={handleStatusFilter}
            className={styles.statusFilter}
          >
            <option value="all">전체 상태</option>
            <option value="normal">정상</option>
            <option value="warning">주의</option>
            <option value="low">부족</option>
            <option value="critical">위험</option>
            <option value="excess">과다</option>
          </select>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>상품명</th>
                <th>카테고리</th>
                <th>현재재고</th>
                <th>최소재고</th>
                <th>최대재고</th>
                <th>사용가능</th>
                <th>재고율</th>
                <th>상태</th>
                <th>단위</th>
                <th>최종업데이트</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className={styles.tableRow}>
                  <td className={styles.itemName}>{item.name || 'N/A'}</td>
                  <td>
                    <span className={styles.category}>{item.category || 'N/A'}</span>
                  </td>
                  <td className={styles.currentStock}>
                    {typeof item.currentStock === 'number' ? item.currentStock.toLocaleString() : '0'}
                  </td>
                  <td className={styles.minStock}>
                    {typeof item.minStock === 'number' ? item.minStock.toLocaleString() : '0'}
                  </td>
                  <td className={styles.maxStock}>
                    {typeof item.maxStock === 'number' ? item.maxStock.toLocaleString() : '0'}
                  </td>
                  <td className={styles.availableStock}>
                    {typeof item.availableStock === 'number' ? item.availableStock.toLocaleString() : '0'}
                  </td>
                  <td>
                    <div className={styles.stockBar}>
                      <div 
                        className={styles.stockFill} 
                        style={{ 
                          width: `${getStockPercentage(
                            item.currentStock || 0, 
                            item.maxStock || 1
                          )}%` 
                        }}
                      ></div>
                      <span className={styles.stockPercentage}>
                        {getStockPercentage(item.currentStock || 0, item.maxStock || 1)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.status} ${getStatusClass(item.status || 'normal')}`}>
                      {getStatusText(item.status || 'normal')}
                    </span>
                  </td>
                  <td>{item.unit || 'N/A'}</td>
                  <td>{item.lastUpdated || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
