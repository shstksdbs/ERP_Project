import React, { useState, useEffect, useRef } from 'react';
import styles from './DailySales.module.css';
import trendingUpIcon from '../../assets/trendingUp_icon.png';
import chartIcon from '../../assets/chart_icon.png';
import { salesStatisticsService } from '../../services/salesStatisticsService';
import Chart from 'chart.js/auto';

export default function DailySales({ branchId }) {
  const [salesData, setSalesData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugData, setDebugData] = useState(null); // 디버깅 데이터를 저장할 상태
  
  // Chart.js 관련 ref
  const hourlyChartRef = useRef(null);
  const hourlyChartInstance = useRef(null);

  // 실제 데이터 조회
  useEffect(() => {
    if (branchId && selectedDate) {
      fetchSalesData();
    }
  }, [branchId, selectedDate]);

  // 데이터 업데이트 시 차트 다시 그리기
  useEffect(() => {
    if (salesData && salesData.hourlyData.length > 0) {
      createOrUpdateHourlyChart();
    }
  }, [salesData]);

  const fetchSalesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 선택된 날짜의 일별 매출 데이터 조회
      const dailySales = await salesStatisticsService.getDailySales(
        branchId, 
        selectedDate, 
        selectedDate
      );
      
      if (dailySales && dailySales.length > 0) {
        // 해당 지점의 데이터만 필터링
        const branchDailyData = dailySales.filter(data => data.branchId === branchId);
        
        // 총매출과 주문수를 모든 데이터에서 합산
        const totalSales = branchDailyData.reduce((sum, data) => {
          return sum + (data.totalSales ? Number(data.totalSales) : 0);
        }, 0);
        
        const totalOrders = branchDailyData.reduce((sum, data) => {
          return sum + (data.totalOrders || 0);
        }, 0);
        
        // 일별 통계 데이터 (statisticHour가 null인 데이터)
        const dailyStats = branchDailyData.find(data => data.statisticHour === null);
        const dailyData = dailyStats || branchDailyData[0]; // 폴백용
        
        // 시간대별 매출 데이터 조회 (선택된 날짜) - 지점별로 필터링
        const hourlySales = await salesStatisticsService.getHourlySales(
          branchId,
          selectedDate, 
          selectedDate
        );
        
        // 인기 메뉴 데이터 조회 (선택된 날짜)
        const topMenus = await salesStatisticsService.getTopSellingMenus(
          branchId, 
          selectedDate, 
          selectedDate
        );
        
        // 시간대별 매출 데이터를 09시부터 24시까지 정리하고 합산
        const hourlyDataMap = new Map();
        
        // 09시부터 24시까지 초기화
        for (let hour = 9; hour <= 24; hour++) {
          hourlyDataMap.set(hour, 0);
        }
        
        // 실제 데이터로 매출 합산
        hourlySales.forEach(hour => {
          const hourNum = parseInt(hour.statisticHour);
          if (hourNum >= 9 && hourNum <= 24) {
            const currentSales = hourlyDataMap.get(hourNum) || 0;
            hourlyDataMap.set(hourNum, currentSales + (hour.totalSales ? Number(hour.totalSales) : 0));
          }
        });
        
        // 시간대별 데이터 배열 생성
        const hourlyData = Array.from(hourlyDataMap.entries()).map(([hour, sales]) => ({
          hour: `${hour.toString().padStart(2, '0')}:00`,
          sales: sales
        }));
        
        // 데이터 구조화
        const formattedData = {
          date: selectedDate,
          totalSales: totalSales, // 합산된 총매출 사용
          orderCount: totalOrders, // 합산된 주문수 사용
          averageOrderValue: totalOrders > 0 
            ? Math.round(totalSales / totalOrders) 
            : 0,
          netSales: dailyData.netSales ? Number(dailyData.netSales) : 0,
          totalDiscount: dailyData.totalDiscount ? Number(dailyData.totalDiscount) : 0,
          topProducts: topMenus.slice(0, 5).map(menuData => {
            // menuData는 [MenuSalesStatistics, menuName] 형태의 배열
            const menuStats = menuData[0];
            const menuName = menuData[1];
            return {
              name: menuName || `메뉴 ID: ${menuStats.menuId}`,
              quantity: menuStats.quantitySold || 0,
              revenue: menuStats.netSales ? Number(menuStats.netSales) : 0
            };
          }),
          hourlyData: hourlyData
        };
        
        setSalesData(formattedData);
      } else {
        // 데이터가 없는 경우 빈 데이터 구조 생성
        setSalesData({
          date: selectedDate,
          totalSales: 0,
          orderCount: 0,
          averageOrderValue: 0,
          netSales: 0,
          totalDiscount: 0,
          topProducts: [],
          hourlyData: []
        });
      }
    } catch (err) {
      console.error('매출 데이터 조회 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // Chart.js 시간대별 차트 생성/업데이트 함수
  const createOrUpdateHourlyChart = () => {
    if (!salesData || !salesData.hourlyData.length || !hourlyChartRef.current) return;

    // 기존 차트가 있다면 제거
    if (hourlyChartInstance.current) {
      hourlyChartInstance.current.destroy();
    }

    const ctx = hourlyChartRef.current.getContext('2d');
    
    // 차트 데이터 준비
    const labels = salesData.hourlyData.map(hour => hour.hour);
    const salesValues = salesData.hourlyData.map(hour => hour.sales);

    // 차트 생성
    hourlyChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '시간대별 매출',
            data: salesValues,
            backgroundColor: 'rgba(59, 130, 246, 0.9)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 0,
            borderRadius: 8,
            borderSkipped: false,
            hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
            hoverBorderColor: 'rgba(59, 130, 246, 1)',
            hoverBorderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: `${selectedDate} 시간대별 매출`,
            font: {
              size: 18,
              weight: 'bold',
              family: 'Arial, sans-serif'
            },
            color: '#1f2937',
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              padding: 25,
              font: {
                size: 13,
                weight: '500',
                family: 'Arial, sans-serif'
              },
              color: '#374151'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#3b82f6',
            borderWidth: 2,
            cornerRadius: 12,
            displayColors: true,
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 13
            },
            callbacks: {
              label: function(context) {
                return `매출: ${formatCurrency(context.parsed.y)}원`;
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '시간',
              font: {
                size: 13,
                weight: '600',
                family: 'Arial, sans-serif'
              },
              color: '#374151',
              padding: {
                top: 10
              }
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.2)',
              drawBorder: false,
              lineWidth: 1
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 12,
                weight: '500'
              },
              padding: 8
            },
            border: {
              color: 'rgba(156, 163, 175, 0.3)',
              width: 1
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: '매출 (원)',
              font: {
                size: 13,
                weight: '600',
                family: 'Arial, sans-serif'
              },
              color: '#374151',
              padding: {
                bottom: 10
              }
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.2)',
              drawBorder: false,
              lineWidth: 1
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 12,
                weight: '500'
              },
              padding: 8,
              callback: function(value) {
                return formatCurrency(value);
              }
            },
            border: {
              color: 'rgba(156, 163, 175, 0.3)',
              width: 1
            }
          }
        },
        elements: {
          bar: {
            backgroundColor: 'rgba(59, 130, 246, 0.9)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 0,
            borderRadius: 8,
            borderSkipped: false
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        },
        hover: {
          animationDuration: 200
        }
      }
    });
  };

  const fetchDebugData = async () => {
    try {
      const daily = await salesStatisticsService.getDailySales(branchId, selectedDate, selectedDate);
      const hourly = await salesStatisticsService.getHourlySales(branchId, selectedDate, selectedDate);
      
             // 추가 디버깅: 실제 주문 데이터 확인
       let orderData = null;
       try {
         const response = await fetch(`http://localhost:8080/api/orders/branch/${branchId}/date?date=${selectedDate}`);
         if (response.ok) {
           orderData = await response.json();
         }
       } catch (orderErr) {
         console.log('주문 데이터 조회 실패:', orderErr);
       }
      
      setDebugData({ 
        daily: daily, 
        hourly: hourly, 
        orders: orderData 
      });
    } catch (err) {
      console.error('디버깅 데이터 조회 오류:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>매출 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>오류가 발생했습니다: {error}</p>
          <button onClick={fetchSalesData} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

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

      {salesData ? (
        <div className={styles.content}>
          {/* 요약 카드 */}
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={chartIcon} alt="총매출" />
              </div>
              <div className={styles.summaryContent}>
                <h3>총매출</h3>
                <p className={styles.summaryValue}>{formatCurrency(salesData.totalSales)}원</p>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={trendingUpIcon} alt="주문수" />
              </div>
              <div className={styles.summaryContent}>
                <h3>주문수</h3>
                <p className={styles.summaryValue}>{salesData.orderCount}건</p>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={chartIcon} alt="평균주문금액" />
              </div>
              <div className={styles.summaryContent}>
                <h3>평균주문금액</h3>
                <p className={styles.summaryValue}>{formatCurrency(salesData.averageOrderValue)}원</p>
              </div>
            </div>
          </div>

          
                     {/* 시간대별 매출 */}
           {salesData.hourlyData.length > 0 && (
             <div className={styles.section}>
               <h2 className={styles.sectionTitle}>시간대별 매출</h2>
               <div className={styles.hourlyChartContainer}>
                 <canvas ref={hourlyChartRef} className={styles.hourlyChartCanvas}></canvas>
               </div>
             </div>
           )}

          {/* 인기 상품 */}
          {salesData.topProducts.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>인기 상품</h2>
              <div className={styles.topProducts}>
                {salesData.topProducts.map((product, index) => (
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
          )}

          {/* 데이터가 없는 경우 */}
          {salesData.totalSales === 0 && (
            <div className={styles.noData}>
              <p>선택한 날짜의 매출 데이터가 없습니다.</p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noData}>
          <p>매출 데이터를 불러올 수 없습니다.</p>
        </div>
      )}
    </div>
  );
}
