import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';
import logo from '../../assets/logo.png';
import userIcon from '../../assets/user_icon.png';
import noticeIcon from '../../assets/notice_icon.png';
import bellIcon from '../../assets/bell_icon.png';
import webSocketService from '../../services/websocketService';


export default function Header({ activeTab, setActiveTab, onLogout }) {
  const [userInfo, setUserInfo] = useState({ username: '', realName: '', branchName: '', role: '', lastLogin: '' });
  const [showAlerts, setShowAlerts] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [websocketConnected, setWebsocketConnected] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  // 알림 패널 토글
  const toggleAlerts = () => {
    setShowAlerts(!showAlerts);
    if (!showAlerts && userInfo.username) {
      fetchNotifications();
    }
  };

  // 통합 알림 데이터 조회 (본사용 - 모든 지점 알림)
  const fetchNotifications = async () => {
    if (!userInfo.username) {
      console.log('사용자 정보가 없어 알림 데이터를 가져올 수 없습니다.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('본사 알림 데이터 요청 시작:', `${API_BASE_URL}/api/notifications/headquarters`);
      const response = await fetch(`${API_BASE_URL}/api/notifications/headquarters`);
      
      if (!response.ok) {
        throw new Error(`알림 데이터를 불러오는데 실패했습니다. (${response.status} ${response.statusText})`);
      }

      const data = await response.json();
      console.log('본사 알림 목록 새로고침 완료 - 받은 데이터:', data);
      console.log('총 알림 개수:', data.length);
      console.log('읽지 않은 알림 개수:', data.filter(n => n.isRead !== true && n.isRead !== 'true').length);
      
      setNotifications(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('알림 데이터 조회 중 오류 발생:', error);
      setError(error.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // 알림 클릭 처리 (알림센터로 이동)
  const handleNotificationClick = (notification) => {
    console.log('알림 클릭:', notification);
    
    // 알림센터 탭으로 이동
    setActiveTab(['notifications']);
    
    // 알림 패널 닫기
    setShowAlerts(false);
    
    // 읽지 않은 알림이면 읽음 처리
    if (notification.isRead !== true && notification.isRead !== 'true') {
      handleMarkAsRead(notification.id);
    }
  };

  // 알림 읽음 처리
  const handleMarkAsRead = async (notificationId) => {
    try {
      console.log('알림 읽음 처리 시작 - 알림 ID:', notificationId);
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      console.log('알림 읽음 처리 응답:', response.status, response.statusText);
      
      if (response.ok) {
        console.log('알림 읽음 처리 성공 - 알림 ID:', notificationId);
        // 읽음 처리 후 알림 목록 새로고침
        await fetchNotifications();
      } else {
        console.error('알림 읽음 처리 실패 - 응답 상태:', response.status);
      }
    } catch (error) {
      console.error('알림 읽음 처리 중 오류 발생:', error);
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    if (!userInfo.username) return;
    
    try {
      console.log('모든 알림 읽음 처리 시작 - 본사 사용자:', userInfo.username);
      const response = await fetch(`${API_BASE_URL}/api/notifications/headquarters/read-all`, {
        method: 'PUT'
      });
      
      console.log('모든 알림 읽음 처리 응답:', response.status, response.statusText);
      
      if (response.ok) {
        console.log('모든 알림 읽음 처리 성공 - 본사 사용자:', userInfo.username);
        // 모든 알림 읽음 처리 후 알림 목록 새로고침
        await fetchNotifications();
      } else {
        console.error('모든 알림 읽음 처리 실패 - 응답 상태:', response.status);
      }
    } catch (error) {
      console.error('모든 알림 읽음 처리 중 오류 발생:', error);
    }
  };

  // 알림 타입에 따른 아이콘 반환
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'inventory':
        return '📦';
      case 'order':
        return '🚚'; // 발주 알림용 트럭 아이콘
      case 'employee':
        return '👤';
      case 'system':
        return '⚙️';
      case 'sales':
        return '💰';
      default:
        return '🔔';
    }
  };

  // 알림 카테고리에 따른 스타일 클래스 반환
  const getNotificationCategoryClass = (category) => {
    switch (category) {
      case 'critical':
        return styles.notificationCritical;
      case 'warning':
        return styles.notificationWarning;
      case 'info':
        return styles.notificationInfo;
      case 'success':
        return styles.notificationSuccess;
      default:
        return '';
    }
  };

  // 알림 카테고리에 따른 텍스트 반환
  const getNotificationCategoryText = (category) => {
    switch (category) {
      case 'critical':
        return '위험';
      case 'warning':
        return '경고';
      case 'info':
        return '정보';
      case 'success':
        return '성공';
      default:
        return category;
    }
  };

  // 읽지 않은 알림 개수 (더 안전한 체크)
  const unreadCount = notifications.filter(notification => {
    return notification.isRead !== true && notification.isRead !== 'true';
  }).length;

  // 날짜 포맷팅
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${month}-${day} ${hours}:${minutes}`;
  };

  useEffect(() => {
    const loginData = localStorage.getItem('erpLoginData');
    if (loginData) {
      try {
        const parsedData = JSON.parse(loginData);
        setUserInfo({
          username: parsedData.username || '',
          realName: parsedData.realName || parsedData.username || '사용자',
          branchName: parsedData.branchName || '본사',
          role: parsedData.role || 'ADMIN',
          lastLogin: parsedData.lastLogin || ''
        });
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
      }
    }
  }, []);

  // 사용자 정보가 로드되면 초기 알림 데이터 가져오기
  useEffect(() => {
    if (userInfo.username) {
      console.log('본사 사용자 로그인 감지, 초기 알림 데이터 로드:', userInfo.username);
      fetchNotifications();
      
      // 브라우저 알림 권한 요청
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('브라우저 알림 권한:', permission);
        });
      }
    }
  }, [userInfo.username]);

  // 웹소켓 연결 및 실시간 알림 수신 (본사용)
  useEffect(() => {
    if (userInfo.username) {
      // 웹소켓 연결 (본사는 'hq'로 연결)
      webSocketService.connect(
        'hq',
        (frame) => {
          console.log('본사 웹소켓 연결 성공:', frame);
          setWebsocketConnected(true);
          
          // 웹소켓 연결 성공 시 알림 데이터 새로고침
          fetchNotifications();
          
          // 본사 알림 구독
          webSocketService.subscribeToHQNotifications(
            (notification) => {
              console.log('🔔 본사 실시간 알림 수신:', notification);
              console.log('📋 알림 상세 정보:', {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                category: notification.category,
                timestamp: notification.timestamp,
                isRead: notification.isRead
              });
              
              // 새 알림을 기존 알림 목록 앞에 추가 (중복 방지)
              setNotifications(prevNotifications => {
                console.log('📝 현재 알림 목록 개수:', prevNotifications.length);
                
                // 같은 ID의 알림이 이미 있는지 확인
                const existingIndex = prevNotifications.findIndex(n => n.id === notification.id);
                if (existingIndex !== -1) {
                  // 이미 있는 알림이면 업데이트
                  const updated = [...prevNotifications];
                  updated[existingIndex] = notification;
                  console.log('🔄 기존 알림 업데이트:', notification.id);
                  return updated;
                } else {
                  // 새로운 알림이면 맨 앞에 추가
                  console.log('✨ 새 알림 추가:', notification.id, '제목:', notification.title);
                  const newNotifications = [notification, ...prevNotifications];
                  console.log('📊 업데이트된 알림 목록 개수:', newNotifications.length);
                  return newNotifications;
                }
              });
              
              // 브라우저 알림도 표시 (사용자가 허용한 경우)
              if (Notification.permission === 'granted') {
                new Notification(notification.title, {
                  body: notification.message,
                  icon: '/favicon.ico'
                });
              }
            }
          );
        },
        (error) => {
          console.error('본사 웹소켓 연결 실패:', error);
          setWebsocketConnected(false);
        }
      );
    }

    // 컴포넌트 언마운트 시 웹소켓 연결 해제
    return () => {
      webSocketService.disconnect();
      setWebsocketConnected(false);
    };
  }, [userInfo.username]);

  // 웹소켓 연결 상태 주기적 확인
  useEffect(() => {
    const checkConnection = () => {
      const isConnected = webSocketService.isConnected();
      if (isConnected !== websocketConnected) {
        setWebsocketConnected(isConnected);
        console.log('본사 웹소켓 연결 상태 변경:', isConnected);
      }
    };

    const interval = setInterval(checkConnection, 5000); // 5초마다 확인
    return () => clearInterval(interval);
  }, [websocketConnected]);

  // 알림 패널 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAlerts && !event.target.closest(`.${styles.alertsDropdown}`)) {
        setShowAlerts(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAlerts]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className={styles['erp-header']}>
      <div className={styles['header-container']}>
        {/* 로고 영역 */}
        <div className={styles['header-logo']}>
          <img
            src={logo}
            alt="ERP 시스템 로고"
            className={styles['logo-image']}
            onClick={() => setActiveTab(['dashboard'])}
            style={{ cursor: 'pointer' }}
          />
        </div>



        {/* 사용자 정보 영역 */}
        <div className={styles['header-user']}>
          <div className={styles['header-icon-container']}>            
            {/* 알림 아이콘 및 드롭다운 */}
            <div className={styles.alertsDropdown}>
              <div className={styles.alertsIconContainer} onClick={toggleAlerts}>
                <img src={bellIcon} alt="알림" className={styles['header-icon']} />
                {unreadCount > 0 && (
                  <span className={styles.alertBadge}>{unreadCount}</span>
                )}
                {/* 웹소켓 연결 상태 표시 */}
                <div className={`${styles.websocketStatus} ${websocketConnected ? styles.connected : styles.disconnected}`} title={websocketConnected ? '실시간 알림 연결됨' : '실시간 알림 연결 끊김'}>
                  <span className={styles.statusDot}></span>
                </div>
              </div>
              
              {/* 알림 드롭다운 패널 */}
              {showAlerts && (
                <div className={styles.alertsPanel}>
                  <div className={styles.alertsHeader}>
                    <h3>본사 ERP 알림</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className={styles.markAllReadButton}
                      >
                        모두 읽음
                      </button>
                    )}
                  </div>
                  
                  <div className={styles.alertsContent}>
                    {loading ? (
                      <div className={styles.alertsLoading}>
                        <div className={styles.loadingSpinner}></div>
                        <p>알림을 불러오는 중...</p>
                      </div>
                    ) : error ? (
                      <div className={styles.alertsError}>
                        <p>알림을 불러올 수 없습니다.</p>
                        <button 
                          onClick={fetchNotifications}
                          className={styles.retryButton}
                        >
                          다시 시도
                        </button>
                      </div>
                    ) : unreadCount === 0 ? (
                      <div className={styles.alertsEmpty}>
                        <p>새로운 알림이 없습니다.</p>
                        <p className={styles.alertsEmptySubtext}>발주 요청이나 재고 관련 알림이 표시됩니다.</p>
                      </div>
                    ) : (
                      <div className={styles.alertsList}>
                        {notifications
                          .filter(notification => notification.isRead !== true && notification.isRead !== 'true') // 읽지 않은 알림만 필터링
                          .slice(0, 5) // 최대 5개까지만 표시
                          .map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`${styles.alertItem} ${(notification.isRead !== true && notification.isRead !== 'true') ? styles.unread : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className={styles.alertHeader}>
                              <div className={styles.alertTypeContainer}>
                                <span className={styles.notificationIcon}>
                                  {getNotificationIcon(notification.type)}
                                </span>
                                <span className={`${styles.alertType} ${getNotificationCategoryClass(notification.category)}`}>
                                  {getNotificationCategoryText(notification.category)}
                                </span>
                              </div>
                              <span className={styles.alertTime}>
                                {formatDateTime(notification.timestamp)}
                              </span>
                            </div>
                            <div className={styles.alertContent}>
                              <h4 className={styles.alertTitle}>{notification.title}</h4>
                              <p className={styles.alertMessage}>{notification.message}</p>
                              <div className={styles.alertDetails}>
                                <span className={styles.targetName}>{notification.targetName}</span>
                                {notification.userName && notification.userName !== '시스템' && (
                                  <span className={styles.userName}>by {notification.userName}</span>
                                )}
                              </div>
                            </div>
                            {(notification.isRead !== true && notification.isRead !== 'true') && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation(); // 이벤트 전파 방지
                                  handleMarkAsRead(notification.id);
                                }}
                                className={styles.markReadButton}
                              >
                                읽음
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {unreadCount > 5 && (
                          <div className={styles.alertsMore}>
                            <button 
                              onClick={() => {
                                setActiveTab(['notifications']);
                                setShowAlerts(false); // 알림 패널 닫기
                              }}
                              className={styles.viewAllButton}
                            >
                              모든 알림 보기 ({unreadCount}개)
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={styles['user-info']}>
            <img src={userIcon} alt="사용자" className={styles['user-icon']} />
            <div className={styles['user-details']}>
              <span className={styles['user-name']}>
                {userInfo.realName ? `${userInfo.realName}님` : '사용자님'}
                {userInfo.branchName && userInfo.role && (
                  <span className={styles['user-info-detail']}>
                    [ {userInfo.branchName} / {userInfo.role} ]
                  </span>
                )}
              </span>
              {userInfo.lastLogin && (
                <span className={styles['last-login']}>
                  마지막 로그인: {new Date(userInfo.lastLogin).toLocaleString('ko-KR')}
                </span>
              )}
            </div>
          </div>
          <button 
            className={`btn btn-secondary ${styles['logout-button']}`}
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}