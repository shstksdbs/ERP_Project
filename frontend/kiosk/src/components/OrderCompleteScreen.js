import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './OrderCompleteScreen.module.css';

const OrderCompleteScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { orderId, orderNumber, totalAmount } = location.state || {};

  const goToMenu = () => {
    navigate('/');
  };

  const goToOrderHistory = () => {
    // 주문 내역 화면으로 이동 (구현 필요)
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.successIcon}>
          <div className={styles.checkmark}>✓</div>
        </div>
        
        <h1 className={styles.title}>주문이 완료되었습니다!</h1>
        
        <div className={styles.orderInfo}>
          <div className={styles.infoRow}>
            <span className={styles.label}>주문번호:</span>
            <span className={styles.value}>{orderNumber || 'N/A'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>주문ID:</span>
            <span className={styles.value}>{orderId || 'N/A'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>총 금액:</span>
            <span className={styles.value}>₩{totalAmount?.toLocaleString() || '0'}</span>
          </div>
        </div>
        
        <div className={styles.message}>
          <p>주문이 성공적으로 접수되었습니다.</p>
          <p>잠시만 기다려주시면 준비해드리겠습니다.</p>
        </div>
        
        <div className={styles.buttons}>
          <button className={styles.primaryButton} onClick={goToMenu}>
            메뉴로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCompleteScreen;
