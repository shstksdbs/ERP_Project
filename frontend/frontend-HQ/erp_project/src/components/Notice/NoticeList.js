import React, { useState, useEffect } from 'react';
import styles from './NoticeList.module.css';
import searchIcon from '../../assets/search_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import noticeIcon from '../../assets/notice_icon.png';

export default function NoticeList() {
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
        title: '시스템 점검 안내',
        content: '2024년 1월 25일 새벽 2시부터 4시까지 시스템 점검이 진행됩니다.',
        category: 'maintenance',
        priority: 'high',
        status: 'published',
        isImportant: true,
        isPublic: true,
        author: '관리자',
        viewCount: 156,
        startDate: '2024-01-25T02:00:00',
        endDate: '2024-01-25T04:00:00',
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20'
      },
      {
        id: 2,
        title: '신규 메뉴 출시 안내',
        content: '새로운 시즌 메뉴가 출시되었습니다. 많은 관심 부탁드립니다.',
        category: 'event',
        priority: 'normal',
        status: 'published',
        isImportant: false,
        isPublic: true,
        author: '마케팅팀',
        viewCount: 89,
        startDate: '2024-01-22T00:00:00',
        endDate: '2024-02-22T23:59:59',
        createdAt: '2024-01-18',
        updatedAt: '2024-01-18'
      },
      {
        id: 3,
        title: '직원 복지 개선 안내',
        content: '직원 복지 제도가 개선되었습니다. 자세한 내용은 인사팀에 문의하세요.',
        category: 'general',
        priority: 'normal',
        status: 'published',
        isImportant: false,
        isPublic: true,
        author: '인사팀',
        viewCount: 234,
        startDate: '2024-01-15T00:00:00',
        endDate: null,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15'
      },
      {
        id: 4,
        title: '긴급: 보안 업데이트',
        content: '보안 강화를 위한 시스템 업데이트가 완료되었습니다.',
        category: 'important',
        priority: 'urgent',
        status: 'published',
        isImportant: true,
        isPublic: true,
        author: 'IT팀',
        viewCount: 312,
        startDate: '2024-01-10T00:00:00',
        endDate: null,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-10'
      },
      {
        id: 5,
        title: '연말연시 영업시간 안내',
        content: '연말연시 기간 중 영업시간이 변경됩니다. 참고하시기 바랍니다.',
        category: 'general',
        priority: 'normal',
        status: 'scheduled',
        isImportant: false,
        isPublic: true,
        author: '운영팀',
        viewCount: 0,
        startDate: '2024-12-20T00:00:00',
        endDate: '2025-01-05T23:59:59',
        createdAt: '2024-01-05',
        updatedAt: '2024-01-05'
      }
    ];

    setNotices(sampleNotices);
  }, []);

  const handleAddNotice = (newNotice) => {
    const notice = {
      ...newNotice,
      id: notices.length + 1,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      viewCount: 0
    };
    setNotices([notice, ...notices]);
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

  const getCategoryText = (category) => {
    const categories = {
      general: '일반공지',
      important: '중요공지',
      event: '이벤트',
      maintenance: '점검공지',
      update: '업데이트'
    };
    return categories[category] || category;
  };

  const getPriorityText = (priority) => {
    const priorities = {
      low: '낮음',
      normal: '보통',
      high: '높음',
      urgent: '긴급'
    };
    return priorities[priority] || priority;
  };

  const getStatusText = (status) => {
    const statuses = {
      draft: '임시저장',
      published: '발행',
      scheduled: '예약발행'
    };
    return statuses[status] || status;
  };

  const getPriorityClass = (priority) => {
    if (priority === 'urgent') return styles['priority-urgent'];
    if (priority === 'high') return styles['priority-high'];
    return '';
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || notice.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className={styles['notice-list']}>
      <div className={styles['notice-list-header']}>
        <h1>공지 관리</h1>
        <button 
          className={styles['add-notice-btn']}
          onClick={() => setShowAddNoticeModal(true)}
        >
          <img src={plusIcon} alt="추가" />
          공지 등록
        </button>
      </div>

      <div className={styles['filter-section']}>
        <div className={styles['search-box']}>
          <img src={searchIcon} alt="검색" />
          <input
            type="text"
            placeholder="공지 제목 또는 내용으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles['filter-options']}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">전체 카테고리</option>
            <option value="general">일반공지</option>
            <option value="important">중요공지</option>
            <option value="event">이벤트</option>
            <option value="maintenance">점검공지</option>
            <option value="update">업데이트</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">전체 상태</option>
            <option value="draft">임시저장</option>
            <option value="published">발행</option>
            <option value="scheduled">예약발행</option>
          </select>
        </div>
      </div>

      <div className={styles['notice-table-container']}>
        <table className={styles['notice-table']}>
          <thead className={styles['notice-table-header']}>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>카테고리</th>
              <th>우선순위</th>
              <th>작성자</th>
              <th>조회수</th>
              <th>발행일</th>
              <th>작성일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotices.map((notice, index) => (
              <tr key={notice.id}>
                <td>{index + 1}</td>
                <td className={styles['notice-title']}>
                  {notice.isImportant && <span className={styles['important-mark']}>★</span>}
                  {notice.title}
                </td>
                <td>{getCategoryText(notice.category)}</td>
                <td className={getPriorityClass(notice.priority)}>
                  {getPriorityText(notice.priority)}
                </td>
                <td>{notice.author}</td>
                <td>{notice.viewCount}</td>
                <td>{formatDate(notice.startDate)}</td>
                <td>{formatDate(notice.createdAt)}</td>
                <td>
                  <div className={styles['action-buttons']}>
                    <button
                      className={`btn btn-small ${styles['view-btn']}`}
                      onClick={() => {
                        setSelectedNotice(notice);
                        setShowNoticeDetailModal(true);
                      }}
                    >
                      보기
                    </button>
                    <button
                      className={`btn btn-small ${styles['edit-btn']}`}
                      onClick={() => {
                        setSelectedNotice(notice);
                        setShowEditNoticeModal(true);
                      }}
                    >
                      <img src={pencilIcon} alt="수정" />
                    </button>
                    <button
                      className={`btn btn-small btn-danger ${styles['delete-btn']}`}
                      onClick={() => handleDeleteNotice(notice.id)}
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

// 공지 추가 모달
function AddNoticeModal({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    priority: 'normal',
    status: 'draft',
    startDate: '',
    endDate: '',
    isImportant: false,
    isPublic: true
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
          <h2>공지 등록</h2>
          <button onClick={onClose} className={styles['close-btn']}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label>제목 *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles['form-group']}>
            <label>내용 *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows="4"
            />
          </div>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>카테고리</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">선택하세요</option>
                <option value="general">일반공지</option>
                <option value="important">중요공지</option>
                <option value="event">이벤트</option>
                <option value="maintenance">점검공지</option>
                <option value="update">업데이트</option>
              </select>
            </div>
            <div className={styles['form-group']}>
              <label>우선순위</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">낮음</option>
                <option value="normal">보통</option>
                <option value="high">높음</option>
                <option value="urgent">긴급</option>
              </select>
            </div>
          </div>
          <div className={styles['modal-actions']}>
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit">등록</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 공지 수정 모달
function EditNoticeModal({ notice, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    title: notice.title,
    content: notice.content,
    category: notice.category,
    priority: notice.priority,
    status: notice.status,
    startDate: notice.startDate ? notice.startDate.split('T')[0] : '',
    endDate: notice.endDate ? notice.endDate.split('T')[0] : '',
    isImportant: notice.isImportant,
    isPublic: notice.isPublic
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...notice, ...formData });
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal']}>
        <div className={styles['modal-header']}>
          <h2>공지 수정</h2>
          <button onClick={onClose} className={styles['close-btn']}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles['form-group']}>
            <label>제목 *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles['form-group']}>
            <label>내용 *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows="4"
            />
          </div>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>카테고리</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">선택하세요</option>
                <option value="general">일반공지</option>
                <option value="important">중요공지</option>
                <option value="event">이벤트</option>
                <option value="maintenance">점검공지</option>
                <option value="update">업데이트</option>
              </select>
            </div>
            <div className={styles['form-group']}>
              <label>우선순위</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">낮음</option>
                <option value="normal">보통</option>
                <option value="high">높음</option>
                <option value="urgent">긴급</option>
              </select>
            </div>
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

// 공지 상세 모달
function NoticeDetailModal({ notice, onClose }) {
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal']}>
        <div className={styles['modal-header']}>
          <h2>공지 상세</h2>
          <button onClick={onClose} className={styles['close-btn']}>×</button>
        </div>
        <div className={styles['notice-detail']}>
          <div className={styles['detail-row']}>
            <label>제목:</label>
            <span>{notice.title}</span>
          </div>
          <div className={styles['detail-row']}>
            <label>내용:</label>
            <p>{notice.content}</p>
          </div>
          <div className={styles['detail-row']}>
            <label>카테고리:</label>
            <span>{notice.category}</span>
          </div>
          <div className={styles['detail-row']}>
            <label>우선순위:</label>
            <span>{notice.priority}</span>
          </div>
          <div className={styles['detail-row']}>
            <label>상태:</label>
            <span>{notice.status}</span>
          </div>
          <div className={styles['detail-row']}>
            <label>작성자:</label>
            <span>{notice.author}</span>
          </div>
          <div className={styles['detail-row']}>
            <label>조회수:</label>
            <span>{notice.viewCount}</span>
          </div>
          <div className={styles['detail-row']}>
            <label>발행일:</label>
            <span>{notice.startDate}</span>
          </div>
          <div className={styles['detail-row']}>
            <label>작성일:</label>
            <span>{notice.createdAt}</span>
          </div>
        </div>
        <div className={styles['modal-actions']}>
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
} 