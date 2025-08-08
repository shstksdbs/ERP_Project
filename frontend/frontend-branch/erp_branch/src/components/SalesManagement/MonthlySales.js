import React, { useState, useEffect } from 'react';
import styles from './MonthlySales.module.css';
import chartPieIcon from '../../assets/chartPie_icon.png';
import chartIcon from '../../assets/chart_icon.png';

export default function MonthlySales({ branchId }) {
  const [salesData, setSalesData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('2024-01');

  // 샘플 데이터
  useEffect(() => {
    const sampleSalesData = [
      {
        month: '2024-01',
        totalSales: 35000000,
        orderCount: 1250,
        averageOrderValue: 28000,
        dailyAverage: 1166667,
        categoryBreakdown: [
          { category: '음료', sales: 21000000, percentage: 60 },
          { category: '식품', sales: 10500000, percentage: 30 },
          { category: '디저트', sales: 3500000, percentage: 10 }
        ],
        dailyData: [
          { day: 1, sales: 1200000 },
          { day: 2, sales: 1100000 },
          { day: 3, sales: 1300000 },
          { day: 4, sales: 1400000 },
          { day: 5, sales: 1500000 },
          { day: 6, sales: 1600000 },
          { day: 7, sales: 1700000 },
          { day: 8, sales: 1200000 },
          { day: 9, sales: 1100000 },
          { day: 10, sales: 1300000 },
          { day: 11, sales: 1400000 },
          { day: 12, sales: 1500000 },
          { day: 13, sales: 1600000 },
          { day: 14, sales: 1700000 },
          { day: 15, sales: 1200000 },
          { day: 16, sales: 1100000 },
          { day: 17, sales: 1300000 },
          { day: 18, sales: 1400000 },
          { day: 19, sales: 1500000 },
          { day: 20, sales: 1600000 },
          { day: 21, sales: 1700000 },
          { day: 22, sales: 1200000 },
          { day: 23, sales: 1100000 },
          { day: 24, sales: 1300000 },
          { day: 25, sales: 1400000 },
          { day: 26, sales: 1500000 },
          { day: 27, sales: 1600000 },
          { day: 28, sales: 1700000 },
          { day: 29, sales: 1200000 },
          { day: 30, sales: 1100000 },
          { day: 31, sales: 1300000 }
        ]
      }
    ];

    setSalesData(sampleSalesData);
  }, []);

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const currentData = salesData.find(data => data.month === selectedMonth);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>월별매출</h1>
        <div className={styles.headerActions}>
          <input
            type="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className={styles.monthInput}
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
                <img src={chartPieIcon} alt="주문수" />
              </div>
              <div className={styles.summaryContent}>
                <h3>주문수</h3>
                <p className={styles.summaryValue}>{currentData.orderCount.toLocaleString()}건</p>
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
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={chartPieIcon} alt="일평균매출" />
              </div>
              <div className={styles.summaryContent}>
                <h3>일평균매출</h3>
                <p className={styles.summaryValue}>{formatCurrency(currentData.dailyAverage)}원</p>
              </div>
            </div>
          </div>

          {/* 카테고리별 매출 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>카테고리별 매출</h2>
            <div className={styles.categoryBreakdown}>
              {currentData.categoryBreakdown.map((category, index) => (
                <div key={index} className={styles.categoryCard}>
                  <div className={styles.categoryInfo}>
                    <h3 className={styles.categoryName}>{category.category}</h3>
                    <p className={styles.categorySales}>{formatCurrency(category.sales)}원</p>
                  </div>
                  <div className={styles.categoryBar}>
                    <div 
                      className={styles.categoryBarFill}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <div className={styles.categoryPercentage}>{category.percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* 일별 매출 차트 */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>일별 매출</h2>
            <div className={styles.dailyChart}>
              {currentData.dailyData.map((dayData, index) => (
                <div key={index} className={styles.dailyBar}>
                  <div className={styles.dailyLabel}>{dayData.day}일</div>
                  <div className={styles.dailyBarContainer}>
                    <div 
                      className={styles.dailyBarFill}
                      style={{ 
                        height: `${(dayData.sales / Math.max(...currentData.dailyData.map(d => d.sales))) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <div className={styles.dailyValue}>{formatCurrency(dayData.sales)}원</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.noData}>
          <p>선택한 월의 매출 데이터가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
