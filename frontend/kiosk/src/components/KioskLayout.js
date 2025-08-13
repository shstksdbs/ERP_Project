import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './KioskLayout.module.css';

const KioskLayout = () => {
  return (
    <div className={styles.layoutContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>주문</h1>
      </header>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default KioskLayout;
