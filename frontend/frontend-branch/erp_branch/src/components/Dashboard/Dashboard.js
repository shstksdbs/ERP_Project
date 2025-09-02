import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import dollorIcon from '../../assets/dollor_icon.png';
import packageInIcon from '../../assets/packageIn_icon.png';
import storeIcon from '../../assets/store_icon.png';
import truckIcon from '../../assets/truck_icon.png';
import bellIcon from '../../assets/bell_icon.png';
import usersIcon from '../../assets/users_icon.png';
import chartIcon from '../../assets/chart_icon.png';
import chartPieIcon from '../../assets/chartPie_icon.png';
import { Line } from 'react-chartjs-2';
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

export default function Dashboard({ branchId, loginData }) {
  const formatNumber = (n) => new Intl.NumberFormat('ko-KR').format(n);
  
  // 상태 관리
  const [kpiData, setKpiData] = useState({
    todaySales: { value: 0 },
    todayOrders: { value: 0 },
    pendingSupplyRequests: { value: 0 },
    lowStockItems: { value: 0 },
    unreadNotifications: { value: 0 }
  });
  const [chartData, setChartData] = useState({
    labels: [],
    data: []
  });
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API 호출 함수들
  const fetchTodaySales = async () => {
    try {
      console.log('매출 API 호출 시작, branchId:', branchId);
      const url = `http://localhost:8080/api/dashboard/today-sales?branchId=${branchId}`;
      console.log('API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('매출 API 응답 상태:', response.status, response.statusText);
      console.log('매출 API 응답 헤더:', response.headers.get('content-type'));
      
      if (!response.ok) {
        console.warn('매출 API 응답 실패:', response.status, response.statusText);
        return { value: 0 };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('매출 API가 JSON이 아닌 응답을 반환했습니다:', contentType);
        const textResponse = await response.text();
        console.log('실제 응답 내용:', textResponse.substring(0, 200));
        return { value: 0 };
      }
      
      const data = await response.json();
      console.log('매출 API 성공 응답:', data);
      return data;
    } catch (error) {
      console.error('오늘 매출 조회 실패:', error);
      return { value: 0 };
    }
  };

  const fetchTodayOrders = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/dashboard/today-orders?branchId=${branchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.warn('주문 API 응답 실패:', response.status, response.statusText);
        return { value: 0 };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('주문 API가 JSON이 아닌 응답을 반환했습니다:', contentType);
        return { value: 0 };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('오늘 주문 수 조회 실패:', error);
      return { value: 0 };
    }
  };

  const fetchPendingSupplyRequests = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/dashboard/pending-supply-requests?branchId=${branchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.warn('발주 API 응답 실패:', response.status, response.statusText);
        return { value: 0 };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('발주 API가 JSON이 아닌 응답을 반환했습니다:', contentType);
        return { value: 0 };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('발주 대기 수 조회 실패:', error);
      return { value: 0 };
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/dashboard/low-stock?branchId=${branchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.warn('재고 API 응답 실패:', response.status, response.statusText);
        return { value: 0 };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('재고 API가 JSON이 아닌 응답을 반환했습니다:', contentType);
        return { value: 0 };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('재고 부족 수 조회 실패:', error);
      return { value: 0 };
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/dashboard/unread-notifications?branchId=${branchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.warn('알림 API 응답 실패:', response.status, response.statusText);
        return { value: 0 };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('알림 API가 JSON이 아닌 응답을 반환했습니다:', contentType);
        return { value: 0 };
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('읽지 않은 알림 수 조회 실패:', error);
      return { value: 0 };
    }
  };

  // 주간 매출 추이 데이터 가져오기
  const fetchWeeklySalesTrend = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/dashboard/weekly-sales-trend?branchId=${branchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn('주간 매출 추이 API 응답 실패:', response.status, response.statusText);
        return { labels: [], data: [] };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('주간 매출 추이 API가 JSON이 아닌 응답을 반환했습니다:', contentType);
        return { labels: [], data: [] };
      }
      
      const data = await response.json();
      console.log('주간 매출 추이 API 성공 응답:', data);
      return data;
    } catch (error) {
      console.error('주간 매출 추이 조회 실패:', error);
      return { labels: [], data: [] };
    }
  };

  // 인기 상품 5개 데이터 가져오기
  const fetchTopProducts = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/dashboard/top-products?branchId=${branchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn('인기 상품 API 응답 실패:', response.status, response.statusText);
        return { products: [] };
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('인기 상품 API가 JSON이 아닌 응답을 반환했습니다:', contentType);
        return { products: [] };
      }
      
      const data = await response.json();
      console.log('인기 상품 API 성공 응답:', data);
      return data;
    } catch (error) {
      console.error('인기 상품 조회 실패:', error);
      return { products: [] };
    }
  };

  // 모든 KPI 데이터를 한번에 가져오는 함수
  const fetchAllKpiData = async () => {
    if (!branchId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [sales, orders, supplyRequests, lowStock, notifications, weeklyTrend, topProductsData] = await Promise.all([
        fetchTodaySales(),
        fetchTodayOrders(),
        fetchPendingSupplyRequests(),
        fetchLowStockItems(),
        fetchUnreadNotifications(),
        fetchWeeklySalesTrend(),
        fetchTopProducts()
      ]);

      setKpiData({
        todaySales: sales,
        todayOrders: orders,
        pendingSupplyRequests: supplyRequests,
        lowStockItems: lowStock,
        unreadNotifications: notifications
      });

      setChartData({
        labels: weeklyTrend.labels || [],
        data: weeklyTrend.data || []
      });

      setTopProducts(topProductsData.products || []);
    } catch (error) {
      console.error('KPI 데이터 조회 실패:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchAllKpiData();
  }, [branchId]);

  // 5분마다 데이터 새로고침
  useEffect(() => {
    const interval = setInterval(fetchAllKpiData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [branchId]);

  const kpis = [
    { 
      label: '매출', 
      value: kpiData.todaySales.value, 
      delta: '오늘', 
      icon: dollorIcon, 
      color: '#1f2937' 
    },
    { 
      label: '주문 수', 
      value: kpiData.todayOrders.value, 
      delta: '오늘', 
      icon: packageInIcon, 
      color: '#1f2937' 
    },
    { 
      label: '발주 대기', 
      value: kpiData.pendingSupplyRequests.value, 
      delta: '승인 필요', 
      icon: truckIcon, 
      color: '#1f2937' 
    },
    { 
      label: '재고 부족', 
      value: kpiData.lowStockItems.value, 
      delta: '발주 필요', 
      icon: bellIcon, 
      color: '#1f2937' 
    },
    { 
      label: '읽지 않은 알림', 
      value: kpiData.unreadNotifications.value, 
      delta: '새 알림', 
      icon: bellIcon, 
      color: '#1f2937' 
    },
  ];

  const lineData = {
    labels: chartData.labels.length > 0 ? chartData.labels : ['데이터 없음'],
    datasets: [
      {
        label: '일 매출(원)',
        data: chartData.data.length > 0 ? chartData.data.map(value => 
          typeof value === 'number' ? value : parseFloat(value) || 0
        ) : [0],
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
      title: { display: true,  align: 'start', color: '#374151', font: { weight: '600', size: 14 } }
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

  // 인기 상품 테이블 데이터 포맷팅
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

  return (
    <div className={styles['product-list']}>
      <div className={styles['product-list-header']}>
        <h1>{loginData?.branchName ? `${loginData.branchName} 대시보드` : '가맹점 대시보드'}</h1>
        {loading && <div style={{ fontSize: 14, color: '#6b7280' }}>데이터 로딩 중...</div>}
        {error && <div style={{ fontSize: 14, color: '#ef4444' }}>{error}</div>}

      </div>

      {/* 요약 카드 - ProductList와 동일 구조 */}
      <div className={styles['summary-cards']}>
        {kpis.map((k) => (
          <div key={k.label} className={styles['summary-card']}>
            <div className={styles['summary-icon']} style={{ backgroundColor: `${k.color}15` }}>
              <img src={k.icon} alt={k.label} />
            </div>
            <div className={styles['summary-content']}>
              <h3>{k.label}</h3>
              <div className={styles['summary-number']} style={{ color: k.color }}>
                {loading ? (
                  <div style={{ fontSize: 16, color: '#9ca3af' }}>로딩 중...</div>
                ) : (
                  k.label.includes('매출') ? `${formatNumber(k.value)}원` : formatNumber(k.value)
                )}
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
              <img src={chartPieIcon} alt="인기상품" style={{ width: 20, height: 20 }} />
            </div>
            {formatTopProductsTable()}
          </div>
        </div>
      </div>
    </div>
  );
}