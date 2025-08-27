import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './PaymentSuccessScreen.module.css';

const PaymentSuccessScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [countdown, setCountdown] = useState(10);
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    // URL 파라미터에서 결제 정보 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const paymentKey = urlParams.get('paymentKey');
    const orderId = urlParams.get('orderId');
    const amount = urlParams.get('amount');

    if (paymentKey && orderId && amount) {
      setOrderInfo({
        paymentKey,
        orderId,
        amount: parseInt(amount)
      });

      // 백엔드에 결제 검증 요청
      verifyPayment(paymentKey, orderId, parseInt(amount));
    }

    // 10초 후 메인 화면으로 자동 이동
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // 결제 검증 및 상태 업데이트 함수
  const verifyPayment = async (paymentKey, orderId, amount) => {
    try {
      // 1. 결제 상태를 completed로 업데이트
      const updateResponse = await fetch(`http://localhost:8080/api/orders/${orderId}/payment-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus: 'completed',
          paymentKey: paymentKey
        })
      });

      if (updateResponse.ok) {
        const result = await updateResponse.json();
        console.log('결제 상태 업데이트 성공:', result);
      } else {
        console.error('결제 상태 업데이트 실패:', updateResponse.status);
      }
    } catch (error) {
      console.error('결제 상태 업데이트 중 오류:', error);
    }
  };

  const goToMain = () => {
    navigate('/');
  };

  const printReceipt = () => {
    // 영수증 인쇄 기능 (실제 구현 필요)
    window.print();
  };

  if (!orderInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>결제 정보를 확인하는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.successCard}>
        <div className={styles.successIcon}>
          <div className={styles.checkmark}>✓</div>
        </div>
        
        <h1 className={styles.title}>결제가 완료되었습니다!</h1>
        
        <div className={styles.orderInfo}>
          <div className={styles.infoRow}>
            <span className={styles.label}>주문 번호:</span>
            <span className={styles.value}>{orderInfo.orderId}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>결제 금액:</span>
            <span className={styles.value}>₩{orderInfo.amount.toLocaleString()}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>결제 시간:</span>
            <span className={styles.value}>{new Date().toLocaleString('ko-KR')}</span>
          </div>
        </div>

        <div className={styles.message}>
          <p>주문이 성공적으로 접수되었습니다.</p>
          <p>잠시 후 주문번호를 불러주세요.</p>
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.printButton} onClick={printReceipt}>
            영수증 인쇄
          </button>
          <button className={styles.mainButton} onClick={goToMain}>
            메인으로 돌아가기
          </button>
        </div>

        <div className={styles.countdown}>
          {countdown}초 후 메인 화면으로 이동합니다
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessScreen;
