import React, { useState, useEffect } from 'react';
import styles from './OrderList.module.css';
import searchIcon from '../../assets/search_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import packageOutIcon from '../../assets/packageOut_icon.png';
import dollorIcon from '../../assets/dollor_icon.png';
import usersIcon from '../../assets/users_icon.png';

export default function OrderList({ branchId }) {
  const [activeTab, setActiveTab] = useState('order-list');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);

  // 샘플 데이터
  useEffect(() => {
    const sampleOrders = [
      {
        id: 1,
        orderNumber: 'ORD001',
        customerName: '김철수',
        customerPhone: '010-1234-5678',
        items: [
          { name: '아메리카노', quantity: 2, price: 4500 },
          { name: '카페라떼', quantity: 1, price: 5500 }
        ],
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
        customerPhone: '010-2345-6789',
        items: [
          { name: '샌드위치', quantity: 1, price: 8000 },
          { name: '아메리카노', quantity: 1, price: 4500 }
        ],
        totalAmount: 12500,
        status: 'preparing',
        orderDate: '2024-01-15 15:00',
        completedDate: null,
        paymentMethod: '현금',
        employeeName: '김직원'
      },
      {
        id: 3,
        orderNumber: 'ORD003',
        customerName: '최민수',
        customerPhone: '010-3456-7890',
        items: [
          { name: '카푸치노', quantity: 2, price: 5500 },
          { name: '티라떼', quantity: 1, price: 5000 }
        ],
        totalAmount: 16000,
        status: 'pending',
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

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowOrderDetailModal(false);
    setSelectedOrder(null);
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

  // 결제 상태 텍스트 변환
  const getPaymentStatusText = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending':
        return '결제대기';
      case 'completed':
        return '결제완료';
      case 'failed':
        return '결제실패';
      default:
        return paymentStatus;
    }
  };

  // 결제 상태 스타일 클래스
  const getPaymentStatusClass = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending':
        return styles.paymentStatusPending;
      case 'completed':
        return styles.paymentStatusCompleted;
      case 'failed':
        return styles.paymentStatusFailed;
      default:
        return '';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        order.customerPhone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>주문목록</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <img src={searchIcon} alt="검색" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="주문번호, 고객명, 전화번호로 검색"
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
            <option value="pending">대기중</option>
            <option value="preparing">준비중</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소</option>
          </select>
        </div>
      </div>

      <div className={styles.orderlistContainer}>
        <div className={styles.orderlistList}>
          <table className={styles.orderlistTable}>
            <thead className={styles.orderlistTableHeader}>
              <tr>
                <th>주문번호</th>
                <th>고객명</th>
                <th>주문내용</th>
                <th>총 금액</th>
                <th>주문상태</th>
                <th>결제상태</th>
                <th>주문시간</th>
                <th>담당직원</th>
                <th>결제방법</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} onClick={() => handleOrderClick(order)} className={styles.tableRow}>
                  <td>{order.orderNumber}</td>
                  <td>
                    <div className={styles.customerInfo}>
                      <div className={styles.customerName}>{order.customerName}</div>
                      <div className={styles.customerPhone}>{order.customerPhone}</div>
                    </div>
                  </td>
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
                  <td>
                    <span className={`${styles.paymentStatus} ${getPaymentStatusClass(order.paymentStatus)}`}>
                      {getPaymentStatusText(order.paymentStatus)}
                    </span>
                  </td>
                  <td>{order.orderDate}</td>
                  <td>{order.employeeName}</td>
                  <td>{order.paymentMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showOrderDetailModal && selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={handleCloseModal} />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
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

  // 결제 상태 텍스트 변환
  const getPaymentStatusText = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending':
        return '결제대기';
      case 'completed':
        return '결제완료';
      case 'failed':
        return '결제실패';
      default:
        return paymentStatus;
    }
  };

  // 결제 상태 스타일 클래스
  const getPaymentStatusClass = (paymentStatus) => {
    switch (paymentStatus) {
      case 'pending':
        return styles.statusPending;
      case 'completed':
        return styles.statusCompleted;
      case 'failed':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>주문 상세정보</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <div className={styles.modalContent}>
          <div className={styles.orderInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>주문번호:</span>
              <span className={styles.value}>{order.orderNumber}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>고객명:</span>
              <span className={styles.value}>{order.customerName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>전화번호:</span>
              <span className={styles.value}>{order.customerPhone}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>주문상태:</span>
              <span className={`${styles.value} ${getStatusClass(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>결제상태:</span>
              <span className={`${styles.value} ${getPaymentStatusClass(order.paymentStatus)}`}>
                {getPaymentStatusText(order.paymentStatus)}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>주문시간:</span>
              <span className={styles.value}>{order.orderDate}</span>
            </div>
            {order.completedDate && (
              <div className={styles.infoRow}>
                <span className={styles.label}>완료시간:</span>
                <span className={styles.value}>{order.completedDate}</span>
              </div>
            )}
            <div className={styles.infoRow}>
              <span className={styles.label}>담당직원:</span>
              <span className={styles.value}>{order.employeeName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>결제방법:</span>
              <span className={styles.value}>{order.paymentMethod}</span>
            </div>
          </div>
          
          <div className={styles.orderItems}>
            <h3>주문내용</h3>
            {order.items.map((item, index) => (
              <div key={index} className={styles.itemRow}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemQuantity}>x{item.quantity}</span>
                <span className={styles.itemPrice}>{formatCurrency(item.price)}원</span>
                <span className={styles.itemTotal}>{formatCurrency(item.price * item.quantity)}원</span>
              </div>
            ))}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>총 금액:</span>
              <span className={styles.totalAmount}>{formatCurrency(order.totalAmount)}원</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
