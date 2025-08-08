import React, { useState, useEffect } from 'react';
import styles from './OrderHistory.module.css';
import searchIcon from '../../assets/search_icon.png';
import historyIcon from '../../assets/history_icon.png';

export default function OrderHistory({ branchId }) {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

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
        paymentMethod: '카드',
        employeeName: '박직원'
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
        paymentMethod: '현금',
        employeeName: '김직원'
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
        paymentMethod: '카드',
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesDateRange = (!dateRange.start || order.orderDate >= dateRange.start) &&
                            (!dateRange.end || order.orderDate <= dateRange.end);
    return matchesSearch && matchesStatus && matchesDateRange;
  });

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
                <th>고객명</th>
                <th>주문내용</th>
                <th>총 금액</th>
                <th>상태</th>
                <th>주문시간</th>
                <th>완료시간</th>
                <th>담당직원</th>
                <th>결제방법</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className={styles.tableRow}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>
                    <div className={styles.orderItems}>
                      {order.items.map((item, index) => (
                        <div key={index} className={styles.orderItem}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className={styles.amount}>{formatCurrency(order.totalAmount)}원</td>
                  <td>
                    <span className={`${styles.status} ${getStatusClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td>{order.orderDate}</td>
                  <td>{order.completedDate || '-'}</td>
                  <td>{order.employeeName}</td>
                  <td>{order.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
