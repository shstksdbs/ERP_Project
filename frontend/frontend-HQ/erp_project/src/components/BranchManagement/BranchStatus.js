import React, { useState, useEffect } from 'react';
import styles from './BranchStatus.module.css';
import searchIcon from '../../assets/search_icon.png';

export default function BranchEdit({ setActiveTab }) {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 실제 서버에서 지점 데이터 가져오기
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await fetch('http://localhost:8080/api/branches');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('받아온 지점 데이터:', data);
        
        // 서버 데이터를 컴포넌트에서 사용할 형태로 변환
        const formattedBranches = data.map(branch => {
          console.log('개별 지점 데이터:', branch);
          console.log('openingHours 값:', branch.openingHours);
          
          return {
            id: branch.id,
            branchName: branch.branchName,
            branchCode: branch.branchCode,
            address: branch.address || '주소 정보 없음',
            phone: branch.phone || '연락처 정보 없음',
            manager: branch.managerName || '담당자 정보 없음',
            status: branch.status || 'active',
            openingHours: branch.openingHours || '운영시간 정보 없음',
            openingDate: branch.openingDate ? new Date(branch.openingDate).toLocaleDateString('ko-KR') : '오픈날짜 정보 없음',
            createdAt: branch.createdAt ? new Date(branch.createdAt).toLocaleDateString('ko-KR') : '등록일 정보 없음'
          };
        });
        
        console.log('변환된 지점 데이터:', formattedBranches);
        
        setBranches(formattedBranches);
      } catch (err) {
        console.error('지점 데이터 조회 오류:', err);
        setError('지점 데이터를 불러오는데 실패했습니다. 다시 시도해주세요.');
        
        // 에러 발생 시 기본 데이터로 폴백
        setBranches([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const handleEdit = (branch) => {
    setSelectedBranch(branch);
  };

  const handleDelete = async (branchId) => {
    // 삭제할 지점 정보 찾기
    const branchToDelete = branches.find(branch => branch.id === branchId);
    if (!branchToDelete) {
      alert('삭제할 지점을 찾을 수 없습니다.');
      return;
    }

    // 삭제 확인 다이얼로그 개선
    const confirmMessage = `정말로 이 지점을 삭제하시겠습니까?\n\n` +
                          `지점명: ${branchToDelete.branchName}\n` +
                          `지점코드: ${branchToDelete.branchCode}\n` +
                          `상태: ${branchToDelete.status === 'active' ? '활성' : 
                                   branchToDelete.status === 'inactive' ? '비활성' : 
                                   branchToDelete.status === 'pending' ? '대기' : '알 수 없음'}\n\n` +
                          `이 작업은 되돌릴 수 없습니다.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('지점 삭제 시도:', branchToDelete);
      
      const response = await fetch(`http://localhost:8080/api/branches/${branchId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // 삭제 성공 시 목록에서 제거
        setBranches(prevBranches => prevBranches.filter(branch => branch.id !== branchId));
        
        // 성공 메시지 표시
        const successMessage = `지점이 성공적으로 삭제되었습니다.\n\n` +
                              `삭제된 지점: ${branchToDelete.branchName} (${branchToDelete.branchCode})`;
        alert(successMessage);
        
        console.log('지점 삭제 성공:', branchToDelete);
      } else {
        // 서버에서 오류 응답
        const errorData = await response.json().catch(() => ({}));
        console.error('서버 삭제 오류 응답:', errorData);
        
        let errorMessage = '지점 삭제에 실패했습니다.';
        if (errorData.message) {
          errorMessage += `\n${errorData.message}`;
        }
        if (errorData.details) {
          const details = Object.values(errorData.details).join(', ');
          errorMessage += `\n상세: ${details}`;
        }
        
        alert(errorMessage);
      }
    } catch (err) {
      console.error('지점 삭제 오류:', err);
      
      // 네트워크 오류 등
      let errorMessage = '지점 삭제 중 오류가 발생했습니다.';
      if (err.message) {
        errorMessage += `\n${err.message}`;
      }
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage += '\n\n네트워크 연결을 확인해주세요.';
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updatedBranch) => {
    try {
      setIsLoading(true);
      
      // 백엔드 API와 일치하는 데이터 구조로 변환
      const branchData = {
        branchName: updatedBranch.branchName,
        branchCode: updatedBranch.branchCode,
        address: updatedBranch.address,
        phone: updatedBranch.phone,
        managerName: updatedBranch.manager, // manager를 managerName으로 매핑
        status: updatedBranch.status || 'active', // 상태 값이 없으면 기본값 사용
        operatingHours: updatedBranch.openingTime && updatedBranch.closingTime 
          ? `${updatedBranch.openingTime} - ${updatedBranch.closingTime}` 
          : updatedBranch.openingHours,
        openDate: updatedBranch.openingDate // 오픈날짜 추가
      };

      console.log('수정할 데이터:', branchData);
      console.log('상태 값 확인:', branchData.status, typeof branchData.status);
      console.log('상태 값 길이:', branchData.status ? branchData.status.length : 'NULL');
      console.log('상태 값 바이트 확인:', branchData.status ? Array.from(branchData.status).map(c => c.charCodeAt(0)) : 'NULL');

      const response = await fetch(`http://localhost:8080/api/branches/${updatedBranch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(branchData)
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('서버 응답 데이터:', responseData);
        
        // 업데이트 성공 시 목록 업데이트
        const updatedBranchWithHours = {
          ...updatedBranch,
          openingHours: branchData.operatingHours,
          // 서버에서 반환된 데이터로 업데이트
          ...responseData
        };
        
        setBranches(prevBranches => 
          prevBranches.map(branch => 
            branch.id === updatedBranch.id ? updatedBranchWithHours : branch
          )
        );
        
        setSelectedBranch(null);
        alert('지점 정보가 성공적으로 수정되었습니다.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('서버 에러 응답:', errorData);
        
        // 상세한 에러 메시지 표시
        let errorMessage = '지점 정보 수정에 실패했습니다.';
        if (errorData.message) {
          errorMessage += `\n${errorData.message}`;
        }
        if (errorData.details) {
          const details = Object.values(errorData.details).join(', ');
          errorMessage += `\n상세: ${details}`;
        }
        
        alert(errorMessage);
      }
      
    } catch (err) {
      console.error('지점 수정 오류:', err);
      alert(`지점 정보 수정에 실패했습니다: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branch.branchCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || branch.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className={styles['branch-edit']}>
        <div className={styles['branch-status-header']}>
          <h1>지점 현황</h1>
        </div>
        <div className={styles['loading-container']}>
          <p>지점 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['branch-edit']}>
        <div className={styles['branch-status-header']}>
          <h1>지점 현황</h1>
        </div>
        <div className={styles['error-container']}>
          <p className={styles['error-message']}>{error}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

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
        <p className={styles['branch-count']}>총 {branches.length}개 지점</p>
        <div className={styles['action-box']}>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('branch-register')}
          >
            지점 등록
          </button>
        </div>
      </div>

      <div className={styles['branches-container']}>
        {filteredBranches.length === 0 ? (
          <div className={styles['no-data']}>
            <p>검색 조건에 맞는 지점이 없습니다.</p>
          </div>
        ) : (
          <div className={styles['branches-list']}>
            <table className={styles['branches-table']}>
              <thead className={styles['branches-table-header']}>
                <tr>
                  <th>지점명</th>
                  <th>지점코드</th>
                  <th>담당자</th>
                  <th>연락처</th>
                  <th>상태</th>
                  <th>운영시간</th>
                  <th>오픈날짜</th>
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
                         branch.status === 'inactive' ? '비활성' : 
                         branch.status === 'pending' ? '대기' : '알 수 없음'}
                      </span>
                    </td>
                    <td>{branch.openingHours}</td>
                    <td>{branch.openingDate}</td>
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
        )}
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 기존 운영시간을 시작시간과 종료시간으로 분리
  const parseOpeningHours = (openingHours) => {
    if (!openingHours || openingHours === '운영시간 정보 없음') {
      return { openingTime: '', closingTime: '' };
    }
    
    const parts = openingHours.split(' - ');
    if (parts.length === 2) {
      return { openingTime: parts[0], closingTime: parts[1] };
    }
    
    return { openingTime: '', closingTime: '' };
  };

  const { openingTime, closingTime } = parseOpeningHours(branch.openingHours);
  
  // openingDate를 ISO 날짜 형식으로 변환 (YYYY-MM-DD)
  const formatOpeningDate = (dateString) => {
    if (!dateString || dateString === '오픈날짜 정보 없음') return '';
    try {
      // 이미 날짜 형식인 경우 그대로 반환
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      // 한국어 날짜 형식인 경우 ISO 형식으로 변환
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error('날짜 변환 오류:', e);
      return '';
    }
  };
  
  const [formData, setFormData] = useState({
    ...branch,
    openingTime,
    closingTime,
    openingDate: formatOpeningDate(branch.openingDate)
  });

  console.log('수정 모달 초기화 - 원본 지점 데이터:', branch);
  console.log('수정 모달 초기화 - 설정된 formData:', formData);
  console.log('수정 모달 초기화 - 상태 값:', formData.status);
  console.log('수정 모달 초기화 - 상태 값 타입:', typeof formData.status);
  console.log('수정 모달 초기화 - 상태 값 길이:', formData.status ? formData.status.length : 'NULL');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!formData.branchName || !formData.branchCode) {
      alert('지점명과 지점코드는 필수 입력 항목입니다.');
      return;
    }
    
    // 운영시간 검증
    if (formData.openingTime && formData.closingTime) {
      if (formData.openingTime >= formData.closingTime) {
        alert('시작시간은 종료시간보다 빨라야 합니다.');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      await onUpdate(formData);
    } catch (error) {
      console.error('수정 처리 중 오류:', error);
    } finally {
      setIsSubmitting(false);
    }
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

          <div className={styles['form-group']}>
            <label>전화번호</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>운영시간 (시작)</label>
              <input
                type="time"
                name="openingTime"
                value={formData.openingTime || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles['form-group']}>
              <label>운영시간 (종료)</label>
              <input
                type="time"
                name="closingTime"
                value={formData.closingTime || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>오픈날짜</label>
            <input
              type="date"
              name="openingDate"
              value={formData.openingDate || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles['modal-actions']}>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '수정 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 