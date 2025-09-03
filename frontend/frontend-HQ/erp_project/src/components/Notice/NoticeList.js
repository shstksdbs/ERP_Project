import React, { useState, useEffect } from 'react';
import styles from './NoticeList.module.css';
import { noticeService } from '../../services/noticeService';
import searchIcon from '../../assets/search_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import noticeIcon from '../../assets/notice_icon.png';

export default function NoticeList({ setActiveTab }) {
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showEditNoticeModal, setShowEditNoticeModal] = useState(false);
  const [showNoticeDetailModal, setShowNoticeDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 공지사항 목록 로드
  useEffect(() => {
    loadNotices();
  }, [selectedCategory, selectedStatus, searchTerm]);

  const loadNotices = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        category: selectedCategory !== 'all' ? selectedCategory : null,
        status: selectedStatus !== 'all' ? selectedStatus : null,
        searchTerm: searchTerm || null,
        page: 0,
        size: 20,
        sortBy: 'createdAt',
        sortDir: 'desc'
      };
      
      const response = await noticeService.getNotices(params);
      setNotices(response.content || []);
    } catch (error) {
      setError('공지사항 목록을 불러오는데 실패했습니다.');
      console.error('공지사항 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNotice = (updatedNotice) => {
    // 공지사항 수정 후 목록 새로고침
    loadNotices();
    setShowEditNoticeModal(false);
  };

  const handleDeleteNotice = async (noticeId) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      try {
        await noticeService.deleteNotice(noticeId);
        // 삭제 후 목록 새로고침
        loadNotices();
      } catch (error) {
        setError('공지사항 삭제에 실패했습니다.');
        console.error('공지사항 삭제 실패:', error);
      }
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  // 필터링된 공지사항 목록
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = !searchTerm || 
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className={styles['notice-list']}>
      <div className={styles['notice-list-header']}>
        <h1>공지사항 목록</h1>
      </div>

      <div className={styles['filter-section']}>
        <div className={styles['search-filters']}>
          <div className={styles['search-box']}>
            <img src={searchIcon} alt="검색" className={styles['search-icon']} />
            <input
              type="text"
              placeholder="제목 또는 내용으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* <select className={styles['filter-select']}
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

          <select className={styles['filter-select']}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">전체 상태</option>
            <option value="draft">임시저장</option>
            <option value="published">발행</option>
            <option value="scheduled">예약발행</option>
          </select> */}
          
        </div>
        <div className={styles['button-group']}>
          <button
            className={styles['refresh-btn']}
            onClick={loadNotices}
            disabled={loading}
          >
            새로고침
          </button>
          <button
            className={styles['add-notice-btn']}
            onClick={() => {
              if (setActiveTab) {
                setActiveTab(['notice', 'notice-register']);
              }
            }}
          >
            공지 등록
          </button>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className={styles['error-message']}>
          {error}
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className={styles['loading-message']}>
          공지사항을 불러오는 중...
        </div>
      )}

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
              <th>작성일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredNotices.length === 0 ? (
              <tr>
                <td colSpan="8" className={styles['no-data']}>
                  등록된 공지사항이 없습니다.
                </td>
              </tr>
            ) : (
              filteredNotices.map((notice, index) => (
              <tr key={notice.id}>
                <td>{index + 1}</td>
                <td className={styles['notice-title']}>
                  {notice.isImportant && <span className={styles['important-mark']}>★</span>}
                  {notice.title}
                </td>
                <td>{getCategoryText(notice.category)}</td>
                <td>
                  {getPriorityText(notice.priority)}
                </td>
                <td>
                  {notice.authorRealName || '알 수 없음'}
                  {notice.authorEmail && (
                    <div className={styles['author-email']}>
                      {notice.authorEmail}
                    </div>
                  )}
                </td>
                <td>{notice.viewCount}</td>
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
                      상세
                    </button>
                    <button
                      className={`btn btn-small btn-primary ${styles['edit-btn']}`}
                      onClick={() => {
                        setSelectedNotice(notice);
                        setShowEditNoticeModal(true);
                      }}
                    >
                      수정
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
              ))
            )}
          </tbody>
        </table>
      </div>

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

// 공지 수정 모달
function EditNoticeModal({ notice, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    title: notice.title,
    content: notice.content,
    category: notice.category,
    priority: notice.priority,
    status: notice.status,
    isImportant: notice.isImportant,
    isPublic: notice.isPublic
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attachments, setAttachments] = useState(notice.attachments || []);
  const [newFiles, setNewFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewFiles(prev => [...prev, ...files]);
  };

  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeAttachment = async (attachmentId) => {
    try {
      await noticeService.deleteFile(attachmentId);
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    } catch (error) {
      console.error('첨부파일 삭제 실패:', error);
      setError('첨부파일 삭제에 실패했습니다.');
    }
  };

  const handleDownloadAttachment = async (attachmentId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/files/download/${attachmentId}`);
      if (!response.ok) {
        throw new Error('다운로드 실패');
      }
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'attachment';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('첨부파일 다운로드 실패:', error);
      alert('첨부파일 다운로드에 실패했습니다.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // 백엔드 API 형식에 맞게 데이터 구성
      const updateData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        isImportant: formData.isImportant,
        isPublic: formData.isPublic,
        targetGroupIds: notice.targetGroups ? notice.targetGroups.map(tg => tg.targetGroupId) : []
      };

      // 공지사항 기본 정보 수정
      await noticeService.updateNotice(notice.id, updateData);

      // 새 파일들 업로드
      if (newFiles.length > 0) {
        for (const file of newFiles) {
          await noticeService.uploadFile(notice.id, file);
        }
      }

      setSuccess('공지사항이 성공적으로 수정되었습니다.');
      
      // 1초 후 모달 닫기
      setTimeout(() => {
    onUpdate({ ...notice, ...formData });
      }, 1000);
    } catch (error) {
      setError('공지사항 수정에 실패했습니다.');
      console.error('공지사항 수정 실패:', error);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>공지사항 수정</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        
        {error && (
          <div className={styles['error-message']}>
            {error}
          </div>
        )}
        
        {success && (
          <div className={styles['success-message']}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['form-section']}>
            <h3>기본 정보</h3>
          <div className={styles['form-group']}>
            <label>제목 *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
                className={styles['form-input']}
            />
          </div>
            
          <div className={styles['form-group']}>
            <label>내용 *</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
                className={styles['form-textarea']}
                rows={8}
            />
            </div>
          </div>

          <div className={styles['form-section']}>
            <h3>분류 및 설정</h3>
                      <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label>카테고리 *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className={styles['form-select']}
                >
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
                  className={styles['form-select']}
                >
                  <option value="low">낮음</option>
                  <option value="normal">보통</option>
                  <option value="high">높음</option>
                  <option value="urgent">긴급</option>
                </select>
              </div>

              <div className={styles['form-group']}>
                <label>상태</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={styles['form-select']}
                >
                  <option value="draft">임시저장</option>
                  <option value="published">발행</option>
                  <option value="scheduled">예약발행</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles['form-section']}>
            <h3>옵션 설정</h3>
          <div className={styles['checkbox-group']}>
            <label className={styles['checkbox-label']}>
              <input
                type="checkbox"
                name="isImportant"
                checked={formData.isImportant}
                onChange={handleInputChange}
              />
                <span className={styles['checkbox-text']}>★ 중요 공지로 설정</span>
            </label>
              
            <label className={styles['checkbox-label']}>
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
              />
                <span className={styles['checkbox-text']}>공개 공지 (모든 지점에서 볼 수 있음)</span>
              </label>
            </div>
          </div>

          <div className={styles['form-section']}>
            <h3>첨부파일 관리</h3>
            
            {/* 기존 첨부파일 */}
            {attachments.length > 0 && (
              <div className={styles['existing-attachments']}>
                <h4>기존 첨부파일</h4>
                <div className={styles['attachments-list']}>
                  {attachments.map((attachment, index) => (
                    <div key={attachment.id || index} className={styles['attachment-item']}>
                      <div className={styles['attachment-info']}>
                        <span className={styles['attachment-name']}>{attachment.originalFilename}</span>
                        <div className={styles['attachment-details']}>
                          <span className={styles['attachment-size']}>
                            {(attachment.fileSize / 1024).toFixed(1)} KB
                          </span>
                          <span className={styles['attachment-type']}>
                            {attachment.fileType || '파일'}
                          </span>
                        </div>
                      </div>
                      <div className={styles['attachment-actions']}>
                        <button
                          type="button"
                          className={styles['download-button']}
                          onClick={() => handleDownloadAttachment(attachment.id)}
                          title="다운로드"
                        >
                          다운로드
                        </button>
                        <button
                          type="button"
                          className={styles['delete-button']}
                          onClick={() => removeAttachment(attachment.id)}
                          title="삭제"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 새 파일 업로드 */}
            <div className={styles['file-upload-section']}>
              <h4>새 파일 추가</h4>
              <div className={styles['file-input-wrapper']}>
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileChange}
                  className={styles['file-input']}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                />
                <label htmlFor="file-upload" className={styles['file-input-label']}>
                  📁 파일 선택
            </label>
              </div>
              
              {/* 선택된 새 파일들 */}
              {newFiles.length > 0 && (
                <div className={styles['new-files-list']}>
                  <h5>추가할 파일들:</h5>
                  {newFiles.map((file, index) => (
                    <div key={index} className={styles['new-file-item']}>
                      <span className={styles['new-file-name']}>{file.name}</span>
                      <span className={styles['new-file-size']}>
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        className={styles['remove-file-button']}
                        onClick={() => removeNewFile(index)}
                        title="제거"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles['modal-actions']}>
            <button 
              type="button" 
              onClick={onClose} 
              className={`btn btn-secondary ${styles['cancel-btn']}`}
              disabled={loading}
            >
              취소
            </button>
            <button 
              type="submit" 
              className={`btn btn-primary ${styles['submit-btn']}`}
              disabled={loading}
            >
              {loading ? (uploading ? '파일 업로드 중...' : '수정 중...') : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 공지 상세 모달
function NoticeDetailModal({ notice, onClose }) {
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
    switch (priority) {
      case 'urgent': return styles['priority-urgent'];
      case 'high': return styles['priority-high'];
      case 'normal': return styles['priority-normal'];
      case 'low': return styles['priority-low'];
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'published': return styles['status-published'];
      case 'scheduled': return styles['status-scheduled'];
      case 'draft': return styles['status-draft'];
      default: return '';
    }
  };

  const handleDownloadAttachment = async (attachmentId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/files/download/${attachmentId}`);
      if (!response.ok) {
        throw new Error('다운로드 실패');
      }
      
      // 응답에서 파일명 추출
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'attachment';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Blob으로 변환하여 다운로드
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('첨부파일 다운로드 실패:', error);
      alert('첨부파일 다운로드에 실패했습니다.');
    }
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>공지사항 상세 정보</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        <div className={styles['notice-detail']}>
          <div className={styles['detail-section']}>
            <h3>기본 정보</h3>
            <div className={styles['detail-grid']}>
              <div className={styles['detail-item']}>
                <label>제목:</label>
                <span className={styles['notice-title']}>{notice.title}</span>
              </div>
              <div className={styles['detail-item']}>
                <label>카테고리:</label>
                <span className={`${styles['category-badge']} ${styles[`category-${notice.category}`]}`}>
                  {getCategoryText(notice.category)}
                </span>
              </div>
              <div className={styles['detail-item']}>
                <label>작성자:</label>
                <span>{notice.authorRealName || '알 수 없음'}</span>
                {notice.authorEmail && (
                  <span className={styles['author-email']}>({notice.authorEmail})</span>
                )}
              </div>
              <div className={styles['detail-item']}>
                <label>우선순위:</label>
                <span className={`${styles['priority-badge']} ${getPriorityClass(notice.priority)}`}>
                  {getPriorityText(notice.priority)}
                </span>
              </div>
              <div className={styles['detail-item']}>
                <label>상태:</label>
                <span className={`${styles['status-badge']} ${getStatusClass(notice.status)}`}>
                  {getStatusText(notice.status)}
                </span>
              </div>
              <div className={styles['detail-item']}>
                <label>중요도:</label>
                <span className={styles['importance-indicator']}>
                  {notice.isImportant ? '★ 중요' : '일반'}
                </span>
              </div>
              <div className={styles['detail-item']}>
                <label>공개 여부:</label>
                <span className={styles['public-indicator']}>
                  {notice.isPublic ? '공개' : '비공개'}
                </span>
              </div>
              <div className={styles['detail-item']}>
                <label>조회수:</label>
                <span className={styles['view-count']}>{notice.viewCount || 0}회</span>
            </div>
              <div className={styles['detail-item']}>
                <label>작성일:</label>
                <span>{new Date(notice.createdAt).toLocaleString('ko-KR')}</span>
            </div>
              <div className={styles['detail-item']}>
                <label>수정일:</label>
                <span>{new Date(notice.updatedAt).toLocaleString('ko-KR')}</span>
            </div>
              {notice.startDate && (
                <div className={styles['detail-item']}>
                  <label>발행일:</label>
                  <span>{new Date(notice.startDate).toLocaleString('ko-KR')}</span>
            </div>
              )}
              {notice.endDate && (
                <div className={styles['detail-item']}>
                  <label>종료일:</label>
                  <span>{new Date(notice.endDate).toLocaleString('ko-KR')}</span>
            </div>
              )}
            </div>
          </div>
          
          {notice.targetGroups && notice.targetGroups.length > 0 && (
            <div className={styles['detail-section']}>
              <h3>대상 그룹</h3>
              <div className={styles['target-groups-list']}>
                {notice.targetGroups.map((mapping, index) => (
                  <div key={index} className={styles['target-group-item']}>
                    {mapping.targetGroup && (
                      <div className={styles['target-group-info']}>
                        <span className={styles['target-group-name']}>{mapping.targetGroup.name}</span>
                        <span className={styles['target-group-description']}>
                          {mapping.targetGroup.description}
                        </span>
                        <span className={styles['target-group-member-count']}>
                          대상 인원: {mapping.targetGroup.memberCount}명
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className={styles['detail-section']}>
            <h3>내용</h3>
            <div className={styles['description']}>
              {notice.content}
            </div>
          </div>
          
          {notice.attachments && notice.attachments.length > 0 && (
            <div className={styles['detail-section']}>
              <h3>첨부파일 ({notice.attachments.length}개)</h3>
              <div className={styles['attachments-list']}>
                {notice.attachments.map((attachment, index) => (
                  <div key={attachment.id || index} className={styles['attachment-item']}>
                    <div className={styles['attachment-info']}>
                      <span className={styles['attachment-name']}>{attachment.originalFilename}</span>
                      <div className={styles['attachment-details']}>
                        <span className={styles['attachment-size']}>
                          {(attachment.fileSize / 1024).toFixed(1)} KB
                        </span>
                        <span className={styles['attachment-type']}>
                          {attachment.fileType || '파일'}
                        </span>
                        {attachment.downloadCount > 0 && (
                          <span className={styles['download-count']}>
                            다운로드 {attachment.downloadCount}회
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className={styles['download-button']}
                      onClick={() => handleDownloadAttachment(attachment.id)}
                      title="다운로드"
                    >
                      다운로드
                    </button>
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