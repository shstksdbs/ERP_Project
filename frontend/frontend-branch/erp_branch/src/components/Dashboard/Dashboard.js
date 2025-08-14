import React from 'react';
import styles from './Dashboard.module.css';
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

  const kpis = [
    { label: '총 매출', value: 46000000, delta: '+12%', icon: dollorIcon },
    { label: '총 주문', value: 3420, delta: '+8%', icon: packageInIcon },
    { label: '운영 지점', value: 15, delta: '전체 지점', icon: storeIcon },
    { label: '발주 대기', value: 8, delta: '승인 필요', icon: truckIcon },
    { label: '재고 부족', value: 12, delta: '긴급 대응', icon: bellIcon },
    { label: '신규 가입', value: 3, delta: '이번 주', icon: usersIcon },
  ];

  const lineData = {
    labels: ['1/24','1/25','1/26','1/27','1/28','1/29','1/30'],
    datasets: [
      {
        label: '일 매출(만원)',
        data: [4500, 4200, 4800, 4400, 5000, 4700, 4800],
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
      title: { display: true, text: '주간 매출 추이', align: 'start', color: '#374151', font: { weight: '600', size: 14 } }
    },
    scales: {
      x: { grid: { display: false } },
      y: { ticks: { callback: (v) => `₩${v}M` }, grid: { color: '#eef2f7' } }
    }
  };

  const donutData = {
    labels: ['버거', '사이드', '음료', '디저트'],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: ['#4f46e5', '#60a5fa', '#93c5fd', '#bfdbfe'],
        borderWidth: 0
      }
    ]
  };
  const donutOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' },
      title: { display: true, text: '카테고리별 매출 비중', align: 'start', color: '#374151', font: { weight: '600', size: 14 } }
    },
    cutout: '60%'
  };

  return (
    <div className={styles['product-list']}>
      <div className={styles['product-list-header']}>
        <h1>가맹점 대시보드</h1>
        <p style={{ color: '#6b7280' }}>전사 KPI와 핵심 지표 요약</p>
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
              <h3>카테고리별 매출 비중</h3>
              <img src={chartPieIcon} alt="도넛" style={{ width: 20, height: 20 }} />
            </div>
            <Doughnut data={donutData} options={donutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}