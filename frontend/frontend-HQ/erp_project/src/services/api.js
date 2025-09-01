const API_BASE_URL = 'http://localhost:8080/api';

// 공통 API 호출 함수
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};

// 발주 요청 관련 API
export const supplyRequestAPI = {
  // 모든 발주 요청 조회
  getAllSupplyRequests: () => apiCall('/supply-requests'),
  
  // 발주 요청 상세 조회
  getSupplyRequestById: (id) => apiCall(`/supply-requests/${id}`),
  
  // 지점별 발주 요청 조회
  getSupplyRequestsByBranch: (branchId) => apiCall(`/supply-requests/branch/${branchId}`),
  
  // 상태별 발주 요청 조회
  getSupplyRequestsByStatus: (status) => apiCall(`/supply-requests/status/${status}`),
  
  // 발주 요청 승인
  approveSupplyRequest: (id, approvalData) => apiCall(`/supply-requests/${id}/approve`, {
    method: 'PUT',
    body: JSON.stringify(approvalData),
  }),
  
  // 발주 요청 거절
  rejectSupplyRequest: (id, rejectionData) => apiCall(`/supply-requests/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify(rejectionData),
  }),
  
  // 발주 요청 상태 업데이트
  updateSupplyRequestStatus: (id, statusData) => apiCall(`/supply-requests/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
  }),
};

// 지점 관련 API
export const branchAPI = {
  // 모든 지점 조회
  getAllBranches: () => apiCall('/branches'),
  
  // 지점별 상세 정보 조회
  getBranchById: (id) => apiCall(`/branches/${id}`),
};

// 재료 관련 API
export const materialAPI = {
  // 모든 재료 조회
  getAllMaterials: () => apiCall('/materials'),
  
  // 재료별 상세 정보 조회
  getMaterialById: (id) => apiCall(`/materials/${id}`),
};

// 사용자 관련 API
export const userAPI = {
  // 사용자 정보 조회
  getUserById: (id) => apiCall(`/users/${id}`),
};

export default {
  supplyRequestAPI,
  branchAPI,
  materialAPI,
  userAPI,
};
