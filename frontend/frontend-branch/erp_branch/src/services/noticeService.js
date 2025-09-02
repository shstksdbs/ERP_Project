const API_BASE_URL = 'http://localhost:8080/api/notices';

// 공지사항 서비스
export const noticeService = {
  // 공지사항 목록 조회 (지점용)
  async getNotices(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.status) queryParams.append('status', params.status);
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params.branchId) queryParams.append('branchId', params.branchId);
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);

    const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('공지사항 목록 조회 실패');
    }
    
    try {
      const text = await response.text();
      console.log('Raw response:', text); // 디버깅용
      return JSON.parse(text);
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      console.error('응답 텍스트:', await response.text());
      throw new Error('JSON 파싱 실패: ' + error.message);
    }
  },

  // 공지사항 상세 조회
  async getNoticeById(noticeId) {
    const response = await fetch(`${API_BASE_URL}/${noticeId}`);
    if (!response.ok) {
      throw new Error('공지사항 상세 조회 실패');
    }
    return response.json();
  },

  // 공지사항 조회수 증가
  async incrementViewCount(noticeId) {
    const response = await fetch(`${API_BASE_URL}/${noticeId}/view`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('조회수 증가 실패');
    }
    return response;
  },

  // 공지사항 읽음 상태 업데이트
  async markAsRead(noticeId, userId = 1) {
    const response = await fetch(`${API_BASE_URL}/${noticeId}/read?userId=${userId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('읽음 상태 업데이트 실패');
    }
    return response;
  },

  // 카테고리 옵션
  getCategoryOptions() {
    return [
      { value: 'general', label: '일반공지' },
      { value: 'important', label: '중요공지' },
      { value: 'event', label: '이벤트' },
      { value: 'maintenance', label: '점검공지' },
      { value: 'update', label: '업데이트' }
    ];
  },

  // 우선순위 옵션
  getPriorityOptions() {
    return [
      { value: 'low', label: '낮음' },
      { value: 'normal', label: '보통' },
      { value: 'high', label: '높음' },
      { value: 'urgent', label: '긴급' }
    ];
  },

  // 상태 옵션
  getStatusOptions() {
    return [
      { value: 'draft', label: '임시저장' },
      { value: 'published', label: '발행' },
      { value: 'scheduled', label: '예약발행' }
    ];
  }
};
