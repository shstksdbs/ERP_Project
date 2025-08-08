import React, { useState, useEffect } from 'react';
import styles from './BranchComparison.module.css';
import searchIcon from '../../assets/search_icon.png';
import chartIcon from '../../assets/chart_icon.png';
import downloadIcon from '../../assets/download_icon.png';
import trendingUpIcon from '../../assets/trendingUp_icon.png';
import dollorIcon from '../../assets/dollor_icon.png';
import percentIcon from '../../assets/percent_icon.png';
import userIcon from '../../assets/user_icon.png';

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

export default function BranchComparisonWithChart() {
  const [activeTab, setActiveTab] = useState('sales-analysis');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedBranches, setSelectedBranches] = useState(['all']);
  const [searchTerm, setSearchTerm] = useState('');
  const [branches, setBranches] = useState([]);
  const [salesData, setSalesData] = useState([]);

  // 샘플 지점 데이터
  useEffect(() => {
    const sampleBranches = [
      { id: 1, name: '강남점', code: 'GN001', region: '서울', status: 'active', manager: '김강남' },
      { id: 2, name: '홍대점', code: 'HD001', region: '서울', status: 'active', manager: '이홍대' },
      { id: 3, name: '부산점', code: 'BS001', region: '부산', status: 'active', manager: '박부산' },
      { id: 4, name: '대구점', code: 'DG001', region: '대구', status: 'active', manager: '최대구' },
      { id: 5, name: '인천점', code: 'IC001', region: '인천', status: 'active', manager: '정인천' },
      { id: 6, name: '광주점', code: 'GJ001', region: '광주', status: 'active', manager: '한광주' },
      { id: 7, name: '대전점', code: 'DJ001', region: '대전', status: 'active', manager: '윤대전' },
      { id: 8, name: '울산점', code: 'US001', region: '울산', status: 'active', manager: '임울산' }
    ];

    const sampleSalesData = [
      {
        branchId: 1,
        branchName: '강남점',
        monthlySales: 85000000,
        monthlyGrowth: 12.5,
        customerCount: 12500,
        avgOrderValue: 6800,
        topProducts: ['아메리카노', '카페라떼', '샌드위치'],
        salesByMonth: [72000000, 78000000, 82000000, 85000000, 88000000, 92000000]
      },
      {
        branchId: 2,
        branchName: '홍대점',
        monthlySales: 72000000,
        monthlyGrowth: 8.3,
        customerCount: 9800,
        avgOrderValue: 6200,
        topProducts: ['카페라떼', '티라미수', '샐러드'],
        salesByMonth: [65000000, 68000000, 70000000, 72000000, 75000000, 78000000]
      },
      {
        branchId: 3,
        branchName: '부산점',
        monthlySales: 65000000,
        monthlyGrowth: 15.2,
        customerCount: 8900,
        avgOrderValue: 5800,
        topProducts: ['카푸치노', '치즈케이크', '감자튀김'],
        salesByMonth: [55000000, 58000000, 61000000, 65000000, 68000000, 72000000]
      },
      {
        branchId: 4,
        branchName: '대구점',
        monthlySales: 58000000,
        monthlyGrowth: 6.8,
        customerCount: 7600,
        avgOrderValue: 5400,
        topProducts: ['아메리카노', '샌드위치', '샐러드'],
        salesByMonth: [52000000, 54000000, 56000000, 58000000, 60000000, 62000000]
      },
      {
        branchId: 5,
        branchName: '인천점',
        monthlySales: 52000000,
        monthlyGrowth: 9.7,
        customerCount: 6800,
        avgOrderValue: 5100,
        topProducts: ['카페라떼', '티라미수', '샌드위치'],
        salesByMonth: [46000000, 48000000, 50000000, 52000000, 54000000, 56000000]
      }
    ];

    setBranches(sampleBranches);
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

  // 라인 차트 데이터
  const getLineChartData = () => {
    const labels = ['1월', '2월', '3월', '4월', '5월', '6월'];
    const datasets = salesData.map((branch, index) => ({
      label: branch.branchName,
      data: branch.salesByMonth,
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.1)`,
      tension: 0.4,
      fill: false
    }));

    return { labels, datasets };
  };

  // 바 차트 데이터 (매출 비교)
  const getBarChartData = () => {
    const labels = salesData.map(branch => branch.branchName);
    const data = salesData.map(branch => branch.monthlySales);
    const backgroundColors = salesData.map((_, index) => `hsl(${index * 60}, 70%, 50%)`);

    return {
      labels,
      datasets: [{
        label: '월 매출',
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1
      }]
    };
  };

  // 도넛 차트 데이터 (성장률 분포)
  const getDoughnutChartData = () => {
    const labels = salesData.map(branch => branch.branchName);
    const data = salesData.map(branch => branch.monthlyGrowth);
    const backgroundColors = salesData.map((_, index) => `hsl(${index * 60}, 70%, 50%)`);

    return {
      labels,
      datasets: [{
        label: '성장률',
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
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
        text: '지점별 매출 추이'
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
        text: '지점별 월 매출 비교'
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

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: '지점별 성장률 분포'
      },
    }
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.branchComparison}>
      <div className={styles.branchComparisonHeader}>
        <div>
          <h1>지점별 비교분석</h1>
          <p>본사에서 각 지점의 매출 성과를 비교 분석할 수 있습니다.</p>
        </div>
      </div>

      {/* 탭 컨테이너 */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'sales-analysis' ? styles.active : ''}`}
          onClick={() => setActiveTab('sales-analysis')}
        >
          매출 분석
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'performance-comparison' ? styles.active : ''}`}
          onClick={() => setActiveTab('performance-comparison')}
        >
          성과 비교
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'trend-analysis' ? styles.active : ''}`}
          onClick={() => setActiveTab('trend-analysis')}
        >
          트렌드 분석
        </button>
      </div>

      {/* 검색 및 필터 */}
      <div className={styles.searchFilterContainer}>
        <div className={styles.searchBox}>
          <div className={styles.searchInputContainer}>
            <img src={searchIcon} alt="검색" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="지점명 또는 코드로 검색"
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
        <button className={styles.exportButton} onClick={handleExportData}>
          <img src={downloadIcon} alt="내보내기" className={styles.buttonIcon} />
          데이터 내보내기
        </button>
      </div>

      {/* 매출 분석 탭 */}
      {activeTab === 'sales-analysis' && (
        <div className={styles.salesAnalysis}>
          {/* 요약 카드 */}
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={dollorIcon} alt="총 매출" />
              </div>
              <div className={styles.summaryContent}>
                <h3>총 매출</h3>
                <div className={styles.summaryNumber}>
                  {formatCurrency(salesData.reduce((sum, branch) => sum + branch.monthlySales, 0))}원
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
                  {formatPercentage(salesData.reduce((sum, branch) => sum + branch.monthlyGrowth, 0) / salesData.length)}
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
                  {formatCurrency(salesData.reduce((sum, branch) => sum + branch.customerCount, 0))}명
                </div>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={percentIcon} alt="평균 주문금액" />
              </div>
              <div className={styles.summaryContent}>
                <h3>평균 주문금액</h3>
                <div className={styles.summaryNumber}>
                  {formatCurrency(Math.round(salesData.reduce((sum, branch) => sum + branch.avgOrderValue, 0) / salesData.length))}원
                </div>
              </div>
            </div>
          </div>

          {/* 차트 영역 */}
          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <h2>지점별 매출 추이</h2>
              <p>각 지점의 월별 매출 추이를 비교할 수 있습니다.</p>
            </div>
            <div style={{ height: '400px' }}>
              <Line data={getLineChartData()} options={lineChartOptions} />
            </div>
          </div>

          {/* 지점별 상세 정보 */}
          <div className={styles.branchDetails}>
            <h2>지점별 상세 정보</h2>
            <div className={styles.branchGrid}>
              {filteredBranches.map(branch => {
                const salesInfo = salesData.find(s => s.branchId === branch.id);
                if (!salesInfo) return null;

                return (
                  <div key={branch.id} className={styles.branchCard}>
                    <div className={styles.branchHeader}>
                      <h3>{branch.name}</h3>
                      <span className={styles.branchCode}>{branch.code}</span>
                    </div>
                    <div className={styles.branchStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>월 매출</span>
                        <span className={styles.statValue}>{formatCurrency(salesInfo.monthlySales)}원</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>성장률</span>
                        <span 
                          className={styles.statValue}
                          style={{ color: getGrowthColor(salesInfo.monthlyGrowth) }}
                        >
                          {formatPercentage(salesInfo.monthlyGrowth)}
                        </span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>고객수</span>
                        <span className={styles.statValue}>{formatCurrency(salesInfo.customerCount)}명</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>평균 주문금액</span>
                        <span className={styles.statValue}>{formatCurrency(salesInfo.avgOrderValue)}원</span>
                      </div>
                    </div>
                    <div className={styles.topProducts}>
                      <h4>인기 상품</h4>
                      <div className={styles.productList}>
                        {salesInfo.topProducts.map((product, index) => (
                          <span key={index} className={styles.productTag}>{product}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 성과 비교 탭 */}
      {activeTab === 'performance-comparison' && (
        <div className={styles.performanceComparison}>
          <div className={styles.comparisonHeader}>
            <h2>지점별 성과 비교</h2>
            <p>매출, 고객수, 성장률 등을 기준으로 지점을 비교 분석합니다.</p>
          </div>
          
          {/* 차트 영역 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2>매출 비교</h2>
                <p>지점별 월 매출을 비교합니다.</p>
              </div>
              <div style={{ height: '300px' }}>
                <Bar data={getBarChartData()} options={barChartOptions} />
              </div>
            </div>
            
            <div className={styles.chartContainer}>
              <div className={styles.chartHeader}>
                <h2>성장률 분포</h2>
                <p>지점별 성장률 분포를 확인합니다.</p>
              </div>
              <div style={{ height: '300px' }}>
                <Doughnut data={getDoughnutChartData()} options={doughnutChartOptions} />
              </div>
            </div>
          </div>
          
          <div className={styles.comparisonTable}>
            <table>
              <thead>
                <tr>
                  <th>지점명</th>
                  <th>월 매출</th>
                  <th>성장률</th>
                  <th>고객수</th>
                  <th>평균 주문금액</th>
                  <th>순위</th>
                </tr>
              </thead>
              <tbody>
                {salesData
                  .sort((a, b) => b.monthlySales - a.monthlySales)
                  .map((branch, index) => (
                    <tr key={branch.branchId}>
                      <td>
                        <div className={styles.branchInfo}>
                          <span className={styles.branchName}>{branch.branchName}</span>
                          <span className={styles.branchCode}>{branches.find(b => b.id === branch.branchId)?.code}</span>
                        </div>
                      </td>
                      <td>{formatCurrency(branch.monthlySales)}원</td>
                      <td>
                        <span style={{ color: getGrowthColor(branch.monthlyGrowth) }}>
                          {formatPercentage(branch.monthlyGrowth)}
                        </span>
                      </td>
                      <td>{formatCurrency(branch.customerCount)}명</td>
                      <td>{formatCurrency(branch.avgOrderValue)}원</td>
                      <td>
                        <span className={styles.rankBadge}>{index + 1}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 트렌드 분석 탭 */}
      {activeTab === 'trend-analysis' && (
        <div className={styles.trendAnalysis}>
          <div className={styles.trendHeader}>
            <h2>매출 트렌드 분석</h2>
            <p>지점별 매출 패턴과 트렌드를 분석합니다.</p>
          </div>
          
          <div className={styles.trendGrid}>
            <div className={styles.trendCard}>
              <h3>성장률 순위</h3>
              <div className={styles.trendList}>
                {salesData
                  .sort((a, b) => b.monthlyGrowth - a.monthlyGrowth)
                  .map((branch, index) => (
                    <div key={branch.branchId} className={styles.trendItem}>
                      <span className={styles.trendRank}>{index + 1}</span>
                      <span className={styles.trendBranch}>{branch.branchName}</span>
                      <span 
                        className={styles.trendValue}
                        style={{ color: getGrowthColor(branch.monthlyGrowth) }}
                      >
                        {formatPercentage(branch.monthlyGrowth)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div className={styles.trendCard}>
              <h3>고객수 순위</h3>
              <div className={styles.trendList}>
                {salesData
                  .sort((a, b) => b.customerCount - a.customerCount)
                  .map((branch, index) => (
                    <div key={branch.branchId} className={styles.trendItem}>
                      <span className={styles.trendRank}>{index + 1}</span>
                      <span className={styles.trendBranch}>{branch.branchName}</span>
                      <span className={styles.trendValue}>{formatCurrency(branch.customerCount)}명</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 