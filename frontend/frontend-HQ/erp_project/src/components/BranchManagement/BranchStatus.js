import React, { useState, useEffect } from 'react';
import styles from './BranchStatus.module.css';
import searchIcon from '../../assets/search_icon.png';

export default function BranchEdit() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // 샘플 데이터
  useEffect(() => {
    const sampleBranches = [
      {
        id: 1,
        branchName: '강남강남강남점',
        branchCode: 'GN001',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        manager: '김철수',
        email: 'gn@company.com',
        businessNumber: '123-45-67890',
        status: 'active',
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        branchName: '홍대점',
        branchCode: 'HD001',
        address: '서울시 마포구 홍대로 456',
        phone: '02-2345-6789',
        manager: '이영희',
        email: 'hd@company.com',
        businessNumber: '234-56-78901',
        status: 'active',
        createdAt: '2024-01-20'
      },
      {
        id: 3,
        branchName: '부산점',
        branchCode: 'BS001',
        address: '부산시 해운대구 해운대로 789',
        phone: '051-3456-7890',
        manager: '박민수',
        email: 'bs@company.com',
        businessNumber: '345-67-89012',
        status: 'inactive',
        createdAt: '2024-02-01'
      }
    ];
    setBranches(sampleBranches);
  }, []);

  const handleEdit = (branch) => {
    setSelectedBranch(branch);
  };

  const handleDelete = (branchId) => {
    if (window.confirm('정말로 이 지점을 삭제하시겠습니까?')) {
      setBranches(branches.filter(branch => branch.id !== branchId));
    }
  };

  const handleUpdate = (updatedBranch) => {
    setBranches(branches.map(branch => 
      branch.id === updatedBranch.id ? updatedBranch : branch
    ));
    setSelectedBranch(null);
  };

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.branchCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || branch.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles['branch-edit']}>
      <div className={styles['branch-status-header']}>
        <h1>지점 현황</h1>
      </div>

      <div className={styles['search-filter-container']}>
        <div className={styles['search-box']}>
          <div className={styles['search-input-container']}>
            <img 
              src={searchIcon} 
              alt="검색" 
              className={styles['search-icon']}
            />
            <input
              type="text"
              placeholder="지점명 또는 지점코드로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles['search-input']}
            />
          </div>
        </div>
        <div className={styles['filter-box']}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles['filter-select']}
          >
            <option value="all">전체 상태</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="pending">대기</option>
          </select>
        </div>
      </div>

      <div className={styles['branches-container']}>
        <div className={styles['branches-list']}>
          <table className={styles['branches-table']}>
            <thead className={styles['branches-table-header']}>
              <tr>
                <th>지점명</th>
                <th>지점코드</th>
                <th>담당자</th>
                <th>연락처</th>
                <th>상태</th>
                <th>등록일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.map(branch => (
                <tr key={branch.id}>
                  <td>{branch.branchName}</td>
                  <td>{branch.branchCode}</td>
                  <td>{branch.manager}</td>
                  <td>{branch.phone}</td>
                  <td>
                    <span className={`${styles['status-badge']} ${styles[`status-${branch.status}`]}`}>
                      {branch.status === 'active' ? '활성' : 
                       branch.status === 'inactive' ? '비활성' : '대기'}
                    </span>
                  </td>
                  <td>{branch.createdAt}</td>
                  <td>
                    <div className={styles['action-buttons']}>
                      <button
                        className={`btn btn-small btn-primary ${styles['btn-small']}`}
                        onClick={() => handleEdit(branch)}
                      >
                        수정
                      </button>
                      <button
                        className={`btn btn-small btn-danger ${styles['btn-small']}`}
                        onClick={() => handleDelete(branch.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBranch && (
        <BranchEditModal
          branch={selectedBranch}
          onUpdate={handleUpdate}
          onClose={() => setSelectedBranch(null)}
        />
      )}
    </div>
  );
}

// 지점 수정 모달 컴포넌트
function BranchEditModal({ branch, onUpdate, onClose }) {
  const [formData, setFormData] = useState(branch);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>지점 정보 수정</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>지점명</label>
              <input
                type="text"
                name="branchName"
                value={formData.branchName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles['form-group']}>
              <label>지점코드</label>
              <input
                type="text"
                name="branchCode"
                value={formData.branchCode}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>담당자</label>
              <input
                type="text"
                name="manager"
                value={formData.manager}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles['form-group']}>
              <label>상태</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="pending">대기</option>
              </select>
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>주소</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>전화번호</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles['form-group']}>
              <label>이메일</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              수정 완료
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 