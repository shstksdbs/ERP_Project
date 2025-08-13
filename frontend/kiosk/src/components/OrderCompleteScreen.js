import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OrderCompleteScreen.module.css';

const OrderCompleteScreen = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10); // 10초 카운트다운

  // 샘플 주문 완료 데이터
  const orderData = {
    orderNumber: 'ORD-2024-001',
    orderTime: new Date().toLocaleString('ko-KR'),
    estimatedTime: '15분',
    totalAmount: 16500
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timer);
          navigate('/'); // 카운트다운 종료 후 메인 화면으로 이동
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, [navigate]);

  const startNewOrder = () => {
    navigate('/'); // 메인 화면으로 이동하여 새 주문 시작
  };

  const goHome = () => {
    navigate('/'); // 홈 화면으로 이동 (현재는 메인 화면과 동일)
  };

  return (
    <div className={styles.completeContainer}>
      <div className={styles.successIcon}>
        <div className={styles.successIconText}>✓</div>
      </div>

      <h1 className={styles.completeTitle}>주문이 완료되었습니다!</h1>

      <p className={styles.completeMessage}>
        주문해주셔서 감사합니다.<br />
        빠른 시일 내에 준비해드리겠습니다.
      </p>

      <div className={styles.orderInfo}>
        <div className={styles.orderNumber}>주문번호: {orderData.orderNumber}</div>

        <div className={styles.orderDetails}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>주문 시간</span>
            <span className={styles.detailValue}>{orderData.orderTime}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>예상 준비 시간</span>
            <span className={styles.detailValue}>{orderData.estimatedTime}</span>
          </div>
        </div>

        <div className={styles.totalAmount}>
          <div className={styles.totalLabel}>총 결제 금액</div>
          <div className={styles.totalPrice}>₩{orderData.totalAmount.toLocaleString()}</div>
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.newOrderButton} onClick={startNewOrder}>
            새 주문하기
          </button>
          <button className={styles.homeButton} onClick={goHome}>
            홈으로
          </button>
        </div>
      </div>

      <div className={styles.countdown}>
        {countdown}초 후 자동으로 메인 화면으로 이동합니다
      </div>
    </div>
  );
};

export default OrderCompleteScreen;
