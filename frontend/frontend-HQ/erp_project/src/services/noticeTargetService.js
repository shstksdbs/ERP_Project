const API_BASE_URL = 'http://localhost:8080/api/notices';

// 공지 대상 그룹 관리 서비스
export const noticeTargetService = {
  // 대상 그룹 목록 조회
  async getTargetGroups() {
    try {
      const response = await fetch(`${API_BASE_URL}/target-groups`);
      if (!response.ok) {
        throw new Error('대상 그룹 목록 조회 실패');
      }
      return await response.json();
    } catch (error) {
      console.error('대상 그룹 목록 조회 오류:', error);
      throw error;
    }
  },

  // 대상 그룹 생성
  async createTargetGroup(targetGroup) {
    try {
      const response = await fetch(`${API_BASE_URL}/target-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(targetGroup),
      });
      if (!response.ok) {
        throw new Error('대상 그룹 생성 실패');
      }
      return await response.json();
    } catch (error) {
      console.error('대상 그룹 생성 오류:', error);
      throw error;
    }
  },

  // 대상 그룹 수정
  async updateTargetGroup(id, targetGroup) {
    try {
      const response = await fetch(`${API_BASE_URL}/target-groups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(targetGroup),
      });
      if (!response.ok) {
        throw new Error('대상 그룹 수정 실패');
      }
      return await response.json();
    } catch (error) {
      console.error('대상 그룹 수정 오류:', error);
      throw error;
    }
  },

  // 대상 그룹 삭제
  async deleteTargetGroup(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/target-groups/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('대상 그룹 삭제 실패');
      }
    } catch (error) {
      console.error('대상 그룹 삭제 오류:', error);
      throw error;
    }
  },

  // 대상 그룹 상세 조회
  async getTargetGroupById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/target-groups/${id}`);
      if (!response.ok) {
        throw new Error('대상 그룹 상세 조회 실패');
      }
      return await response.json();
    } catch (error) {
      console.error('대상 그룹 상세 조회 오류:', error);
      throw error;
    }
  },

  // 인원수 계산
  async calculateMemberCount(targetGroup) {
    try {
      const response = await fetch(`${API_BASE_URL}/target-groups/calculate-member-count`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(targetGroup),
      });
      if (!response.ok) {
        throw new Error('인원수 계산 실패');
      }
      return await response.json();
    } catch (error) {
      console.error('인원수 계산 오류:', error);
      throw error;
    }
  },

  // 직급 매핑 (프론트엔드 표시명 -> 백엔드 enum 값)
  mapPositionToRole(position) {
    const positionMap = {
      '전체 직원': 'ALL',
      '점주': 'OWNER',
      '매니저': 'MANAGER',
      '직원': 'STAFF',
      '알바': 'PART_TIME'
    };
    return positionMap[position] || position;
  },

  // 직급 역매핑 (백엔드 enum 값 -> 프론트엔드 표시명)
  mapRoleToPosition(role) {
    const roleMap = {
      'ALL': '전체 직원',
      'OWNER': '점주',
      'MANAGER': '매니저',
      'STAFF': '직원',
      'PART_TIME': '알바'
    };
    return roleMap[role] || role;
  },

  // 대상 그룹 타입 옵션
  getTargetGroupTypeOptions() {
    return [
      { value: 'all', label: '전체' },
      { value: 'branch', label: '지점별' },
      { value: 'position', label: '직급별 (일정 직급 이상)' }
    ];
  },

  // 직급 옵션 (시스템 관리자 제외)
  getPositionOptions() {
    return [
      { value: 'MANAGER', label: '지점장' },
      { value: 'STAFF', label: '일반 직원' }
    ];
  },

  // 지점 목록 조회
  async getBranches() {
    try {
      const response = await fetch(`${API_BASE_URL}/branches`);
      if (!response.ok) {
        throw new Error('지점 목록 조회 실패');
      }
      return await response.json();
    } catch (error) {
      console.error('지점 목록 조회 오류:', error);
      throw error;
    }
  }
};
