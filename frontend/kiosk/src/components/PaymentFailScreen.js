import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './PaymentFailScreen.module.css';

const PaymentFailScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [countdown, setCountdown] = useState(10);
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    // URL 파라미터에서 에러 정보 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const message = urlParams.get('message');
    const orderId = urlParams.get('orderId');

    if (code || message) {
      setErrorInfo({
        code,
        message: decodeURIComponent(message || '알 수 없는 오류가 발생했습니다.'),
        orderId
      });
      
      // 결제 실패 시 주문 상태를 failed로 업데이트
      if (orderId) {
        updatePaymentStatusToFailed(orderId);
      }
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

  const goToMain = () => {
    navigate('/');
  };

  // 결제 실패 상태 업데이트 함수
  const updatePaymentStatusToFailed = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/payment-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentStatus: 'failed'
        })
      });

      if (response.ok) {
        console.log('결제 실패 상태 업데이트 성공');
      } else {
        console.error('결제 실패 상태 업데이트 실패:', response.status);
      }
    } catch (error) {
      console.error('결제 실패 상태 업데이트 중 오류:', error);
    }
  };

  const goToCart = () => {
    navigate('/cart');
  };

  const getErrorMessage = (code) => {
    const errorMessages = {
      'PAY_PROCESS_CANCELED': '결제가 취소되었습니다.',
      'PAY_PROCESS_ABORTED': '결제가 중단되었습니다.',
      'INVALID_CARD': '유효하지 않은 카드입니다.',
      'INSUFFICIENT_FUNDS': '잔액이 부족합니다.',
      'CARD_EXPIRED': '만료된 카드입니다.',
      'INVALID_PASSWORD': '카드 비밀번호가 올바르지 않습니다.',
      'EXCEED_DAILY_LIMIT': '일일 결제 한도를 초과했습니다.',
      'EXCEED_MONTHLY_LIMIT': '월 결제 한도를 초과했습니다.',
      'BLOCKED_CARD': '사용이 제한된 카드입니다.',
      'TIMEOUT': '결제 시간이 초과되었습니다.',
      'NETWORK_ERROR': '네트워크 오류가 발생했습니다.',
      'SYSTEM_ERROR': '시스템 오류가 발생했습니다.'
    };
    
    return errorMessages[code] || '알 수 없는 오류가 발생했습니다.';
  };

  if (!errorInfo) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>오류 정보를 확인하는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.failCard}>
        <div className={styles.failIcon}>
          <div className={styles.cross}>✗</div>
        </div>
        
        <h1 className={styles.title}>결제에 실패했습니다</h1>
        
        <div className={styles.errorInfo}>
          <div className={styles.errorMessage}>
            {getErrorMessage(errorInfo.code)}
          </div>
          {errorInfo.message && (
            <div className={styles.detailMessage}>
              {errorInfo.message}
            </div>
          )}
          {errorInfo.orderId && (
            <div className={styles.orderId}>
              주문 번호: {errorInfo.orderId}
            </div>
          )}
        </div>

        <div className={styles.suggestions}>
          <p>다음 사항을 확인해주세요:</p>
          <ul>
            <li>카드 정보가 올바른지 확인</li>
            <li>카드 잔액이 충분한지 확인</li>
            <li>카드 사용 제한 여부 확인</li>
            <li>네트워크 연결 상태 확인</li>
          </ul>
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.retryButton} onClick={goToCart}>
            다시 시도하기
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

export default PaymentFailScreen;
