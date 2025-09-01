import React, { useState, useEffect } from 'react';
import styles from './ProductSales.module.css';
import chartLinearIcon from '../../assets/chartLinear_icon.png';
import searchIcon from '../../assets/search_icon.png';
import { salesStatisticsService } from '../../services/salesStatisticsService';

export default function ProductSales({ branchId }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  // 실제 데이터 조회
  useEffect(() => {
    if (branchId && dateRange.start && dateRange.end) {
      fetchProductSalesData();
    }
  }, [branchId, dateRange.start, dateRange.end]);

  const fetchProductSalesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 상품별 매출 통계 조회
      const productStats = await salesStatisticsService.getProductSalesStatistics(
        branchId, 
        dateRange.start, 
        dateRange.end
      );
      
      // 카테고리별 매출 통계 조회
      const categoryStats = await salesStatisticsService.getCategorySalesStatistics(
        branchId, 
        dateRange.start, 
        dateRange.end
      );
      
      // 상품별 매출 데이터 처리
      const processedProducts = productStats.map(stat => {
        const [menuStats, menuName, menuCategory, menuPrice] = stat;
        
        // 수익률 계산 (순매출 / 총매출 * 100)
        const totalSales = Number(menuStats.totalSales || 0);
        const netSales = Number(menuStats.netSales || 0);
        const profitMargin = totalSales > 0 ? Math.round((netSales / totalSales) * 100) : 0;
        
        return {
          id: menuStats.menuId,
          name: menuName || `메뉴 ID: ${menuStats.menuId}`,
          category: menuCategory || '미분류',
          totalSales: totalSales,
          quantity: menuStats.quantitySold || 0,
          averagePrice: Number(menuPrice || 0),
          revenue: netSales,
          salesCount: menuStats.quantitySold || 0,
          profitMargin: profitMargin
        };
      });
      
      // 중복된 상품 데이터를 하나로 합치기
      const mergedProducts = processedProducts.reduce((acc, product) => {
        const existingProduct = acc.find(p => p.id === product.id);
        
        if (existingProduct) {
          // 기존 상품이 있으면 데이터 누적
          existingProduct.quantity += product.quantity;
          existingProduct.totalSales += product.totalSales;
          existingProduct.revenue += product.revenue;
          existingProduct.salesCount += product.salesCount;
          
          // 평균가격은 기존 가격 유지 (동일한 상품이므로)
          // 수익률은 누적된 데이터로 재계산
          existingProduct.profitMargin = existingProduct.totalSales > 0 
            ? Math.round((existingProduct.revenue / existingProduct.totalSales) * 100) 
            : 0;
        } else {
          // 새로운 상품이면 추가
          acc.push({ ...product });
        }
        
        return acc;
      }, []);
      
      // 카테고리 목록 추출
      const uniqueCategories = [...new Set(mergedProducts.map(p => p.category))];
      setCategories(uniqueCategories);
      
      setProducts(mergedProducts);
    } catch (err) {
      console.error('상품별 매출 데이터 조회 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
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

      {loading ? (
        <div className={styles.loading}>
          <p>상품별 매출 데이터를 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className={styles.error}>
          <p>오류가 발생했습니다: {error}</p>
          <button onClick={fetchProductSalesData} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      ) : (
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
              {sortedProducts.length > 0 ? (
                sortedProducts.map((product, index) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan="8" className={styles.noData}>
                    <p>선택한 기간의 상품별 매출 데이터가 없습니다.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
