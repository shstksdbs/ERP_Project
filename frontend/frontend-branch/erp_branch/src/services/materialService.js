// 원재료 관련 API 서비스
const API_BASE_URL = 'http://localhost:8080/api';

export const materialService = {
  // 모든 원재료 조회
  async getAllMaterials() {
    try {
      const response = await fetch(`${API_BASE_URL}/materials`);
      if (!response.ok) {
        throw new Error('원재료 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('원재료 조회 오류:', error);
      throw error;
    }
  },

  // 카테고리별 원재료 조회
  async getMaterialsByCategory(category) {
    try {
      const response = await fetch(`${API_BASE_URL}/materials/category/${category}`);
      if (!response.ok) {
        throw new Error('카테고리별 원재료 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('카테고리별 원재료 조회 오류:', error);
      throw error;
    }
  },

  // 이름으로 검색
  async searchMaterialsByName(name) {
    try {
      const response = await fetch(`${API_BASE_URL}/materials/search/name?name=${encodeURIComponent(name)}`);
      if (!response.ok) {
        throw new Error('원재료 검색에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('원재료 검색 오류:', error);
      throw error;
    }
  },

  // 모든 카테고리 조회
  async getAllCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/materials/categories`);
      if (!response.ok) {
        throw new Error('카테고리 조회에 실패했습니다.');
      }
      return await response.json();
    } catch (error) {
      console.error('카테고리 조회 오류:', error);
      throw error;
    }
  }
};
