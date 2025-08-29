import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';
import logo from '../../assets/logo.png';
import userIcon from '../../assets/user_icon.png';
import noticeIcon from '../../assets/notice_icon.png';
import bellIcon from '../../assets/bell_icon.png';

export default function Header({ activeTab, setActiveTab, onLogout, loginData }) {
  const [showAlerts, setShowAlerts] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  // 알림 패널 토글
  const toggleAlerts = () => {
    setShowAlerts(!showAlerts);
    if (!showAlerts && loginData?.branchId) {
      fetchNotifications();
    }
  };

  // 통합 알림 데이터 조회
  const fetchNotifications = async () => {
    if (!loginData?.branchId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/notifications/branch/${loginData.branchId}`);
      
      if (!response.ok) {
        throw new Error(`알림 데이터를 불러오는데 실패했습니다. (${response.status})`);
      }

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('알림 데이터 조회 중 오류 발생:', error);
      setError(error.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // 알림 읽음 처리
  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => 
            notification.id === notificationId ? { ...notification, isRead: true } : notification
          )
        );
      }
    } catch (error) {
      console.error('알림 읽음 처리 중 오류 발생:', error);
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    if (!loginData?.branchId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/branch/${loginData.branchId}/read-all`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ ...notification, isRead: true }))
        );
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
        return '📋';
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

  // 읽지 않은 알림 개수
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

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
            <img src={noticeIcon} alt="공지사항" className={styles['header-icon']} />
            
            {/* 알림 아이콘 및 드롭다운 */}
            <div className={styles.alertsDropdown}>
              <div className={styles.alertsIconContainer} onClick={toggleAlerts}>
                <img src={bellIcon} alt="알림" className={styles['header-icon']} />
                {unreadCount > 0 && (
                  <span className={styles.alertBadge}>{unreadCount}</span>
                )}
              </div>
              
              {/* 알림 드롭다운 패널 */}
              {showAlerts && (
                <div className={styles.alertsPanel}>
                  <div className={styles.alertsHeader}>
                    <h3>ERP 알림</h3>
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
                    ) : notifications.length === 0 ? (
                      <div className={styles.alertsEmpty}>
                        <p>새로운 알림이 없습니다.</p>
                      </div>
                    ) : (
                      <div className={styles.alertsList}>
                        {notifications.slice(0, 5).map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`${styles.alertItem} ${!notification.isRead ? styles.unread : ''}`}
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
                            {!notification.isRead && (
                              <button 
                                onClick={() => handleMarkAsRead(notification.id)}
                                className={styles.markReadButton}
                              >
                                읽음
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {notifications.length > 5 && (
                          <div className={styles.alertsMore}>
                            <button 
                              onClick={() => setActiveTab(['notifications'])}
                              className={styles.viewAllButton}
                            >
                              모든 알림 보기 ({notifications.length}개)
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
                {loginData?.realName ? `${loginData.realName}님` : '사용자님'}
                {loginData?.branchName && loginData?.role && (
                  <span className={styles['user-info-detail']}>
                    [ {loginData.branchName} / {loginData.role} ]
                  </span>
                )}
              </span>
              {loginData?.lastLogin && (
                <span className={styles['last-login']}>
                  마지막 로그인: {new Date(loginData.lastLogin).toLocaleString('ko-KR')}
                </span>
              )}
            </div>
          </div>
          <button
            className={`btn btn-secondary ${styles['logout-button']}`}
            onClick={onLogout}
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}