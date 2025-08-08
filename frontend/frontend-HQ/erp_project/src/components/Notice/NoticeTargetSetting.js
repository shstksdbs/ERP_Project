import React, { useState, useEffect } from 'react';
import styles from './NoticeTargetSetting.module.css';
import searchIcon from '../../assets/search_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import usersIcon from '../../assets/users_icon.png';
import storeIcon from '../../assets/store_icon.png';

export default function NoticeTargetSetting() {
  const [targetGroups, setTargetGroups] = useState([]);
  const [selectedTargetGroup, setSelectedTargetGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddTargetModal, setShowAddTargetModal] = useState(false);
  const [showEditTargetModal, setShowEditTargetModal] = useState(false);
  const [showTargetDetailModal, setShowTargetDetailModal] = useState(false);

  // 샘플 데이터
  useEffect(() => {
    const sampleTargetGroups = [
      {
        id: 1,
        name: '전체 직원',
        type: 'all',
        description: '모든 지점의 전체 직원을 대상으로 하는 공지',
        branches: ['전체 지점'],
        employees: ['전체 직원'],
        memberCount: 1250,
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 2,
        name: '매니저급 이상',
        type: 'position',
        description: '매니저, 부장, 지점장급 이상 직원 대상',
        branches: ['전체 지점'],
        employees: ['매니저', '부장', '지점장', '본사 직원'],
        memberCount: 85,
        status: 'active',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 3,
        name: '신규 입사자',
        type: 'new',
        description: '입사 3개월 이내 신규 직원 대상',
        branches: ['전체 지점'],
        employees: ['신규 직원'],
        memberCount: 45,
        status: 'active',
        createdAt: '2024-01-08',
        updatedAt: '2024-01-08'
      },
      {
        id: 4,
        name: '서울 지역 지점',
        type: 'region',
        description: '서울 지역 지점 직원만 대상',
        branches: ['강남점', '홍대점', '신촌점', '잠실점'],
        employees: ['전체 직원'],
        memberCount: 320,
        status: 'active',
        createdAt: '2024-01-05',
        updatedAt: '2024-01-05'
      },
      {
        id: 5,
        name: '점주 대상',
        type: 'owner',
        description: '프랜차이즈 점주만 대상',
        branches: ['전체 지점'],
        employees: ['점주'],
        memberCount: 150,
        status: 'active',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ];

    setTargetGroups(sampleTargetGroups);
  }, []);

  const handleAddTargetGroup = (newTargetGroup) => {
    const targetGroup = {
      ...newTargetGroup,
      id: targetGroups.length + 1,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      memberCount: Math.floor(Math.random() * 500) + 50
    };
    setTargetGroups([targetGroup, ...targetGroups]);
    setShowAddTargetModal(false);
  };

  const handleEditTargetGroup = (updatedTargetGroup) => {
    setTargetGroups(targetGroups.map(group => 
      group.id === updatedTargetGroup.id 
        ? { ...updatedTargetGroup, updatedAt: new Date().toISOString().split('T')[0] }
        : group
    ));
    setShowEditTargetModal(false);
  };

  const handleDeleteTargetGroup = (targetGroupId) => {
    setTargetGroups(targetGroups.filter(group => group.id !== targetGroupId));
  };

  const getTypeText = (type) => {
    const types = {
      all: '전체',
      position: '직급별',
      region: '지역별',
      new: '신규직원',
      owner: '점주',
      custom: '커스텀'
    };
    return types[type] || type;
  };

  const getStatusText = (status) => {
    const statuses = {
      active: '활성',
      inactive: '비활성'
    };
    return statuses[status] || status;
  };

  const getStatusClass = (status) => {
    return status === 'active' ? styles['status-active'] : styles['status-inactive'];
  };

  const filteredTargetGroups = targetGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || group.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className={styles['target-setting']}>
      <div className={styles['target-setting-header']}>
        <h1>공지 대상 설정</h1>
        <button 
          className={styles['add-target-btn']}
          onClick={() => setShowAddTargetModal(true)}
        >
          <img src={plusIcon} alt="추가" />
          대상 그룹 추가
        </button>
      </div>

      <div className={styles['filter-section']}>
        <div className={styles['search-box']}>
          <img src={searchIcon} alt="검색" />
          <input
            type="text"
            placeholder="대상 그룹명 또는 설명으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles['filter-options']}>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">전체 유형</option>
            <option value="all">전체</option>
            <option value="position">직급별</option>
            <option value="region">지역별</option>
            <option value="new">신규직원</option>
            <option value="owner">점주</option>
            <option value="custom">커스텀</option>
          </select>
        </div>
      </div>

      <div className={styles['target-table-container']}>
        <table className={styles['target-table']}>
          <thead className={styles['target-table-header']}>
            <tr>
              <th>번호</th>
              <th>대상 그룹명</th>
              <th>유형</th>
              <th>설명</th>
              <th>대상 지점</th>
              <th>대상 직원</th>
              <th>인원수</th>
              <th>상태</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredTargetGroups.map((group, index) => (
              <tr key={group.id}>
                <td>{index + 1}</td>
                <td className={styles['target-name']}>
                  {group.name}
                </td>
                <td>{getTypeText(group.type)}</td>
                <td className={styles['target-description']}>
                  {group.description}
                </td>
                <td>{group.branches.join(', ')}</td>
                <td>{group.employees.join(', ')}</td>
                <td>{group.memberCount}명</td>
                <td>
                  <span className={`${styles['status-badge']} ${getStatusClass(group.status)}`}>
                    {getStatusText(group.status)}
                  </span>
                </td>
                <td>{formatDate(group.createdAt)}</td>
                <td>
                  <div className={styles['action-buttons']}>
                    <button
                      className={`btn btn-small ${styles['view-btn']}`}
                      onClick={() => {
                        setSelectedTargetGroup(group);
                        setShowTargetDetailModal(true);
                      }}
                    >
                      보기
                    </button>
                    <button
                      className={`btn btn-small ${styles['edit-btn']}`}
                      onClick={() => {
                        setSelectedTargetGroup(group);
                        setShowEditTargetModal(true);
                      }}
                    >
                      <img src={pencilIcon} alt="수정" />
                    </button>
                    <button
                      className={`btn btn-small btn-danger ${styles['delete-btn']}`}
                      onClick={() => handleDeleteTargetGroup(group.id)}
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

      {showAddTargetModal && (
        <AddTargetModal
          onAdd={handleAddTargetGroup}
          onClose={() => setShowAddTargetModal(false)}
        />
      )}

      {showEditTargetModal && selectedTargetGroup && (
        <EditTargetModal
          targetGroup={selectedTargetGroup}
          onUpdate={handleEditTargetGroup}
          onClose={() => setShowEditTargetModal(false)}
        />
      )}

      {showTargetDetailModal && selectedTargetGroup && (
        <TargetDetailModal
          targetGroup={selectedTargetGroup}
          onClose={() => setShowTargetDetailModal(false)}
        />
      )}
    </div>
  );
}

// 대상 그룹 추가 모달
function AddTargetModal({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'all',
    description: '',
    branches: ['전체 지점'],
    employees: ['전체 직원']
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal']}>
        <div className={styles['modal-header']}>
          <h2>대상 그룹 추가</h2>
          <button onClick={onClose} className={styles['close-btn']}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label>그룹명 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles['form-group']}>
            <label>유형</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="all">전체</option>
              <option value="position">직급별</option>
              <option value="region">지역별</option>
              <option value="new">신규직원</option>
              <option value="owner">점주</option>
              <option value="custom">커스텀</option>
            </select>
          </div>
          <div className={styles['form-group']}>
            <label>설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <div className={styles['modal-actions']}>
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit">추가</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 대상 그룹 수정 모달
function EditTargetModal({ targetGroup, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    name: targetGroup.name,
    type: targetGroup.type,
    description: targetGroup.description,
    branches: targetGroup.branches,
    employees: targetGroup.employees
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...targetGroup, ...formData });
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal']}>
        <div className={styles['modal-header']}>
          <h2>대상 그룹 수정</h2>
          <button onClick={onClose} className={styles['close-btn']}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label>그룹명 *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles['form-group']}>
            <label>유형</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="all">전체</option>
              <option value="position">직급별</option>
              <option value="region">지역별</option>
              <option value="new">신규직원</option>
              <option value="owner">점주</option>
              <option value="custom">커스텀</option>
            </select>
          </div>
          <div className={styles['form-group']}>
            <label>설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <div className={styles['modal-actions']}>
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit">수정</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 대상 그룹 상세 모달
function TargetDetailModal({ targetGroup, onClose }) {
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal']}>
        <div className={styles['modal-header']}>
          <h2>대상 그룹 상세</h2>
          <button onClick={onClose} className={styles['close-btn']}>×</button>
        </div>
        <div className={styles['target-detail']}>
          <div className={styles['detail-row']}>
            <label>그룹명:</label>
            <span>{targetGroup.name}</span>
          </div>
          <div className={styles['detail-row']}>
            <label>유형:</label>
            <span>{targetGroup.type}</span>
          </div>
          <div className={styles['detail-row']}>
            <label>설명:</label>
            <p>{targetGroup.description}</p>
          </div>
          <div className={styles['detail-row']}>
            <label>대상 지점:</label>
            <span>{targetGroup.branches.join(', ')}</span>
          </div>
          <div className={styles['detail-row']}>
            <label>대상 직원:</label>
            <span>{targetGroup.employees.join(', ')}</span>
          </div>
          <div className={styles['detail-row']}>
            <label>인원수:</label>
            <span>{targetGroup.memberCount}명</span>
          </div>
          <div className={styles['detail-row']}>
            <label>상태:</label>
            <span>{targetGroup.status}</span>
          </div>
          <div className={styles['detail-row']}>
            <label>등록일:</label>
            <span>{targetGroup.createdAt}</span>
          </div>
        </div>
        <div className={styles['modal-actions']}>
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
} 