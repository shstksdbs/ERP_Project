import React, { useState, useEffect } from 'react';
import styles from './InventoryAlert.module.css';
import bellIcon from '../../assets/bell_icon.png';

export default function InventoryAlert({ branchId }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

  // 지점별 재고 데이터 조회 및 알림 생성
  useEffect(() => {
    if (branchId) {
      fetchInventoryAlerts();
    }
  }, [branchId]);

  const fetchInventoryAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('재고 알림 데이터 조회 시작 - 지점 ID:', branchId);
      const response = await fetch(`${API_BASE_URL}/api/material-stocks/branch/${branchId}/alerts`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 오류 응답:', errorText);
        throw new Error(`재고 알림 데이터를 불러오는데 실패했습니다. (${response.status})`);
      }

      const data = await response.json();
      console.log('받은 재고 알림 데이터:', data);
      
      if (!Array.isArray(data) || data.length === 0) {
        console.log('현재 재고 상태에 문제가 있는 항목이 없습니다.');
        setAlerts([]);
        return;
      }
      
      // API에서 받은 알림 데이터를 프론트엔드 형식으로 변환
      const formattedAlerts = data.map(alert => ({
        id: alert.id,
        type: alert.type,
        message: alert.message,
        itemName: alert.itemName,
        currentStock: alert.currentStock,
        minStock: alert.minStock,
        maxStock: alert.maxStock,
        unit: alert.unit,
        category: alert.category,
        timestamp: formatDateTime(alert.timestamp),
        isRead: alert.isRead
      }));
      
      setAlerts(formattedAlerts);
      
    } catch (error) {
      console.error('재고 알림 데이터 조회 중 오류 발생:', error);
      setError(error.message);
      // 오류 발생 시 빈 배열로 설정 (샘플 데이터 사용 안함)
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  // 샘플 알림 데이터 함수는 제거됨
  // 현재 재고 상태 알림은 생성하지 않음

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

  const handleMarkAsRead = (alertId) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => ({ ...alert, isRead: true }))
    );
  };

  const getAlertTypeText = (type) => {
    switch (type) {
      case 'critical':
        return '위험';
      case 'warning':
        return '경고';
      default:
        return type;
    }
  };

  const getAlertTypeClass = (type) => {
    switch (type) {
      case 'critical':
        return styles.alertCritical;
      case 'warning':
        return styles.alertWarning;
      default:
        return '';
    }
  };

  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>재고알림</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.emptyState}>
            <div className={styles.loadingSpinner}></div>
            <p>재고 알림을 불러오는 중...</p>
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
          <h1 className={styles.title}>재고알림</h1>
        </div>
        <div className={styles.content}>
          <div className={styles.emptyState}>
            <img src={bellIcon} alt="알림" className={styles.emptyIcon} />
            <p>재고 데이터를 불러오는데 실패했습니다.</p>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              onClick={fetchInventoryAlerts}
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
        <h1 className={styles.title}>재고알림</h1>
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

      <div className={styles.content}>
        {alerts.length === 0 ? (
          <div className={styles.emptyState}>
            <img src={bellIcon} alt="알림" className={styles.emptyIcon} />
            <p>현재 재고 상태에 문제가 있는 항목이 없습니다.</p>
          </div>
        ) : (
          <div className={styles.alertsList}>
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`${styles.alertItem} ${!alert.isRead ? styles.unread : ''}`}
              >
                <div className={styles.alertHeader}>
                  <span className={`${styles.alertType} ${getAlertTypeClass(alert.type)}`}>
                    {getAlertTypeText(alert.type)}
                  </span>
                  <span className={styles.alertTime}>{alert.timestamp}</span>
                </div>
                <div className={styles.alertContent}>
                  <p className={styles.alertMessage}>{alert.message}</p>
                  <div className={styles.alertDetails}>
                    <span className={styles.itemName}>{alert.itemName}</span>
                    <span className={styles.category}>{alert.category}</span>
                    <span className={styles.stockInfo}>
                      현재: {alert.currentStock}{alert.unit} / 최소: {alert.minStock}{alert.unit}
                      {alert.maxStock > 0 && ` / 최대: ${alert.maxStock}${alert.unit}`}
                    </span>
                  </div>
                </div>
                {!alert.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(alert.id)}
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
