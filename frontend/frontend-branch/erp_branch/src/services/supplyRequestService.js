// 발주 신청 관련 API 서비스
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const supplyRequestService = {
  // 발주 요청 목록 조회
  async getSupplyRequests(branchId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/supply-requests?branchId=${branchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('발주 요청 목록 조회 실패:', error);
      throw error;
    }
  },

  // 발주 요청 생성
  async createSupplyRequest(supplyRequestData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/supply-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(supplyRequestData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('발주 요청 생성 실패:', error);
      throw error;
    }
  },

  // 발주 요청 상세 조회
  async getSupplyRequestById(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/supply-requests/${requestId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('발주 요청 상세 조회 실패:', error);
      throw error;
    }
  },

  // 발주 요청 상태 업데이트
  async updateSupplyRequestStatus(requestId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/supply-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('발주 요청 상태 업데이트 실패:', error);
      throw error;
    }
  },

  // 발주 요청 취소
  async cancelSupplyRequest(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/supply-requests/${requestId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('발주 요청 취소 실패:', error);
      throw error;
    }
  },

  // 발주 요청 삭제
  async deleteSupplyRequest(requestId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/supply-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.text();
    } catch (error) {
      console.error('발주 요청 삭제 실패:', error);
      throw error;
    }
  }
};

export default supplyRequestService;
