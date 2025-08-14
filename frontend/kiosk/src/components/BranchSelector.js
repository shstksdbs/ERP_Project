import React, { useState, useEffect } from 'react';
import styles from './BranchSelector.module.css';

const BranchSelector = ({ selectedBranch, onBranchChange, branches = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 기본 지점 데이터 (props로 전달되지 않은 경우)
  const defaultBranches = [
    { id: 1, code: 'HQ001', name: '본사점', type: 'headquarters' },
    { id: 2, code: 'BR001', name: '강남점', type: 'branch' },
    { id: 3, code: 'BR002', name: '홍대점', type: 'branch' }
  ];

  const availableBranches = branches.length > 0 ? branches : defaultBranches;

  // 기본값으로 첫 번째 지점 선택
  useEffect(() => {
    if (!selectedBranch && availableBranches.length > 0) {
      onBranchChange(availableBranches[0]);
    }
  }, [selectedBranch, onBranchChange, availableBranches]);

  const handleBranchSelect = (branch) => {
    onBranchChange(branch);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.branchSelector}>
      <button 
        className={styles.selectorButton} 
        onClick={toggleDropdown}
        aria-label="지점 선택"
      >
        <span className={styles.selectedBranch}>
          {selectedBranch ? selectedBranch.name : '지점 선택'}
        </span>
        <span className={`${styles.arrow} ${isOpen ? styles.up : styles.down}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          {availableBranches.map((branch) => (
            <button
              key={branch.id}
              className={`${styles.branchOption} ${
                selectedBranch?.id === branch.id ? styles.selected : ''
              }`}
              onClick={() => handleBranchSelect(branch)}
            >
              <span className={styles.branchCode}>{branch.code}</span>
              <span className={styles.branchName}>{branch.name}</span>
              <span className={styles.branchType}>
                {branch.type === 'headquarters' ? '본사' : '지점'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchSelector;
