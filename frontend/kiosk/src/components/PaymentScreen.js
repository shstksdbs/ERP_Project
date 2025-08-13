import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PaymentScreen.module.css';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('');
  
  // 샘플 주문 데이터
  const orderItems = [
    {
      id: 1,
      name: '치즈버거 세트 (치킨너겟, 아메리카노)',
      quantity: 1,
      price: 8500,
      total: 8500
    },
    {
      id: 2,
      name: '불고기버거 (추가: 치즈, 제거: 양파)',
      quantity: 1,
      price: 6500,
      total: 6500
    }
  ];
  
  const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);

  const paymentMethods = [
    { id: 'card', name: '신용카드' },
    { id: 'cash', name: '현금' },
    { id: 'mobile', name: '모바일 결제' },
    { id: 'gift', name: '상품권' }
  ];

  const handlePayment = () => {
    if (!selectedMethod) {
      alert('결제 방법을 선택해주세요.');
      return;
    }
    
    // 결제 처리 로직 (실제로는 API 호출)
    setTimeout(() => {
      navigate('/complete');
    }, 2000);
  };

  const goBack = () => {
    navigate('/cart');
  };

  return (
    <div className={styles.paymentContainer}>
      <div className={styles.paymentHeader}>
        <h2 className={styles.paymentTitle}>결제</h2>
      </div>

      <div className={styles.orderSummary}>
        <h3 className={styles.summaryTitle}>주문 내역</h3>
        <div className={styles.orderItems}>
          {orderItems.map((item, index) => (
            <div key={index} className={styles.orderItem}>
              <span className={styles.itemName}>{item.name} x{item.quantity}</span>
              <span className={styles.itemTotal}>₩{item.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className={styles.totalAmount}>
          <div className={styles.totalLabel}>총 결제 금액</div>
          <div className={styles.totalPrice}>₩{totalAmount.toLocaleString()}</div>
        </div>
      </div>

      <div className={styles.paymentMethods}>
        <h3 className={styles.methodsTitle}>결제 방법 선택</h3>
        <div className={styles.methodGrid}>
          {paymentMethods.map(method => (
            <button
              key={method.id}
              className={`${styles.paymentMethod} ${selectedMethod === method.id ? styles.selected : ''}`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className={styles.methodIcon}>
                <div className={styles.methodIconText}>{method.name.charAt(0)}</div>
              </div>
              <span className={styles.methodName}>{method.name}</span>
            </button>
          ))}
        </div>
        
        <div className={styles.actionButtons}>
          <button className={styles.backButton} onClick={goBack}>
            장바구니로 돌아가기
          </button>
          <button className={styles.payButton} onClick={handlePayment} disabled={!selectedMethod}>
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;
