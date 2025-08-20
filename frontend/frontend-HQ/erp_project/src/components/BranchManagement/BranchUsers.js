import React, { useState, useEffect, useCallback } from 'react';
import styles from './BranchUsers.module.css';
import searchIcon from '../../assets/search_icon.png';

export default function BranchUsers() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [modalSelectedBranch, setModalSelectedBranch] = useState(''); // 모달용 별도 지점 상태
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    role: 'staff',
    status: 'active',
    branchId: null
  });

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
      
      
      // 직접 백엔드 URL 사용 - 모든 지점 데이터 가져오기
      const apiUrl = 'http://localhost:8080/api/branches';
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors' // CORS 설정 추가
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 지점 데이터를 가져오는데 실패했습니다`);
      }
      
      const responseText = await response.text();
    
      
      let branchesData;
      try {
        branchesData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        throw new Error('API 응답을 JSON으로 파싱할 수 없습니다');
      }
      
      console.log('파싱된 지점 데이터:', branchesData);
      
      if (!Array.isArray(branchesData)) {
        console.error('지점 데이터가 배열이 아님:', typeof branchesData, branchesData);
        throw new Error('지점 데이터 형식이 올바르지 않습니다');
      }
      
      // API 응답 구조에 맞게 변환 (백엔드 DTO 구조와 일치)
      const formattedBranches = branchesData.map(branch => {
        return {
          id: branch.id,
          branchName: branch.branchName || '이름 없음',
          branchCode: branch.branchCode || '코드 없음',
          branchType: branch.branchType || 'branch',
          address: branch.address || '',
          phone: branch.phone || '',
          managerName: branch.managerName || '',
          status: branch.status || 'active'
        };
      });
      
      setBranches(formattedBranches);
      setError(null);
      
    } catch (err) {
      console.error('지점 데이터 로딩 에러:', err);
      setError(err.message);
      
      // 에러 발생 시 기본 지점 데이터 사용
      const fallbackBranches = [
        { id: 1, branchName: '강남점', branchCode: 'GN001', branchType: 'branch' },
        { id: 2, branchName: '홍대점', branchCode: 'HD001', branchType: 'branch' },
        { id: 3, branchName: '부산점', branchCode: 'BS001', branchType: 'branch' }
      ];
      
      setBranches(fallbackBranches);
      console.log('폴백 지점 데이터 사용:', fallbackBranches);
      
    } finally {
      setLoading(false);
    }
  }, [hasAttemptedFetch]);

  // 컴포넌트 마운트 시 지점 데이터 가져오기
  useEffect(() => {
    if (!hasAttemptedFetch) {
      fetchBranches();
    }
  }, [hasAttemptedFetch, fetchBranches]);

  // 사용자 데이터를 API에서 가져오는 함수
  const fetchUsers = useCallback(async (branchId = null) => {
    try {
      let apiUrl;
      if (branchId) {
        apiUrl = `http://localhost:8080/api/users/branch/${branchId}`;
      } else {
        apiUrl = 'http://localhost:8080/api/users'; // 모든 사용자 가져오기
      }
      
      console.log('사용자 데이터 API 요청:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 사용자 데이터를 가져오는데 실패했습니다`);
      }
      
      const responseText = await response.text();
      console.log('사용자 API 응답 텍스트:', responseText);
      
      let usersData;
      try {
        usersData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('사용자 데이터 JSON 파싱 오류:', parseError);
        throw new Error('사용자 데이터를 JSON으로 파싱할 수 없습니다');
      }
      
      console.log('파싱된 사용자 데이터:', usersData);
      
      if (!Array.isArray(usersData)) {
        console.error('사용자 데이터가 배열이 아님:', typeof usersData, usersData);
        throw new Error('사용자 데이터 형식이 올바르지 않습니다');
      }
      
      // API 응답 구조에 맞게 변환
      const formattedUsers = usersData.map(user => {
        console.log('개별 사용자 데이터:', user);
        return {
          id: user.id,
          username: user.username || '사용자명 없음',
          name: user.realName || '이름 없음',
          email: user.email || '',
          role: user.role ? user.role.toLowerCase() : 'staff',
          status: user.status || 'active',
          lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString('ko-KR') : '-',
          branchId: user.branchId
        };
      });
      
      console.log('변환된 사용자 데이터:', formattedUsers);
      setUsers(formattedUsers);
      
    } catch (err) {
      console.error('사용자 데이터 로딩 에러:', err);
      // 에러 발생 시 빈 배열로 설정
      setUsers([]);
    }
  }, []);

  // 지점 선택 변경 시 사용자 데이터 가져오기
  useEffect(() => {
    if (selectedBranch === '') {
      // 지점 선택이 기본값일 때는 모든 사용자를 보여줌
      fetchUsers();
    } else if (selectedBranch) {
      // 특정 지점이 선택되었을 때는 해당 지점의 사용자만 보여줌
      fetchUsers(parseInt(selectedBranch));
    } else {
      setUsers([]);
    }
  }, [selectedBranch, fetchUsers]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // 지점이 선택되지 않은 경우 경고
    if (!modalSelectedBranch) {
      alert('지점을 선택해주세요.');
      return;
    }
    
    try {
      // 실제 사용자 추가 API 호출
      const userData = {
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        branchId: parseInt(modalSelectedBranch) // 모달에서 선택된 지점 ID 사용
      };
      
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData),
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 사용자 추가에 실패했습니다`);
      }

      const result = await response.text();
      console.log('사용자 추가 성공:', result);

             // 사용자 추가 성공 시 목록 새로고침
       if (selectedBranch === '') {
         fetchUsers(); // 모든 사용자
       } else {
         fetchUsers(parseInt(selectedBranch)); // 선택된 지점의 사용자
       }
       
       // 폼 초기화
       setNewUser({
         username: '',
         name: '',
         email: '',
         role: 'staff',
         status: 'active',
         branchId: null
       });
       setModalSelectedBranch(''); // 모달 지점 선택 초기화
       setShowAddUser(false);
      
      // 성공 메시지
      alert('사용자가 성공적으로 추가되었습니다.');
      
    } catch (error) {
      console.error('사용자 추가 실패:', error);
      
      // 에러 메시지 표시
      let errorMessage = '사용자 추가에 실패했습니다.';
      if (error.message) {
        errorMessage += `\n${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleDeleteUser = async (userId) => {
    // 삭제할 사용자 정보 찾기
    const userToDelete = users.find(user => user.id === userId);
    if (!userToDelete) {
      alert('삭제할 사용자를 찾을 수 없습니다.');
      return;
    }

    // 삭제 확인 다이얼로그
    const confirmMessage = `정말로 이 사용자를 삭제하시겠습니까?\n\n` +
                          `사용자명: ${userToDelete.username}\n` +
                          `이름: ${userToDelete.name}\n` +
                          `이메일: ${userToDelete.email}\n\n` +
                          `이 작업은 되돌릴 수 없습니다.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // 실제 사용자 삭제 API 호출
      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 사용자 삭제에 실패했습니다`);
      }

      const result = await response.text();
      console.log('사용자 삭제 성공:', result);

      // 삭제 성공 시 목록에서 제거
      setUsers(users.filter(user => user.id !== userId));
      
      // 성공 메시지 표시
      const successMessage = `사용자가 성공적으로 삭제되었습니다.\n\n` +
                            `삭제된 사용자: ${userToDelete.username} (${userToDelete.name})`;
      alert(successMessage);
      
      console.log('사용자 삭제 성공:', userToDelete);
      
    } catch (error) {
      console.error('사용자 삭제 실패:', error);
      
      // 에러 메시지 표시
      let errorMessage = '사용자 삭제에 실패했습니다.';
      if (error.message) {
        errorMessage += `\n${error.message}`;
      }
      
      alert(errorMessage);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      // 실제 사용자 상태 변경 API 호출
      const response = await fetch(`http://localhost:8080/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus }),
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 사용자 상태 변경에 실패했습니다`);
      }

      const result = await response.text();
      console.log('사용자 상태 변경 성공:', result);

      // 상태 변경 후 사용자 목록 새로고침
      if (selectedBranch === '') {
        fetchUsers(); // 모든 사용자
      } else {
        fetchUsers(parseInt(selectedBranch)); // 선택된 지점의 사용자
      }

      // 성공 메시지
      alert('사용자 상태가 성공적으로 변경되었습니다.');

    } catch (error) {
      console.error('사용자 상태 변경 실패:', error);
      alert('사용자 상태 변경에 실패했습니다: ' + error.message);
      
      // 에러 발생 시 원래 상태로 되돌리기
      if (selectedBranch === '') {
        fetchUsers();
      } else {
        fetchUsers(parseInt(selectedBranch));
      }
    }
  };

  // 사용자 수정 모달 열기
  const handleEditUser = (user) => {
    setEditingUser({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      branchId: user.branchId
    });
    setShowEditUser(true);
  };

  // 사용자 정보 수정 처리
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    try {
      // 실제 사용자 수정 API 호출
      const response = await fetch(`http://localhost:8080/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: editingUser.username,
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          status: editingUser.status,
          branchId: editingUser.branchId
        }),
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 사용자 정보 수정에 실패했습니다`);
      }

      const result = await response.text();
      console.log('사용자 정보 수정 성공:', result);

      // 수정 후 사용자 목록 새로고침
      if (selectedBranch === '') {
        fetchUsers(); // 모든 사용자
      } else {
        fetchUsers(parseInt(selectedBranch)); // 선택된 지점의 사용자
      }

      // 모달 닫기
      setShowEditUser(false);
      setEditingUser(null);
      
      // 성공 메시지
      alert('사용자 정보가 성공적으로 수정되었습니다.');
      
    } catch (error) {
      console.error('사용자 수정 실패:', error);
      alert('사용자 수정에 실패했습니다: ' + error.message);
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'manager':
      case 'MANAGER':
        return '매니저';
      case 'staff':
      case 'STAFF':
        return '직원';
      case 'admin':
      case 'ADMIN':
        return '관리자';
      default:
        return role || '권한 없음';
    }
  };

  // 지점 상태를 한글로 변환하는 함수
  const getBranchStatusName = (status) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'pending':
        return '대기';
      case 'inactive':
        return '비활성화';
      case 'suspended':
        return '정지';
      case 'closed':
        return '폐점';
      default:
        return status || '상태 없음';
    }
  };

  // 검색 필터링된 사용자 목록
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className={styles['branch-users']}>
      <div className={styles['branch-users-header']}>
        <h1>지점별 계정관리</h1>
      </div>
      <div className={styles['users-container']}>
        <div className={styles['users-header']}>
          <div className={styles['users-header-left']}>
            <div className={styles['search-box']}>
              <div className={styles['search-input-container']}>
                <img
                  src={searchIcon}
                  alt="검색"
                  className={styles['search-icon']}
                />
                <input
                  type="text"
                  placeholder="사용자명, 이름 또는 이메일로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles['search-input']}
                />
              </div>
            </div>
            <div className={styles['branch-selector']}>
              {loading ? (
                <div className={styles['loading-text']}>지점 정보 로딩 중...</div>
              ) : error ? (
                <div className={styles['error-text']}>
                  <div>지점 정보를 불러오는데 실패했습니다.</div>
                  <div className={styles['error-detail']}>기본 데이터를 사용 중입니다.</div>
                </div>
              ) : branches.length === 0 ? (
                <div className={styles['no-branches-text']}>등록된 지점이 없습니다.</div>
              ) : (
                <select
                  id="branchSelect"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className={styles['branch-select']}
                >
                  <option value="">지점 선택</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName} ({branch.branchCode})
                      {branch.status !== 'active' && ` - ${getBranchStatusName(branch.status)}`}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
                     <button
             className="btn btn-primary"
             onClick={() => {
               setShowAddUser(true);
               setModalSelectedBranch(''); // 모달 열 때 지점 선택 초기화
             }}
           >
             사용자 추가
           </button>
        </div>

        <div className={styles['users-list']}>
          <table className={styles['users-table']}>
            <thead className={styles['users-table-header']}>
              <tr>
                <th>사용자명</th>
                <th>이름</th>
                <th>이메일</th>
                <th>권한</th>
                <th>상태</th>
                <th>마지막 로그인</th>
                <th>지점</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{getRoleName(user.role)}</td>
                                     <td>
                     <span className={`${styles['status-badge']} ${styles[`status-${user.status}`]}`}>
                       {user.status === 'active' ? '활성' : 
                        user.status === 'inactive' ? '비활성' : 
                        user.status === 'suspended' ? '정지' : '알 수 없음'}
                     </span>
                   </td>
                  <td>{user.lastLogin}</td>
                  {selectedBranch === '' && (
                    <td>
                      {(() => {
                        const branch = branches.find(b => b.id === user.branchId);
                        if (!branch) return '-';
                        return branch.status === 'active' 
                          ? branch.branchName 
                          : `${branch.branchName} (${getBranchStatusName(branch.status)})`;
                      })()}
                    </td>
                  )}
                  {selectedBranch !== '' && (
                    <td>
                      {(() => {
                        const branch = branches.find(b => b.id === parseInt(selectedBranch));
                        if (!branch) return '-';
                        return branch.status === 'active' 
                          ? branch.branchName 
                          : `${branch.branchName} (${getBranchStatusName(branch.status)})`;
                      })()}
                    </td>
                  )}
                                     <td>
                     <div className={styles['action-buttons']}>
                       <button
                         className={`btn btn-primary btn-small ${styles['btn-small']}`}
                         onClick={() => handleEditUser(user)}
                       >
                         수정
                       </button>
                       <button
                         className={`btn btn-small btn-danger ${styles['btn-small']}`}
                         onClick={() => handleDeleteUser(user.id)}
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

      {showAddUser && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
                         <div className={styles['modal-header']}>
               <h2>사용자 추가</h2>
               <button className={styles['modal-close']} onClick={() => {
                 setShowAddUser(false);
                 setModalSelectedBranch(''); // 모달 닫을 때 지점 선택 초기화
               }}>×</button>
             </div>

            <form onSubmit={handleAddUser} className={styles['add-user-form']}>
              <div className={styles['form-row']}>
                <div className={styles['form-group']}>
                  <label>사용자명 *</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    required
                    placeholder="사용자명을 입력하세요"
                  />
                </div>
                <div className={styles['form-group']}>
                  <label>이름 *</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                    placeholder="이름을 입력하세요"
                  />
                </div>
              </div>

              <div className={styles['form-row']}>
                <div className={styles['form-group']}>
                  <label>이메일 *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                    placeholder="이메일을 입력하세요"
                  />
                </div>
                <div className={styles['form-group']}>
                  <label>권한</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="staff">직원</option>
                    <option value="manager">매니저</option>
                    <option value="admin">관리자</option>
                  </select>
                </div>
              </div>

              <div className={styles['form-row']}>
                                 <div className={styles['form-group']}>
                   <label>지점 *</label>
                   <select
                     value={modalSelectedBranch || ''}
                     onChange={(e) => setModalSelectedBranch(e.target.value)}
                     disabled={branches.length === 0}
                     required
                   >
                    <option value="">지점 선택</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branchName} ({branch.branchCode})
                        {branch.status !== 'active' && ` - ${getBranchStatusName(branch.status)}`}
                      </option>
                    ))}
                  </select>
                  {branches.length === 0 && (
                    <div className={styles['form-help-text']}>
                      등록된 지점이 없습니다.
                    </div>
                  )}
                </div>
                                 <div className={styles['form-group']}>
                   <label>상태 *</label>
                   <select
                     value={newUser.status}
                     onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                     required
                   >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </select>
                </div>
              </div>



                             <div className={styles['modal-actions']}>
                 <button type="button" className="btn btn-secondary" onClick={() => {
                   setShowAddUser(false);
                   setModalSelectedBranch(''); // 모달 닫을 때 지점 선택 초기화
                 }}>
                   취소
                 </button>
                <button type="submit" className="btn btn-primary">
                  사용자 추가
                </button>
              </div>
            </form>
          </div>
        </div>
             )}

       {/* 사용자 수정 모달 */}
       {showEditUser && editingUser && (
         <div className={styles['modal-overlay']}>
           <div className={styles['modal-content']}>
             <div className={styles['modal-header']}>
               <h2>사용자 정보 수정</h2>
               <button className={styles['modal-close']} onClick={() => {
                 setShowEditUser(false);
                 setEditingUser(null);
               }}>×</button>
             </div>

             <form onSubmit={handleUpdateUser} className={styles['add-user-form']}>
               <div className={styles['form-row']}>
                 <div className={styles['form-group']}>
                   <label>사용자명 *</label>
                   <input
                     type="text"
                     value={editingUser.username}
                     onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                     required
                     placeholder="사용자명을 입력하세요"
                   />
                 </div>
                 <div className={styles['form-group']}>
                   <label>이름 *</label>
                   <input
                     type="text"
                     value={editingUser.name}
                     onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                     required
                     placeholder="이름을 입력하세요"
                   />
                 </div>
               </div>

               <div className={styles['form-row']}>
                 <div className={styles['form-group']}>
                   <label>이메일 *</label>
                   <input
                     type="email"
                     value={editingUser.email}
                     onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                     required
                     placeholder="이메일을 입력하세요"
                   />
                 </div>
                 <div className={styles['form-group']}>
                   <label>권한</label>
                   <select
                     value={editingUser.role}
                     onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                   >
                     <option value="staff">직원</option>
                     <option value="manager">매니저</option>
                     <option value="admin">관리자</option>
                   </select>
                 </div>
               </div>

               <div className={styles['form-row']}>
                 <div className={styles['form-group']}>
                   <label>지점</label>
                   <select
                     value={editingUser.branchId || ''}
                     onChange={(e) => setEditingUser({ ...editingUser, branchId: e.target.value ? parseInt(e.target.value) : null })}
                     disabled={branches.length === 0}
                   >
                     <option value="">지점을 선택하세요</option>
                     {branches.map(branch => (
                       <option key={branch.id} value={branch.id}>
                         {branch.branchName} ({branch.branchCode})
                         {branch.status !== 'active' && ` - ${getBranchStatusName(branch.status)}`}
                       </option>
                     ))}
                   </select>
                   
                 </div>
                 <div className={styles['form-group']}>
                   <label>상태</label>
                   <select
                     value={editingUser.status}
                     onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                   >
                     <option value="active">활성</option>
                     <option value="inactive">비활성</option>
                   </select>
                 </div>
               </div>

               <div className={styles['modal-actions']}>
                 <button type="button" className="btn btn-secondary" onClick={() => {
                   setShowEditUser(false);
                   setEditingUser(null);
                 }}>
                   취소
                 </button>
                 <button type="submit" className="btn btn-primary">
                   수정 완료
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
     </div>
   );
 } 