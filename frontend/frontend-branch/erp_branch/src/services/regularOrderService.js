const API_BASE_URL = 'http://localhost:8080/api';

export const regularOrderService = {
  // 지점별 모든 정기발주 조회
  async getAllRegularOrders(branchId) {
    try {
      const response = await fetch(`${API_BASE_URL}/regular-orders/branch/${branchId}`);
      if (!response.ok) {
        throw new Error('정기발주 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('정기발주 조회 오류:', error);
      throw error;
    }
  },

  // 지점별 활성 정기발주 조회
  async getActiveRegularOrders(branchId) {
    try {
      const response = await fetch(`${API_BASE_URL}/regular-orders/branch/${branchId}/active`);
      if (!response.ok) {
        throw new Error('활성 정기발주 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('활성 정기발주 조회 오류:', error);
      throw error;
    }
  },

  // 지점별 비활성 정기발주 조회
  async getInactiveRegularOrders(branchId) {
    try {
      const response = await fetch(`${API_BASE_URL}/regular-orders/branch/${branchId}/inactive`);
      if (!response.ok) {
        throw new Error('비활성 정기발주 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('비활성 정기발주 조회 오류:', error);
      throw error;
    }
  },

  // 정기발주명으로 검색
  async searchRegularOrders(branchId, keyword) {
    try {
      const response = await fetch(`${API_BASE_URL}/regular-orders/branch/${branchId}/search?keyword=${encodeURIComponent(keyword)}`);
      if (!response.ok) {
        throw new Error('정기발주 검색에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('정기발주 검색 오류:', error);
      throw error;
    }
  },

  // 정기발주 상세 조회
  async getRegularOrderById(regularOrderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/regular-orders/${regularOrderId}`);
      if (!response.ok) {
        throw new Error('정기발주 상세 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('정기발주 상세 조회 오류:', error);
      throw error;
    }
  },

  // 정기발주 활성화/비활성화 토글
  async toggleRegularOrderStatus(regularOrderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/regular-orders/${regularOrderId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('정기발주 상태 변경에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('정기발주 상태 변경 오류:', error);
      throw error;
    }
  },

  // 정기발주 상태별 필터링
  async getRegularOrdersByStatus(branchId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/regular-orders/branch/${branchId}/status/${status}`);
      if (!response.ok) {
        throw new Error('상태별 정기발주 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('상태별 정기발주 조회 오류:', error);
      throw error;
    }
  },

  // 다음 발주일 순 정렬된 활성 정기발주 조회
  async getActiveOrdersByNextOrderDate(branchId) {
    try {
      const response = await fetch(`${API_BASE_URL}/regular-orders/branch/${branchId}/next-order-date-sorted`);
      if (!response.ok) {
        throw new Error('다음 발주일 순 정기발주 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('다음 발주일 순 정기발주 조회 오류:', error);
      throw error;
    }
  },

  // 정기발주 생성
  async createRegularOrder(orderData) {
    try {
      const response = await fetch(`${API_BASE_URL}/regular-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        throw new Error('정기발주 생성에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('정기발주 생성 오류:', error);
      throw error;
    }
  },

  // 정기발주 수정
  async updateRegularOrder(regularOrderId, orderData) {
    try {
      const response = await fetch(`${API_BASE_URL}/regular-orders/${regularOrderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        throw new Error('정기발주 수정에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('정기발주 수정 오류:', error);
      throw error;
    }
  },

  // 정기발주 삭제
  async deleteRegularOrder(regularOrderId) {
    try {
      const response = await fetch(`${API_BASE_URL}/regular-orders/${regularOrderId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('정기발주 삭제에 실패했습니다.');
      }
      return true;
    } catch (error) {
      console.error('정기발주 삭제 오류:', error);
      throw error;
    }
  }
};
