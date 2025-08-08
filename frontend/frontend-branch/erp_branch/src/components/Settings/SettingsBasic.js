import React, { useState, useEffect } from 'react';
import styles from './SettingsBasic.module.css';
import settingIcon from '../../assets/setting_icon.png';
import userIcon from '../../assets/user_icon.png';
import storeIcon from '../../assets/store_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import searchIcon from '../../assets/search_icon.png';

export default function SettingsBasic() {
  const [activeTab, setActiveTab] = useState('company-info');
  const [settings, setSettings] = useState([]);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddSettingModal, setShowAddSettingModal] = useState(false);
  const [showEditSettingModal, setShowEditSettingModal] = useState(false);
  const [showSettingDetailModal, setShowSettingDetailModal] = useState(false);

  // 샘플 데이터
  useEffect(() => {
    const sampleSettings = [
      {
        id: 1,
        name: '회사명',
        value: '카페 ERP 시스템',
        category: '회사정보',
        type: 'text',
        status: 'active',
        description: '회사 기본 정보',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        required: true
      },
      {
        id: 2,
        name: '사업자등록번호',
        value: '123-45-67890',
        category: '회사정보',
        type: 'text',
        status: 'active',
        description: '사업자등록번호',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        required: true
      },
      {
        id: 3,
        name: '대표자명',
        value: '김대표',
        category: '회사정보',
        type: 'text',
        status: 'active',
        description: '회사 대표자명',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        required: true
      },
      {
        id: 4,
        name: '연락처',
        value: '02-1234-5678',
        category: '연락처',
        type: 'text',
        status: 'active',
        description: '회사 연락처',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        required: true
      },
      {
        id: 5,
        name: '이메일',
        value: 'contact@cafeerp.com',
        category: '연락처',
        type: 'email',
        status: 'active',
        description: '회사 이메일',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        required: true
      },
      {
        id: 6,
        name: '주소',
        value: '서울시 강남구 테헤란로 123',
        category: '주소',
        type: 'text',
        status: 'active',
        description: '회사 주소',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        required: true
      },
      {
        id: 7,
        name: '영업시간',
        value: '09:00-18:00',
        category: '운영정보',
        type: 'text',
        status: 'active',
        description: '기본 영업시간',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        required: false
      },
      {
        id: 8,
        name: '통화단위',
        value: 'KRW',
        category: '시스템',
        type: 'select',
        status: 'active',
        description: '기본 통화 단위',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        required: true
      }
    ];

    setSettings(sampleSettings);
  }, []);

  const handleAddSetting = (newSetting) => {
    const settingWithId = {
      ...newSetting,
      id: settings.length + 1,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setSettings([...settings, settingWithId]);
    setShowAddSettingModal(false);
  };

  const handleEditSetting = (updatedSetting) => {
    setSettings(settings.map(setting => 
      setting.id === updatedSetting.id 
        ? { ...updatedSetting, updatedAt: new Date().toISOString().split('T')[0] }
        : setting
    ));
    setShowEditSettingModal(false);
  };

  const handleDeleteSetting = (settingId) => {
    setSettings(settings.filter(setting => setting.id !== settingId));
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      case 'draft': return '임시저장';
      default: return '알 수 없음';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return styles.statusActive;
      case 'inactive': return styles.statusInactive;
      case 'draft': return styles.statusDraft;
      default: return '';
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'text': return '텍스트';
      case 'email': return '이메일';
      case 'number': return '숫자';
      case 'select': return '선택';
      case 'date': return '날짜';
      default: return '알 수 없음';
    }
  };

  const filteredSettings = settings.filter(setting => {
    const matchesSearch = setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.value.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || setting.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || setting.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalSettings = settings.length;
  const activeSettings = settings.filter(s => s.status === 'active').length;
  const requiredSettings = settings.filter(s => s.required).length;
  const recentSettings = settings.filter(s => {
    const settingDate = new Date(s.updatedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return settingDate >= weekAgo;
  }).length;

  return (
    <div className={styles.settingsBasic}>
      <div className={styles.settingsBasicHeader}>
        <h1>기본 설정 관리</h1>
        <p>시스템의 기본 설정을 관리하고 구성할 수 있습니다.</p>
      </div>

      {/* 탭 컨테이너 */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'company-info' ? styles.active : ''}`}
          onClick={() => setActiveTab('company-info')}
        >
          회사 정보
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'system-settings' ? styles.active : ''}`}
          onClick={() => setActiveTab('system-settings')}
        >
          시스템 설정
        </button>
      </div>

      {/* 설정 관리 섹션 */}
      <div className={styles.settingsManagement}>
        {/* 요약 카드 */}
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <img src={settingIcon} alt="설정" />
            </div>
            <div className={styles.summaryContent}>
              <h3>총 설정</h3>
              <p>{totalSettings}개</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <img src={userIcon} alt="활성" />
            </div>
            <div className={styles.summaryContent}>
              <h3>활성 설정</h3>
              <p>{activeSettings}개</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <img src={storeIcon} alt="필수" />
            </div>
            <div className={styles.summaryContent}>
              <h3>필수 설정</h3>
              <p>{requiredSettings}개</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <img src={settingIcon} alt="최근" />
            </div>
            <div className={styles.summaryContent}>
              <h3>최근 수정</h3>
              <p>{recentSettings}개</p>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className={styles.searchFilterContainer}>
          <div className={styles.searchBox}>
            <div className={styles.searchInputContainer}>
              <img src={searchIcon} alt="검색" className={styles.searchIcon} />
              <input
                type="text"
                placeholder="설정명 또는 값으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
          <div className={styles.filterBox}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">모든 카테고리</option>
              <option value="회사정보">회사정보</option>
              <option value="연락처">연락처</option>
              <option value="주소">주소</option>
              <option value="운영정보">운영정보</option>
              <option value="시스템">시스템</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="draft">임시저장</option>
            </select>
          </div>
          <button
            className={styles.addButton}
            onClick={() => setShowAddSettingModal(true)}
          >
            <img src={plusIcon} alt="추가" className={styles.buttonIcon} />
            설정 추가
          </button>
        </div>

        {/* 설정 테이블 */}
        <div className={styles.settingsContainer}>
          <table className={styles.settingsTable}>
            <thead>
              <tr>
                <th>설정명</th>
                <th>값</th>
                <th>카테고리</th>
                <th>타입</th>
                <th>상태</th>
                <th>필수</th>
                <th>설명</th>
                <th>수정일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredSettings.map(setting => (
                <tr key={setting.id}>
                  <td>
                    <div className={styles.settingInfo}>
                      <span className={styles.settingName}>{setting.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.settingValue}>{setting.value}</span>
                  </td>
                  <td>
                    <span className={`${styles.categoryBadge} ${styles[`category-${setting.category}`]}`}>
                      {setting.category}
                    </span>
                  </td>
                  <td>
                    <span className={styles.typeBadge}>
                      {getTypeText(setting.type)}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(setting.status)}`}>
                      {getStatusText(setting.status)}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.requiredBadge} ${setting.required ? styles.required : styles.optional}`}>
                      {setting.required ? '필수' : '선택'}
                    </span>
                  </td>
                  <td>{setting.description}</td>
                  <td>{setting.updatedAt}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.btnSmall}
                        onClick={() => {
                          setSelectedSetting(setting);
                          setShowSettingDetailModal(true);
                        }}
                      >
                        상세
                      </button>
                      <button
                        className={styles.btnSmall}
                        onClick={() => {
                          setSelectedSetting(setting);
                          setShowEditSettingModal(true);
                        }}
                      >
                        <img src={pencilIcon} alt="수정" className={styles.actionIcon} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 모달들 */}
      {showAddSettingModal && (
        <AddSettingModal
          onAdd={handleAddSetting}
          onClose={() => setShowAddSettingModal(false)}
        />
      )}

      {showEditSettingModal && selectedSetting && (
        <EditSettingModal
          setting={selectedSetting}
          onUpdate={handleEditSetting}
          onClose={() => setShowEditSettingModal(false)}
        />
      )}

      {showSettingDetailModal && selectedSetting && (
        <SettingDetailModal
          setting={selectedSetting}
          onClose={() => setShowSettingDetailModal(false)}
        />
      )}
    </div>
  );
}

// 설정 추가 모달
function AddSettingModal({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    category: '회사정보',
    type: 'text',
    status: 'active',
    description: '',
    required: false
  });

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>설정 추가</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>설정명</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>카테고리</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="회사정보">회사정보</option>
                <option value="연락처">연락처</option>
                <option value="주소">주소</option>
                <option value="운영정보">운영정보</option>
                <option value="시스템">시스템</option>
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>값</label>
              <input
                type="text"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>타입</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="text">텍스트</option>
                <option value="email">이메일</option>
                <option value="number">숫자</option>
                <option value="select">선택</option>
                <option value="date">날짜</option>
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>상태</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="draft">임시저장</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>필수 여부</label>
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  name="required"
                  checked={formData.required}
                  onChange={handleInputChange}
                />
                <span>필수 설정</span>
              </div>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit">추가</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 설정 수정 모달
function EditSettingModal({ setting, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    name: setting.name,
    value: setting.value,
    category: setting.category,
    type: setting.type,
    status: setting.status,
    description: setting.description,
    required: setting.required
  });

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...setting, ...formData });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>설정 수정</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>설정명</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>카테고리</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="회사정보">회사정보</option>
                <option value="연락처">연락처</option>
                <option value="주소">주소</option>
                <option value="운영정보">운영정보</option>
                <option value="시스템">시스템</option>
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>값</label>
              <input
                type="text"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>타입</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="text">텍스트</option>
                <option value="email">이메일</option>
                <option value="number">숫자</option>
                <option value="select">선택</option>
                <option value="date">날짜</option>
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>상태</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="draft">임시저장</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>필수 여부</label>
              <div className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  name="required"
                  checked={formData.required}
                  onChange={handleInputChange}
                />
                <span>필수 설정</span>
              </div>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>설명</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>
          <div className={styles.modalActions}>
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit">수정</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 설정 상세 모달
function SettingDetailModal({ setting, onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>설정 상세 정보</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <div className={styles.settingDetail}>
          <div className={styles.detailSection}>
            <h3>기본 정보</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <label>설정명:</label>
                <span>{setting.name}</span>
              </div>
              <div className={styles.detailItem}>
                <label>값:</label>
                <span>{setting.value}</span>
              </div>
              <div className={styles.detailItem}>
                <label>카테고리:</label>
                <span>{setting.category}</span>
              </div>
              <div className={styles.detailItem}>
                <label>타입:</label>
                <span>{setting.type}</span>
              </div>
              <div className={styles.detailItem}>
                <label>상태:</label>
                <span>{setting.status}</span>
              </div>
              <div className={styles.detailItem}>
                <label>필수 여부:</label>
                <span>{setting.required ? '필수' : '선택'}</span>
              </div>
              <div className={styles.detailItem}>
                <label>생성일:</label>
                <span>{setting.createdAt}</span>
              </div>
              <div className={styles.detailItem}>
                <label>수정일:</label>
                <span>{setting.updatedAt}</span>
              </div>
            </div>
          </div>
          <div className={styles.detailSection}>
            <h3>설명</h3>
            <div className={styles.description}>
              {setting.description || '설명이 없습니다.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
