import React, { useState, useEffect } from 'react';
import styles from './InventoryStatus.module.css';
import searchIcon from '../../assets/search_icon.png';
import warehouseIcon from '../../assets/warehouse_icon.png';

export default function InventoryStatus({ branchId }) {
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 샘플 데이터
  useEffect(() => {
    const sampleInventory = [
      {
        id: 1,
        name: '아메리카노',
        category: '음료',
        currentStock: 50,
        minStock: 20,
        maxStock: 100,
        unit: '개',
        lastUpdated: '2024-01-15 14:30',
        status: 'normal'
      },
      {
        id: 2,
        name: '카페라떼',
        category: '음료',
        currentStock: 15,
        minStock: 20,
        maxStock: 80,
        unit: '개',
        lastUpdated: '2024-01-15 14:30',
        status: 'low'
      },
      {
        id: 3,
        name: '샌드위치',
        category: '식품',
        currentStock: 8,
        minStock: 10,
        maxStock: 50,
        unit: '개',
        lastUpdated: '2024-01-15 14:30',
        status: 'critical'
      },
      {
        id: 4,
        name: '우유',
        category: '원재료',
        currentStock: 25,
        minStock: 15,
        maxStock: 60,
        unit: 'L',
        lastUpdated: '2024-01-15 14:30',
        status: 'normal'
      }
    ];

    setInventory(sampleInventory);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'normal':
        return '정상';
      case 'low':
        return '부족';
      case 'critical':
        return '위험';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'normal':
        return styles.statusNormal;
      case 'low':
        return styles.statusLow;
      case 'critical':
        return styles.statusCritical;
      default:
        return '';
    }
  };

  const getStockPercentage = (current, max) => {
    return Math.round((current / max) * 100);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            <option value="음료">음료</option>
            <option value="식품">식품</option>
            <option value="원재료">원재료</option>
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
                <th>재고율</th>
                <th>상태</th>
                <th>단위</th>
                <th>최종업데이트</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className={styles.tableRow}>
                  <td className={styles.itemName}>{item.name}</td>
                  <td>
                    <span className={styles.category}>{item.category}</span>
                  </td>
                  <td className={styles.currentStock}>{item.currentStock}</td>
                  <td className={styles.minStock}>{item.minStock}</td>
                  <td className={styles.maxStock}>{item.maxStock}</td>
                  <td>
                    <div className={styles.stockBar}>
                      <div 
                        className={styles.stockFill} 
                        style={{ width: `${getStockPercentage(item.currentStock, item.maxStock)}%` }}
                      ></div>
                      <span className={styles.stockPercentage}>
                        {getStockPercentage(item.currentStock, item.maxStock)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.status} ${getStatusClass(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td>{item.unit}</td>
                  <td>{item.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
