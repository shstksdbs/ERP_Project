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
  const [franchiseSalesData, setFranchiseSalesData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 년/월 선택 필터 추가
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // 카테고리 데이터 가져오기
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/menu-categories');
      if (!response.ok) {
        throw new Error('카테고리 데이터를 가져오는데 실패했습니다.');
      }
      const data = await response.json();
      setCategories(data);
      console.log('카테고리 데이터:', data);
    } catch (error) {
      console.error('카테고리 데이터 가져오기 실패:', error);
      // 오류 시 기본 카테고리 설정
      setCategories([
        { id: 1, name: '음료' },
        { id: 2, name: '식품' },
        { id: 3, name: '디저트' },
        { id: 4, name: '사이드' }
      ]);
    }
  };

  // 실제 API 데이터 가져오기
  const fetchProductSalesData = async (year, month) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:8080/api/product-sales/overview?year=${year}&month=${month}`);
      
      if (!response.ok) {
        throw new Error('데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      
      // 상품 목록 생성
      // 디버깅: 상품 데이터 확인
      console.log('상품별 매출 데이터:', data.productSales);
      
      const productList = data.productSales.map(product => ({
        id: product.productId,
        name: product.productName,
        code: product.productCode,
        category: product.category,
        price: product.price,
        cost: product.cost,
        status: 'active'
      }));
      
      // 디버깅: 변환된 상품 리스트 확인
      console.log('변환된 상품 리스트:', productList);
      
      setProducts(productList);
      setSalesData(data.productSales);
      
    } catch (err) {
      console.error('상품별 매출 데이터 조회 오류:', err);
      setError(err.message);
      
      // 오류 시 빈 데이터로 초기화
      setProducts([]);
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  // 가맹점별 매출 데이터 가져오기
  const fetchFranchiseSalesData = async (year, month) => {
    try {
      console.log(`가맹점별 매출 데이터 요청: ${year}년 ${month}월`);
      const response = await fetch(`http://localhost:8080/api/product-sales/franchise-analysis?year=${year}&month=${month}`);
      
      if (!response.ok) {
        throw new Error('가맹점별 매출 데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('가맹점별 매출 데이터 응답:', data);
      setFranchiseSalesData(data);
      
    } catch (err) {
      console.error('가맹점별 매출 데이터 조회 오류:', err);
      setFranchiseSalesData(null);
    }
  };

  // 컴포넌트 마운트 시 카테고리 데이터 가져오기
  useEffect(() => {
    fetchCategories();
  }, []);

  // 년/월 변경 시 데이터 다시 가져오기
  useEffect(() => {
    fetchProductSalesData(selectedYear, selectedMonth);
    fetchFranchiseSalesData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // 카테고리 필터링은 filteredProducts에서 자동으로 처리됨

  const handleExportData = () => {
    // 데이터 내보내기 기능
    console.log('데이터 내보내기');
  };

  const handleTestData = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/product-sales/test-data');
      const data = await response.json();
      console.log('데이터베이스 테스트 결과:', data);
      alert(`데이터베이스 테스트 결과:\n지점 수: ${data.totalBranches}\n메뉴별 매출 통계 수: ${data.totalMenuSalesStats}\n카테고리별 매출 통계 수: ${data.totalCategorySalesStats}\n메뉴 수: ${data.totalMenus}`);
    } catch (error) {
      console.error('테스트 데이터 조회 오류:', error);
      alert('테스트 데이터 조회 중 오류가 발생했습니다.');
    }
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

  // 상품별 매출 추이 차트 데이터 (메뉴별 판매수 막대그래프)
  const getProductSalesTrendData = () => {
    if (!salesData || salesData.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    // 상품별 판매수 데이터 정렬 (판매수 기준 내림차순)
    const sortedProducts = [...salesData].sort((a, b) => b.monthlyQuantity - a.monthlyQuantity);
    
    // 모든 상품 표시 (제한 없음)
    const topProducts = sortedProducts;
    
    const labels = topProducts.map(product => product.productName);
    const quantities = topProducts.map(product => product.monthlyQuantity);
    
    // 색상 팔레트 (더 많은 색상으로 확장)
    const colorPalette = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
      '#14b8a6', '#f43f5e', '#a855f7', '#0ea5e9', '#22c55e',
      '#eab308', '#dc2626', '#9333ea', '#0891b2', '#16a34a',
      '#ca8a04', '#b91c1c', '#7c3aed', '#0284c7', '#15803d'
    ];
    
    // 메뉴 수에 맞춰 색상 생성
    const generateColors = (count) => {
      const colors = [];
      for (let i = 0; i < count; i++) {
        colors.push(colorPalette[i % colorPalette.length]);
      }
      return colors;
    };
    
    const colors = generateColors(labels.length);
    
    const datasets = [{
      label: '판매수',
      data: quantities,
      backgroundColor: colors.map(color => color + '80'), // 투명도 추가
      borderColor: colors,
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: colors.map(color => color + '60'),
      hoverBorderColor: colors,
      hoverBorderWidth: 3
    }];

    return { labels, datasets };
  };

  // 카테고리별 매출 분포
  const getCategoryDistributionData = () => {
    if (!salesData || salesData.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    const categoryData = {};
    salesData.forEach(product => {
      if (!categoryData[product.category]) {
        categoryData[product.category] = 0;
      }
      categoryData[product.category] += product.monthlySales;
    });

    // 카테고리별 매출 기준 내림차순 정렬
    const sortedCategories = Object.entries(categoryData)
      .sort(([,a], [,b]) => b - a)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    const labels = Object.keys(sortedCategories);
    const sales = Object.values(sortedCategories);
    
    // 실제 카테고리명 확인을 위한 로그
    console.log('실제 카테고리들:', labels);
    
    // 카테고리별 색상 매핑 (영어 카테고리명으로 수정)
    const categoryColors = {
      'Drink': '#3b82f6',    // 파란색 - 음료
      'Burger': '#10b981',        // 초록색 - 식품
      'Set': '#f59e0b',     // 주황색 - 디저트
      'Side': '#ef4444',        // 빨간색 - 사이드
      '음료': '#3b82f6',        // 파란색 - 음료 (한글도 지원)
      '식품': '#10b981',        // 초록색 - 식품 (한글도 지원)
      '디저트': '#f59e0b',      // 주황색 - 디저트 (한글도 지원)
      '사이드': '#ef4444',      // 빨간색 - 사이드 (한글도 지원)
      '기타': '#8b5cf6'         // 보라색 - 기타
    };
    
    const colors = labels.map(category => {
      // 대소문자 구분 없이 매핑
      const normalizedCategory = category.toLowerCase();
      const colorMap = {
        'drink': '#3b82f6',    // 파란색
        'burger': '#10b981',        // 초록색
        'set': '#f59e0b',     // 주황색
        'side': '#ef4444',        // 빨간색
        '음료': '#3b82f6',        // 파란색
        '식품': '#10b981',        // 초록색
        '디저트': '#f59e0b',      // 주황색
        '사이드': '#ef4444',      // 빨간색
        '기타': '#8b5cf6'         // 보라색
      };
      
      return colorMap[normalizedCategory] || colorMap[category] || '#6b7280';
    });

    return {
      labels,
      datasets: [{
        label: '매출',
        data: sales,
        backgroundColor: colors.map(color => color + 'CC'), // 더 진한 투명도
        borderColor: colors,
        borderWidth: 3,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: colors,
        hoverBorderColor: colors,
        hoverBorderWidth: 4
      }]
    };
  };

  // 가맹점별 상품 매출 차트 데이터 (메뉴별 지점 매출 비교)
  const getFranchiseProductSalesData = () => {
    console.log('getFranchiseProductSalesData 호출됨');
    console.log('franchiseSalesData:', franchiseSalesData);
    
    if (!franchiseSalesData || !franchiseSalesData.branchTopMenus || franchiseSalesData.branchTopMenus.length === 0) {
      console.log('데이터가 없어서 빈 차트 반환');
      return { labels: [], datasets: [] };
    }
    
    console.log('branchTopMenus:', franchiseSalesData.branchTopMenus);
    
    // 모든 지점의 인기 메뉴에서 고유한 메뉴명 추출
    const allMenuNames = new Set();
    franchiseSalesData.branchTopMenus.forEach(branch => {
      console.log(`지점 ${branch.branchName}의 메뉴 수:`, branch.topMenus.length);
      branch.topMenus.forEach(menu => {
        allMenuNames.add(menu.productName);
      });
    });
    
    const menuNames = Array.from(allMenuNames).sort();
    console.log('추출된 메뉴명들:', menuNames);
    
    // 지점별 데이터셋 생성 (각 지점이 하나의 데이터셋)
    const datasets = franchiseSalesData.branchTopMenus.map((branch, index) => ({
      label: branch.branchName,
      data: menuNames.map(menuName => {
        const menu = branch.topMenus.find(m => m.productName === menuName);
        return menu ? menu.sales : 0;
      }),
      backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
      hoverBackgroundColor: `hsl(${index * 60}, 70%, 40%)`,
      hoverBorderColor: `hsl(${index * 60}, 70%, 40%)`,
      hoverBorderWidth: 3
    }));

    console.log('생성된 차트 데이터:', { labels: menuNames, datasets });
    return { labels: menuNames, datasets };
  };

  // 수익률 순위 차트 데이터
  const getProfitMarginData = () => {
    if (!franchiseSalesData || !franchiseSalesData.productProfitMargins || franchiseSalesData.productProfitMargins.length === 0) {
      return { labels: [], datasets: [] };
    }
    
    // 상위 10개 상품만 표시
    const topProducts = franchiseSalesData.productProfitMargins.slice(0, 10);
    const labels = topProducts.map(product => product.productName);
    const data = topProducts.map(product => product.profitMargin);

    // 디버깅: 수익률 데이터 확인
    console.log('수익률 차트 데이터:', topProducts.map(p => ({
      name: p.productName,
      price: p.price,
      cost: p.cost,
      profitMargin: p.profitMargin
    })));

    // 수익률에 따른 색상 매핑
    const colors = data.map(profitMargin => {
      if (profitMargin >= 80) return '#10b981'; // 초록색 - 높은 수익률
      if (profitMargin >= 60) return '#3b82f6'; // 파란색 - 보통 수익률
      if (profitMargin >= 40) return '#f59e0b'; // 주황색 - 낮은 수익률
      return '#ef4444'; // 빨간색 - 매우 낮은 수익률
    });

    return {
      labels,
      datasets: [{
        label: '수익률 (%)',
        data,
        backgroundColor: colors.map(color => color + '80'), // 투명도 추가
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: colors.map(color => color + '60'),
        hoverBorderColor: colors,
        hoverBorderWidth: 3,
        // 툴팁에서 사용할 수 있도록 원본 데이터 저장
        _originalData: topProducts
      }]
    };
  };

  // 차트 옵션들
  const productSalesBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // 단일 데이터셋이므로 범례 숨김
      },
      title: {
        display: false, // 제목은 헤더에서 처리
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context) {
            return '🍽️ ' + context[0].label;
          },
          label: function(context) {
            return '판매수: ' + formatCurrency(context.parsed.y) + '개';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
            weight: '500'
          },
          maxRotation: 90,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          },
          callback: function(value) {
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
          }
            return value + '개';
        }
      }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const franchiseSalesBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
            weight: '600'
          },
          boxWidth: 12,
          boxHeight: 12
        }
      },
      title: {
        display: false, // 제목은 헤더에서 처리
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 12,
        displayColors: true,
        padding: 10,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          title: function(context) {
            return '🍽️ ' + context[0].label;
          },
          label: function(context) {
            return context.dataset.label + ': ' + formatCurrency(context.parsed.y) + '원';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 10,
            weight: '600'
          },
          maxRotation: 60,
          minRotation: 45,
          maxTicksLimit: 20 // 최대 20개까지만 표시
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          },
          callback: function(value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
          }
            return value + '원';
        }
      }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const categorySalesBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // 단일 데이터셋이므로 범례 숨김
      },
      title: {
        display: false, // 제목은 헤더에서 처리
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
        displayColors: true, // 색상 표시 활성화
        callbacks: {
          title: function(context) {
            return '📊 ' + context[0].label;
          },
          label: function(context) {
            return '매출: ' + formatCurrency(context.parsed.y) + '원';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 14,
            weight: '600'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          },
          callback: function(value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value + '원';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const profitMarginOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // 단일 데이터셋이므로 범례 숨김
      },
      title: {
        display: false, // 제목은 헤더에서 처리
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 12,
        displayColors: false,
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        callbacks: {
          title: function(context) {
            return '📈 ' + context[0].label;
          },
          label: function(context) {
            const originalData = context.dataset._originalData;
            const productData = originalData[context.dataIndex];
            
            if (productData) {
              return [
                '수익률: ' + context.parsed.y.toFixed(1) + '%',
                '판매가: ' + formatCurrency(productData.price) + '원',
                '원가: ' + formatCurrency(productData.cost) + '원',
                '월 매출: ' + formatCurrency(productData.monthlySales) + '원'
              ];
            }
            return '수익률: ' + context.parsed.y.toFixed(1) + '%';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '600'
          },
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: '500'
          },
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        
        {/* 년/월 선택 필터 */}
        <div className={styles.filterBox}>
          <select
            className={styles.filterSelect}
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                );
              })}
          </select>
        </div>
        
        <div className={styles.filterBox}>
            <select
              className={styles.filterSelect}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}월
                </option>
              ))}
            </select>
          </div>
        
        <div className={styles.filterBox}>
          <select
            className={styles.filterSelect}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">전체 카테고리</option>
            {categories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
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
          {/* 로딩 상태 */}
          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className={styles.loadingText}>데이터를 불러오는 중...</p>
            </div>
          )}
          
          {/* 오류 상태 */}
          {error && (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>⚠️</div>
              <p className={styles.errorText}>{error}</p>
              <button 
                className={styles.retryButton}
                onClick={() => fetchProductSalesData(selectedYear, selectedMonth)}
              >
                다시 시도
              </button>
            </div>
          )}
          
          {/* 데이터 표시 */}
          {!loading && !error && (
            <>
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
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={chartIcon} alt="상품 수" />
              </div>
              <div className={styles.summaryContent}>
                <h3>상품 수</h3>
                <div className={styles.summaryNumber}>
                  {salesData.length}개
                </div>
              </div>
            </div>
          </div>

          {/* 상품별 판매수 차트 - 전체 너비 */}
          <div className={styles.chartContainer} style={{ marginBottom: '32px' }}>
              <div className={styles.chartHeader}>
              <h2>상품별 판매수</h2>
              <p>{selectedYear}년 {selectedMonth}월의 모든 상품 판매수를 확인할 수 있습니다.</p>
              </div>
            <div style={{ height: '500px' }}>
              {salesData && salesData.length > 0 ? (
                <Bar data={getProductSalesTrendData()} options={productSalesBarChartOptions} />
              ) : (
                <div className={styles.emptyDataContainer}>
                  <div className={styles.emptyDataIcon}>📊</div>
                  <h3 className={styles.emptyDataTitle}>데이터가 없습니다</h3>
                  <p className={styles.emptyDataSubtitle}>선택한 기간에 판매 데이터가 없습니다.</p>
                </div>
              )}
              </div>
            </div>
            
          {/* 카테고리별 매출 분포 차트 - 아래쪽 */}
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2>카테고리별 매출 분포</h2>
                <p>음료, 식품, 디저트, 사이드별 매출 분포를 확인할 수 있습니다.</p>
              </div>
            <div style={{ height: '400px' }}>
              {salesData && salesData.length > 0 ? (
                <Bar data={getCategoryDistributionData()} options={categorySalesBarChartOptions} />
              ) : (
                <div className={styles.emptyDataContainer}>
                  <div className={styles.emptyDataIcon}>📊</div>
                  <h3 className={styles.emptyDataTitle}>데이터가 없습니다</h3>
                  <p className={styles.emptyDataSubtitle}>선택한 기간에 카테고리별 매출 데이터가 없습니다.</p>
              </div>
              )}
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {/* 매출 분석 탭 */}
      {activeTab === 'sales-analysis' && (
        <div className={styles.salesAnalysis}>
          <div className={styles.analysisHeader}>
            <h2>매출 분석</h2>
            <p>가맹점별 상품 매출과 수익률 분석을 확인할 수 있습니다.</p>
          </div>
          
                    {/* 지점별 인기 메뉴 차트 - 전체 너비 */}
          <div className={styles.chartContainer} style={{ marginBottom: '32px' }}>
              <div className={styles.chartHeader}>
              <h2>메뉴별 지점 매출 비교</h2>
              <p>선택된 월의 모든 지점의 메뉴별 매출을 비교할 수 있습니다.</p>
              </div>
            <div style={{ height: '500px' }}>
              {franchiseSalesData && franchiseSalesData.branchTopMenus && franchiseSalesData.branchTopMenus.length > 0 ? (
                <Bar data={getFranchiseProductSalesData()} options={franchiseSalesBarChartOptions} />
              ) : (
                <div className={styles.emptyDataContainer}>
                  <div className={styles.emptyDataIcon}>📊</div>
                  <h3 className={styles.emptyDataTitle}>데이터가 없습니다</h3>
                  <p className={styles.emptyDataSubtitle}>선택한 기간에 지점별 인기 메뉴 데이터가 없습니다.</p>
                </div>
              )}
              </div>
            </div>
            
          {/* 상품별 수익률 차트 - 아래쪽 */}
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2>상품별 수익률</h2>
                <p>각 상품의 수익률을 비교합니다.</p>
              </div>
            <div style={{ height: '400px' }}>
              {franchiseSalesData && franchiseSalesData.productProfitMargins && franchiseSalesData.productProfitMargins.length > 0 ? (
                <Bar data={getProfitMarginData()} options={profitMarginOptions} />
              ) : (
                <div className={styles.emptyDataContainer}>
                  <div className={styles.emptyDataIcon}>📊</div>
                  <h3 className={styles.emptyDataTitle}>데이터가 없습니다</h3>
                  <p className={styles.emptyDataSubtitle}>선택한 기간에 수익률 데이터가 없습니다.</p>
              </div>
              )}
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
            <div className={styles.filterInfo}>
              <span>총 {filteredProducts.length}개 상품</span>
              {selectedCategory !== 'all' && (
                <span className={styles.categoryFilter}>
                  ({selectedCategory} 카테고리)
                </span>
              )}
            </div>
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