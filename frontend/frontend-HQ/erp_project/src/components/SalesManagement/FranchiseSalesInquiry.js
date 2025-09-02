import React, { useState, useEffect } from 'react';
import styles from './FranchiseSalesInquiry.module.css';
import searchIcon from '../../assets/search_icon.png';
import chartIcon from '../../assets/chart_icon.png';
import downloadIcon from '../../assets/download_icon.png';
import trendingUpIcon from '../../assets/trendingUp_icon.png';
import dollorIcon from '../../assets/dollor_icon.png';
import percentIcon from '../../assets/percent_icon.png';
import userIcon from '../../assets/user_icon.png';
import storeIcon from '../../assets/store_icon.png';
import chartPieIcon from '../../assets/chartPie_icon.png';
import chartLinearIcon from '../../assets/chartLinear_icon.png';

// Chart.js 컴포넌트들
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

export default function FranchiseSalesInquiry() {
  const [activeTab, setActiveTab] = useState('sales-overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedFranchise, setSelectedFranchise] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [franchises, setFranchises] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [salesOverview, setSalesOverview] = useState(null);
  const [dailyTrendData, setDailyTrendData] = useState(null);

  // API 호출 함수
  const fetchSalesOverview = async (year, month) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/api/sales/overview?year=${year}&month=${month}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSalesOverview(data);

      // 가맹점 데이터 변환
      const franchiseList = data.franchises.map(franchise => ({
        id: franchise.branchId,
        name: franchise.branchName,
        code: franchise.branchCode,
        region: '서울', // 기본값, 실제로는 API에서 받아와야 함
        status: 'active',
        manager: franchise.managerName,
        type: franchise.branchType === 'franchise' ? '가맹점' : '직영점'
      }));

      // 매출 데이터 변환
      const salesList = data.franchises.map(franchise => ({
        franchiseId: franchise.branchId,
        franchiseName: franchise.branchName,
        franchiseCode: franchise.branchCode,
        type: franchise.branchType === 'franchise' ? '가맹점' : '직영점',
        monthlySales: franchise.monthlySales,
        totalOrders: franchise.totalOrders,
        customerCount: franchise.totalOrders, // 임시로 주문수와 동일하게 설정
        avgOrderValue: franchise.avgOrderValue,
        topProducts: franchise.topProducts.map(product => product.name),
        salesByMonth: [72000000, 78000000, 82000000, 85000000, 88000000, 92000000], // 임시 데이터
        salesByCategory: franchise.salesByCategory,
        salesByTime: convertTimeSales(franchise.salesByTime)
      }));

      setFranchises(franchiseList);
      setSalesData(salesList);

    } catch (err) {
      console.error('매출 데이터 조회 실패:', err);
      setError('매출 데이터를 불러오는데 실패했습니다.');

      // 에러 시 빈 데이터로 초기화
      setFranchises([]);
      setSalesData([]);
      setSalesOverview(null);
    } finally {
      setLoading(false);
    }
  };

  // 시간대별 매출 데이터 변환 함수
  const convertTimeSales = (timeSales) => {
    console.log('원본 시간대별 데이터:', timeSales);
    
    const converted = {
      '오전(6-12시)': 0,
      '오후(12-18시)': 0,
      '저녁(18-24시)': 0
    };

    Object.keys(timeSales).forEach(hour => {
      const hourNum = parseInt(hour);
      const value = parseFloat(timeSales[hour]) || 0;
      
      console.log(`시간 ${hour}시 (${hourNum}): ${value}원`);
      
      if (hourNum >= 6 && hourNum < 12) {
        converted['오전(6-12시)'] += value;
        console.log(`오전(6-12시)에 추가: ${value}원, 총합: ${converted['오전(6-12시)']}원`);
      } else if (hourNum >= 12 && hourNum < 18) {
        converted['오후(12-18시)'] += value;
        console.log(`오후(12-18시)에 추가: ${value}원, 총합: ${converted['오후(12-18시)']}원`);
      } else if (hourNum >= 18 && hourNum <= 24) {
        converted['저녁(18-24시)'] += value;
        console.log(`저녁(18-24시)에 추가: ${value}원, 총합: ${converted['저녁(18-24시)']}원`);
      }
    });

    console.log('변환된 시간대별 데이터:', converted);
    return converted;
  };

  // 일별 매출 추이 데이터 조회 함수
  const fetchDailyTrendData = async (year, month) => {
    try {
      const response = await fetch(`http://localhost:8080/api/sales/trend?year=${year}&month=${month}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDailyTrendData(data);

    } catch (err) {
      console.error('일별 매출 추이 데이터 조회 실패:', err);
      setDailyTrendData(null);
    }
  };

  // 초기 데이터 로드 및 연월 변경 시 데이터 재조회
  useEffect(() => {
    fetchSalesOverview(selectedYear, selectedMonth);
    fetchDailyTrendData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  const handleExportData = () => {
    // 데이터 내보내기 기능
    console.log('데이터 내보내기');
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? '#10b981' : '#ef4444';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // 일별 매출 추이 차트 데이터 (막대그래프용)
  const getDailySalesTrendData = () => {
    if (!dailyTrendData || !dailyTrendData.dates || !dailyTrendData.branches) {
      return { labels: [], datasets: [] };
    }

    // 날짜를 더 읽기 쉽게 변환 (예: "12/01", "12/02")
    const labels = dailyTrendData.dates.map(date => {
      const dateObj = new Date(date);
      return `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}`;
    });

    // 막대그래프용 색상 팔레트
    const colors = [
      { background: 'rgba(59, 130, 246, 0.8)', border: '#3B82F6' }, // Blue
      { background: 'rgba(16, 185, 129, 0.8)', border: '#10B981' }, // Emerald
      { background: 'rgba(245, 158, 11, 0.8)', border: '#F59E0B' }, // Amber
      { background: 'rgba(239, 68, 68, 0.8)', border: '#EF4444' }, // Red
      { background: 'rgba(139, 92, 246, 0.8)', border: '#8B5CF6' }, // Violet
      { background: 'rgba(6, 182, 212, 0.8)', border: '#06B6D4' }, // Cyan
      { background: 'rgba(132, 204, 22, 0.8)', border: '#84CC16' }, // Lime
      { background: 'rgba(249, 115, 22, 0.8)', border: '#F97316' }, // Orange
    ];

    const datasets = dailyTrendData.branches.map((branch, index) => {
      const colorIndex = index % colors.length;
      return {
        label: branch.branchName,
        data: branch.dailySales,
        backgroundColor: colors[colorIndex].background,
        borderColor: colors[colorIndex].border,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
        hoverBackgroundColor: colors[colorIndex].border,
        hoverBorderColor: colors[colorIndex].border,
        hoverBorderWidth: 2
      };
    });

    return { labels, datasets };
  };

  // 카테고리별 매출 차트 데이터
  const getCategorySalesData = () => {
    if (!salesData || salesData.length === 0) {
      return { labels: [], datasets: [] };
    }

    // 모든 지점의 카테고리 데이터에서 고유한 카테고리명 추출
    const allCategories = new Set();
    salesData.forEach(franchise => {
      if (franchise.salesByCategory) {
        Object.keys(franchise.salesByCategory).forEach(category => {
          allCategories.add(category);
        });
      }
    });

    const categories = Array.from(allCategories).sort();
    
    // 개선된 색상 팔레트
    const colorPalette = [
      { background: 'rgba(59, 130, 246, 0.8)', border: '#3B82F6', hover: 'rgba(59, 130, 246, 0.9)' },
      { background: 'rgba(16, 185, 129, 0.8)', border: '#10B981', hover: 'rgba(16, 185, 129, 0.9)' },
      { background: 'rgba(245, 158, 11, 0.8)', border: '#F59E0B', hover: 'rgba(245, 158, 11, 0.9)' },
      { background: 'rgba(239, 68, 68, 0.8)', border: '#EF4444', hover: 'rgba(239, 68, 68, 0.9)' },
      { background: 'rgba(139, 92, 246, 0.8)', border: '#8B5CF6', hover: 'rgba(139, 92, 246, 0.9)' },
      { background: 'rgba(6, 182, 212, 0.8)', border: '#06B6D4', hover: 'rgba(6, 182, 212, 0.9)' },
      { background: 'rgba(132, 204, 22, 0.8)', border: '#84CC16', hover: 'rgba(132, 204, 22, 0.9)' },
      { background: 'rgba(249, 115, 22, 0.8)', border: '#F97316', hover: 'rgba(249, 115, 22, 0.9)' }
    ];
    
    const datasets = salesData.map((franchise, index) => {
      const colorIndex = index % colorPalette.length;
      const categoryData = categories.map(category => {
        const value = franchise.salesByCategory && franchise.salesByCategory[category] 
          ? parseFloat(franchise.salesByCategory[category]) 
          : 0;
        return value;
      });

      return {
      label: franchise.franchiseName,
        data: categoryData,
        backgroundColor: colorPalette[colorIndex].background,
        borderColor: colorPalette[colorIndex].border,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: colorPalette[colorIndex].hover,
        hoverBorderColor: colorPalette[colorIndex].border,
        hoverBorderWidth: 3
      };
    });

    console.log('카테고리별 매출 차트 데이터:', { labels: categories, datasets });
    return { labels: categories, datasets };
  };

  // 시간대별 매출 차트 데이터
  const getTimeSalesData = () => {
    if (!salesData || salesData.length === 0) {
      return { labels: [], datasets: [] };
    }

    const timeSlots = ['오전(6-12시)', '오후(12-18시)', '저녁(18-24시)'];
    
    // 시간대별 색상 팔레트 (시간대에 맞는 색상)
    const timeColorPalette = [
      { background: 'rgba(59, 130, 246, 0.8)', border: '#3B82F6', hover: 'rgba(59, 130, 246, 0.9)' }, // 파란색 - 오전
      { background: 'rgba(16, 185, 129, 0.8)', border: '#10B981', hover: 'rgba(16, 185, 129, 0.9)' }, // 초록색 - 오후
      { background: 'rgba(139, 92, 246, 0.8)', border: '#8B5CF6', hover: 'rgba(139, 92, 246, 0.9)' }, // 보라색 - 저녁
      { background: 'rgba(245, 158, 11, 0.8)', border: '#F59E0B', hover: 'rgba(245, 158, 11, 0.9)' }, // 주황색
      { background: 'rgba(239, 68, 68, 0.8)', border: '#EF4444', hover: 'rgba(239, 68, 68, 0.9)' }, // 빨간색
      { background: 'rgba(6, 182, 212, 0.8)', border: '#06B6D4', hover: 'rgba(6, 182, 212, 0.9)' }, // 청록색
      { background: 'rgba(132, 204, 22, 0.8)', border: '#84CC16', hover: 'rgba(132, 204, 22, 0.9)' }, // 라임색
      { background: 'rgba(249, 115, 22, 0.8)', border: '#F97316', hover: 'rgba(249, 115, 22, 0.9)' }  // 오렌지색
    ];
    
    const datasets = salesData.map((franchise, index) => {
      const colorIndex = index % timeColorPalette.length;
      const timeData = timeSlots.map(time => {
        const value = franchise.salesByTime && franchise.salesByTime[time] 
          ? parseFloat(franchise.salesByTime[time]) 
          : 0;
        return value;
      });

      return {
      label: franchise.franchiseName,
        data: timeData,
        backgroundColor: timeColorPalette[colorIndex].background,
        borderColor: timeColorPalette[colorIndex].border,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: timeColorPalette[colorIndex].hover,
        hoverBorderColor: timeColorPalette[colorIndex].border,
        hoverBorderWidth: 3
      };
    });

    console.log('시간대별 매출 차트 데이터:', { labels: timeSlots, datasets });
    return { labels: timeSlots, datasets };
  };



  // 막대그래프 옵션들
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'rect',
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: '지점별 일별 매출 추이',
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#374151',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function (context) {
            return `📅 ${context[0].label}`;
          },
          label: function (context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}원`;
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
            size: 11
          },
          maxTicksLimit: 10
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
            size: 11
          },
          callback: function (value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M원';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K원';
            }
            return formatCurrency(value) + '원';
          }
        }
      }
    }
  };

  const categoryBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'rect',
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `📊 ${context[0].label}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}원`;
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
            size: 11
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
            size: 11
          },
          callback: function (value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M원';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K원';
            }
            return formatCurrency(value) + '원';
          }
        }
      }
    }
  };

  // 시간대별 매출 차트 옵션
  const timeBarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'rect',
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `🕐 ${context[0].label}`;
          },
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}원`;
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
            size: 11
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
            size: 11
          },
          callback: function (value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M원';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K원';
            }
            return formatCurrency(value) + '원';
          }
        }
      }
    }
  };

  const filteredFranchises = franchises.filter(franchise =>
    franchise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    franchise.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.franchiseSalesInquiry}>
      <div className={styles.franchiseSalesInquiryHeader}>
        <div>
          <h1>가맹점 매출 조회</h1>
          <p>본사에서 각 가맹점의 매출 현황을 조회하고 분석할 수 있습니다.</p>
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
        {/* <button
          className={`${styles.tabButton} ${activeTab === 'franchise-details' ? styles.active : ''}`}
          onClick={() => setActiveTab('franchise-details')}
        >
          가맹점 상세
        </button> */}
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.searchFilterContainer}>
        <div className={styles.searchBox}>
          <div className={styles.searchInputContainer}>
            <img src={searchIcon} alt="검색" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="가맹점명 또는 코드로 검색"
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 년도 및 월 선택 */}
        <div className={styles.dateFilterContainer}>
          <div className={styles.dateFilterItem}>
            <select
              id="yearSelect"
              className={styles.dateFilterSelect}
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
          </div>
          
          <div className={styles.dateFilterItem}>
            <select
              id="monthSelect"
              className={styles.dateFilterSelect}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>
          </div>
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

          {/* 에러 상태 */}
          {error && (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>⚠️</div>
              <p className={styles.errorText}>{error}</p>
              <button
                onClick={() => {
                  fetchSalesOverview(selectedYear, selectedMonth);
                  fetchDailyTrendData(selectedYear, selectedMonth);
                }}
                className={styles.retryButton}
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 요약 카드 */}
          {!loading && !error && salesOverview && (
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={dollorIcon} alt="총 매출" />
              </div>
              <div className={styles.summaryContent}>
                <h3>총 매출</h3>
                <div className={styles.summaryNumber}>
                    {formatCurrency(salesOverview.summary.totalSales)}원
                </div>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={userIcon} alt="총 주문수" />
              </div>
              <div className={styles.summaryContent}>
                <h3>총 주문수</h3>
                <div className={styles.summaryNumber}>
                    {formatCurrency(salesOverview.summary.totalCustomers)}명
                </div>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={storeIcon} alt="가맹점 수" />
              </div>
              <div className={styles.summaryContent}>
                <h3>가맹점 수</h3>
                <div className={styles.summaryNumber}>
                    {salesOverview.summary.franchiseCount}개
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 차트 영역 */}
          {!loading && !error && salesOverview && (
            <div style={{ marginBottom: '32px' }}>
              <div className={`${styles.chartContainer} ${styles.chartContainerEnhanced}`}>
                <div className={`${styles.chartHeader} ${styles.chartHeaderEnhanced}`}>
                  <h2 className={styles.chartTitle}>지점별 일별 매출 추이</h2>
                  <p className={styles.chartDescription}>각 지점의 일별 매출 추이를 확인할 수 있습니다.</p>
              </div>
                <div className={styles.chartContent}>
                  {dailyTrendData && dailyTrendData.branches && dailyTrendData.branches.length > 0 ? (
                    <Bar data={getDailySalesTrendData()} options={barChartOptions} />
                  ) : (
                    <div className={styles.emptyDataContainer}>
                      <div className={styles.emptyDataIcon}>📊</div>
                      <p className={styles.emptyDataTitle}>
                        해당 기간의 매출 데이터가 없습니다
                      </p>
                      <p className={styles.emptyDataSubtitle}>
                        다른 기간을 선택해보세요
                      </p>
              </div>
                  )}
              </div>
              </div>
            </div>
          )}

          {/* 가맹점 목록 */}
          {!loading && !error && salesOverview && (
          <div className={styles.franchiseList}>
            <h2>가맹점 목록</h2>
            <div className={styles.franchiseContainer}>
              <div className={styles.franchiseList}>
                <table className={styles.franchiseTable}>
                  <thead className={styles.franchiseTableHeader}>
                    <tr>
                      <th>가맹점명</th>
                      <th>가맹점코드</th>
                      <th>지점장</th>
                      <th>월 매출</th>
                        <th>총 주문수</th>
                      <th>평균 주문금액</th>
                      <th>인기 상품</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFranchises.map(franchise => {
                      const salesInfo = salesData.find(s => s.franchiseId === franchise.id);
                      if (!salesInfo) return null;

                      return (
                        <tr key={franchise.id}>
                          <td>
                            <div className={styles.franchiseInfo}>
                              <span className={styles.franchiseName}>{franchise.name}</span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.franchiseCodeInfo}>
                              <span className={styles.franchiseCode}>{franchise.code}</span>
                            </div>
                          </td>
                          <td>{franchise.manager}</td>
                          <td>{formatCurrency(salesInfo.monthlySales)}원</td>
                          <td>{formatCurrency(salesInfo.totalOrders)}건</td>
                          <td>{formatCurrency(salesInfo.avgOrderValue)}원</td>
                          <td>
                            <div className={styles.topProductsList}>
                              {salesInfo.topProducts.map((product, index) => (
                                <span key={index} className={styles.productTag}>{product}</span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* 매출 분석 탭 */}
      {activeTab === 'sales-analysis' && (
        <div className={styles.salesAnalysis}>
          <div className={styles.analysisHeader}>
            <h2>매출 분석</h2>
            <p>카테고리별, 시간대별 매출 분석을 확인할 수 있습니다.</p>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>데이터를 불러오는 중...</p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && salesOverview && (
            <div className={styles.chartGrid}>
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2>카테고리별 매출</h2>
                <p>각 카테고리별 매출을 비교합니다.</p>
              </div>
                <div className={styles.chartHeight}>
                  {salesData && salesData.length > 0 ? (
                    <Bar data={getCategorySalesData()} options={categoryBarChartOptions} />
                  ) : (
                    <div className={styles.emptyDataContainer}>
                      <div className={styles.emptyDataIcon}>📊</div>
                      <p className={styles.emptyDataTitle}>
                        카테고리별 매출 데이터가 없습니다
                      </p>
                      <p className={styles.emptyDataSubtitle}>
                        다른 기간을 선택해보세요
                      </p>
                    </div>
                  )}
              </div>
            </div>

            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2>시간대별 매출</h2>
                <p>오전, 오후, 저녁 시간대별 매출을 비교합니다.</p>
              </div>
                <div className={styles.chartHeight}>
                  {salesData && salesData.length > 0 ? (
                    <Bar data={getTimeSalesData()} options={timeBarChartOptions} />
                  ) : (
                    <div className={styles.emptyDataContainer}>
                      <div className={styles.emptyDataIcon}>📊</div>
                      <p className={styles.emptyDataTitle}>
                        시간대별 매출 데이터가 없습니다
                      </p>
                      <p className={styles.emptyDataSubtitle}>
                        다른 기간을 선택해보세요
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 가맹점 상세 탭 */}
      {activeTab === 'franchise-details' && (
        <div className={styles.franchiseDetails}>
          <div className={styles.detailsHeader}>
            <h2>지점 상세 정보</h2>
            <p>각 지점의 상세 매출 정보를 확인할 수 있습니다.</p>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>데이터를 불러오는 중...</p>
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && salesOverview && (
          <div className={styles.detailsTable}>
            <div className={styles.franchiseList}>
              <table className={styles.franchisesTable}>
                <thead className={styles.franchisesTableHeader}>
                  <tr>
                    <th>지점명</th>
                    <th>지점 코드</th>
                    <th>월 매출</th>
                    <th>총 주문수</th>
                    <th>평균 주문금액</th>
                    <th>지점장</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData
                    .sort((a, b) => b.monthlySales - a.monthlySales)
                    .map((franchise, index) => (
                      <tr key={franchise.franchiseId}>
                        <td>
                          <div className={styles.franchiseInfo}>
                            <span className={styles.franchiseName}>{franchise.franchiseName}</span>
                          </div>
                        </td>
                        <td><span className={styles.franchiseCode}>{franchise.franchiseCode}</span></td>
                        <td>{formatCurrency(franchise.monthlySales)}원</td>
                        <td>{formatCurrency(franchise.totalOrders)}건</td>
                        <td>{formatCurrency(franchise.avgOrderValue)}원</td>
                        <td>{franchises.find(f => f.id === franchise.franchiseId)?.manager}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  );
} 