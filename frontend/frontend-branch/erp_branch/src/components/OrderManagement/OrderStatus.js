import React, { useState, useEffect } from 'react';
import styles from './OrderStatus.module.css';
import searchIcon from '../../assets/search_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import packageOutIcon from '../../assets/packageOut_icon.png';

export default function OrderStatus({ branchId, loginData }) {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 현재 로그인된 유저의 이름
  const currentEmployeeName = loginData?.realName || '미확인';

  // 실제 주문 데이터 가져오기
  useEffect(() => {
    if (branchId) {
      fetchOrders();
    }
  }, [branchId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/orders/branch/${branchId}`);
      
      if (!response.ok) {
        throw new Error('주문 데이터를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('주문 데이터 조회 오류:', err);
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
      employeeName: currentEmployeeName
    },
    {
      id: 2,
      orderNumber: 'ORD002',
      customerName: '이영희',
      items: ['샌드위치 x1', '아메리카노 x1'],
      totalAmount: 12500,
      status: 'preparing',
      orderDate: '2024-01-15 15:00',
      completedDate: null,
      employeeName: currentEmployeeName
    },
    {
      id: 3,
      orderNumber: 'ORD003',
      customerName: '최민수',
      items: ['카푸치노 x2', '티라떼 x1'],
      totalAmount: 16000,
      status: 'pending',
      orderDate: '2024-01-15 15:15',
      completedDate: null,
      employeeName: currentEmployeeName
    }
  ];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          employeeName: currentEmployeeName // 현재 로그인한 유저의 이름 추가
        }),
      });

      if (response.ok) {
        // 로컬 상태 업데이트
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { 
                  ...order, 
                  status: newStatus, 
                  // 완료시간 자동 설정
                  completedDate: newStatus === 'completed' ? new Date().toLocaleString('ko-KR') : order.completedDate,
                  // 취소시간 자동 설정
                  cancelledDate: newStatus === 'cancelled' ? new Date().toLocaleString('ko-KR') : order.cancelledDate
                }
              : order
          )
        );
        
        // 주문이력 테이블에 자동 추가 (완료 또는 취소된 경우)
        // 백엔드에서 자동으로 처리하므로 프론트엔드에서는 제거
        // if (newStatus === 'completed' || newStatus === 'cancelled') {
        //   addToOrderHistory(orderId, newStatus);
        // }
      } else {
        alert('주문 상태 업데이트에 실패했습니다.');
      }
    } catch (err) {
      console.error('주문 상태 업데이트 오류:', err);
      alert('주문 상태 업데이트 중 오류가 발생했습니다.');
    }
  };

  // 주문이력에 추가하는 함수
  const addToOrderHistory = async (orderId, status) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const historyData = {
        orderId: order.id,
        orderNumber: order.orderNumber,
        branchId: branchId,
        customerName: order.customerName,
        totalAmount: order.totalAmount,
        status: status,
        orderDate: order.orderDate,
        completedDate: status === 'completed' ? new Date().toLocaleString('ko-KR') : null,
        cancelledDate: status === 'cancelled' ? new Date().toLocaleString('ko-KR') : null,
        employeeName: currentEmployeeName
      };
      
      console.log('주문이력에 추가할 데이터:', historyData);
      
      // 주문이력 API 호출 (백엔드 구현 필요)
      const historyResponse = await fetch('http://localhost:8080/api/order-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(historyData),
      });
      
      if (historyResponse.ok) {
        console.log('주문이력에 성공적으로 추가되었습니다.');
      } else {
        console.log('주문이력 추가 실패 (API 미구현)');
      }
    } catch (err) {
      console.error('주문이력 추가 오류:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getStatusText = (status) => { 
    const statusText = (() => {
      switch (status) {
        case 'pending':
          return '대기중';
        case 'confirmed':
          return '확인됨';
        case 'preparing':
          return '준비중';
        case 'completed':
          return '완료';
        case 'cancelled':
          return '취소';
        default:
          return status;
      }
    })();

    const statusClass = getStatusClass(status);
    
    return (
      <span 
        className={`${styles['status-badge']} ${statusClass}`}
        style={{
          display: 'inline-block',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          textAlign: 'center',
          minWidth: '80px',
          whiteSpace: 'nowrap',
          backgroundColor: status === 'pending' ? '#fef3c7' : 
                          status === 'confirmed' ? '#e0e7ff' :
                          status === 'preparing' ? '#dbeafe' :
                          status === 'ready' ? '#fef3c7' :
                          status === 'completed' ? '#d1fae5' :
                          status === 'cancelled' ? '#fee2e2' : '#f3f4f6',
          color: status === 'pending' ? '#92400e' :
                 status === 'confirmed' ? '#3730a3' :
                 status === 'preparing' ? '#1e40af' :
                 status === 'ready' ? '#a16207' :
                 status === 'completed' ? '#065f46' :
                 status === 'cancelled' ? '#991b1b' : '#374151'
        }}
      >
        {statusText}
      </span>
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'confirmed':
        return styles.statusConfirmed;
      case 'preparing':
        return styles.statusPreparing;
      case 'ready':
        return styles.statusReady;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className={styles['order-status']}>
        <div className={styles['order-status-header']}>
          <h1>주문상태 관리</h1>
          <p>지점 주문 상태를 관리합니다.</p>
        </div>
        <div className={styles['loading']}>주문 데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['order-status']}>
        <div className={styles['order-status-header']}>
          <h1>주문상태 관리</h1>
          <p>지점 주문 상태를 관리합니다.</p>
        </div>
        <div className={styles['error']}>
          <p>오류: {error}</p>
          <p>샘플 데이터를 표시합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['order-status']}>
      <div className={styles['order-status-header']}>
        <h1>주문상태 관리</h1>
        <p>지점 주문 상태를 관리합니다.</p>
      </div>

      <div className={styles['search-filter-container']}>
        <div className={styles['search-box']}>
          <div className={styles['search-input-container']}>
            <img src={searchIcon} alt="검색" className={styles['search-icon']} />
            <input
              type="text"
              placeholder="주문번호, 고객명으로 검색"
              value={searchTerm}
              onChange={handleSearch}
              className={styles['search-input']}
            />
          </div>
        </div>
        <div className={styles['filter-box']}>
          <select
            value={selectedStatus}
            onChange={handleStatusFilter}
            className={styles['filter-select']}
          >
            <option value="all">전체 상태</option>
            <option value="pending">대기중</option>
            <option value="confirmed">확인됨</option>
            <option value="preparing">준비중</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소</option>
          </select>
        </div>
      </div>

      <div className={styles['orders-container']}>
        <div className={styles['orders-list']}>
          <table className={styles['orders-table']}>
            <thead className={styles['orders-table-header']}>
              <tr>
                <th>주문번호</th>
                <th>주문내용</th>
                <th>총 금액</th>
                <th>상태</th>
                <th>주문시간</th>
                <th>담당직원</th>
                <th>상태변경</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>
                    <div className={styles['order-items']}>
                      {order.items.map((item, index) => {
                        // 메뉴 이름과 옵션을 분리
                        const parts = item.split('\n');
                        const menuName = parts[0];
                        const options = parts.slice(1).join('\n');
                        
                        return (
                          <div key={index} className={styles['order-item']}>
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
                  <td>{formatCurrency(order.totalAmount)}원</td>
                  <td>
                    {getStatusText(order.status)}
                  </td>
                  <td>{order.orderDate}</td>
                  <td>{currentEmployeeName}</td>
                  <td>
                    <div className={styles['action-buttons']}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={styles['status-select']}
                      >
                        <option value="pending">대기중</option>
                        <option value="confirmed">확인됨</option>
                        <option value="preparing">준비중</option>
                        <option value="completed">완료</option>
                        <option value="cancelled">취소</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
