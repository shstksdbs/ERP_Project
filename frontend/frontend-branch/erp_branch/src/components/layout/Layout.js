import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

export default function Layout({ children, activeTab, setActiveTab, onLogout }) {
  return (
    <div className={styles['erp-layout']}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      <div className={styles['erp-content']}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className={styles['erp-main']}>
          {children}
        </main>
      </div>
    </div>
  );
}