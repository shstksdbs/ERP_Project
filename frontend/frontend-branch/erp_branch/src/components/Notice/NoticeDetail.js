import React, { useState, useEffect } from 'react';
import styles from './NoticeDetail.module.css';
import { noticeService } from '../../services/noticeService';
import noticeIcon from '../../assets/notice_icon.png';
import userIcon from '../../assets/user_icon.png';
import calendarIcon from '../../assets/calendar_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import searchIcon from '../../assets/search_icon.png';

export default function NoticeDetail({ loginData, branchId }) {
  const [activeTab, setActiveTab] = useState('notice-detail');
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
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
        branchId: branchId || null,
        page: 0,
        size: 50,
        sortBy: 'createdAt',
        sortDir: 'desc'
      };
      
      const response = await noticeService.getNotices(params);
      console.log('공지사항 응답:', response); // 디버깅용 로그
      setNotices(response.content || []);
    } catch (error) {
      setError('공지사항 목록을 불러오는데 실패했습니다.');
      console.error('공지사항 로드 실패:', error);
      
      // JSON 파싱 오류인 경우 더 자세한 정보 출력
      if (error.message && error.message.includes('JSON')) {
        console.error('JSON 파싱 오류 상세:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeClick = async (notice) => {
    try {
      // 조회수 증가
      await noticeService.incrementViewCount(notice.id);
      // 읽음 상태 업데이트 (실제 사용자 ID 사용)
      const userId = loginData?.id || 1; // loginData.id가 없으면 기본값 1 사용
      await noticeService.markAsRead(notice.id, userId);
      // 목록 새로고침
      loadNotices();
    } catch (error) {
      console.error('조회수 증가 실패:', error);
    }
    
    setSelectedNotice(notice);
    setShowNoticeDetailModal(true);
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

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'urgent': return styles['priority-urgent'];
      case 'high': return styles['priority-high'];
      case 'normal': return styles['priority-normal'];
      case 'low': return styles['priority-low'];
      default: return '';
    }
  };

  const getStatusText = (status) => {
    const statuses = {
      draft: '임시저장',
      published: '발행',
      scheduled: '예약발행'
    };
    return statuses[status] || status;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'published': return styles['status-published'];
      case 'scheduled': return styles['status-scheduled'];
      case 'draft': return styles['status-draft'];
      default: return '';
    }
  };

  const getTargetAudienceText = (notice) => {
    // 공지사항에 대상 그룹 매핑 정보가 있는 경우
    if (notice.targetGroups && notice.targetGroups.length > 0) {
      const targetMapping = notice.targetGroups[0]; // 첫 번째 대상 그룹 매핑 사용
      
      // targetMapping.targetGroup이 있는지 확인
      if (targetMapping.targetGroup) {
        try {
          const targetGroup = targetMapping.targetGroup;
          
          // targetBranches와 targetPositions를 파싱
          let branches = [];
          let positions = [];
          
          if (targetGroup.targetBranches) {
            try {
              // 문자열인지 확인
              if (typeof targetGroup.targetBranches === 'string') {
                // JSON 배열인지 확인
                if (targetGroup.targetBranches.startsWith('[') && targetGroup.targetBranches.endsWith(']')) {
                  branches = JSON.parse(targetGroup.targetBranches);
                } else {
                  // 단순 문자열인 경우 (예: "전체 지점", "강남점")
                  if (targetGroup.targetBranches === '전체 지점' || targetGroup.targetBranches.includes('전체')) {
                    branches = []; // 빈 배열은 전체 지점을 의미
                  } else {
                    branches = [targetGroup.targetBranches]; // 단일 지점을 배열로 변환
                  }
                }
              } else if (Array.isArray(targetGroup.targetBranches)) {
                // 이미 배열인 경우
                branches = targetGroup.targetBranches;
              } else {
                // 기타 타입인 경우 빈 배열로 처리
                branches = [];
              }
            } catch (e) {
              console.error('targetBranches 파싱 오류:', e);
              // 파싱 실패 시 빈 배열로 처리
              branches = [];
            }
          }
          
          if (targetGroup.targetPositions) {
            try {
              // 문자열인지 확인
              if (typeof targetGroup.targetPositions === 'string') {
                // JSON 배열인지 확인
                if (targetGroup.targetPositions.startsWith('[') && targetGroup.targetPositions.endsWith(']')) {
                  positions = JSON.parse(targetGroup.targetPositions);
                } else {
                  // 단순 문자열인 경우 (예: "전체 직급", "MANAGER")
                  if (targetGroup.targetPositions === '전체 직급' || targetGroup.targetPositions.includes('전체')) {
                    positions = []; // 빈 배열은 전체 직급을 의미
                  } else {
                    positions = [targetGroup.targetPositions]; // 단일 직급을 배열로 변환
                  }
                }
              } else if (Array.isArray(targetGroup.targetPositions)) {
                // 이미 배열인 경우
                positions = targetGroup.targetPositions;
              } else {
                // 기타 타입인 경우 빈 배열로 처리
                positions = [];
              }
            } catch (e) {
              console.error('targetPositions 파싱 오류:', e);
              // 파싱 실패 시 빈 배열로 처리
              positions = [];
            }
          }
          
          // 전체 대상인 경우 (모든 지점과 모든 직급)
          if (branches.length === 0 && positions.length === 0) {
            return '전체 직원';
          }
          
          // 특정 지점만 선택된 경우 (모든 지점 + 특정 직급)
          if (branches.length === 0 && positions.length > 0) {
            const positionTexts = positions.map(pos => {
              const positionMap = {
                'MANAGER': '매니저',
                'STAFF': '직원'
              };
              return positionMap[pos] || pos;
            });
            return `전체 지점(${positionTexts.join(', ')})`;
          }
          
          // 특정 지점과 직급이 선택된 경우
          if (branches.length > 0) {
            if (positions.length === 0) {
              return `${branches.join(', ')} - 전체 직급`;
            } else {
              const positionTexts = positions.map(pos => {
                const positionMap = {
                  'MANAGER': '매니저',
                  'STAFF': '직원'
                };
                return positionMap[pos] || pos;
              });
              return `${branches.join(', ')}(${positionTexts.join(', ')})`;
            }
          }
          
          // 기본값
          return '선택된 대상';
        } catch (error) {
          console.error('대상 그룹 파싱 오류:', error);
          return '전체 직원';
        }
      }
    }
    
    // 대상 그룹 정보가 없는 경우 기본값
    return '전체 직원';
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || notice.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || notice.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalNotices = notices.length;
  const activeNotices = notices.filter(n => n.status === 'published').length;
  const highPriorityNotices = notices.filter(n => n.priority === 'high' || n.priority === 'urgent').length;
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

        {/* 에러 메시지 */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

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
              <option value="general">일반공지</option>
              <option value="important">중요공지</option>
              <option value="event">이벤트</option>
              <option value="maintenance">점검공지</option>
              <option value="update">업데이트</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">모든 상태</option>
              <option value="published">발행</option>
              <option value="scheduled">예약발행</option>
              <option value="draft">임시저장</option>
            </select>
          </div>
          <button
            className={styles.addButton}
            onClick={loadNotices}
            disabled={loading}
          >
            새로고침
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
                {loading ? (
                  <tr>
                    <td colSpan="9" className={styles.loadingMessage}>
                      공지사항을 불러오는 중...
                    </td>
                  </tr>
                ) : filteredNotices.length === 0 ? (
                  <tr>
                    <td colSpan="9" className={styles.noDataMessage}>
                      등록된 공지사항이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredNotices.map(notice => (
                  <tr key={notice.id} onClick={() => handleNoticeClick(notice)} className={styles.tableRow}>
                    <td>
                      <div className={styles.noticeInfo}>
                          <div className={styles.noticeTitle}>
                            {notice.isImportant && <span className={styles.importantMark}>★</span>}
                            {notice.title}
                          </div>
                        <div className={styles.noticeContent}>{notice.content.substring(0, 50)}...</div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.categoryBadge} ${styles[`category-${notice.category}`]}`}>
                          {getCategoryText(notice.category)}
                      </span>
                    </td>
                      <td>{notice.authorRealName || '알 수 없음'}</td>
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
                      <td>{getTargetAudienceText(notice)}</td>
                      <td>{new Date(notice.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td>
                        <span className={styles.attachmentCount}>
                          {notice.attachmentCount || 0}개
                        </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={`btn btn-primary btn-small ${styles['btnSmall']}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNoticeClick(notice);
                          }}
                        >
                          상세
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 공지사항 상세 모달 */}
      {showNoticeDetailModal && selectedNotice && (
        <NoticeDetailModal
          notice={selectedNotice}
          onClose={() => setShowNoticeDetailModal(false)}
        />
      )}
    </div>
  );
}



// 공지사항 상세 모달
function NoticeDetailModal({ notice, onClose }) {
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

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'urgent': return styles['priority-urgent'];
      case 'high': return styles['priority-high'];
      case 'normal': return styles['priority-normal'];
      case 'low': return styles['priority-low'];
      default: return '';
    }
  };

  const getStatusText = (status) => {
    const statuses = {
      draft: '임시저장',
      published: '발행',
      scheduled: '예약발행'
    };
    return statuses[status] || status;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'published': return styles['status-published'];
      case 'scheduled': return styles['status-scheduled'];
      case 'draft': return styles['status-draft'];
      default: return '';
    }
  };

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
                <span className={styles.noticeTitle}>{notice.title}</span>
              </div>
              <div className={styles.detailItem}>
                <label>카테고리:</label>
                <span className={`${styles.categoryBadge} ${styles[`category-${notice.category}`]}`}>
                  {getCategoryText(notice.category)}
                </span>
              </div>
              <div className={styles.detailItem}>
                <label>작성자:</label>
                <span>{notice.authorRealName || '알 수 없음'}</span>
                {notice.authorEmail && (
                  <span className={styles.authorEmail}>({notice.authorEmail})</span>
                )}
              </div>
              <div className={styles.detailItem}>
                <label>우선순위:</label>
                <span className={`${styles.priorityBadge} ${getPriorityClass(notice.priority)}`}>
                  {getPriorityText(notice.priority)}
                </span>
              </div>
              <div className={styles.detailItem}>
                <label>상태:</label>
                <span className={`${styles.statusBadge} ${getStatusClass(notice.status)}`}>
                  {getStatusText(notice.status)}
                </span>
              </div>
              <div className={styles.detailItem}>
                <label>중요도:</label>
                <span className={styles.importanceIndicator}>
                  {notice.isImportant ? '★ 중요' : '일반'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <label>공개 여부:</label>
                <span className={styles.publicIndicator}>
                  {notice.isPublic ? '공개' : '비공개'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <label>조회수:</label>
                <span className={styles.viewCount}>{notice.viewCount || 0}회</span>
              </div>
              <div className={styles.detailItem}>
                <label>작성일:</label>
                <span>{new Date(notice.createdAt).toLocaleString('ko-KR')}</span>
              </div>
              <div className={styles.detailItem}>
                <label>수정일:</label>
                <span>{new Date(notice.updatedAt).toLocaleString('ko-KR')}</span>
              </div>
              {notice.startDate && (
                <div className={styles.detailItem}>
                  <label>발행일:</label>
                  <span>{new Date(notice.startDate).toLocaleString('ko-KR')}</span>
                </div>
              )}
              {notice.endDate && (
                <div className={styles.detailItem}>
                  <label>종료일:</label>
                  <span>{new Date(notice.endDate).toLocaleString('ko-KR')}</span>
                </div>
              )}
            </div>
          </div>
          
          {notice.targetGroups && notice.targetGroups.length > 0 && (
            <div className={styles.detailSection}>
              <h3>대상 그룹</h3>
              <div className={styles.targetGroupsList}>
                {notice.targetGroups.map((mapping, index) => (
                  <div key={index} className={styles.targetGroupItem}>
                    {mapping.targetGroup && (
                      <div className={styles.targetGroupInfo}>
                        <span className={styles.targetGroupName}>{mapping.targetGroup.name}</span>
                        <span className={styles.targetGroupDescription}>
                          {mapping.targetGroup.description}
                        </span>
                        <span className={styles.targetGroupMemberCount}>
                          대상 인원: {mapping.targetGroup.memberCount}명
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className={styles.detailSection}>
            <h3>내용</h3>
            <div className={styles.description}>
              {notice.content}
            </div>
          </div>
          {notice.attachments && notice.attachments.length > 0 && (
            <div className={styles.detailSection}>
              <h3>첨부파일 ({notice.attachments.length}개)</h3>
              <div className={styles.attachmentsList}>
                {notice.attachments.map((attachment, index) => (
                  <div key={attachment.id || index} className={styles.attachmentItem}>
                    <div className={styles.attachmentInfo}>
                      <span className={styles.attachmentName}>{attachment.originalFilename}</span>
                      <div className={styles.attachmentDetails}>
                        <span className={styles.attachmentSize}>
                          {(attachment.fileSize / 1024).toFixed(1)} KB
                        </span>
                        <span className={styles.attachmentType}>
                          {attachment.fileType || '파일'}
                        </span>
                        {attachment.downloadCount > 0 && (
                          <span className={styles.downloadCount}>
                            다운로드 {attachment.downloadCount}회
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className={styles.downloadButton}
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
