import React, { useState, useEffect, useCallback } from 'react';
import styles from './BranchSelector.module.css';

const BranchSelector = ({ selectedBranch, onBranchChange, branches = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableBranches, setAvailableBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // API에서 지점 데이터를 가져오는 함수 (한 번만 시도)
  const fetchBranches = useCallback(async () => {
    // 이미 API 요청을 시도했다면 다시 시도하지 않음
    if (hasAttemptedFetch) {
      console.log('이미 API 요청을 시도했으므로 폴백 데이터를 사용합니다.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setHasAttemptedFetch(true);
      
      console.log('API 요청 시작...');
      const response = await fetch('http://localhost:8080/api/branches', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 지점 데이터를 가져오는데 실패했습니다`);
      }
      
      const branchesData = await response.json();
      console.log('API 응답 데이터:', branchesData);
      
      if (!Array.isArray(branchesData)) {
        throw new Error('지점 데이터 형식이 올바르지 않습니다');
      }
      
      // SQL 데이터 구조에 맞게 변환
      const formattedBranches = branchesData.map(branch => ({
        id: branch.id || branch.branchId,
        code: branch.branchCode,
        name: branch.branchName,
        type: branch.branchType,
        address: branch.address,
        phone: branch.phone,
        managerName: branch.managerName,
        status: branch.status,
        openingHours: branch.openingHours
      }));
      
      console.log('변환된 지점 데이터:', formattedBranches);
      setAvailableBranches(formattedBranches);
      setError(null);
      
    } catch (err) {
      console.error('지점 데이터 로딩 에러:', err);
      setError(err.message);
      
      // 에러 발생 시 기본 지점 데이터 사용 (SQL 파일과 동일)
      const fallbackBranches = [
        { id: 1, code: 'GN001', name: '강남점', type: 'branch' },
        { id: 2, code: 'HD001', name: '홍대점', type: 'branch' },
        { id: 3, code: 'SC001', name: '신촌점', type: 'branch' },
        { id: 4, code: 'JS001', name: '잠실점', type: 'branch' },
        { id: 5, code: 'SP001', name: '송파점', type: 'branch' }
      ];
      
      setAvailableBranches(fallbackBranches);
      console.log('폴백 지점 데이터 사용:', fallbackBranches);
      
    } finally {
      setLoading(false);
    }
  }, [hasAttemptedFetch]);

  // props로 전달된 branches가 있으면 사용, 없으면 API에서 가져오기
  useEffect(() => {
    if (branches.length > 0) {
      setAvailableBranches(branches);
      setLoading(false);
      setHasAttemptedFetch(false); // props가 변경되면 API 요청 상태 초기화
    } else if (!hasAttemptedFetch) {
      // API 요청을 한 번만 시도
      fetchBranches();
    }
  }, [branches, hasAttemptedFetch, fetchBranches]);

  // 지점 데이터가 로드되면 첫 번째 지점을 기본값으로 선택
  useEffect(() => {
    if (!selectedBranch && availableBranches.length > 0) {
      onBranchChange(availableBranches[0]);
    }
  }, [selectedBranch, onBranchChange, availableBranches]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      console.log('BranchSelector 컴포넌트 언마운트');
    };
  }, []);

  const handleBranchSelect = (branch) => {
    onBranchChange(branch);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // 로딩 중이거나 에러가 있는 경우 처리
  if (loading) {
    return (
      <div className={styles.branchSelector}>
        <button className={styles.selectorButton} disabled>
          <span className={styles.selectedBranch}>지점 로딩 중...</span>
          <span className={styles.arrow}>▼</span>
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.branchSelector}>
        <button 
          className={styles.selectorButton} 
          onClick={toggleDropdown}
          aria-label="지점 선택 (오프라인 모드)"
          title={`API 연결 실패: ${error}. 기본 지점 데이터를 사용합니다.`}
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
            <div className={styles.errorMessage}>
              <small>API 연결 실패로 기본 데이터 사용 중 (재시도 안함)</small>
            </div>
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
                  {branch.type === 'headquarters' ? '본사' : 
                   branch.type === 'franchise' ? '프랜차이즈' : '지점'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

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
                {branch.type === 'headquarters' ? '본사' : 
                 branch.type === 'franchise' ? '프랜차이즈' : '지점'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchSelector;
