import React, { useState, useEffect } from 'react';
import styles from './ProductSalesAnalysis.module.css';
import searchIcon from '../../assets/search_icon.png';
import chartIcon from '../../assets/chart_icon.png';
import downloadIcon from '../../assets/download_icon.png';
import trendingUpIcon from '../../assets/trendingUp_icon.png';
import dollorIcon from '../../assets/dollor_icon.png';
import percentIcon from '../../assets/percent_icon.png';
import productIcon from '../../assets/product_icon.png';
import chartPieIcon from '../../assets/chartPie_icon.png';
import chartLinearIcon from '../../assets/chartLinear_icon.png';

// Chart.js 컴포넌트들
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  ArcElement 
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  ArcElement
);

export default function ProductSalesAnalysis() {
  const [activeTab, setActiveTab] = useState('sales-overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);

  // 샘플 상품 데이터
  useEffect(() => {
    const sampleProducts = [
      { id: 1, name: '아메리카노', code: 'AM001', category: '음료', price: 4500, cost: 1500, status: 'active' },
      { id: 2, name: '카페라떼', code: 'CL001', category: '음료', price: 5500, cost: 1800, status: 'active' },
      { id: 3, name: '카푸치노', code: 'CP001', category: '음료', price: 5500, cost: 1800, status: 'active' },
      { id: 4, name: '샌드위치', code: 'SW001', category: '식품', price: 8000, cost: 3000, status: 'active' },
      { id: 5, name: '샐러드', code: 'SL001', category: '식품', price: 12000, cost: 4500, status: 'active' },
      { id: 6, name: '티라미수', code: 'TR001', category: '디저트', price: 6500, cost: 2200, status: 'active' },
      { id: 7, name: '치즈케이크', code: 'CK001', category: '디저트', price: 7000, cost: 2500, status: 'active' },
      { id: 8, name: '감자튀김', code: 'FF001', category: '사이드', price: 3500, cost: 1200, status: 'active' }
    ];

    const sampleSalesData = [
      {
        productId: 1,
        productName: '아메리카노',
        productCode: 'AM001',
        category: '음료',
        monthlySales: 12500000,
        monthlyQuantity: 2778,
        monthlyGrowth: 15.2,
        avgPrice: 4500,
        profitMargin: 66.7,
        salesByMonth: [10000000, 11000000, 12000000, 12500000, 13000000, 13500000],
        salesByFranchise: {
          '강남점': 2500000,
          '홍대점': 2000000,
          '부산점': 1800000,
          '대구점': 1500000,
          '인천점': 1200000
        }
      },
      {
        productId: 2,
        productName: '카페라떼',
        productCode: 'CL001',
        category: '음료',
        monthlySales: 11000000,
        monthlyQuantity: 2000,
        monthlyGrowth: 12.8,
        avgPrice: 5500,
        profitMargin: 67.3,
        salesByMonth: [9000000, 9500000, 10000000, 11000000, 11500000, 12000000],
        salesByFranchise: {
          '강남점': 2200000,
          '홍대점': 1800000,
          '부산점': 1600000,
          '대구점': 1400000,
          '인천점': 1000000
        }
      },
      {
        productId: 3,
        productName: '카푸치노',
        productCode: 'CP001',
        category: '음료',
        monthlySales: 9500000,
        monthlyQuantity: 1727,
        monthlyGrowth: 8.5,
        avgPrice: 5500,
        profitMargin: 67.3,
        salesByMonth: [8000000, 8500000, 9000000, 9500000, 10000000, 10500000],
        salesByFranchise: {
          '강남점': 1900000,
          '홍대점': 1600000,
          '부산점': 1400000,
          '대구점': 1200000,
          '인천점': 900000
        }
      },
      {
        productId: 4,
        productName: '샌드위치',
        productCode: 'SW001',
        category: '식품',
        monthlySales: 8000000,
        monthlyQuantity: 1000,
        monthlyGrowth: 20.1,
        avgPrice: 8000,
        profitMargin: 62.5,
        salesByMonth: [6000000, 6500000, 7000000, 8000000, 8500000, 9000000],
        salesByFranchise: {
          '강남점': 1600000,
          '홍대점': 1400000,
          '부산점': 1200000,
          '대구점': 1000000,
          '인천점': 800000
        }
      },
      {
        productId: 5,
        productName: '샐러드',
        productCode: 'SL001',
        category: '식품',
        monthlySales: 6000000,
        monthlyQuantity: 500,
        monthlyGrowth: 25.3,
        avgPrice: 12000,
        profitMargin: 62.5,
        salesByMonth: [4000000, 4500000, 5000000, 6000000, 6500000, 7000000],
        salesByFranchise: {
          '강남점': 1200000,
          '홍대점': 1000000,
          '부산점': 900000,
          '대구점': 800000,
          '인천점': 600000
        }
      },
      {
        productId: 6,
        productName: '티라미수',
        productCode: 'TR001',
        category: '디저트',
        monthlySales: 5200000,
        monthlyQuantity: 800,
        monthlyGrowth: 18.7,
        avgPrice: 6500,
        profitMargin: 66.2,
        salesByMonth: [4000000, 4300000, 4600000, 5200000, 5500000, 5800000],
        salesByFranchise: {
          '강남점': 1040000,
          '홍대점': 900000,
          '부산점': 800000,
          '대구점': 700000,
          '인천점': 500000
        }
      },
      {
        productId: 7,
        productName: '치즈케이크',
        productCode: 'CK001',
        category: '디저트',
        monthlySales: 4900000,
        monthlyQuantity: 700,
        monthlyGrowth: 14.2,
        avgPrice: 7000,
        profitMargin: 64.3,
        salesByMonth: [4000000, 4200000, 4400000, 4900000, 5200000, 5500000],
        salesByFranchise: {
          '강남점': 980000,
          '홍대점': 850000,
          '부산점': 750000,
          '대구점': 650000,
          '인천점': 450000
        }
      },
      {
        productId: 8,
        productName: '감자튀김',
        productCode: 'FF001',
        category: '사이드',
        monthlySales: 2800000,
        monthlyQuantity: 800,
        monthlyGrowth: 5.8,
        avgPrice: 3500,
        profitMargin: 65.7,
        salesByMonth: [2500000, 2600000, 2700000, 2800000, 2900000, 3000000],
        salesByFranchise: {
          '강남점': 560000,
          '홍대점': 500000,
          '부산점': 450000,
          '대구점': 400000,
          '인천점': 300000
        }
      }
    ];

    setProducts(sampleProducts);
    setSalesData(sampleSalesData);
  }, []);

  const handleExportData = () => {
    // 데이터 내보내기 기능
    console.log('데이터 내보내기');
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? '#10b981' : '#ef4444';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      '음료': '#3b82f6',
      '식품': '#10b981',
      '디저트': '#f59e0b',
      '사이드': '#ef4444'
    };
    return colorMap[category] || '#6b7280';
  };

  const getProfitMarginColor = (margin) => {
    if (margin >= 30) return '#10b981';
    if (margin >= 20) return '#f59e0b';
    if (margin >= 10) return '#ef4444';
    return '#6b7280';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // 상품별 매출 추이 차트 데이터
  const getProductSalesTrendData = () => {
    const labels = ['1월', '2월', '3월', '4월', '5월', '6월'];
    const datasets = salesData.slice(0, 5).map((product, index) => ({
      label: product.productName,
      data: product.salesByMonth,
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.1)`,
      tension: 0.4,
      fill: false
    }));

    return { labels, datasets };
  };

  // 카테고리별 매출 분포
  const getCategoryDistributionData = () => {
    const categoryData = {};
    salesData.forEach(product => {
      if (!categoryData[product.category]) {
        categoryData[product.category] = 0;
      }
      categoryData[product.category] += product.monthlySales;
    });

    return {
      labels: Object.keys(categoryData),
      datasets: [{
        data: Object.values(categoryData),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderWidth: 2
      }]
    };
  };

  // 가맹점별 상품 매출 차트 데이터
  const getFranchiseProductSalesData = () => {
    const franchises = ['강남점', '홍대점', '부산점', '대구점', '인천점'];
    const datasets = salesData.slice(0, 5).map((product, index) => ({
      label: product.productName,
      data: franchises.map(franchise => product.salesByFranchise[franchise] || 0),
      backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      borderWidth: 1
    }));

    return { labels: franchises, datasets };
  };

  // 수익률 순위 차트 데이터
  const getProfitMarginData = () => {
    const sortedProducts = [...salesData].sort((a, b) => b.profitMargin - a.profitMargin);
    const labels = sortedProducts.map(product => product.productName);
    const data = sortedProducts.map(product => product.profitMargin);

    return {
      labels,
      datasets: [{
        label: '수익률 (%)',
        data,
        backgroundColor: data.map((_, index) => `hsl(${index * 30}, 70%, 50%)`),
        borderColor: data.map((_, index) => `hsl(${index * 30}, 70%, 50%)`),
        borderWidth: 1
      }]
    };
  };

  // 차트 옵션들
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '상품별 매출 추이'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value) + '원';
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '가맹점별 상품 매출'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value) + '원';
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: '카테고리별 매출 분포'
      },
    }
  };

  const profitMarginOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '상품별 수익률'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.productSalesAnalysis}>
      <div className={styles.productSalesAnalysisHeader}>
        <div>
          <h1>상품별 매출분석</h1>
          <p>본사에서 각 상품의 매출 현황과 수익성을 분석할 수 있습니다.</p>
        </div>
      </div>

      {/* 탭 컨테이너 */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'sales-overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('sales-overview')}
        >
          매출 개요
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'sales-analysis' ? styles.active : ''}`}
          onClick={() => setActiveTab('sales-analysis')}
        >
          매출 분석
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'product-details' ? styles.active : ''}`}
          onClick={() => setActiveTab('product-details')}
        >
          상품 상세
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.searchFilterContainer}>
        <div className={styles.searchBox}>
          <div className={styles.searchInputContainer}>
            <img src={searchIcon} alt="검색" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="상품명 또는 코드로 검색"
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.filterBox}>
          <select
            className={styles.filterSelect}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="month">월별</option>
            <option value="quarter">분기별</option>
            <option value="year">연도별</option>
          </select>
        </div>
        <div className={styles.filterBox}>
          <select
            className={styles.filterSelect}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">전체 카테고리</option>
            <option value="음료">음료</option>
            <option value="식품">식품</option>
            <option value="디저트">디저트</option>
            <option value="사이드">사이드</option>
          </select>
        </div>
        <button className={styles.exportButton} onClick={handleExportData}>
          <img src={downloadIcon} alt="내보내기" className={styles.buttonIcon} />
          데이터 내보내기
        </button>
      </div>

      {/* 매출 개요 탭 */}
      {activeTab === 'sales-overview' && (
        <div className={styles.salesOverview}>
          {/* 요약 카드 */}
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={dollorIcon} alt="총 매출" />
              </div>
              <div className={styles.summaryContent}>
                <h3>총 매출</h3>
                <div className={styles.summaryNumber}>
                  {formatCurrency(salesData.reduce((sum, product) => sum + product.monthlySales, 0))}원
                </div>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={trendingUpIcon} alt="평균 성장률" />
              </div>
              <div className={styles.summaryContent}>
                <h3>평균 성장률</h3>
                <div className={styles.summaryNumber}>
                  {formatPercentage(salesData.reduce((sum, product) => sum + product.monthlyGrowth, 0) / salesData.length)}
                </div>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={productIcon} alt="총 판매량" />
              </div>
              <div className={styles.summaryContent}>
                <h3>총 판매량</h3>
                <div className={styles.summaryNumber}>
                  {formatCurrency(salesData.reduce((sum, product) => sum + product.monthlyQuantity, 0))}개
                </div>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={percentIcon} alt="평균 수익률" />
              </div>
              <div className={styles.summaryContent}>
                <h3>평균 수익률</h3>
                <div className={styles.summaryNumber}>
                  {formatPercentage(Math.round(salesData.reduce((sum, product) => sum + product.profitMargin, 0) / salesData.length))}
                </div>
              </div>
            </div>
          </div>

          {/* 차트 영역 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2>상품별 매출 추이</h2>
                <p>각 상품의 월별 매출 추이를 확인할 수 있습니다.</p>
              </div>
              <div style={{ height: '300px' }}>
                <Line data={getProductSalesTrendData()} options={lineChartOptions} />
              </div>
            </div>
            
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2>카테고리별 매출 분포</h2>
                <p>음료, 식품, 디저트, 사이드별 매출 분포를 확인할 수 있습니다.</p>
              </div>
              <div style={{ height: '300px' }}>
                <Pie data={getCategoryDistributionData()} options={pieChartOptions} />
              </div>
            </div>
          </div>

          
        </div>
      )}

      {/* 매출 분석 탭 */}
      {activeTab === 'sales-analysis' && (
        <div className={styles.salesAnalysis}>
          <div className={styles.analysisHeader}>
            <h2>매출 분석</h2>
            <p>가맹점별 상품 매출과 수익률 분석을 확인할 수 있습니다.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2>가맹점별 상품 매출</h2>
                <p>각 가맹점에서의 상품별 매출을 비교합니다.</p>
              </div>
              <div style={{ height: '300px' }}>
                <Bar data={getFranchiseProductSalesData()} options={barChartOptions} />
              </div>
            </div>
            
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2>상품별 수익률</h2>
                <p>각 상품의 수익률을 비교합니다.</p>
              </div>
              <div style={{ height: '300px' }}>
                <Bar data={getProfitMarginData()} options={profitMarginOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상품 상세 탭 */}
      {activeTab === 'product-details' && (
        <div className={styles.productDetails}>
          <div className={styles.detailsHeader}>
            <h2>상품 상세 정보</h2>
            <p>각 상품의 상세 매출 정보를 확인할 수 있습니다.</p>
          </div>
          
          {/* 상품 목록 */}
          <div className={styles.productList}>
            <div className={styles.productContainer}>
              <div className={styles.productList}>
                <table className={styles.productTable}>
                  <thead className={styles.productTableHeader}>
                    <tr>
                      <th>상품명</th>
                      <th>상품코드</th>
                      <th>카테고리</th>
                      <th>판매가</th>
                      <th>원가</th>
                      <th>월 매출</th>
                      <th>성장률</th>
                      <th>판매량</th>
                      <th>수익률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => {
                      const salesInfo = salesData.find(s => s.productId === product.id);
                      if (!salesInfo) return null;

                      return (
                        <tr key={product.id}>
                          <td>
                            <div className={styles.productInfo}>
                              <span className={styles.productName}>{product.name}</span>
                              <span className={styles.productUnit}>{product.unit}</span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.productCodeInfo}>
                              <span className={styles.productCode}>{product.code}</span>
                            </div>
                          </td>
                          <td>
                            <span 
                              className={styles.productCategoryBadge}
                              style={{ 
                                backgroundColor: getCategoryColor(product.category),
                                color: 'white'
                              }}
                            >
                              {product.category}
                            </span>
                          </td>
                          <td>{formatCurrency(product.price)}원</td>
                          <td>{formatCurrency(product.cost)}원</td>
                          <td>{formatCurrency(salesInfo.monthlySales)}원</td>
                          <td>
                            <span 
                              className={styles.growthRate}
                              style={{ color: getGrowthColor(salesInfo.monthlyGrowth) }}
                            >
                              {formatPercentage(salesInfo.monthlyGrowth)}
                            </span>
                          </td>
                          <td>{formatCurrency(salesInfo.monthlyQuantity)}개</td>
                          <td>
                            <span 
                              className={styles.profitMargin}
                              style={{ color: getProfitMarginColor(salesInfo.profitMargin) }}
                            >
                              {salesInfo.profitMargin}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 