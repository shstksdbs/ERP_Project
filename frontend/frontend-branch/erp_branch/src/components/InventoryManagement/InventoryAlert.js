import React, { useState, useEffect } from 'react';
import styles from './InventoryAlert.module.css';
import bellIcon from '../../assets/bell_icon.png';

export default function InventoryAlert({ branchId }) {
  const [alerts, setAlerts] = useState([]);

  // 샘플 데이터
  useEffect(() => {
    const sampleAlerts = [
      {
        id: 1,
        type: 'critical',
        message: '카페라떼 재고가 최소 재고량 이하입니다.',
        itemName: '카페라떼',
        currentStock: 15,
        minStock: 20,
        timestamp: '2024-01-15 14:30',
        isRead: false
      },
      {
        id: 2,
        type: 'critical',
        message: '샌드위치 재고가 위험 수준입니다.',
        itemName: '샌드위치',
        currentStock: 8,
        minStock: 10,
        timestamp: '2024-01-15 14:25',
        isRead: false
      },
      {
        id: 3,
        type: 'warning',
        message: '우유 재고가 부족합니다.',
        itemName: '우유',
        currentStock: 18,
        minStock: 15,
        timestamp: '2024-01-15 14:20',
        isRead: true
      }
    ];

    setAlerts(sampleAlerts);
  }, []);

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>재고알림</h1>
        <div className={styles.headerActions}>
          <span className={styles.unreadCount}>
            미읽 알림: {unreadCount}개
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
            <p>새로운 재고 알림이 없습니다.</p>
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
                    <span className={styles.stockInfo}>
                      현재: {alert.currentStock} / 최소: {alert.minStock}
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
