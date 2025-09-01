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

export default function FranchiseSalesInquiry() {
  const [activeTab, setActiveTab] = useState('sales-overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedFranchise, setSelectedFranchise] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [franchises, setFranchises] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // 샘플 가맹점 데이터
  useEffect(() => {
    const sampleFranchises = [
      { id: 1, name: '강남점', code: 'GN001', region: '서울', status: 'active', manager: '김강남', type: '직영점' },
      { id: 2, name: '홍대점', code: 'HD001', region: '서울', status: 'active', manager: '이홍대', type: '가맹점' },
      { id: 3, name: '부산점', code: 'BS001', region: '부산', status: 'active', manager: '박부산', type: '가맹점' },
      { id: 4, name: '대구점', code: 'DG001', region: '대구', status: 'active', manager: '최대구', type: '직영점' },
      { id: 5, name: '인천점', code: 'IC001', region: '인천', status: 'active', manager: '정인천', type: '가맹점' },
      { id: 6, name: '광주점', code: 'GJ001', region: '광주', status: 'active', manager: '한광주', type: '가맹점' },
      { id: 7, name: '대전점', code: 'DJ001', region: '대전', status: 'active', manager: '윤대전', type: '직영점' },
      { id: 8, name: '울산점', code: 'US001', region: '울산', status: 'active', manager: '임울산', type: '가맹점' }
    ];

    const sampleSalesData = [
      {
        franchiseId: 1,
        franchiseName: '강남점',
        franchiseCode: 'GN001',
        type: '직영점',
        monthlySales: 85000000,
        monthlyGrowth: 12.5,
        customerCount: 12500,
        avgOrderValue: 6800,
        topProducts: ['아메리카노', '카페라떼', '샌드위치'],
        salesByMonth: [72000000, 78000000, 82000000, 85000000, 88000000, 92000000],
        salesByCategory: {
          '음료': 45000000,
          '식품': 28000000,
          '디저트': 12000000
        },
        salesByTime: {
          '오전(6-12시)': 25000000,
          '오후(12-18시)': 35000000,
          '저녁(18-24시)': 25000000
        }
      },
      {
        franchiseId: 2,
        franchiseName: '홍대점',
        franchiseCode: 'HD001',
        type: '가맹점',
        monthlySales: 72000000,
        monthlyGrowth: 8.3,
        customerCount: 9800,
        avgOrderValue: 6200,
        topProducts: ['카페라떼', '티라미수', '샐러드'],
        salesByMonth: [65000000, 68000000, 70000000, 72000000, 75000000, 78000000],
        salesByCategory: {
          '음료': 38000000,
          '식품': 22000000,
          '디저트': 12000000
        },
        salesByTime: {
          '오전(6-12시)': 20000000,
          '오후(12-18시)': 30000000,
          '저녁(18-24시)': 22000000
        }
      },
      {
        franchiseId: 3,
        franchiseName: '부산점',
        franchiseCode: 'BS001',
        type: '가맹점',
        monthlySales: 65000000,
        monthlyGrowth: 15.2,
        customerCount: 8900,
        avgOrderValue: 5800,
        topProducts: ['카푸치노', '치즈케이크', '감자튀김'],
        salesByMonth: [55000000, 58000000, 61000000, 65000000, 68000000, 72000000],
        salesByCategory: {
          '음료': 35000000,
          '식품': 20000000,
          '디저트': 10000000
        },
        salesByTime: {
          '오전(6-12시)': 18000000,
          '오후(12-18시)': 28000000,
          '저녁(18-24시)': 19000000
        }
      },
      {
        franchiseId: 4,
        franchiseName: '대구점',
        franchiseCode: 'DG001',
        type: '직영점',
        monthlySales: 58000000,
        monthlyGrowth: 6.8,
        customerCount: 7600,
        avgOrderValue: 5400,
        topProducts: ['아메리카노', '샌드위치', '샐러드'],
        salesByMonth: [52000000, 54000000, 56000000, 58000000, 60000000, 62000000],
        salesByCategory: {
          '음료': 32000000,
          '식품': 18000000,
          '디저트': 8000000
        },
        salesByTime: {
          '오전(6-12시)': 16000000,
          '오후(12-18시)': 25000000,
          '저녁(18-24시)': 17000000
        }
      },
      {
        franchiseId: 5,
        franchiseName: '인천점',
        franchiseCode: 'IC001',
        type: '가맹점',
        monthlySales: 52000000,
        monthlyGrowth: 9.7,
        customerCount: 6800,
        avgOrderValue: 5100,
        topProducts: ['카페라떼', '티라미수', '샌드위치'],
        salesByMonth: [46000000, 48000000, 50000000, 52000000, 54000000, 56000000],
        salesByCategory: {
          '음료': 28000000,
          '식품': 16000000,
          '디저트': 8000000
        },
        salesByTime: {
          '오전(6-12시)': 14000000,
          '오후(12-18시)': 22000000,
          '저녁(18-24시)': 16000000
        }
      }
    ];

    setFranchises(sampleFranchises);
    setSalesData(sampleSalesData);
  }, []);

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

  // 매출 추이 차트 데이터
  const getSalesTrendData = () => {
    const labels = ['1월', '2월', '3월', '4월', '5월', '6월'];
    const datasets = salesData.map((franchise, index) => ({
      label: franchise.franchiseName,
      data: franchise.salesByMonth,
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.1)`,
      tension: 0.4,
      fill: false
    }));

    return { labels, datasets };
  };

  // 카테고리별 매출 차트 데이터
  const getCategorySalesData = () => {
    const categories = ['음료', '식품', '디저트'];
    const datasets = salesData.map((franchise, index) => ({
      label: franchise.franchiseName,
      data: categories.map(category => franchise.salesByCategory[category] || 0),
      backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      borderWidth: 1
    }));

    return { labels: categories, datasets };
  };

  // 시간대별 매출 차트 데이터
  const getTimeSalesData = () => {
    const timeSlots = ['오전(6-12시)', '오후(12-18시)', '저녁(18-24시)'];
    const datasets = salesData.map((franchise, index) => ({
      label: franchise.franchiseName,
      data: timeSlots.map(time => franchise.salesByTime[time] || 0),
      backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      borderWidth: 1
    }));

    return { labels: timeSlots, datasets };
  };

  // 가맹점 타입별 매출 분포
  const getTypeDistributionData = () => {
    const typeData = {};
    salesData.forEach(franchise => {
      if (!typeData[franchise.type]) {
        typeData[franchise.type] = 0;
      }
      typeData[franchise.type] += franchise.monthlySales;
    });

    return {
      labels: Object.keys(typeData),
      datasets: [{
        data: Object.values(typeData),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        borderColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 2
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
        text: '가맹점별 매출 추이'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
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
        text: '카테고리별 매출'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
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
        text: '가맹점 타입별 매출 분포'
      },
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
        <button
          className={`${styles.tabButton} ${activeTab === 'franchise-details' ? styles.active : ''}`}
          onClick={() => setActiveTab('franchise-details')}
        >
          가맹점 상세
        </button>
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
          {/* 요약 카드 */}
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={dollorIcon} alt="총 매출" />
              </div>
              <div className={styles.summaryContent}>
                <h3>총 매출</h3>
                <div className={styles.summaryNumber}>
                  {formatCurrency(salesData.reduce((sum, franchise) => sum + franchise.monthlySales, 0))}원
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
                  {formatPercentage(salesData.reduce((sum, franchise) => sum + franchise.monthlyGrowth, 0) / salesData.length)}
                </div>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={userIcon} alt="총 고객수" />
              </div>
              <div className={styles.summaryContent}>
                <h3>총 고객수</h3>
                <div className={styles.summaryNumber}>
                  {formatCurrency(salesData.reduce((sum, franchise) => sum + franchise.customerCount, 0))}명
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
                  {salesData.length}개
                </div>
              </div>
            </div>
          </div>

          {/* 차트 영역 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2>가맹점별 매출 추이</h2>
                <p>각 가맹점의 월별 매출 추이를 확인할 수 있습니다.</p>
              </div>
              <div style={{ height: '300px' }}>
                <Line data={getSalesTrendData()} options={lineChartOptions} />
              </div>
            </div>

            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2>가맹점 타입별 매출 분포</h2>
                <p>직영점과 가맹점의 매출 분포를 확인할 수 있습니다.</p>
              </div>
              <div style={{ height: '300px' }}>
                <Pie data={getTypeDistributionData()} options={pieChartOptions} />
              </div>
            </div>
          </div>

          {/* 가맹점 목록 */}
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
                      <th>성장률</th>
                      <th>고객수</th>
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
                          <td>
                            <span
                              className={styles.growthRate}
                              style={{ color: getGrowthColor(salesInfo.monthlyGrowth) }}
                            >
                              {formatPercentage(salesInfo.monthlyGrowth)}
                            </span>
                          </td>
                          <td>{formatCurrency(salesInfo.customerCount)}명</td>
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
        </div>
      )}

      {/* 매출 분석 탭 */}
      {activeTab === 'sales-analysis' && (
        <div className={styles.salesAnalysis}>
          <div className={styles.analysisHeader}>
            <h2>매출 분석</h2>
            <p>카테고리별, 시간대별 매출 분석을 확인할 수 있습니다.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2>카테고리별 매출</h2>
                <p>음료, 식품, 디저트별 매출을 비교합니다.</p>
              </div>
              <div style={{ height: '300px' }}>
                <Bar data={getCategorySalesData()} options={barChartOptions} />
              </div>
            </div>

            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2>시간대별 매출</h2>
                <p>오전, 오후, 저녁 시간대별 매출을 비교합니다.</p>
              </div>
              <div style={{ height: '300px' }}>
                <Bar data={getTimeSalesData()} options={barChartOptions} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 가맹점 상세 탭 */}
      {activeTab === 'franchise-details' && (
        <div className={styles.franchiseDetails}>
          <div className={styles.detailsHeader}>
            <h2>지점 상세 정보</h2>
            <p>각 지점의 상세 매출 정보를 확인할 수 있습니다.</p>
          </div>

          <div className={styles.detailsTable}>
            <div className={styles.franchiseList}>
              <table className={styles.franchisesTable}>
                <thead className={styles.franchisesTableHeader}>
                  <tr>
                    <th>지점명</th>
                    <th>지점 코드</th>
                    <th>월 매출</th>
                    <th>성장률</th>
                    <th>고객수</th>
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
                        <td>
                          <span style={{ color: getGrowthColor(franchise.monthlyGrowth) }}>
                            {formatPercentage(franchise.monthlyGrowth)}
                          </span>
                        </td>
                        <td>{formatCurrency(franchise.customerCount)}명</td>
                        <td>{formatCurrency(franchise.avgOrderValue)}원</td>
                        <td>{franchises.find(f => f.id === franchise.franchiseId)?.manager}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 