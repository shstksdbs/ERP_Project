import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export const useWebSocket = (branchId, onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const stompClientRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = () => {
    try {
      // SockJS 연결 생성
      const socket = new SockJS(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080'}/ws`);
      
      // STOMP 클라이언트 생성
      const stompClient = Stomp.over(socket);
      
      // 디버그 로그 비활성화 (프로덕션 환경에서)
      stompClient.debug = (str) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('STOMP:', str);
        }
      };

      // 연결 설정
      const connectHeaders = {
        'branch-id': branchId?.toString() || '1' // 기본값으로 1번 지점 사용
      };

      // 연결 시도
      stompClient.connect(
        connectHeaders,
        (frame) => {
          console.log('웹소켓 연결 성공:', frame);
          setIsConnected(true);
          setError(null);
          
          // 알림 구독
          const subscription = stompClient.subscribe(
            `/topic/notifications/branch/${branchId}`,
            (message) => {
              try {
                const notification = JSON.parse(message.body);
                console.log('알림 수신:', notification);
                if (onMessage) {
                  onMessage(notification);
                }
              } catch (error) {
                console.error('알림 메시지 파싱 오류:', error);
              }
            }
          );
          
          // 구독 정보 저장
          stompClientRef.current = {
            client: stompClient,
            subscription: subscription
          };
        },
        (error) => {
          console.error('웹소켓 연결 실패:', error);
          setError(error);
          setIsConnected(false);
          
          // 재연결 시도 (5초 후)
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('웹소켓 재연결 시도...');
            connect();
          }, 5000);
        }
      );
      
    } catch (error) {
      console.error('웹소켓 초기화 오류:', error);
      setError(error);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (stompClientRef.current) {
      if (stompClientRef.current.subscription) {
        stompClientRef.current.subscription.unsubscribe();
      }
      if (stompClientRef.current.client) {
        stompClientRef.current.client.disconnect();
      }
      stompClientRef.current = null;
    }
    
    setIsConnected(false);
  };

  // 컴포넌트 마운트 시 연결
  useEffect(() => {
    if (branchId) {
      connect();
    }
    
    // 컴포넌트 언마운트 시 연결 해제
    return () => {
      disconnect();
    };
  }, [branchId]);

  // 브라우저 탭 활성화/비활성화 시 연결 상태 확인
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && branchId) {
        console.log('탭 활성화 - 웹소켓 재연결 시도');
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, branchId]);

  return {
    isConnected,
    error,
    connect,
    disconnect
  };
};
