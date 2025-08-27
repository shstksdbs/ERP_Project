import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './PaymentScreen.module.css';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [customerName, setCustomerName] = useState('손님');
  const [customerPhone, setCustomerPhone] = useState('000-0000-0000');
  const [orderType, setOrderType] = useState('takeout');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useDefaultValues, setUseDefaultValues] = useState(true);
  
  // 주문 정보 가져오기
  const orderData = location.state?.orderData;
  const selectedBranch = location.state?.selectedBranch;
  
  useEffect(() => {
    if (!orderData || !selectedBranch) {
      alert('주문 정보가 없습니다. 장바구니로 돌아갑니다.');
      navigate('/cart');
    }
  }, [orderData, selectedBranch, navigate]);

  // 보안 해시 생성 함수
  const generateSecurityHash = async (data) => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handlePayment = async () => {
    // 기본값 사용 시에도 최소한의 검증
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('고객 정보를 입력해주세요.');
      return;
    }
    
    // 기본값 사용 시 경고 메시지
    if (useDefaultValues) {
      const confirmDefault = window.confirm(
        '기본값으로 주문을 진행합니다.\n' +
        '고객명: 손님\n' +
        '전화번호: 000-0000-0000\n' +
        '주문유형: 포장\n' +
        '결제방법: 신용카드\n\n' +
        '계속 진행하시겠습니까?'
      );
      if (!confirmDefault) return;
    }

    setIsProcessing(true);

    try {
      // 보안 해시 생성
      const timestamp = Date.now();
      const dataToHash = orderData.branchId + orderType + customerName + customerPhone + paymentMethod + JSON.stringify(orderData.items);
      const securityHash = await generateSecurityHash(dataToHash + timestamp + 'your_secret_key_here_change_in_production');
      
      // 1. 백엔드에서 주문 생성 및 결제 정보 요청
      const orderResponse = await fetch('http://localhost:8080/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          customerName,
          customerPhone,
          orderType,
          paymentMethod,
          securityHash: securityHash,
          timestamp: timestamp
        })
      });

      if (!orderResponse.ok) {
        throw new Error('주문 생성에 실패했습니다.');
      }

      const orderResult = await orderResponse.json();
      
      // 2. 토스페이먼츠 결제 요청
      const paymentData = {
        amount: orderData.totalAmount,
        orderNumber: orderResult.orderNumber, // orderNumber 사용
        orderName: `${selectedBranch.name} - ${orderData.items[0]?.menuName || '주문'}`,
        customerName,
        customerEmail: 'customer@example.com', // 실제로는 입력받아야 함
        successUrl: `${window.location.origin}/payment-success`,
        failUrl: `${window.location.origin}/payment-fail`,
      };

      // 3. 결제 SDK 초기화 및 결제 요청
      if (window.TossPayments) {
        const tossPayments = window.TossPayments('test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'); // 테스트 키
        
                 tossPayments.requestPayment(paymentMethod, {
           amount: paymentData.amount,
           orderId: paymentData.orderNumber, // orderNumber 사용
           orderName: paymentData.orderName,
           customerName: paymentData.customerName,
           customerEmail: paymentData.customerEmail,
           successUrl: paymentData.successUrl,
           failUrl: paymentData.failUrl,
         });
      } else {
        // 토스페이먼츠 SDK가 로드되지 않은 경우
        console.error('토스페이먼츠 SDK를 찾을 수 없습니다.');
        alert('결제 시스템을 초기화할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }

    } catch (error) {
      console.error('결제 처리 중 오류:', error);
      alert('결제 처리 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const goBack = () => {
    navigate('/cart');
  };

  if (!orderData || !selectedBranch) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className={styles.paymentContainer}>
      <div className={styles.paymentHeader}>
        <h2 className={styles.paymentTitle}>결제 정보 입력</h2>
      </div>

      <div className={styles.branchInfo}>
        <h3>선택된 지점</h3>
        <p>{selectedBranch.name}</p>
      </div>

      <div className={styles.orderSummary}>
        <h3>주문 요약</h3>
        <div className={styles.orderItems}>
          {orderData.items.map((item, index) => (
            <div key={index} className={styles.orderItem}>
              <span>{item.menuName} x {item.quantity}</span>
              <span>₩{item.totalPrice.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className={styles.totalAmount}>
          <strong>총 금액: ₩{orderData.totalAmount.toLocaleString()}</strong>
        </div>
      </div>

      <div className={styles.customerInfo}>
        <h3>고객 정보</h3>
        
        {/* 기본값 사용 토글 */}
        <div className={styles.defaultToggle}>
          <label>
            <input
              type="checkbox"
              checked={useDefaultValues}
              onChange={(e) => setUseDefaultValues(e.target.checked)}
            />
            기본값 사용 (빠른 주문)
          </label>
          <small>체크하면 기본값으로 빠르게 주문할 수 있습니다</small>
        </div>
        
        <div className={styles.inputGroup}>
          <label htmlFor="customerName">이름 *</label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="고객 이름을 입력하세요"
            required
            disabled={useDefaultValues}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="customerPhone">전화번호 *</label>
          <input
            type="tel"
            id="customerPhone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="010-0000-0000"
            required
            disabled={useDefaultValues}
          />
        </div>
      </div>

      <div className={styles.orderOptions}>
        <h3>주문 옵션</h3>
        <div className={styles.optionGroup}>
          <label>주문 유형</label>
          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                value="takeout"
                checked={orderType === 'takeout'}
                onChange={(e) => setOrderType(e.target.value)}
                disabled={useDefaultValues}
              />
              포장
            </label>
            <label>
              <input
                type="radio"
                value="dinein"
                checked={orderType === 'dinein'}
                onChange={(e) => setOrderType(e.target.value)}
                disabled={useDefaultValues}
              />
              매장 내 식사
            </label>
          </div>
        </div>
        <div className={styles.optionGroup}>
          <label>결제 방법</label>
          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={useDefaultValues}
              />
              신용카드
            </label>
            <label>
              <input
                type="radio"
                value="transfer"
                checked={paymentMethod === 'transfer'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={useDefaultValues}
              />
              계좌이체
            </label>
            <label>
              <input
                type="radio"
                value="virtual"
                checked={paymentMethod === 'virtual'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={useDefaultValues}
              />
              가상계좌
            </label>
          </div>
        </div>
      </div>

      <div className={styles.actionButtons}>
        <button className={styles.backButton} onClick={goBack} disabled={isProcessing}>
          뒤로 가기
        </button>
        <button 
          className={styles.payButton} 
          onClick={handlePayment}
          disabled={isProcessing || !customerName.trim() || !customerPhone.trim()}
        >
          {isProcessing ? '처리 중...' : useDefaultValues ? '빠른 결제하기' : '결제하기'}
        </button>
      </div>
    </div>
  );
};

export default PaymentScreen;
