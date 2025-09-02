const API_BASE_URL = 'http://localhost:8080/api/notices';

// 공지사항 서비스
export const noticeService = {
  // 공지사항 목록 조회
  async getNotices(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.status) queryParams.append('status', params.status);
    if (params.isImportant !== undefined) queryParams.append('isImportant', params.isImportant);
    if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);

    const response = await fetch(`${API_BASE_URL}?${queryParams}`);
    if (!response.ok) {
      throw new Error('공지사항 목록 조회 실패');
    }
    return response.json();
  },

  // 공지사항 상세 조회
  async getNoticeById(noticeId, userId = null) {
    const url = userId ? 
      `${API_BASE_URL}/${noticeId}?userId=${userId}` : 
      `${API_BASE_URL}/${noticeId}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('공지사항 상세 조회 실패');
    }
    return response.json();
  },

  // 공지사항 생성
  async createNotice(noticeData) {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noticeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '공지사항 생성 실패');
    }
    return response.json();
  },

  // 공지사항 수정
  async updateNotice(noticeId, noticeData) {
    const response = await fetch(`${API_BASE_URL}/${noticeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noticeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '공지사항 수정 실패');
    }
    return response.json();
  },

  // 공지사항 삭제
  async deleteNotice(noticeId) {
    const response = await fetch(`${API_BASE_URL}/${noticeId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('공지사항 삭제 실패');
    }
    return true;
  },

  // 공지사항 상태 변경
  async updateNoticeStatus(noticeId, status) {
    const response = await fetch(`${API_BASE_URL}/${noticeId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('공지사항 상태 변경 실패');
    }
    return response.json();
  },

  // 파일 업로드
  async uploadFile(noticeId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`http://localhost:8080/api/files/notice/${noticeId}/attach`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('파일 업로드 실패');
    }
    return response.json();
  },

  // 파일 다운로드
  async downloadFile(attachmentId) {
    const response = await fetch(`http://localhost:8080/api/files/download/${attachmentId}`);
    if (!response.ok) {
      throw new Error('파일 다운로드 실패');
    }
    return response.blob();
  },

  // 파일 삭제
  async deleteFile(attachmentId) {
    const response = await fetch(`http://localhost:8080/api/files/attachment/${attachmentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('파일 삭제 실패');
    }
    return true;
  },

  // 공지사항 첨부파일 목록 조회
  async getNoticeAttachments(noticeId) {
    const response = await fetch(`http://localhost:8080/api/files/notice/${noticeId}/attachments`);
    if (!response.ok) {
      throw new Error('첨부파일 목록 조회 실패');
    }
    return response.json();
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
      { value: 'scheduled', label: '예약발행' },
      { value: 'archived', label: '보관' }
    ];
  }
};
