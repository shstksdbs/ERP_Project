import React, { useState, useEffect } from 'react';
import styles from './BranchUsers.module.css';
import searchIcon from '../../assets/search_icon.png';


export default function BranchUsers() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    username: '',
    name: '',
    email: '',
    role: 'staff',
    status: 'active',
    branchId: null
  });

  // 샘플 지점 데이터
  useEffect(() => {
    const sampleBranches = [
      { id: 1, name: '강남점', code: 'GN001' },
      { id: 2, name: '홍대점', code: 'HD001' },
      { id: 3, name: '부산점', code: 'BS001' }
    ];
    setBranches(sampleBranches);
    setSelectedBranch('');
  }, []);

  // 모든 지점의 사용자 데이터
  const allUsersData = {
    1: [ // 강남점
      {
        id: 1,
        username: 'manager_gn',
        name: '김철수',
        email: 'manager@gn.com',
        role: 'manager',
        status: 'active',
        lastLogin: '2024-01-15 14:30',
        branchId: 1
      },
      {
        id: 2,
        username: 'staff_gn1',
        name: '이영희',
        email: 'staff1@gn.com',
        role: 'staff',
        status: 'active',
        lastLogin: '2024-01-15 13:45',
        branchId: 1
      },
      {
        id: 3,
        username: 'staff_gn2',
        name: '박민수',
        email: 'staff2@gn.com',
        role: 'staff',
        status: 'inactive',
        lastLogin: '2024-01-10 09:20',
        branchId: 1
      }
    ],
    2: [ // 홍대점
      {
        id: 4,
        username: 'manager_hd',
        name: '최영수',
        email: 'manager@hd.com',
        role: 'manager',
        status: 'active',
        lastLogin: '2024-01-16 10:15',
        branchId: 2
      },
      {
        id: 5,
        username: 'staff_hd1',
        name: '정미영',
        email: 'staff1@hd.com',
        role: 'staff',
        status: 'active',
        lastLogin: '2024-01-16 09:30',
        branchId: 2
      },
      {
        id: 6,
        username: 'staff_hd2',
        name: '김태호',
        email: 'staff2@hd.com',
        role: 'staff',
        status: 'active',
        lastLogin: '2024-01-15 16:45',
        branchId: 2
      },
      {
        id: 7,
        username: 'staff_hd3',
        name: '박지영',
        email: 'staff3@hd.com',
        role: 'staff',
        status: 'suspended',
        lastLogin: '2024-01-12 11:20',
        branchId: 2
      }
    ],
    3: [ // 부산점
      {
        id: 8,
        username: 'manager_bs',
        name: '이동훈',
        email: 'manager@bs.com',
        role: 'manager',
        status: 'active',
        lastLogin: '2024-01-16 08:30',
        branchId: 3
      },
      {
        id: 9,
        username: 'staff_bs1',
        name: '김수진',
        email: 'staff1@bs.com',
        role: 'staff',
        status: 'active',
        lastLogin: '2024-01-16 07:45',
        branchId: 3
      },
      {
        id: 10,
        username: 'staff_bs2',
        name: '최준호',
        email: 'staff2@bs.com',
        role: 'staff',
        status: 'inactive',
        lastLogin: '2024-01-14 15:20',
        branchId: 3
      },
      {
        id: 11,
        username: 'staff_bs3',
        name: '정민지',
        email: 'staff3@bs.com',
        role: 'staff',
        status: 'active',
        lastLogin: '2024-01-15 12:10',
        branchId: 3
      },
      {
        id: 12,
        username: 'admin_bs',
        name: '박성민',
        email: 'admin@bs.com',
        role: 'admin',
        status: 'active',
        lastLogin: '2024-01-16 09:15',
        branchId: 3
      }
    ]
  };

  // 선택된 지점의 사용자 데이터
  useEffect(() => {
    if (selectedBranch === '') {
      // 지점 선택이 기본값일 때는 모든 지점의 사용자를 보여줌
      const allUsers = Object.values(allUsersData).flat();
      setUsers(allUsers);
    } else if (selectedBranch) {
      // 특정 지점이 선택되었을 때는 해당 지점의 사용자만 보여줌
      const branchUsers = allUsersData[selectedBranch] || [];
      setUsers(branchUsers);
    } else {
      setUsers([]);
    }
  }, [selectedBranch]);

  const handleAddUser = (e) => {
    e.preventDefault();
    const user = {
      ...newUser,
      id: Date.now(),
      lastLogin: '-',
      branchId: selectedBranch ? parseInt(selectedBranch) : null
    };
    setUsers([...users, user]);
    setNewUser({
      username: '',
      name: '',
      email: '',
      role: 'staff',
      status: 'active',
      branchId: null
    });
    setShowAddUser(false);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'manager': return '매니저';
      case 'staff': return '직원';
      case 'admin': return '관리자';
      default: return role;
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
              <select
                id="branchSelect"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className={styles['branch-select']}
              >
                <option value="">지점 선택</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddUser(true)}
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
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className={`${styles['status-select']} ${styles[`status-${user.status}`]}`}
                    >
                      <option value="active">활성</option>
                      <option value="inactive">비활성</option>
                      <option value="suspended">정지</option>
                    </select>
                  </td>
                  <td>{user.lastLogin}</td>
                  {selectedBranch === '' && (
                    <td>
                      {branches.find(branch => branch.id === user.branchId)?.name || '-'}
                    </td>
                  )}
                  {selectedBranch !== '' && (
                    <td>
                      {branches.find(branch => branch.id === parseInt(selectedBranch))?.name || '-'}
                    </td>
                  )}
                  <td>
                    <div className={styles['action-buttons']}>
                      <button
                        className={`btn btn-small ${styles['btn-small']}`}
                        onClick={() => {/* 비밀번호 재설정 로직 */ }}
                      >
                        비밀번호 재설정
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
              <button className={styles['modal-close']} onClick={() => setShowAddUser(false)}>×</button>
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
                  <label>지점</label>
                  <select
                    value={newUser.branchId || ''}
                    onChange={(e) => setNewUser({ ...newUser, branchId: e.target.value ? parseInt(e.target.value) : null })}
                  >
                    <option value="">지점 선택</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles['form-group']}>
                  <label>상태</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </select>
                </div>
              </div>



              <div className={styles['modal-actions']}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddUser(false)}>
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
    </div>
  );
} 