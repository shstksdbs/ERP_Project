import React, { useState, useEffect, useRef } from 'react';
import styles from './MonthlySales.module.css';
import trendingUpIcon from '../../assets/trendingUp_icon.png';
import chartIcon from '../../assets/chart_icon.png';
import { salesStatisticsService } from '../../services/salesStatisticsService';
import Chart from 'chart.js/auto';

export default function MonthlySales({ branchId }) {
  const [salesData, setSalesData] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('bar'); // 'bar' 또는 'line'
  
  // Chart.js 관련 ref
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const weeklyChartRef = useRef(null);
  const weeklyChartInstance = useRef(null);

  // 실제 데이터 조회
  useEffect(() => {
    if (branchId && selectedYear && selectedMonth) {
      fetchMonthlyData();
    }
  }, [branchId, selectedYear, selectedMonth]);

  // 차트 타입 변경 시 차트 다시 그리기
  useEffect(() => {
    if (salesData && salesData.dailyData.length > 0) {
      createOrUpdateChart();
    }
    if (salesData && salesData.weeklyData.length > 0) {
      createOrUpdateWeeklyChart();
    }
  }, [chartType, salesData]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 선택된 년월의 월별 매출 데이터 조회
      const monthlySales = await salesStatisticsService.getMonthlySales(
        branchId, 
        selectedYear, 
        selectedMonth
      );
      
      if (monthlySales && monthlySales.length > 0) {
        const monthlyData = monthlySales[0];
        
        // 해당 월의 일별 데이터도 조회 (차트용)
        const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
        
        const dailySales = await salesStatisticsService.getDailySales(
          branchId, 
          startDate, 
          endDate
        );
        
        // 주간별 데이터 생성
        const weeklyData = (() => {
          const weeks = [];
          const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
          
          // 주간별로 그룹핑 (1주차: 1-7일, 2주차: 8-14일, 3주차: 15-21일, 4주차: 22-28일, 5주차: 29-31일)
          for (let week = 1; week <= 5; week++) {
            let startDay = (week - 1) * 7 + 1;
            let endDay = Math.min(week * 7, daysInMonth);
            
            if (startDay <= daysInMonth) {
              const weekData = dailySales.filter(daily => {
                const day = parseInt(daily.statisticDate.split('-')[2]);
                return day >= startDay && day <= endDay;
              });
              
              const weekSales = weekData.reduce((sum, daily) => 
                sum + (daily.totalSales ? Number(daily.totalSales) : 0), 0);
              const weekOrders = weekData.reduce((sum, daily) => 
                sum + (daily.totalOrders || 0), 0);
              const weekDays = weekData.length;
              
              weeks.push({
                week: week,
                startDay: startDay,
                endDay: endDay,
                totalSales: weekSales,
                totalOrders: weekOrders,
                averageSales: weekDays > 0 ? Math.round(weekSales / weekDays) : 0,
                days: weekDays
              });
            }
          }
          return weeks;
        })();
        
        // 일별 데이터를 1일부터 31일까지 모든 날짜로 확장
        const completeDailyData = (() => {
          const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
          const completeData = [];
          
          for (let day = 1; day <= daysInMonth; day++) {
            const dayStr = day.toString().padStart(2, '0');
            const dateStr = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${dayStr}`;
            
            // 해당 날짜의 실제 데이터 찾기
            const existingData = dailySales.find(daily => 
              daily.statisticDate === dateStr
            );
            
            if (existingData) {
              completeData.push({
                date: dateStr,
                day: day,
                sales: existingData.totalSales ? Number(existingData.totalSales) : 0,
                orders: existingData.totalOrders || 0
              });
            } else {
              // 데이터가 없는 날은 0으로 설정
              completeData.push({
                date: dateStr,
                day: day,
                sales: 0,
                orders: 0
              });
            }
          }
          
          return completeData;
        })();
        
        // 데이터 구조화
        const formattedData = {
          year: selectedYear,
          month: selectedMonth,
          totalSales: monthlyData.totalSales ? Number(monthlyData.totalSales) : 0,
          orderCount: monthlyData.totalOrders || 0,
          averageOrderValue: monthlyData.totalOrders > 0 && monthlyData.totalSales
            ? Math.round(Number(monthlyData.totalSales) / monthlyData.totalOrders) 
            : 0,
          netSales: monthlyData.netSales ? Number(monthlyData.netSales) : 0,
          totalDiscount: monthlyData.totalDiscount ? Number(monthlyData.totalDiscount) : 0,
          dailyData: completeDailyData,
          weeklyData: weeklyData
        };
        
        setSalesData(formattedData);
      } else {
        // 데이터가 없는 경우 빈 데이터 구조 생성
        setSalesData({
          year: selectedYear,
          month: selectedMonth,
          totalSales: 0,
          orderCount: 0,
          averageOrderValue: 0,
          netSales: 0,
          totalDiscount: 0,
          dailyData: [],
          weeklyData: []
        });
      }
    } catch (err) {
      console.error('월별 매출 데이터 조회 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getMonthName = (month) => {
    const monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    return monthNames[month - 1];
  };

  // Chart.js 차트 생성/업데이트 함수
  const createOrUpdateChart = () => {
    if (!salesData || !salesData.dailyData.length || !chartRef.current) return;

    // 기존 차트가 있다면 제거
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    // 차트 데이터 준비
    const labels = salesData.dailyData.map(day => `${day.day}일`);
    const salesValues = salesData.dailyData.map(day => day.sales);
    const ordersValues = salesData.dailyData.map(day => day.orders);

    // 차트 생성
    chartInstance.current = new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: '매출',
            data: salesValues,
            borderColor: '#3b82f6',
            backgroundColor: chartType === 'bar' 
              ? 'rgba(59, 130, 246, 0.85)' 
              : 'rgba(59, 130, 246, 0.1)',
            borderWidth: chartType === 'bar' ? 0 : 3,
            borderRadius: chartType === 'bar' ? 8 : 0,
            borderSkipped: false,
            tension: 0.4,
            fill: chartType === 'line',
            yAxisID: 'y',
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: chartType === 'line' ? 5 : 0,
            pointHoverRadius: chartType === 'line' ? 7 : 0,
            hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
            hoverBorderColor: 'rgba(59, 130, 246, 1)',
            hoverBorderWidth: chartType === 'bar' ? 2 : 3
          },
          {
            label: '주문수',
            data: ordersValues,
            borderColor: '#10b981',
            backgroundColor: chartType === 'bar' 
              ? 'rgba(16, 185, 129, 0.85)' 
              : 'rgba(16, 185, 129, 0.1)',
            borderWidth: chartType === 'bar' ? 0 : 3,
            borderRadius: chartType === 'bar' ? 8 : 0,
            borderSkipped: false,
            tension: 0.4,
            fill: false,
            yAxisID: 'y1',
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: chartType === 'line' ? 5 : 0,
            pointHoverRadius: chartType === 'line' ? 7 : 0,
            hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
            hoverBorderColor: 'rgba(16, 185, 129, 1)',
            hoverBorderWidth: chartType === 'bar' ? 2 : 3
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
            text: `${selectedYear}년 ${getMonthName(selectedMonth)} 일별 매출 추이`,
            font: {
              size: 20,
              weight: 'bold',
              family: 'Arial, sans-serif'
            },
            color: '#1f2937',
            padding: {
              top: 15,
              bottom: 25
            }
          },
          legend: {
            display: true,
            position: 'top',
            align: 'center',
            labels: {
              usePointStyle: true,
              padding: 30,
              font: {
                size: 14,
                weight: '600',
                family: 'Arial, sans-serif'
              },
              color: '#374151'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.98)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#3b82f6',
            borderWidth: 3,
            cornerRadius: 16,
            displayColors: true,
            padding: 16,
            titleFont: {
              size: 15,
              weight: 'bold'
            },
            bodyFont: {
              size: 14
            },
            callbacks: {
              label: function(context) {
                if (context.dataset.label === '매출') {
                  return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}원`;
                } else {
                  return `${context.dataset.label}: ${context.parsed.y}건`;
                }
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '날짜',
              font: {
                size: 14,
                weight: '600',
                family: 'Arial, sans-serif'
              },
              color: '#374151',
              padding: {
                top: 15
              }
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.15)',
              drawBorder: false,
              lineWidth: 1
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 13,
                weight: '500'
              },
              padding: 10
            },
            border: {
              color: 'rgba(156, 163, 175, 0.2)',
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
                size: 14,
                weight: '600',
                family: 'Arial, sans-serif'
              },
              color: '#374151',
              padding: {
                bottom: 15
              }
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.15)',
              drawBorder: false,
              lineWidth: 1
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 13,
                weight: '500'
              },
              padding: 10,
              callback: function(value) {
                return formatCurrency(value);
              }
            },
            border: {
              color: 'rgba(156, 163, 175, 0.2)',
              width: 1
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: '주문수 (건)',
              font: {
                size: 14,
                weight: '600',
                family: 'Arial, sans-serif'
              },
              color: '#10b981',
              padding: {
                bottom: 15
              }
            },
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: '#10b981',
              font: {
                size: 13,
                weight: '500'
              },
              padding: 10
            },
            border: {
              color: 'rgba(16, 185, 129, 0.2)',
              width: 1
            }
          }
        },
        elements: {
          bar: {
            backgroundColor: 'rgba(59, 130, 246, 0.85)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 0,
            borderRadius: 8,
            borderSkipped: false
          }
        },
        animation: {
          duration: 1200,
          easing: 'easeOutQuart'
        },
        hover: {
          animationDuration: 300
        }
      }
    });
  };

  // 주간별 차트 생성/업데이트 함수
  const createOrUpdateWeeklyChart = () => {
    if (!salesData || !salesData.weeklyData.length || !weeklyChartRef.current) return;

    // 기존 차트가 있다면 제거
    if (weeklyChartInstance.current) {
      weeklyChartInstance.current.destroy();
    }

    const ctx = weeklyChartRef.current.getContext('2d');
    
    // 주간 차트 데이터 준비
    const labels = salesData.weeklyData.map(week => `${week.startDay}일-${week.endDay}일`);
    const salesValues = salesData.weeklyData.map(week => week.totalSales);
    const ordersValues = salesData.weeklyData.map(week => week.totalOrders);

    // 주간 차트 생성
    weeklyChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: '주간 매출',
            data: salesValues,
            backgroundColor: 'rgba(99, 102, 241, 0.9)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 0,
            borderRadius: 8,
            borderSkipped: false,
            yAxisID: 'y'
          },
          {
            label: '주간 주문수',
            data: ordersValues,
            backgroundColor: 'rgba(34, 197, 94, 0.9)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 0,
            borderRadius: 8,
            borderSkipped: false,
            yAxisID: 'y1'
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
            text: `${selectedYear}년 ${getMonthName(selectedMonth)} 주간별 매출 추이`,
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
            borderColor: '#6366f1',
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
                if (context.dataset.label === '주간 매출') {
                  return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}원`;
                } else {
                  return `${context.dataset.label}: ${context.parsed.y}건`;
                }
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: '주차',
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
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: '주문수 (건)',
              font: {
                size: 13,
                weight: '600',
                family: 'Arial, sans-serif'
              },
              color: '#22c55e',
              padding: {
                bottom: 10
              }
            },
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: '#22c55e',
              font: {
                size: 12,
                weight: '500'
              },
              padding: 8
            },
            border: {
              color: 'rgba(34, 197, 94, 0.3)',
              width: 1
            }
          }
        },
        elements: {
          bar: {
            backgroundColor: 'rgba(99, 102, 241, 0.9)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 0,
            borderRadius: 8,
            borderSkipped: false
          }
        },
        animation: {
          duration: 1200,
          easing: 'easeOutQuart'
        },
        hover: {
          animationDuration: 200
        }
      }
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>월별 매출 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>오류가 발생했습니다: {error}</p>
          <button onClick={fetchMonthlyData} className={styles.retryButton}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>월별매출</h1>
        <div className={styles.headerActions}>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className={styles.yearSelect}
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}년</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className={styles.monthSelect}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>{month}월</option>
            ))}
          </select>
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
                <h3>{selectedYear}년 {getMonthName(selectedMonth)} 총매출</h3>
                <p className={styles.summaryValue}>{formatCurrency(salesData.totalSales)}원</p>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryIcon}>
                <img src={trendingUpIcon} alt="주문수" />
              </div>
              <div className={styles.summaryContent}>
                <h3>총 주문수</h3>
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

          {/* 일별 매출 차트 */}
          {salesData.dailyData.length > 0 && (
            <div className={styles.section}>
              <div className={styles.chartHeader}>
                <h2 className={styles.sectionTitle}>일별 매출 추이</h2>
                <div className={styles.chartToggle}>
                  <button
                    className={`${styles.toggleButton} ${chartType === 'bar' ? styles.active : ''}`}
                    onClick={() => setChartType('bar')}
                  >
                    막대 그래프
                  </button>
                  <button
                    className={`${styles.toggleButton} ${chartType === 'line' ? styles.active : ''}`}
                    onClick={() => setChartType('line')}
                  >
                    꺾은선 그래프
                  </button>
                </div>
              </div>
              
                            <div className={styles.chartContainer}>
                <canvas ref={chartRef} className={styles.chartCanvas}></canvas>
              </div>
            </div>
          )}

                     {/* 주간별 매출 차트 */}
           {salesData.weeklyData.length > 0 && (
             <div className={styles.section}>
               <h2 className={styles.sectionTitle}>주간별 매출 추이</h2>
               <div className={styles.weeklyChartContainer}>
                 <canvas ref={weeklyChartRef} className={styles.weeklyChartCanvas}></canvas>
               </div>
             </div>
           )}

          {/* 데이터가 없는 경우 */}
          {salesData.totalSales === 0 && (
            <div className={styles.noData}>
              <p>선택한 월의 매출 데이터가 없습니다.</p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noData}>
          <p>월별 매출 데이터를 불러올 수 없습니다.</p>
        </div>
      )}
    </div>
  );
}
