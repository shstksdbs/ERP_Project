import React, { useState, useEffect } from 'react';
import styles from './OrderingStatus.module.css';
import searchIcon from '../../assets/search_icon.png';
import packageInIcon from '../../assets/packageIn_icon.png';

export default function OrderingStatus({ branchId }) {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // 샘플 데이터
  useEffect(() => {
    const sampleOrders = [
      {
        id: 1,
        orderNumber: 'PO001',
        orderDate: '2024-01-15',
        items: [
          { name: '카페라떼', quantity: 50, price: 1800 },
          { name: '샌드위치', quantity: 20, price: 3000 }
        ],
        totalAmount: 150000,
        status: 'approved',
        expectedDelivery: '2024-01-18',
        employeeName: '김직원'
      },
      {
        id: 2,
        orderNumber: 'PO002',
        orderDate: '2024-01-14',
        items: [
          { name: '우유', quantity: 30, price: 2500 },
          { name: '커피원두', quantity: 5, price: 15000 }
        ],
        totalAmount: 82500,
        status: 'pending',
        expectedDelivery: '2024-01-20',
        employeeName: '박직원'
      },
      {
        id: 3,
        orderNumber: 'PO003',
        orderDate: '2024-01-13',
        items: [
          { name: '아메리카노', quantity: 100, price: 1200 }
        ],
        totalAmount: 120000,
        status: 'delivered',
        expectedDelivery: '2024-01-16',
        employeeName: '김직원'
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

  const handleOrderClick = (order) => {
    // 발주 상세 정보를 보여주는 로직을 추가할 수 있습니다
    console.log('Selected order:', order);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '승인대기';
      case 'approved':
        return '승인완료';
      case 'delivered':
        return '배송완료';
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
      case 'approved':
        return styles.statusApproved;
      case 'delivered':
        return styles.statusDelivered;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>발주상태</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <img src={searchIcon} alt="검색" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="발주번호로 검색"
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
            <option value="pending">승인대기</option>
            <option value="approved">승인완료</option>
            <option value="delivered">배송완료</option>
            <option value="cancelled">취소</option>
          </select>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th>발주번호</th>
                <th>발주일</th>
                <th>발주내용</th>
                <th>총 금액</th>
                <th>상태</th>
                <th>예상배송일</th>
                <th>담당자</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} onClick={() => handleOrderClick(order)} className={styles.tableRow}>
                  <td className={styles.orderNumber}>{order.orderNumber}</td>
                  <td>{order.orderDate}</td>
                  <td>
                    <div className={styles.orderItems}>
                      {order.items.map((item, index) => (
                        <div key={index} className={styles.orderItem}>
                          {item.name} x{item.quantity}
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
                  <td>{order.expectedDelivery}</td>
                  <td>{order.employeeName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
