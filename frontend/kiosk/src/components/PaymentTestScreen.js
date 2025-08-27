import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './PaymentTestScreen.module.css';

const PaymentTestScreen = () => {
  const navigate = useNavigate();
  const [testAmount, setTestAmount] = useState(1000);
  const [testOrderId, setTestOrderId] = useState(`TEST${Date.now()}`);
  const [isProcessing, setIsProcessing] = useState(false);

  // 보안 해시 생성 함수
  const generateSecurityHash = async (data) => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  const handleTestPayment = async () => {
    setIsProcessing(true);
    
    try {
      // 테스트 주문 데이터 생성
      const testOrderData = {
        branchId: 1,
        totalAmount: testAmount,
        items: [{
          menuId: 1,
          menuName: '테스트 메뉴',
          quantity: 1,
          unitPrice: testAmount,
          totalPrice: testAmount,
          displayName: '테스트 메뉴',
          displayOptions: [],
          options: []
        }]
      };

      // 보안 해시 생성
      const timestamp = Date.now();
      const dataToHash = testOrderData.branchId + 'takeout' + '테스트 고객' + '010-0000-0000' + 'card' + JSON.stringify(testOrderData.items);
      const securityHash = await generateSecurityHash(dataToHash + timestamp + 'your_secret_key_here_change_in_production');
      
      // 1. 백엔드에서 주문 생성
      const orderResponse = await fetch('http://localhost:8080/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testOrderData,
          customerName: '테스트 고객',
          customerPhone: '010-0000-0000',
          orderType: 'takeout',
          paymentMethod: 'card',
          securityHash: securityHash,
          timestamp: timestamp
        })
      });

      if (!orderResponse.ok) {
        throw new Error('주문 생성에 실패했습니다.');
      }

      const orderResult = await orderResponse.json();
      
             // 2. 토스페이먼츠 테스트 결제 요청
       if (window.TossPayments) {
         const tossPayments = window.TossPayments(process.env.REACT_APP_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq');
         
         // 디버깅을 위한 로그 출력
         console.log('백엔드에서 받은 주문 정보:', orderResult);
         console.log('사용할 orderId:', orderResult.orderId);
         console.log('사용할 amount:', testAmount);
         
         tossPayments.requestPayment('card', {
           amount: testAmount,
           orderId: orderResult.orderNumber, // orderNumber 사용
           orderName: '테스트 주문',
           customerName: '테스트 고객',
           customerEmail: 'test@example.com',
           successUrl: `${window.location.origin}/payment-success`,
           failUrl: `${window.location.origin}/payment-fail`,
         });
       } else {
         throw new Error('토스페이먼츠 SDK를 찾을 수 없습니다.');
       }

    } catch (error) {
      console.error('테스트 결제 오류:', error);
      alert('테스트 결제 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const goToMain = () => {
    navigate('/');
  };

  return (
    <div className={styles.testContainer}>
      <div className={styles.testCard}>
        <h1 className={styles.title}>결제 시스템 테스트</h1>
        
        <div className={styles.testInfo}>
          <p>이 화면은 결제 시스템을 테스트하기 위한 것입니다.</p>
          <p>실제 결제가 발생하지 않는 테스트 모드입니다.</p>
        </div>

        <div className={styles.testForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="testAmount">테스트 금액 (원)</label>
            <input
              type="number"
              id="testAmount"
              value={testAmount}
              onChange={(e) => setTestAmount(parseInt(e.target.value) || 1000)}
              min="1000"
              step="1000"
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="testOrderId">테스트 주문 ID</label>
            <input
              type="text"
              id="testOrderId"
              value={testOrderId}
              onChange={(e) => setTestOrderId(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.testCards}>
          <h3>테스트 카드 정보</h3>
          <div className={styles.cardInfo}>
            <p><strong>카드번호:</strong> 4111-1111-1111-1111</p>
            <p><strong>유효기간:</strong> 12/25</p>
            <p><strong>생년월일:</strong> 900101</p>
            <p><strong>비밀번호:</strong> 00</p>
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button 
            className={styles.testButton} 
            onClick={handleTestPayment}
            disabled={isProcessing}
          >
            {isProcessing ? '테스트 결제 중...' : '테스트 결제 시작'}
          </button>
          <button className={styles.mainButton} onClick={goToMain}>
            메인으로 돌아가기
          </button>
        </div>

        <div className={styles.notes}>
          <h4>테스트 시 주의사항:</h4>
          <ul>
            <li>실제 결제가 발생하지 않습니다</li>
            <li>테스트 카드 정보를 사용하세요</li>
            <li>결제 성공/실패 시나리오를 테스트할 수 있습니다</li>
            <li>백엔드 서버가 실행 중이어야 합니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentTestScreen;
