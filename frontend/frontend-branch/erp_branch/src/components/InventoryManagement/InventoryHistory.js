import React, { useState, useEffect } from 'react';
import styles from './InventoryHistory.module.css';
import searchIcon from '../../assets/search_icon.png';
import historyIcon from '../../assets/history_icon.png';

export default function InventoryHistory({ branchId }) {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API 기본 URL
  const API_BASE_URL = 'http://localhost:8080/api';

  // 재고 이동 이력 데이터 로드
  useEffect(() => {
    if (branchId) {
      fetchInventoryHistory();
    }
  }, [branchId, selectedType, dateRange.start, dateRange.end]);

  // 재고 이동 이력 조회
  const fetchInventoryHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // API 파라미터 구성
      const params = new URLSearchParams();
      if (selectedType !== 'all') {
        params.append('movementType', selectedType);
      }
      if (dateRange.start) {
        params.append('startDate', dateRange.start);
      }
      if (dateRange.end) {
        params.append('endDate', dateRange.end);
      }
      if (searchTerm.trim()) {
        params.append('searchTerm', searchTerm.trim());
      }

      const url = `${API_BASE_URL}/stock-movements/branch/${branchId}?${params.toString()}`;
      console.log('재고 이동 이력 API 호출:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`재고 이동 이력 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('재고 이동 이력 데이터:', data);
      
      setHistory(data);
      
    } catch (err) {
      console.error('재고 이동 이력 조회 오류:', err);
      setError(err.message);
      
      // 에러 발생 시 샘플 데이터 사용
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  // 샘플 데이터 로드 (API 오류 시 사용)
  const loadSampleData = () => {
    const sampleHistory = [
      {
        id: 1,
        itemName: '카페라떼',
        type: 'in',
        quantity: 50,
        previousStock: 15,
        currentStock: 65,
        reason: '발주 입고',
        employeeName: '김직원',
        timestamp: '2024-01-15 14:30'
      },
      {
        id: 2,
        itemName: '샌드위치',
        type: 'out',
        quantity: 5,
        previousStock: 13,
        currentStock: 8,
        reason: '주문 출고',
        employeeName: '박직원',
        timestamp: '2024-01-15 14:25'
      },
      {
        id: 3,
        itemName: '우유',
        type: 'in',
        quantity: 20,
        previousStock: 25,
        currentStock: 45,
        reason: '발주 입고',
        employeeName: '김직원',
        timestamp: '2024-01-15 14:20'
      },
      {
        id: 4,
        itemName: '아메리카노',
        type: 'out',
        quantity: 10,
        previousStock: 60,
        currentStock: 50,
        reason: '주문 출고',
        employeeName: '박직원',
        timestamp: '2024-01-15 14:15'
      }
    ];

    setHistory(sampleHistory);
  };

  // 검색 처리
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // 검색 실행
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInventoryHistory();
  };

  // 타입 필터 변경
  const handleTypeFilter = (e) => {
    setSelectedType(e.target.value);
  };

  // 날짜 범위 변경
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  // 새로고침
  const handleRefresh = () => {
    fetchInventoryHistory();
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'in':
        return '입고';
      case 'out':
        return '출고';
      case 'adjustment':
        return '조정';
      default:
        return type;
    }
  };

  const getTypeClass = (type) => {
    switch (type) {
      case 'in':
        return styles.typeIn;
      case 'out':
        return styles.typeOut;
      case 'adjustment':
        return styles.typeAdjustment;
      default:
        return '';
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className={styles['inventory-history']}>
        <div className={styles['inventory-history-header']}>
          <h1>재고이력</h1>
          <p>지점 재고 변동 이력을 확인합니다.</p>
        </div>
        <div className={styles['loading']}>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['inventory-history']}>
        <div className={styles['inventory-history-header']}>
          <h1>재고이력</h1>
          <p>지점 재고 변동 이력을 확인합니다.</p>
        </div>
        <div className={styles['error']}>
          <p>오류가 발생했습니다: {error}</p>
          <button onClick={handleRefresh} className={styles['refresh-button']}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['inventory-history']}>
      <div className={styles['inventory-history-header']}>
        <h1>재고이력</h1>
        <p>지점 재고 변동 이력을 확인합니다.</p>
      </div>

      <div className={styles['search-filter-container']}>
        <form onSubmit={handleSearchSubmit} className={styles['search-box']}>
          <div className={styles['search-input-container']}>
            <img src={searchIcon} alt="검색" className={styles['search-icon']} />
            <input
              type="text"
              placeholder="상품명으로 검색"
              value={searchTerm}
              onChange={handleSearch}
              className={styles['search-input']}
            />
            {/* <button type="submit" className={styles['search-button']}>
              검색
            </button> */}
          </div>
        </form>
        {/* <div className={styles['filter-box']}>
          {<select
            value={selectedType}
            onChange={handleTypeFilter}
            className={styles['filter-select']}
          >
            <option value="all">전체 유형</option>
            <option value="in">입고</option>
            <option value="out">출고</option>
            <option value="adjustment">조정</option>
          </select> 
        </div> */}
        <div className={styles['date-range']}>
          <input
            type="date"
            name="start"
            value={dateRange.start}
            onChange={handleDateChange}
            className={styles['date-input']}
            placeholder="시작일"
          />
          <span className={styles['date-separator']}>~</span>
          <input
            type="date"
            name="end"
            value={dateRange.end}
            onChange={handleDateChange}
            className={styles['date-input']}
            placeholder="종료일"
          />
        </div>
        <button onClick={handleRefresh} className={styles['refresh-button']}>
          새로고침
        </button>
      </div>

      <div className={styles['history-container']}>
        <div className={styles['history-summary']}>
          <div className={styles['summary-card']}>
            <h3>전체 이력</h3>
            <p className={styles['summary-number']}>{filteredHistory.length}건</p>
          </div>
          <div className={styles['summary-card']}>
            <h3>입고</h3>
            <p className={styles['summary-number']}>
              {filteredHistory.filter(item => item.type === 'in').length}건
            </p>
          </div>
          <div className={styles['summary-card']}>
            <h3>출고</h3>
            <p className={styles['summary-number']}>
              {filteredHistory.filter(item => item.type === 'out').length}건
            </p>
          </div>
          <div className={styles['summary-card']}>
            <h3>조정</h3>
            <p className={styles['summary-number']}>
              {filteredHistory.filter(item => item.type === 'adjustment').length}건
            </p>
          </div>
        </div>

        <div className={styles['history-list']}>
          {filteredHistory.length === 0 ? (
            <div className={styles['empty-state']}>
              <p>재고 변동 이력이 없습니다.</p>
            </div>
          ) : (
            <table className={styles['history-table']}>
              <thead className={styles['history-table-header']}>
                <tr>
                  <th>상품명</th>
                  <th>유형</th>
                  <th>수량</th>
                  <th>이전재고</th>
                  <th>현재재고</th>
                  <th>사유</th>
                  <th>일시</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className={styles['item-info']}>
                        <span className={styles['item-name']}>{item.itemName}</span>
                        {item.itemCategory && (
                          <span className={styles['item-category']}>{item.itemCategory}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`${styles['type-badge']} ${styles[`type-${item.type}`]}`}>
                        {getTypeText(item.type)}
                      </span>
                    </td>
                    <td className={`${styles['quantity']} ${item.type === 'in' ? styles['quantity-in'] : styles['quantity-out']}`}>
                      {item.type === 'in' ? '+' : '-'}{item.quantity}
                    </td>
                    <td>{item.previousStock}</td>
                    <td className={styles['current-stock']}>{item.currentStock}</td>
                    <td>{item.reason}</td>
                    <td>{item.timestamp}</td>
                    <td>{item.employeeName}</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
