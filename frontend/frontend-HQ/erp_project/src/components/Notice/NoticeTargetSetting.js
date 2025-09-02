import React, { useState, useEffect } from 'react';
import styles from './NoticeTargetSetting.module.css';
import searchIcon from '../../assets/search_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import usersIcon from '../../assets/users_icon.png';
import storeIcon from '../../assets/store_icon.png';
import { noticeTargetService } from '../../services/noticeTargetService';

export default function NoticeTargetSetting() {
  const [targetGroups, setTargetGroups] = useState([]);
  const [selectedTargetGroup, setSelectedTargetGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTargetModal, setShowAddTargetModal] = useState(false);
  const [showEditTargetModal, setShowEditTargetModal] = useState(false);
  const [showTargetDetailModal, setShowTargetDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [branches, setBranches] = useState([]);

  // 대상 그룹 목록 조회 및 지점 목록 조회
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [targetGroupsData, branchesData] = await Promise.all([
          noticeTargetService.getTargetGroups(),
          noticeTargetService.getBranches()
        ]);
        setTargetGroups(targetGroupsData);
        setBranches(branchesData);
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddTargetGroup = async (newTargetGroup) => {
    try {
      const createdGroup = await noticeTargetService.createTargetGroup(newTargetGroup);
      setTargetGroups([createdGroup, ...targetGroups]);
      setShowAddTargetModal(false);
    } catch (err) {
      setError('대상 그룹 생성에 실패했습니다.');
      console.error('Error creating target group:', err);
    }
  };

  const handleEditTargetGroup = async (updatedTargetGroup) => {
    try {
      const updatedGroup = await noticeTargetService.updateTargetGroup(updatedTargetGroup.id, updatedTargetGroup);
      setTargetGroups(targetGroups.map(group =>
        group.id === updatedTargetGroup.id ? updatedGroup : group
      ));
      setShowEditTargetModal(false);
    } catch (err) {
      setError('대상 그룹 수정에 실패했습니다.');
      console.error('Error updating target group:', err);
    }
  };

  const handleDeleteTargetGroup = async (targetGroupId) => {
    if (window.confirm('정말로 이 대상 그룹을 삭제하시겠습니까?')) {
      try {
        await noticeTargetService.deleteTargetGroup(targetGroupId);
        setTargetGroups(targetGroups.filter(group => group.id !== targetGroupId));
      } catch (err) {
        setError('대상 그룹 삭제에 실패했습니다.');
        console.error('Error deleting target group:', err);
      }
    }
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
      (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className={styles['target-setting']}>
        <div className={styles['loading-overlay']}>
          <div className={styles['loading-spinner']}></div>
          <p>대상 그룹 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['target-setting']}>
        <div className={styles['error-message']}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['target-setting']}>
      <div className={styles['target-setting-header']}>
        <h1>공지 대상 설정</h1>

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
        <button
          className={styles['add-target-btn']}
          onClick={() => setShowAddTargetModal(true)}
        >
          대상 그룹 추가
        </button>

      </div>

      <div className={styles['target-table-container']}>
        <table className={styles['target-table']}>
          <thead className={styles['target-table-header']}>
            <tr>
              <th>번호</th>
              <th>대상 그룹명</th>
              <th>설명</th>
              <th>대상 지점</th>
              <th>대상 직급</th>
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
                <td className={styles['target-description']}>
                  {group.description}
                </td>
                <td>{group.targetBranches && group.targetBranches !== '[]' ? JSON.parse(group.targetBranches).join(', ') : '전체 지점'}</td>
                <td>{group.targetPositions && group.targetPositions !== '[]' ? JSON.parse(group.targetPositions).join(', ') : '전체 직급'}</td>
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
                      상세
                    </button>
                    <button
                      className={`btn btn-small btn-primary ${styles['edit-btn']}`}
                      onClick={() => {
                        setSelectedTargetGroup(group);
                        setShowEditTargetModal(true);
                      }}
                    >
                      수정
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
          branches={branches}
        />
      )}

      {showEditTargetModal && selectedTargetGroup && (
        <EditTargetModal
          targetGroup={selectedTargetGroup}
          onUpdate={handleEditTargetGroup}
          onClose={() => setShowEditTargetModal(false)}
          branches={branches}
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
function AddTargetModal({ onAdd, onClose, branches }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetBranches: JSON.stringify([]),
    targetPositions: JSON.stringify([]),
    status: 'active'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const handleBranchSelection = (branchName, isSelected) => {
    const currentBranches = JSON.parse(formData.targetBranches);
    let newBranches;

    if (branchName === '전체 지점') {
      // 전체 지점 선택 시
      if (isSelected) {
        newBranches = ['전체 지점'];
      } else {
        newBranches = [];
      }
    } else {
      // 개별 지점 선택 시
      if (isSelected) {
        // 전체 지점이 선택되어 있으면 제거하고 개별 지점 추가
        newBranches = currentBranches.filter(b => b !== '전체 지점');
        if (!newBranches.includes(branchName)) {
          newBranches.push(branchName);
        }
      } else {
        newBranches = currentBranches.filter(b => b !== branchName);
      }
    }

    setFormData(prev => ({
      ...prev,
      targetBranches: JSON.stringify(newBranches)
    }));
  };

  const handlePositionSelection = (position, isSelected) => {
    const currentPositions = JSON.parse(formData.targetPositions);
    let newPositions;

    if (position === '전체 직급') {
      // 전체 직급 선택 시
      if (isSelected) {
        newPositions = ['전체 직급'];
      } else {
        newPositions = [];
      }
    } else {
      // 개별 직급 선택 시
      if (isSelected) {
        // 전체 직급이 선택되어 있으면 제거하고 개별 직급 추가
        newPositions = currentPositions.filter(p => p !== '전체 직급');
        if (!newPositions.includes(position)) {
          newPositions.push(position);
        }
      } else {
        newPositions = currentPositions.filter(p => p !== position);
      }
    }

    setFormData(prev => ({
      ...prev,
      targetPositions: JSON.stringify(newPositions)
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
            <label>대상 지점 선택 (선택사항)</label>
            <div className={styles['checkbox-group']}>
              {/* 전체 지점 옵션 */}
              <label className={`${styles['checkbox-item']} ${styles['all-option']}`}>
                <input
                  type="checkbox"
                  checked={JSON.parse(formData.targetBranches).includes('전체 지점')}
                  onChange={(e) => handleBranchSelection('전체 지점', e.target.checked)}
                />
                <strong>전체 지점</strong>
              </label>

              {/* 개별 지점들 */}
              {branches.map(branch => {
                const isSelected = JSON.parse(formData.targetBranches).includes(branch.branchName);
                return (
                  <label key={branch.id} className={styles['checkbox-item']}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleBranchSelection(branch.branchName, e.target.checked)}
                    />
                    {branch.branchName}
                  </label>
                );
              })}
            </div>
            <small className={styles['help-text']}>지점을 선택하지 않으면 모든 지점이 대상입니다.</small>
          </div>

          <div className={styles['form-group']}>
            <label>대상 직급 선택 (선택사항)</label>
            <div className={styles['checkbox-group']}>
              {/* 전체 직급 옵션 */}
              <label className={`${styles['checkbox-item']} ${styles['all-option']}`}>
                <input
                  type="checkbox"
                  checked={JSON.parse(formData.targetPositions).includes('전체 직급')}
                  onChange={(e) => handlePositionSelection('전체 직급', e.target.checked)}
                />
                <strong>전체 직급</strong>
              </label>

              {/* 개별 직급들 */}
              {noticeTargetService.getPositionOptions().map(option => {
                const isSelected = JSON.parse(formData.targetPositions).includes(option.value);
                return (
                  <label key={option.value} className={styles['checkbox-item']}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handlePositionSelection(option.value, e.target.checked)}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
            <small className={styles['help-text']}>직급을 선택하지 않으면 모든 직급이 대상입니다.</small>
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
function EditTargetModal({ targetGroup, onUpdate, onClose, branches }) {
  const [formData, setFormData] = useState({
    name: targetGroup.name,
    description: targetGroup.description,
    targetBranches: targetGroup.targetBranches || JSON.stringify([]),
    targetPositions: targetGroup.targetPositions || JSON.stringify([]),
    status: targetGroup.status || 'active'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 지점 선택 핸들러
  const handleBranchSelection = (branchName, isChecked) => {
    const currentBranches = JSON.parse(formData.targetBranches);
    let newBranches;

    if (branchName === '전체 지점') {
      if (isChecked) {
        // 전체 지점 선택 시 다른 모든 지점 선택 해제
        newBranches = ['전체 지점'];
      } else {
        newBranches = [];
      }
    } else {
      if (isChecked) {
        // 개별 지점 선택 시 전체 지점 선택 해제
        newBranches = currentBranches.filter(b => b !== '전체 지점');
        newBranches.push(branchName);
      } else {
        newBranches = currentBranches.filter(b => b !== branchName);
      }
    }

    setFormData(prev => ({
      ...prev,
      targetBranches: JSON.stringify(newBranches)
    }));
  };

  // 직급 선택 핸들러
  const handlePositionSelection = (position, isChecked) => {
    const currentPositions = JSON.parse(formData.targetPositions);
    let newPositions;

    if (position === '전체 직급') {
      if (isChecked) {
        // 전체 직급 선택 시 다른 모든 직급 선택 해제
        newPositions = ['전체 직급'];
      } else {
        newPositions = [];
      }
    } else {
      if (isChecked) {
        // 개별 직급 선택 시 전체 직급 선택 해제
        newPositions = currentPositions.filter(p => p !== '전체 직급');
        newPositions.push(position);
      } else {
        newPositions = currentPositions.filter(p => p !== position);
      }
    }

    setFormData(prev => ({
      ...prev,
      targetPositions: JSON.stringify(newPositions)
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
            <label>대상 지점 선택 (선택사항)</label>
            <div className={styles['checkbox-group']}>
              {/* 전체 지점 옵션 */}
              <label className={`${styles['checkbox-item']} ${styles['all-option']}`}>
                <input
                  type="checkbox"
                  checked={JSON.parse(formData.targetBranches).includes('전체 지점')}
                  onChange={(e) => handleBranchSelection('전체 지점', e.target.checked)}
                />
                <strong>전체 지점</strong>
              </label>

              {/* 개별 지점들 */}
              {branches.map(branch => {
                const isSelected = JSON.parse(formData.targetBranches).includes(branch.branchName);
                return (
                  <label key={branch.id} className={styles['checkbox-item']}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleBranchSelection(branch.branchName, e.target.checked)}
                    />
                    {branch.branchName}
                  </label>
                );
              })}
            </div>
            <small className={styles['help-text']}>지점을 선택하지 않으면 모든 지점이 대상입니다.</small>
          </div>

          <div className={styles['form-group']}>
            <label>대상 직급 선택 (선택사항)</label>
            <div className={styles['checkbox-group']}>
              {/* 전체 직급 옵션 */}
              <label className={`${styles['checkbox-item']} ${styles['all-option']}`}>
                <input
                  type="checkbox"
                  checked={JSON.parse(formData.targetPositions).includes('전체 직급')}
                  onChange={(e) => handlePositionSelection('전체 직급', e.target.checked)}
                />
                <strong>전체 직급</strong>
              </label>

              {/* 개별 직급들 */}
              {noticeTargetService.getPositionOptions().map(option => {
                const isSelected = JSON.parse(formData.targetPositions).includes(option.value);
                return (
                  <label key={option.value} className={styles['checkbox-item']}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handlePositionSelection(option.value, e.target.checked)}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
            <small className={styles['help-text']}>직급을 선택하지 않으면 모든 직급이 대상입니다.</small>
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
            <span>{targetGroup.targetBranches ? JSON.parse(targetGroup.targetBranches).join(', ') : '-'}</span>
          </div>
          <div className={styles['detail-row']}>
            <label>대상 직원:</label>
            <span>{targetGroup.targetPositions ? JSON.parse(targetGroup.targetPositions).join(', ') : '-'}</span>
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