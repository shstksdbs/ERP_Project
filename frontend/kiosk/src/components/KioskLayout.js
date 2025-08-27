import React, { useState, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import BranchSelector from './BranchSelector';
import styles from './KioskLayout.module.css';

// 지점 컨텍스트 생성
export const BranchContext = createContext();

// 지점 정보를 사용할 수 있는 훅
export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};

const KioskLayout = ({ selectedBranch: appSelectedBranch, onBranchChange: appOnBranchChange }) => {
  const [localSelectedBranch, setLocalSelectedBranch] = useState(appSelectedBranch);

  // App.js에서 전달받은 지점 정보가 있으면 사용
  const selectedBranch = appSelectedBranch || localSelectedBranch;
  const handleBranchChange = appOnBranchChange || setLocalSelectedBranch;

  const handleLocalBranchChange = (branch) => {
    setLocalSelectedBranch(branch);
    if (appOnBranchChange) {
      appOnBranchChange(branch);
    }
    console.log('선택된 지점:', branch);
  };

  return (
    <BranchContext.Provider value={{ selectedBranch, setSelectedBranch: handleLocalBranchChange }}>
      <div className={styles.layoutContainer}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>주문하기</h1>
            <div className={styles.headerRight}>
              <BranchSelector 
                selectedBranch={selectedBranch}
                onBranchChange={handleLocalBranchChange}
              />
              <a href="/payment-test" className={styles.testLink}>
                결제 테스트
              </a>
            </div>
          </div>
        </header>
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </BranchContext.Provider>
  );
};

export default KioskLayout;
