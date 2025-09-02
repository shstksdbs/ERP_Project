import React, { useState, useEffect } from 'react';
import styles from '../ProductManagement/ProductList.module.css';
import dollorIcon from '../../assets/dollor_icon.png';
import packageInIcon from '../../assets/packageIn_icon.png';
import storeIcon from '../../assets/store_icon.png';
import truckIcon from '../../assets/truck_icon.png';
import bellIcon from '../../assets/bell_icon.png';
import usersIcon from '../../assets/users_icon.png';
import chartIcon from '../../assets/chart_icon.png';
import chartPieIcon from '../../assets/chartPie_icon.png';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  Title
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler, Title);

export default function Dashboard() {
  const formatNumber = (n) => new Intl.NumberFormat('ko-KR').format(n);
  
  // 상태 관리
  const [kpiData, setKpiData] = useState({
    totalTodaySales: { value: 0 },
    totalTodayOrders: { value: 0 },
    activeBranches: { value: 0 },
    pendingSupplyRequests: { value: 0 },
    unreadNotifications: { value: 0 }
  });
  const [chartData, setChartData] = useState({
    labels: [],
    data: []
  });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 본사 대시보드 KPI 데이터 가져오기
  const fetchHqKpis = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/dashboard/hq-kpis', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn('본사 KPI API 응답 실패:', response.status, response.statusText);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('본사 KPI API가 JSON이 아닌 응답을 반환했습니다:', contentType);
        return;
      }
      
      const data = await response.json();
      console.log('본사 KPI API 성공 응답:', data);
      setKpiData(data);
    } catch (error) {
      console.error('본사 KPI 조회 실패:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 본사용 주간 매출 추이 데이터 가져오기
  const fetchHqWeeklySalesTrend = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/dashboard/hq-weekly-sales-trend', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn('본사 주간 매출 추이 API 응답 실패:', response.status, response.statusText);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('본사 주간 매출 추이 API가 JSON이 아닌 응답을 반환했습니다:', contentType);
        return;
      }
      
      const data = await response.json();
      console.log('본사 주간 매출 추이 API 성공 응답:', data);
      setChartData({
        labels: data.labels || [],
        data: data.data || []
      });
    } catch (error) {
      console.error('본사 주간 매출 추이 조회 실패:', error);
    }
  };

  // 본사용 인기 상품 데이터 가져오기
  const fetchHqTopProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/dashboard/hq-top-products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn('본사 인기 상품 API 응답 실패:', response.status, response.statusText);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('본사 인기 상품 API가 JSON이 아닌 응답을 반환했습니다:', contentType);
        return;
      }
      
      const data = await response.json();
      console.log('본사 인기 상품 API 성공 응답:', data);
      setTopProducts(data.products || []);
    } catch (error) {
      console.error('본사 인기 상품 조회 실패:', error);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchHqKpis();
    fetchHqWeeklySalesTrend();
    fetchHqTopProducts();
    
    // 5분마다 데이터 새로고침
    const interval = setInterval(() => {
      fetchHqKpis();
      fetchHqWeeklySalesTrend();
      fetchHqTopProducts();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const kpis = [
    { 
      label: '오늘 총매출', 
      value: kpiData.totalTodaySales.value || 0, 
      delta: '전 지점', 
      icon: dollorIcon 
    },
    { 
      label:  '오늘 총 주문', 
      value: kpiData.totalTodayOrders.value || 0, 
      delta: '전 지점', 
      icon: packageInIcon 
    },
    { 
      label: '운영 지점', 
      value: kpiData.activeBranches.value || 0, 
      delta: '활성 지점', 
      icon: storeIcon 
    },
    { 
      label: '발주 대기', 
      value: kpiData.pendingSupplyRequests.value || 0, 
      delta: '승인 필요', 
      icon: truckIcon 
    },
    { 
      label: '읽지 않은 알림', 
      value: kpiData.unreadNotifications.value || 0, 
      delta: '미처리', 
      icon: bellIcon 
    },
  ];

  const lineData = {
    labels: chartData.labels.length > 0 ? chartData.labels : ['1/24','1/25','1/26','1/27','1/28','1/29','1/30'],
    datasets: [
      {
        label: '전지점 일 매출(원)',
        data: chartData.data.length > 0 ? chartData.data : [4500, 4200, 4800, 4400, 5000, 4700, 4800],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      }
    ]
  };
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: '주간 매출 추이 (전지점 합계)', align: 'start', color: '#374151', font: { weight: '600', size: 14 } }
    },
    scales: {
      x: { grid: { display: false } },
      y: { 
        ticks: { 
          callback: (v) => {
            if (v >= 1000000) {
              return `₩${(v / 1000000).toFixed(1)}M`;
            } else if (v >= 1000) {
              return `₩${(v / 1000).toFixed(0)}K`;
            } else {
              return `₩${v}`;
            }
          }
        }, 
        grid: { color: '#eef2f7' } 
      }
    }
  };

  // 인기 상품 테이블 렌더링 함수
  const formatTopProductsTable = () => {
    if (!topProducts || topProducts.length === 0) {
      return (
        <div className={styles['empty-state']}>
          <p>인기 상품 데이터가 없습니다.</p>
        </div>
      );
    }

    return (
      <table className={styles['history-table']}>
        <thead className={styles['history-table-header']}>
          <tr>
            <th>순위</th>
            <th>상품명</th>
            <th>판매량</th>
            <th>매출액</th>
          </tr>
        </thead>
        <tbody>
          {topProducts.map((product, index) => (
            <tr key={product.menuId || index}>
              <td>
                <div className={styles['rank-info']}>
                  <span className={`${styles['rank-badge']} ${styles[`rank-${product.rank}`]}`}>
                    {product.rank}
                  </span>
                </div>
              </td>
              <td>
                <div className={styles['item-info']}>
                  <span className={styles['item-name']}>{product.menuName}</span>
                </div>
              </td>
              <td className={styles['quantity']}>
                {product.totalQuantity}개
              </td>
              <td className={styles['current-stock']}>
                ₩{formatNumber(product.totalSales)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return (
      <div className={styles['product-list']}>
        <div className={styles['product-list-header']}>
          <h1>본사 대시보드</h1>
          <p style={{ color: '#6b7280' }}>전사 KPI와 핵심 지표 요약</p>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280', fontSize: '16px' }}>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['product-list']}>
        <div className={styles['product-list-header']}>
          <h1>본사 대시보드</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ef4444', fontSize: '16px' }}>
          <p>오류가 발생했습니다: {error}</p>
          <button 
            onClick={() => {
              fetchHqKpis();
              fetchHqWeeklySalesTrend();
              fetchHqTopProducts();
            }} 
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['product-list']}>
      <div className={styles['product-list-header']}>
        <h1>본사 대시보드</h1>
      </div>

      {/* 요약 카드 - ProductList와 동일 구조 */}
      <div className={styles['summary-cards']}>
        {kpis.map((k) => (
          <div key={k.label} className={styles['summary-card']}>
            <div className={styles['summary-icon']}>
              <img src={k.icon} alt={k.label} />
            </div>
            <div className={styles['summary-content']}>
              <h3>{k.label}</h3>
              <div className={styles['summary-number']}>
                {k.label.includes('매출') ? `${formatNumber(k.value)}원` : formatNumber(k.value)}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{k.delta}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 차트 - ProductList의 분석 레이아웃 활용 */}
      <div className={styles['product-analytics']}>
        <div className={styles['analytics-grid']}>
          <div className={styles['analytics-card']}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3>주간 매출 추이</h3>
              <img src={chartIcon} alt="라인" style={{ width: 20, height: 20 }} />
            </div>
            <Line data={lineData} options={lineOptions} />
          </div>

          <div className={styles['analytics-card']}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3>인기 상품 TOP 5</h3>
              <img src={chartPieIcon} alt="테이블" style={{ width: 20, height: 20 }} />
            </div>
            {formatTopProductsTable()}
          </div>
        </div>
      </div>
    </div>
  );
}