import React, { useState, useEffect } from 'react';
import styles from './NotificationCenter.module.css';
import bellIcon from '../../assets/bell_icon.png';
import { useWebSocket } from '../../hooks/useWebSocket';

export default function NotificationCenter({ branchId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [newNotificationCount, setNewNotificationCount] = useState(0);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  // 웹소켓 메시지 핸들러
  const handleWebSocketMessage = (notification) => {
    console.log('새로운 알림 수신:', notification);
    
    // 새 알림을 목록 맨 앞에 추가
    setNotifications(prev => [notification, ...prev]);
    
    // 새 알림 카운트 증가
    setNewNotificationCount(prev => prev + 1);
    
    // 브라우저 알림 표시 (사용자가 허용한 경우)
    if (Notification.permission === 'granted') {
      new Notification('새로운 알림', {
        body: notification.message,
        icon: bellIcon
      });
    }
  };

  // 웹소켓 연결
  const { isConnected, error: wsError } = useWebSocket(branchId, handleWebSocketMessage);

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // 알림 데이터 조회
  useEffect(() => {
    if (branchId) {
      resetAndFetchNotifications();
    }
  }, [branchId]);

  // 필터 변경 시 알림 목록 초기화 및 재조회
  useEffect(() => {
    if (branchId) {
      resetAndFetchNotifications();
    }
  }, [selectedType, selectedCategory, showUnreadOnly]);

  // 알림 목록 초기화 및 첫 페이지 조회
  const resetAndFetchNotifications = async () => {
    setNotifications([]);
    setCurrentPage(0);
    setHasMore(true);
    setTotalCount(0);
    setNewNotificationCount(0); // 새 알림 카운트 초기화
    console.log('resetAndFetchNotifications 호출');
    await fetchNotifications(0, true);
  };

  // 알림 데이터 조회 (페이징 지원)
  const fetchNotifications = async (page = 0, isReset = false) => {
    try {
      // page 파라미터 타입 확인 및 변환
      const pageNumber = typeof page === 'number' ? page : parseInt(page) || 0;
      console.log('fetchNotifications 호출 - page:', page, 'type:', typeof page, 'converted:', pageNumber);
      
      if (isReset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/notifications/branch/${branchId}?page=${pageNumber}&size=20`);
      
      if (!response.ok) {
        throw new Error(`알림 데이터를 불러오는데 실패했습니다. (${response.status})`);
      }

      const data = await response.json();
      console.log(`알림 목록 조회 완료 - 페이지: ${page}, 받은 데이터:`, data);
      
      // 각 알림의 isRead 상태를 자세히 로그
      data.forEach((notification, index) => {
        console.log(`알림 ${index + 1}:`, {
          id: notification.id,
          title: notification.title,
          isRead: notification.isRead,
          isReadType: typeof notification.isRead,
          rawData: notification
        });
      });
      
      if (isReset) {
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        setNotifications(prev => [...prev, ...(Array.isArray(data) ? data : [])]);
      }
      
      // 더 이상 데이터가 없으면 hasMore를 false로 설정
      if (data.length < 20) {
        setHasMore(false);
      }
      
      setCurrentPage(pageNumber);
      
    } catch (error) {
      console.error('알림 데이터 조회 중 오류 발생:', error);
      setError(error.message);
      if (isReset) {
        setNotifications([]);
      }
    } finally {
      if (isReset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  // 더 많은 알림 로드
  const loadMoreNotifications = async () => {
    if (!loadingMore && hasMore) {
      const nextPage = typeof currentPage === 'number' ? currentPage + 1 : 1;
      console.log('loadMoreNotifications - currentPage:', currentPage, 'nextPage:', nextPage);
      await fetchNotifications(nextPage, false);
    }
  };

  // 스크롤 이벤트 핸들러
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px 전에 로드
    
    if (isNearBottom && hasMore && !loadingMore) {
      loadMoreNotifications();
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
        // 읽음 처리 후 해당 알림의 상태만 업데이트
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
      } else {
        console.error('알림 읽음 처리 실패 - 응답 상태:', response.status);
      }
    } catch (error) {
      console.error('알림 읽음 처리 중 오류 발생:', error);
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      console.log('모든 알림 읽음 처리 시작 - 지점 ID:', branchId);
      const response = await fetch(`${API_BASE_URL}/api/notifications/branch/${branchId}/read-all`, {
        method: 'PUT'
      });
      
      console.log('모든 알림 읽음 처리 응답:', response.status, response.statusText);
      
      if (response.ok) {
        console.log('모든 알림 읽음 처리 성공 - 지점 ID:', branchId);
        // 모든 알림 읽음 처리 후 모든 알림의 상태를 읽음으로 업데이트
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
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
    // isRead 필드가 존재하고 true인 경우에만 읽음으로 처리
    if (showUnreadOnly && (notification.isRead === true || notification.isRead === 'true')) return false;
    return true;
  });

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
          <div className={styles.statusInfo}>
            {/* <span className={`${styles.connectionStatus} ${isConnected ? styles.connected : styles.disconnected}`}>
              {isConnected ? '🟢 실시간 연결됨' : '🔴 연결 끊김'}
            </span> */}
            {newNotificationCount > 0 && (
              <span className={styles.newNotificationCount}>
                새 알림: {newNotificationCount}개
              </span>
            )}
          </div>
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
            <p className={styles.emptyStateSubtext}>
              재고 차감이나 발주 상태 변경 시 알림이 표시됩니다.
            </p>
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
          <div 
            className={styles.notificationsList}
            onScroll={handleScroll}
            style={{ maxHeight: '70vh', overflowY: 'auto' }}
          >
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`${styles.notificationItem} ${(notification.isRead !== true && notification.isRead !== 'true') ? styles.unread : ''}`}
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
                
                {(notification.isRead !== true && notification.isRead !== 'true') && (
                  <button 
                    onClick={() => handleMarkAsRead(notification.id)}
                    className={styles.markReadButton}
                  >
                    읽음 처리
                  </button>
                )}
              </div>
            ))}
            
            {/* 무한스크롤 로딩 상태 */}
            {loadingMore && (
              <div className={styles.loadingMoreContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>더 많은 알림을 불러오는 중...</p>
              </div>
            )}
            
            {/* 더 이상 로드할 데이터가 없을 때 */}
            {!hasMore && filteredNotifications.length > 0 && (
              <div className={styles.noMoreDataContainer}>
                <p>모든 알림을 불러왔습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
