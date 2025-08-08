import React, { useState, useEffect } from 'react';
import styles from './DailySales.module.css';
import trendingUpIcon from '../../assets/trendingUp_icon.png';
import chartIcon from '../../assets/chart_icon.png';

export default function DailySales({ branchId }) {
  const [salesData, setSalesData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2024-01-15');

  // 샘플 데이터
  useEffect(() => {
    const sampleSalesData = [
      {
        date: '2024-01-15',
        totalSales: 1250000,
        orderCount: 45,
        averageOrderValue: 27778,
        topProducts: [
          { name: '아메리카노', quantity: 25, revenue: 112500 },
          { name: '카페라떼', quantity: 20, revenue: 110000 },
          { name: '샌드위치', quantity: 15, revenue: 120000 }
        ],
        hourlyData: [
          { hour: '09:00', sales: 85000 },
          { hour: '10:00', sales: 120000 },
          { hour: '11:00', sales: 150000 },
          { hour: '12:00', sales: 200000 },
          { hour: '13:00', sales: 180000 },
          { hour: '14:00', sales: 160000 },
          { hour: '15:00', sales: 140000 },
          { hour: '16:00', sales: 120000 },
          { hour: '17:00', sales: 100000 },
          { hour: '18:00', sales: 80000 }
        ]
      }
    ];

    setSalesData(sampleSalesData);
  }, []);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const currentData = salesData.find(data => data.date === selectedDate);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>일별매출</h1>
        <div className={styles.headerActions}>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className={styles.dateInput}
          />
        </div>
      </div>

      {currentData ? (
        <div className={styles.content}>
          {/* 요약 카드 */}
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={chartIcon} alt="총매출" />
              </div>
              <div className={styles.summaryContent}>
                <h3>총매출</h3>
                <p className={styles.summaryValue}>{formatCurrency(currentData.totalSales)}원</p>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={trendingUpIcon} alt="주문수" />
              </div>
              <div className={styles.summaryContent}>
                <h3>주문수</h3>
                <p className={styles.summaryValue}>{currentData.orderCount}건</p>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={chartIcon} alt="평균주문금액" />
              </div>
              <div className={styles.summaryContent}>
                <h3>평균주문금액</h3>
                <p className={styles.summaryValue}>{formatCurrency(currentData.averageOrderValue)}원</p>
              </div>
            </div>
          </div>

          {/* 시간대별 매출 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>시간대별 매출</h2>
            <div className={styles.hourlyChart}>
              {currentData.hourlyData.map((hourData, index) => (
                <div key={index} className={styles.hourlyBar}>
                  <div className={styles.hourlyLabel}>{hourData.hour}</div>
                  <div className={styles.hourlyBarContainer}>
                    <div 
                      className={styles.hourlyBarFill}
                      style={{ 
                        height: `${(hourData.sales / Math.max(...currentData.hourlyData.map(d => d.sales))) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className={styles.hourlyValue}>{formatCurrency(hourData.sales)}원</div>
                </div>
              ))}
            </div>
          </div>

          {/* 인기 상품 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>인기 상품</h2>
            <div className={styles.topProducts}>
              {currentData.topProducts.map((product, index) => (
                <div key={index} className={styles.productCard}>
                  <div className={styles.productRank}>{index + 1}</div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productQuantity}>판매량: {product.quantity}개</p>
                  </div>
                  <div className={styles.productRevenue}>
                    {formatCurrency(product.revenue)}원
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.noData}>
          <p>선택한 날짜의 매출 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
