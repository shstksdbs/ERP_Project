import React, { useState, useEffect } from 'react';
import styles from './ProductSales.module.css';
import chartLinearIcon from '../../assets/chartLinear_icon.png';
import searchIcon from '../../assets/search_icon.png';

export default function ProductSales({ branchId }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // 샘플 데이터
  useEffect(() => {
    const sampleProducts = [
      {
        id: 1,
        name: '아메리카노',
        category: '음료',
        totalSales: 4500000,
        quantity: 1000,
        averagePrice: 4500,
        revenue: 4500000,
        salesCount: 1000,
        profitMargin: 66.7
      },
      {
        id: 2,
        name: '카페라떼',
        category: '음료',
        totalSales: 4400000,
        quantity: 800,
        averagePrice: 5500,
        revenue: 4400000,
        salesCount: 800,
        profitMargin: 67.3
      },
      {
        id: 3,
        name: '카푸치노',
        category: '음료',
        totalSales: 3960000,
        quantity: 720,
        averagePrice: 5500,
        revenue: 3960000,
        salesCount: 720,
        profitMargin: 67.3
      },
      {
        id: 4,
        name: '샌드위치',
        category: '식품',
        totalSales: 3600000,
        quantity: 450,
        averagePrice: 8000,
        revenue: 3600000,
        salesCount: 450,
        profitMargin: 62.5
      },
      {
        id: 5,
        name: '티라떼',
        category: '음료',
        totalSales: 3000000,
        quantity: 600,
        averagePrice: 5000,
        revenue: 3000000,
        salesCount: 600,
        profitMargin: 65.0
      }
    ];

    setProducts(sampleProducts);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => b.totalSales - a.totalSales);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>상품별매출</h1>
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
            <option value="디저트">디저트</option>
          </select>
          <div className={styles.dateRange}>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className={styles.dateInput}
              placeholder="시작일"
            />
            <span className={styles.dateSeparator}>~</span>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className={styles.dateInput}
              placeholder="종료일"
            />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>순위</th>
                <th>상품명</th>
                <th>카테고리</th>
                <th>판매량</th>
                <th>평균가격</th>
                <th>총매출</th>
                <th>수익률</th>
                <th>판매횟수</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product, index) => (
                <tr key={product.id} className={styles.tableRow}>
                  <td className={styles.rank}>
                    <span className={styles.rankNumber}>{index + 1}</span>
                  </td>
                  <td className={styles.productName}>{product.name}</td>
                  <td>
                    <span className={styles.category}>{product.category}</span>
                  </td>
                  <td className={styles.quantity}>{product.quantity.toLocaleString()}개</td>
                  <td className={styles.averagePrice}>{formatCurrency(product.averagePrice)}원</td>
                  <td className={styles.totalSales}>{formatCurrency(product.totalSales)}원</td>
                  <td>
                    <div className={styles.profitMargin}>
                      <div className={styles.profitBar}>
                        <div 
                          className={styles.profitFill}
                          style={{ width: `${product.profitMargin}%` }}
                        ></div>
                      </div>
                      <span className={styles.profitText}>{product.profitMargin}%</span>
                    </div>
                  </td>
                  <td className={styles.salesCount}>{product.salesCount.toLocaleString()}회</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
