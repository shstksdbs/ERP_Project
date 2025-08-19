import React, { useState, useEffect } from 'react';
import styles from './OrderHistory.module.css';
import searchIcon from '../../assets/search_icon.png';
import historyIcon from '../../assets/history_icon.png';

export default function OrderHistory({ branchId, loginData }) {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 현재 로그인된 유저의 이름
  const currentEmployeeName = loginData?.realName || '미확인';

  // 실제 주문이력 데이터 가져오기
  useEffect(() => {
    if (branchId) {
      fetchOrderHistory();
    }
  }, [branchId, selectedStatus, dateRange]);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      // order_history API 호출
      let url = `http://localhost:8080/api/order-history/branch/${branchId}`;
      
      // 상태별 필터링
      if (selectedStatus !== 'all') {
        url = `http://localhost:8080/api/order-history/branch/${branchId}/status/${selectedStatus}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('주문이력 데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      console.log('order_history API 응답:', data);
      console.log('첫 번째 항목 상세:', data[0]);
      
      // order_history 데이터 구조에 맞게 변환
      const historyData = data.map(history => {
        const mapped = {
          id: history.id || history.orderId,
          orderNumber: history.orderNumber,
          customerName: history.customerName,
          items: history.items || [], // 백엔드에서 전송한 items 배열 사용
          totalAmount: history.totalAmount,
          status: history.status,
          orderDate: history.orderDate || history.orderTime,
          completedDate: history.completedDate || history.completedTime,
          cancelledDate: history.cancelledDate || history.cancelledTime,
          paymentMethod: '카드', // order_history에는 결제 방법 정보가 없음
          employeeName: history.employeeName || currentEmployeeName
        };
        console.log('매핑된 데이터:', mapped);
        return mapped;
      });
      
      setOrders(historyData);
      setError(null);
    } catch (err) {
      console.error('주문이력 조회 오류:', err);
      setError(err.message);
      // 에러 발생 시 샘플 데이터 사용
      setOrders(getSampleOrders());
    } finally {
      setLoading(false);
    }
  };

  // 샘플 데이터 (API 오류 시 사용)
  const getSampleOrders = () => [
    {
      id: 1,
      orderNumber: 'ORD001',
      customerName: '김철수',
      items: ['아메리카노 x2', '카페라떼 x1'],
      totalAmount: 14500,
      status: 'completed',
      orderDate: '2024-01-15 14:30',
      completedDate: '2024-01-15 14:45',
      cancelledDate: null,
      paymentMethod: '카드',
      employeeName: currentEmployeeName
    },
    {
      id: 2,
      orderNumber: 'ORD002',
      customerName: '이영희',
      items: ['샌드위치 x1', '아메리카노 x1'],
      totalAmount: 12500,
      status: 'completed',
      orderDate: '2024-01-15 15:00',
      completedDate: '2024-01-15 15:20',
      cancelledDate: null,
      paymentMethod: '현금',
      employeeName: currentEmployeeName
    },
    {
      id: 3,
      orderNumber: 'ORD003',
      customerName: '최민수',
      items: ['카푸치노 x2', '티라떼 x1'],
      totalAmount: 16000,
      status: 'cancelled',
      orderDate: '2024-01-15 15:15',
      completedDate: null,
      cancelledDate: '2024-01-15 15:25',
      paymentMethod: '카드',
      employeeName: currentEmployeeName
    }
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'preparing':
        return '준비중';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'preparing':
        return styles.statusPreparing;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  // 완료시간 포맷팅 개선
  const formatCompletedTime = (order) => {
    let targetDate = null;
    
    if (order.status === 'completed' && order.completedDate) {
      targetDate = order.completedDate;
    } else if (order.status === 'cancelled' && order.cancelledDate) {
      targetDate = order.cancelledDate;
    }
    
    if (!targetDate) return '-';
    
    try {
      // LocalDateTime을 Date 객체로 변환
      const date = new Date(targetDate);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return targetDate.toString();
    }
  };

  // 주문시간 포맷팅
  const formatOrderTime = (dateTime) => {
    if (!dateTime) return '-';
    
    try {
      // LocalDateTime을 Date 객체로 변환
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return '-';
      
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateTime.toString();
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesDateRange = (!dateRange.start || order.orderDate >= dateRange.start) &&
                            (!dateRange.end || order.orderDate <= dateRange.end);
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // 로딩 상태 처리
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>주문이력</h1>
          <p>지점 주문 이력을 조회하고 관리합니다.</p>
        </div>
        <div className={styles.loading}>주문이력 데이터를 불러오는 중...</div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>주문이력</h1>
          <p>지점 주문 이력을 조회하고 관리합니다.</p>
        </div>
        <div className={styles.error}>
          <p>오류: {error}</p>
          <p>샘플 데이터를 표시합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>주문이력</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <img src={searchIcon} alt="검색" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="주문번호, 고객명으로 검색"
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
          <select
            value={selectedStatus}
            onChange={handleStatusFilter}
            className={styles.statusFilter}
          >
            <option value="all">전체 상태</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소</option>
          </select>
          <div className={styles.dateRange}>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              className={styles.dateInput}
              placeholder="시작일"
            />
            <span className={styles.dateSeparator}>~</span>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              className={styles.dateInput}
              placeholder="종료일"
            />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>주문번호</th>
                <th>주문내용</th>
                <th>총 금액</th>
                <th>상태</th>
                <th>주문시간</th>
                <th>완료시간</th>
                <th>담당직원</th>
                
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className={styles.tableRow}>
                  <td>{order.orderNumber}</td>
                  <td>
                    <div className={styles.orderItems}>
                      {order.items.map((item, index) => {
                        // 메뉴 이름과 옵션을 분리
                        const parts = item.split('\n');
                        const menuName = parts[0];
                        const options = parts.slice(1).join('\n');
                        
                        return (
                          <div key={index} className={styles.orderItem}>
                            <div className={styles['order-item-simple']}>
                              <div className={styles['menu-name']}>
                                {menuName}
                              </div>
                              {options && (
                                <div className={styles['menu-options']}>
                                  {options}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className={styles.amount}>{formatCurrency(order.totalAmount)}원</td>
                  <td>
                    <span className={`${styles['status-badge']} ${getStatusClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td>{formatOrderTime(order.orderDate)}</td>
                  <td>{formatCompletedTime(order)}</td>
                  <td>{order.employeeName || currentEmployeeName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
