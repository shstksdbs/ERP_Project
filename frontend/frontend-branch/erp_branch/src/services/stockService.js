// 재고 관련 API 서비스
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const stockService = {
  // 지점별 원재료 재고 현황 조회
  async getMaterialStockByBranch(branchId, materialId = null) {
    try {
      let url = `${API_BASE_URL}/api/stock/branch/${branchId}`;
      if (materialId) {
        url += `/material/${materialId}`;
      }
      
      const response = await fetch(url, {
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
      console.error('재고 현황 조회 실패:', error);
      throw error;
    }
  },

  // 원재료별 재고 이동 이력 조회
  async getStockMovements(materialId, branchId, startDate = null, endDate = null) {
    try {
      let url = `${API_BASE_URL}/api/stock/movements`;
      const params = new URLSearchParams();
      
      if (materialId) {
        params.append('materialId', materialId);
      }
      if (branchId) {
        params.append('branchId', branchId);
      }
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
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
      console.error('재고 이동 이력 조회 실패:', error);
      throw error;
    }
  },

  // 재고 조정 (입고/출고/조정)
  async adjustStock(stockAdjustmentData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stockAdjustmentData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('재고 조정 실패:', error);
      throw error;
    }
  },

  // 재고 알림 설정 조회
  async getStockAlerts(branchId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock/alerts?branchId=${branchId}`, {
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
      console.error('재고 알림 조회 실패:', error);
      throw error;
    }
  },

  // 재고 대시보드 데이터 조회
  async getStockDashboard(branchId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock/dashboard?branchId=${branchId}`, {
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
      console.error('재고 대시보드 조회 실패:', error);
      throw error;
    }
  }
};

export default stockService;
