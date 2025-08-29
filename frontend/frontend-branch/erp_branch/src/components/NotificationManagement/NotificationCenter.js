import React, { useState, useEffect } from 'react';
import styles from './NotificationCenter.module.css';
import bellIcon from '../../assets/bell_icon.png';

export default function NotificationCenter({ branchId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  // 알림 데이터 조회
  useEffect(() => {
    if (branchId) {
      fetchNotifications();
    }
  }, [branchId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/notifications/branch/${branchId}`);
      
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
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/branch/${branchId}/read-all`, {
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

  // 알림 타입에 따른 텍스트 반환
  const getNotificationTypeText = (type) => {
    switch (type) {
      case 'inventory':
        return '재고';
      case 'order':
        return '발주';
      case 'employee':
        return '직원';
      case 'system':
        return '시스템';
      case 'sales':
        return '매출';
      default:
        return type;
    }
  };

  // 필터링된 알림 목록
  const filteredNotifications = notifications.filter(notification => {
    if (selectedType !== 'all' && notification.type !== selectedType) return false;
    if (selectedCategory !== 'all' && notification.category !== selectedCategory) return false;
    if (showUnreadOnly && notification.isRead) return false;
    return true;
  });

  // 읽지 않은 알림 개수
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  // 날짜 포맷팅
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    
    if (isNaN(date.getTime())) {
      return 'N/A';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>알림 센터</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>알림을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 오류 상태 표시
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>알림 센터</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.errorContainer}>
            <img src={bellIcon} alt="알림" className={styles.errorIcon} />
            <p>알림을 불러올 수 없습니다.</p>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              onClick={fetchNotifications}
              className={styles.retryButton}
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>알림 센터</h1>
        <div className={styles.headerActions}>
          <span className={styles.unreadCount}>
            미읽음 알림: {unreadCount}개
          </span>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className={styles.markAllReadButton}
            >
              모두 읽음 처리
            </button>
          )}
        </div>
      </div>

      {/* 필터 영역 */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label>알림 타입:</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">전체</option>
            <option value="inventory">재고</option>
            <option value="order">발주</option>
            <option value="employee">직원</option>
            <option value="system">시스템</option>
            <option value="sales">매출</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>카테고리:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">전체</option>
            <option value="critical">위험</option>
            <option value="warning">경고</option>
            <option value="info">정보</option>
            <option value="success">성공</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className={styles.checkbox}
            />
            읽지 않은 알림만
          </label>
        </div>
      </div>

      <div className={styles.content}>
        {filteredNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <img src={bellIcon} alt="알림" className={styles.emptyIcon} />
            <p>표시할 알림이 없습니다.</p>
            {(selectedType !== 'all' || selectedCategory !== 'all' || showUnreadOnly) && (
              <button 
                onClick={() => {
                  setSelectedType('all');
                  setSelectedCategory('all');
                  setShowUnreadOnly(false);
                }}
                className={styles.resetFiltersButton}
              >
                필터 초기화
              </button>
            )}
          </div>
        ) : (
          <div className={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
              >
                <div className={styles.notificationHeader}>
                  <div className={styles.notificationTypeContainer}>
                    <span className={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <span className={styles.notificationType}>
                      {getNotificationTypeText(notification.type)}
                    </span>
                    <span className={`${styles.notificationCategory} ${getNotificationCategoryClass(notification.category)}`}>
                      {getNotificationCategoryText(notification.category)}
                    </span>
                  </div>
                  <span className={styles.notificationTime}>
                    {formatDateTime(notification.timestamp)}
                  </span>
                </div>
                
                <div className={styles.notificationContent}>
                  <h3 className={styles.notificationTitle}>{notification.title}</h3>
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  
                  <div className={styles.notificationDetails}>
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
                    읽음 처리
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
