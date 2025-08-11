import React, { useState, useEffect } from 'react';
import styles from './OrderStatus.module.css';
import searchIcon from '../../assets/search_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import packageOutIcon from '../../assets/packageOut_icon.png';

export default function OrderStatus({ branchId }) {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // 샘플 데이터
  useEffect(() => {
    const sampleOrders = [
      {
        id: 1,
        orderNumber: 'ORD001',
        customerName: '김철수',
        items: ['아메리카노 x2', '카페라떼 x1'],
        totalAmount: 14500,
        status: 'completed',
        orderDate: '2024-01-15 14:30',
        completedDate: '2024-01-15 14:45',
        employeeName: '박직원'
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
        employeeName: '김직원'
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
        employeeName: '박직원'
      }
    ];

    setOrders(sampleOrders);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, completedDate: newStatus === 'completed' ? new Date().toLocaleString() : order.completedDate }
          : order
      )
    );
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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
                      {order.items.map((item, index) => (
                        <div key={index} className={styles['order-item']}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>{formatCurrency(order.totalAmount)}원</td>
                  <td>
                    <span className={`${styles['status-badge']} ${styles[`status-${order.status}`]}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td>{order.orderDate}</td>
                  <td>{order.employeeName}</td>
                  <td>
                    <div className={styles['action-buttons']}>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={styles['status-select']}
                      >
                        <option value="pending">대기중</option>
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
