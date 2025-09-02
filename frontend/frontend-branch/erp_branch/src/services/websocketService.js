import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000; // 5초
  }

  // 웹소켓 연결
  connect(branchId, onConnect, onError) {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
      
      // 새로운 STOMP 클라이언트 생성
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
        connectHeaders: {
          'branch-id': branchId.toString()
        },
        debug: (str) => {
          // 디버그 로그 비활성화
        },
        onConnect: (frame) => {
          console.log('웹소켓 연결 성공:', frame);
          this.connected = true;
          this.reconnectAttempts = 0;
          
          if (onConnect) {
            onConnect(frame);
          }
        },
        onStompError: (frame) => {
          console.error('웹소켓 연결 실패:', frame);
          this.connected = false;
          
          if (onError) {
            onError(frame);
          }
          
          // 자동 재연결 시도
          this.attemptReconnect(branchId, onConnect, onError);
        },
        onWebSocketError: (error) => {
          console.error('웹소켓 오류:', error);
          this.connected = false;
          
          if (onError) {
            onError(error);
          }
          
          // 자동 재연결 시도
          this.attemptReconnect(branchId, onConnect, onError);
        }
      });
      
      // 연결 시작
      this.stompClient.activate();
      
    } catch (error) {
      console.error('웹소켓 초기화 실패:', error);
      if (onError) {
        onError(error);
      }
    }
  }

  // 자동 재연결 시도
  attemptReconnect(branchId, onConnect, onError) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`웹소켓 재연결 시도 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect(branchId, onConnect, onError);
      }, this.reconnectInterval);
    } else {
      console.error('웹소켓 최대 재연결 시도 횟수 초과');
    }
  }

  // 지점별 알림 구독
  subscribeToBranchNotifications(branchId, callback) {
    if (!this.connected || !this.stompClient) {
      console.error('웹소켓이 연결되지 않았습니다.');
      return null;
    }

    const destination = `/topic/notifications/branch/${branchId}`;
    const subscription = this.stompClient.subscribe(destination, (message) => {
      try {
        console.log('웹소켓 메시지 수신:', message);
        const notification = JSON.parse(message.body);
        console.log('지점 알림 수신:', notification);
        if (callback) {
          callback(notification);
        }
      } catch (error) {
        console.error('알림 메시지 파싱 실패:', error, '원본 메시지:', message);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log(`지점 알림 구독 완료: ${destination}`);
    return subscription;
  }

  // 전체 알림 구독
  subscribeToAllNotifications(callback) {
    if (!this.connected || !this.stompClient) {
      console.error('웹소켓이 연결되지 않았습니다.');
      return null;
    }

    const destination = '/topic/notifications/all';
    const subscription = this.stompClient.subscribe(destination, (message) => {
      try {
        const notification = JSON.parse(message.body);
        console.log('전체 알림 수신:', notification);
        if (callback) {
          callback(notification);
        }
      } catch (error) {
        console.error('알림 메시지 파싱 실패:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log(`전체 알림 구독 완료: ${destination}`);
    return subscription;
  }

  // 개인 알림 구독
  subscribeToUserNotifications(userId, callback) {
    if (!this.connected || !this.stompClient) {
      console.error('웹소켓이 연결되지 않았습니다.');
      return null;
    }

    const destination = `/queue/notifications/user/${userId}`;
    const subscription = this.stompClient.subscribe(destination, (message) => {
      try {
        const notification = JSON.parse(message.body);
        console.log('개인 알림 수신:', notification);
        if (callback) {
          callback(notification);
        }
      } catch (error) {
        console.error('알림 메시지 파싱 실패:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log(`개인 알림 구독 완료: ${destination}`);
    return subscription;
  }

  // 구독 해제
  unsubscribe(destination) {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log(`구독 해제 완료: ${destination}`);
    }
  }

  // 모든 구독 해제
  unsubscribeAll() {
    this.subscriptions.forEach((subscription, destination) => {
      subscription.unsubscribe();
      console.log(`구독 해제: ${destination}`);
    });
    this.subscriptions.clear();
  }

  // 웹소켓 연결 해제
  disconnect() {
    if (this.stompClient && this.connected) {
      this.unsubscribeAll();
      this.stompClient.deactivate();
      console.log('웹소켓 연결 해제 완료');
      this.connected = false;
    }
  }

  // 연결 상태 확인
  isConnected() {
    const isConnected = this.connected && this.stompClient && this.stompClient.connected;
    console.log('웹소켓 연결 상태 확인:', {
      connected: this.connected,
      hasClient: !!this.stompClient,
      clientConnected: this.stompClient?.connected,
      finalStatus: isConnected
    });
    return isConnected;
  }

  // 메시지 전송 (필요시 사용)
  sendMessage(destination, message) {
    if (!this.connected || !this.stompClient) {
      console.error('웹소켓이 연결되지 않았습니다.');
      return false;
    }

    try {
      this.stompClient.publish({
        destination: destination,
        body: JSON.stringify(message)
      });
      console.log('메시지 전송 완료:', destination, message);
      return true;
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스 생성
const webSocketService = new WebSocketService();

export default webSocketService;
