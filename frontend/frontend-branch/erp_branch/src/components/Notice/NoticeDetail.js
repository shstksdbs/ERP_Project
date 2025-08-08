import React, { useState, useEffect } from 'react';
import styles from './NoticeDetail.module.css';
import noticeIcon from '../../assets/notice_icon.png';
import userIcon from '../../assets/user_icon.png';
import calendarIcon from '../../assets/calendar_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import searchIcon from '../../assets/search_icon.png';

export default function NoticeDetail() {
  const [activeTab, setActiveTab] = useState('notice-detail');
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddNoticeModal, setShowAddNoticeModal] = useState(false);
  const [showEditNoticeModal, setShowEditNoticeModal] = useState(false);
  const [showNoticeDetailModal, setShowNoticeDetailModal] = useState(false);

  // 샘플 데이터
  useEffect(() => {
    const sampleNotices = [
      {
        id: 1,
        title: '월간 매장 점검 안내',
        content: '이번 달 매장 점검이 예정되어 있습니다. 모든 직원분들께서는 점검 일정을 확인해 주시기 바랍니다.',
        category: '공지사항',
        author: '관리자',
        status: 'active',
        priority: 'high',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        targetAudience: '전체 직원',
        attachments: ['점검일정표.pdf', '체크리스트.xlsx']
      },
      {
        id: 2,
        title: '신규 메뉴 출시 안내',
        content: '새로운 시즌 메뉴가 출시됩니다. 메뉴 교육이 예정되어 있으니 참고해 주시기 바랍니다.',
        category: '제품안내',
        author: '제품팀',
        status: 'active',
        priority: 'medium',
        createdAt: '2024-01-14',
        updatedAt: '2024-01-14',
        targetAudience: '매장 직원',
        attachments: ['신메뉴가이드.pdf']
      },
      {
        id: 3,
        title: '시스템 점검 공지',
        content: '시스템 점검이 예정되어 있습니다. 점검 시간 동안 서비스 이용이 제한될 수 있습니다.',
        category: '시스템',
        author: 'IT팀',
        status: 'active',
        priority: 'high',
        createdAt: '2024-01-13',
        updatedAt: '2024-01-13',
        targetAudience: '전체 직원',
        attachments: ['점검일정.xlsx']
      },
      {
        id: 4,
        title: '안전 교육 실시',
        content: '월간 안전 교육이 실시됩니다. 모든 직원분들께서는 필수 참석해 주시기 바랍니다.',
        category: '교육',
        author: '인사팀',
        status: 'active',
        priority: 'high',
        createdAt: '2024-01-12',
        updatedAt: '2024-01-12',
        targetAudience: '전체 직원',
        attachments: ['안전교육자료.pdf', '교육일정.xlsx']
      }
    ];

    setNotices(sampleNotices);
  }, []);

  const handleAddNotice = (newNotice) => {
    const noticeWithId = {
      ...newNotice,
      id: notices.length + 1,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setNotices([...notices, noticeWithId]);
    setShowAddNoticeModal(false);
  };

  const handleEditNotice = (updatedNotice) => {
    setNotices(notices.map(notice => 
      notice.id === updatedNotice.id 
        ? { ...updatedNotice, updatedAt: new Date().toISOString().split('T')[0] }
        : notice
    ));
    setShowEditNoticeModal(false);
  };

  const handleDeleteNotice = (noticeId) => {
    setNotices(notices.filter(notice => notice.id !== noticeId));
  };

  const handleNoticeClick = (notice) => {
    setSelectedNotice(notice);
    setShowNoticeDetailModal(true);
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '알 수 없음';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      case 'low': return styles.priorityLow;
      default: return '';
    }
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

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || notice.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalNotices = notices.length;
  const activeNotices = notices.filter(n => n.status === 'active').length;
  const highPriorityNotices = notices.filter(n => n.priority === 'high').length;
  const recentNotices = notices.filter(n => {
    const noticeDate = new Date(n.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return noticeDate >= weekAgo;
  }).length;

  return (
    <div className={styles.noticeDetail}>
      <div className={styles.noticeDetailHeader}>
        <h1>공지사항 상세 관리</h1>
        <p>공지사항의 상세 내용을 관리하고 모니터링할 수 있습니다.</p>
      </div>


      {/* 공지사항 상세 관리 섹션 */}
      <div className={styles.noticeDetailManagement}>
        {/* 요약 카드 */}
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <img src={noticeIcon} alt="공지사항" />
            </div>
            <div className={styles.summaryContent}>
              <h3>총 공지사항</h3>
              <p>{totalNotices}개</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <img src={userIcon} alt="활성" />
            </div>
            <div className={styles.summaryContent}>
              <h3>활성 공지사항</h3>
              <p>{activeNotices}개</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <img src={calendarIcon} alt="최근" />
            </div>
            <div className={styles.summaryContent}>
              <h3>최근 7일</h3>
              <p>{recentNotices}개</p>
            </div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryIcon}>
              <img src={noticeIcon} alt="우선순위" />
            </div>
            <div className={styles.summaryContent}>
              <h3>높은 우선순위</h3>
              <p>{highPriorityNotices}개</p>
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
                placeholder="제목 또는 내용으로 검색..."
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
              <option value="공지사항">공지사항</option>
              <option value="제품안내">제품안내</option>
              <option value="시스템">시스템</option>
              <option value="교육">교육</option>
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
            onClick={() => setShowAddNoticeModal(true)}
          >
            <img src={plusIcon} alt="추가" className={styles.buttonIcon} />
            공지사항 추가
          </button>
        </div>

        {/* 공지사항 상세 테이블 */}
        <div className={styles.noticesContainer}>
          <div className={styles.noticesList}>
            <table className={styles.noticesTable}>
              <thead className={styles.noticesTableHeader}>
                <tr>
                  <th>제목</th>
                  <th>카테고리</th>
                  <th>작성자</th>
                  <th>우선순위</th>
                  <th>상태</th>
                  <th>대상</th>
                  <th>작성일</th>
                  <th>첨부파일</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotices.map(notice => (
                  <tr key={notice.id} onClick={() => handleNoticeClick(notice)} className={styles.tableRow}>
                    <td>
                      <div className={styles.noticeInfo}>
                        <div className={styles.noticeTitle}>{notice.title}</div>
                        <div className={styles.noticeContent}>{notice.content.substring(0, 50)}...</div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.categoryBadge} ${styles[`category-${notice.category}`]}`}>
                        {notice.category}
                      </span>
                    </td>
                    <td>{notice.author}</td>
                    <td>
                      <span className={`${styles.priorityBadge} ${getPriorityClass(notice.priority)}`}>
                        {getPriorityText(notice.priority)}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(notice.status)}`}>
                        {getStatusText(notice.status)}
                      </span>
                    </td>
                    <td>{notice.targetAudience}</td>
                    <td>{notice.createdAt}</td>
                    <td>
                      {notice.attachments && notice.attachments.length > 0 ? (
                        <span className={styles.attachmentCount}>
                          {notice.attachments.length}개
                        </span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.btnSmall}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNoticeClick(notice);
                          }}
                        >
                          상세
                        </button>
                        <button
                          className={styles.btnSmall}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotice(notice);
                            setShowEditNoticeModal(true);
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
      </div>

      {/* 모달들 */}
      {showAddNoticeModal && (
        <AddNoticeModal
          onAdd={handleAddNotice}
          onClose={() => setShowAddNoticeModal(false)}
        />
      )}

      {showEditNoticeModal && selectedNotice && (
        <EditNoticeModal
          notice={selectedNotice}
          onUpdate={handleEditNotice}
          onClose={() => setShowEditNoticeModal(false)}
        />
      )}

      {showNoticeDetailModal && selectedNotice && (
        <NoticeDetailModal
          notice={selectedNotice}
          onClose={() => setShowNoticeDetailModal(false)}
        />
      )}
    </div>
  );
}

// 공지사항 추가 모달
function AddNoticeModal({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '공지사항',
    author: '',
    priority: 'medium',
    status: 'active',
    targetAudience: '전체 직원',
    attachments: []
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
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
          <h2>공지사항 추가</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>제목</label>
              <input
                type="text"
                name="title"
                value={formData.title}
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
                <option value="공지사항">공지사항</option>
                <option value="제품안내">제품안내</option>
                <option value="시스템">시스템</option>
                <option value="교육">교육</option>
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>작성자</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>우선순위</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
              >
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
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
              <label>대상</label>
              <select
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                required
              >
                <option value="전체 직원">전체 직원</option>
                <option value="매장 직원">매장 직원</option>
                <option value="관리자">관리자</option>
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>내용</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="6"
              required
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

// 공지사항 수정 모달
function EditNoticeModal({ notice, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    title: notice.title,
    content: notice.content,
    category: notice.category,
    author: notice.author,
    priority: notice.priority,
    status: notice.status,
    targetAudience: notice.targetAudience,
    attachments: notice.attachments || []
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...notice, ...formData });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>공지사항 수정</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>제목</label>
              <input
                type="text"
                name="title"
                value={formData.title}
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
                <option value="공지사항">공지사항</option>
                <option value="제품안내">제품안내</option>
                <option value="시스템">시스템</option>
                <option value="교육">교육</option>
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>작성자</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>우선순위</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
              >
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
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
              <label>대상</label>
              <select
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                required
              >
                <option value="전체 직원">전체 직원</option>
                <option value="매장 직원">매장 직원</option>
                <option value="관리자">관리자</option>
              </select>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>내용</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="6"
              required
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

// 공지사항 상세 모달
function NoticeDetailModal({ notice, onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>공지사항 상세 정보</h2>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <div className={styles.noticeDetail}>
          <div className={styles.detailSection}>
            <h3>기본 정보</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <label>제목:</label>
                <span>{notice.title}</span>
              </div>
              <div className={styles.detailItem}>
                <label>카테고리:</label>
                <span>{notice.category}</span>
              </div>
              <div className={styles.detailItem}>
                <label>작성자:</label>
                <span>{notice.author}</span>
              </div>
              <div className={styles.detailItem}>
                <label>우선순위:</label>
                <span>{notice.priority}</span>
              </div>
              <div className={styles.detailItem}>
                <label>상태:</label>
                <span>{notice.status}</span>
              </div>
              <div className={styles.detailItem}>
                <label>대상:</label>
                <span>{notice.targetAudience}</span>
              </div>
              <div className={styles.detailItem}>
                <label>작성일:</label>
                <span>{notice.createdAt}</span>
              </div>
              <div className={styles.detailItem}>
                <label>수정일:</label>
                <span>{notice.updatedAt}</span>
              </div>
            </div>
          </div>
          <div className={styles.detailSection}>
            <h3>내용</h3>
            <div className={styles.description}>
              {notice.content}
            </div>
          </div>
          {notice.attachments && notice.attachments.length > 0 && (
            <div className={styles.detailSection}>
              <h3>첨부파일</h3>
              <div className={styles.attachmentsList}>
                {notice.attachments.map((file, index) => (
                  <div key={index} className={styles.attachmentItem}>
                    {file}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
