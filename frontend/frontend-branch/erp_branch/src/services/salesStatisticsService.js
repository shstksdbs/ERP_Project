const API_BASE_URL = 'http://localhost:8080/api';

export const salesStatisticsService = {
  // 일별 매출 조회
  async getDailySales(branchId, startDate, endDate) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sales-statistics/daily/${branchId}?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error('일별 매출 데이터 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('일별 매출 조회 오류:', error);
      throw error;
    }
  },

  // 월별 매출 조회
  async getMonthlySales(branchId, year, month) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sales-statistics/monthly/${branchId}?year=${year}&month=${month}`
      );
      if (!response.ok) {
        throw new Error('월별 매출 데이터 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('월별 매출 조회 오류:', error);
      throw error;
    }
  },

  // 시간대별 매출 분석
  async getHourlySales(branchId, startDate, endDate) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sales-statistics/hourly/${branchId}?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error('시간대별 매출 데이터 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('시간대별 매출 조회 오류:', error);
      throw error;
    }
  },

  // 인기 메뉴 조회 (매출 기준)
  async getTopSellingMenus(branchId, startDate, endDate) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sales-statistics/menu/top-sales-with-name/${branchId}?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error('상품별 매출 데이터를 가져오는데 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('상품별 매출 데이터 조회 오류:', error);
      throw error;
    }
  },

  // 상품별 매출 통계 조회
  async getProductSalesStatistics(branchId, startDate, endDate) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sales-statistics/product-sales/${branchId}?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error('상품별 매출 통계를 가져오는데 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('상품별 매출 통계 조회 오류:', error);
      throw error;
    }
  },

  // 카테고리별 매출 통계 조회
  async getCategorySalesStatistics(branchId, startDate, endDate) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sales-statistics/category-sales/${branchId}?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error('카테고리별 매출 통계를 가져오는데 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('카테고리별 매출 통계 조회 오류:', error);
      throw error;
    }
  },

  // 인기 메뉴 조회 (수량 기준)
  async getTopSellingMenusByQuantity(branchId, startDate, endDate) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sales-statistics/menu/top-quantity/${branchId}?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error('인기 메뉴 데이터 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('인기 메뉴 조회 오류:', error);
      throw error;
    }
  },

  // 디버깅: 특정 날짜의 일별 통계 데이터 조회
  async getDailyStatisticsForDebug(branchId, date) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sales-statistics/debug/daily/${branchId}?date=${date}`
      );
      if (!response.ok) {
        throw new Error('디버깅 데이터 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('디버깅 데이터 조회 오류:', error);
      throw error;
    }
  },

  // 디버깅: 특정 날짜의 시간별 통계 데이터 조회
  async getHourlyStatisticsForDebug(branchId, date) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/sales-statistics/debug/hourly/${branchId}?date=${date}`
      );
      if (!response.ok) {
        throw new Error('시간별 디버깅 데이터 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('시간별 디버깅 데이터 조회 오류:', error);
      throw error;
    }
  }
};
