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

const KioskLayout = () => {
  const [selectedBranch, setSelectedBranch] = useState(null);

  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);
    console.log('선택된 지점:', branch);
    // 여기에 지점 변경 시 필요한 로직 추가 가능
    // 예: 메뉴 데이터 새로고침, 가격 정책 적용 등
  };

  return (
    <BranchContext.Provider value={{ selectedBranch, setSelectedBranch }}>
      <div className={styles.layoutContainer}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>주문</h1>
            <BranchSelector 
              selectedBranch={selectedBranch}
              onBranchChange={handleBranchChange}
            />
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
