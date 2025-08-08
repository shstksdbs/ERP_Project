import React, { useState, useEffect } from 'react';
import styles from './InventoryHistory.module.css';
import searchIcon from '../../assets/search_icon.png';
import historyIcon from '../../assets/history_icon.png';

export default function InventoryHistory({ branchId }) {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // 샘플 데이터
  useEffect(() => {
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
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilter = (e) => {
    setSelectedType(e.target.value);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
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
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesDateRange = (!dateRange.start || item.timestamp >= dateRange.start) &&
                            (!dateRange.end || item.timestamp <= dateRange.end);
    return matchesSearch && matchesType && matchesDateRange;
  });

  return (
    <div className={styles['inventory-history']}>
      <div className={styles['inventory-history-header']}>
        <h1>재고이력</h1>
        <p>지점 재고 변동 이력을 확인합니다.</p>
      </div>

      <div className={styles['search-filter-container']}>
        <div className={styles['search-box']}>
          <div className={styles['search-input-container']}>
            <img src={searchIcon} alt="검색" className={styles['search-icon']} />
            <input
              type="text"
              placeholder="상품명으로 검색"
              value={searchTerm}
              onChange={handleSearch}
              className={styles['search-input']}
            />
          </div>
        </div>
        <div className={styles['filter-box']}>
          <select
            value={selectedType}
            onChange={handleTypeFilter}
            className={styles['filter-select']}
          >
            <option value="all">전체 유형</option>
            <option value="in">입고</option>
            <option value="out">출고</option>
            <option value="adjustment">조정</option>
          </select>
        </div>
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
      </div>

      <div className={styles['history-container']}>
        <div className={styles['history-list']}>
          <table className={styles['history-table']}>
            <thead className={styles['history-table-header']}>
              <tr>
                <th>상품명</th>
                <th>유형</th>
                <th>수량</th>
                <th>이전재고</th>
                <th>현재재고</th>
                <th>사유</th>
                <th>담당자</th>
                <th>일시</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles['item-info']}>
                      <span className={styles['item-name']}>{item.itemName}</span>
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
                  <td>{item.employeeName}</td>
                  <td>{item.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
