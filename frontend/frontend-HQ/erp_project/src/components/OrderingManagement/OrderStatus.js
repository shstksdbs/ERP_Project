import React, { useState, useEffect } from 'react';
import styles from './OrderStatus.module.css';
import searchIcon from '../../assets/search_icon.png';
import packageInIcon from '../../assets/packageIn_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import downloadIcon from '../../assets/download_icon.png';

export default function OrderStatus() {
  const [activeTab, setActiveTab] = useState('order-management');
  const [orders, setOrders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProcessOrderModal, setShowProcessOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 로그인된 사용자 정보 가져오기
  const [currentUser, setCurrentUser] = useState(null);

  // API 기본 URL
  const API_BASE_URL = 'http://localhost:8080/api';

  // 컴포넌트 마운트 시 로그인된 사용자 정보 로드
  useEffect(() => {
    const loginData = localStorage.getItem('erpLoginData');
    if (loginData) {
      try {
        const userData = JSON.parse(loginData);
        setCurrentUser(userData);
        console.log('로그인된 사용자 정보:', userData);
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
      }
    }
  }, []);

  // 발주 요청 데이터 가져오기
  const fetchSupplyRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      // SupplyRequest API 사용
      const response = await fetch(`${API_BASE_URL}/supply-requests`);
      if (!response.ok) {
        throw new Error('발주 요청 데이터를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      console.log('API 응답 데이터:', data); // 디버깅용 로그

      // API 응답 구조에 맞게 데이터 변환
      const transformedOrders = data.map(request => {
        console.log('발주 요청 아이템:', request.items); // 디버깅용 로그
        console.log('가맹점 ID:', request.requestingBranchId);

        const branchName = getBranchName(request.requestingBranchId);
        console.log('조회된 가맹점명:', branchName);

        return {
          id: request.id,
          orderNumber: `SR-${request.id}`,
          branchId: request.requestingBranchId,
          branchName: branchName,
          branchCode: request.branchCode || '',
          orderDate: request.requestDate ? new Date(request.requestDate).toLocaleDateString('ko-KR') : 'N/A',
          deliveryDate: request.expectedDeliveryDate || '-',
          status: request.status || 'PENDING',
          totalAmount: request.totalCost || 0,
          items: request.items?.map(item => {
            //console.log('개별 아이템:', item); // 디버깅용 로그
            return {
              productId: item.materialId,
              productName: item.materialName,
              quantity: item.requestedQuantity,
              unit: item.unit || '개', // unit 정보 추가
              unitPrice: item.costPerUnit,
              totalPrice: item.totalCost
            };
          }) || [],
          requestNote: request.notes || '',
          priority: request.priority || 'NORMAL',
          processedBy: request.processedBy || null,
          processedAt: request.processedAt ? new Date(request.processedAt).toLocaleString('ko-KR') : null,
          updatedAt: request.updatedAt ? new Date(request.updatedAt).toLocaleString('ko-KR') : null
        };
      });

      setOrders(transformedOrders);
    } catch (err) {
      console.error('발주 요청 조회 오류:', err);
      setError(err.message);
      // 오류 발생 시 샘플 데이터 사용
      loadSampleData();
    } finally {
      setLoading(false);
    }
  };

  // 지점별 발주 요청 데이터 가져오기
  const fetchSupplyRequestsByBranch = async (branchId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/supply-requests?branchId=${branchId}`);
      if (!response.ok) {
        throw new Error('지점별 발주 요청 데이터를 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      console.log('지점별 API 응답 데이터:', data); // 디버깅용 로그

      // API 응답 구조에 맞게 데이터 변환
      const transformedOrders = data.map(request => {
        console.log('지점별 발주 요청 아이템:', request.items); // 디버깅용 로그
        console.log('가맹점 ID:', request.requestingBranchId);

        const branchName = getBranchName(request.requestingBranchId);
        console.log('조회된 가맹점명:', branchName);

        return {
          id: request.id,
          orderNumber: `SR-${request.id}`,
          branchId: request.requestingBranchId,
          branchName: branchName,
          branchCode: request.branchCode || '',
          orderDate: request.requestDate ? new Date(request.requestDate).toLocaleDateString('ko-KR') : 'N/A',
          deliveryDate: request.expectedDeliveryDate || 'N/A',
          status: request.status || 'PENDING',
          totalAmount: request.totalCost || 0,
          items: request.items?.map(item => {
            //console.log('지점별 개별 아이템:', item); // 디버깅용 로그
            return {
              productId: item.materialId,
              productName: item.materialName,
              quantity: item.requestedQuantity,
              unit: item.unit || '개', // unit 정보 추가
              unitPrice: item.costPerUnit,
              totalPrice: item.totalCost
            };
          }) || [],
          requestNote: request.notes || '',
          priority: request.priority || 'NORMAL',
          processedBy: null,
          processedAt: null
        };
      });

      setOrders(transformedOrders);
    } catch (err) {
      console.error('지점별 발주 요청 조회 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 발주 요청 상태 업데이트
  const updateSupplyRequestStatus = async (orderId, action, processedBy, notes = '') => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = '';
      let requestBody = {};

      // 처리자 정보와 처리 시간을 포함한 요청 본문 생성
      const currentTime = new Date().toISOString();
      const processInfo = {
        processedBy: processedBy || 'Unknown',
        processedAt: currentTime
      };

      switch (action) {
        case 'APPROVED':
          endpoint = `${API_BASE_URL}/supply-requests/${orderId}/status`;
          requestBody = {
            status: 'APPROVED',
            ...processInfo
          };
          break;
        case 'CANCELLED':
          endpoint = `${API_BASE_URL}/supply-requests/${orderId}/cancel`;
          requestBody = processInfo;
          break;
        case 'IN_TRANSIT':
          endpoint = `${API_BASE_URL}/supply-requests/${orderId}/status`;
          requestBody = {
            status: 'IN_TRANSIT',
            ...processInfo
          };
          break;
        case 'DELIVERED':
          endpoint = `${API_BASE_URL}/supply-requests/${orderId}/status`;
          requestBody = {
            status: 'DELIVERED',
            ...processInfo
          };
          break;
        default:
          throw new Error('지원하지 않는 액션입니다.');
      }

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('발주 요청 상태 업데이트에 실패했습니다.');
      }

      const updatedOrder = await response.json();
      console.log('API 응답 데이터:', updatedOrder);
      console.log('액션:', action);
      console.log('업데이트된 발주 상태:', updatedOrder.status);

      setShowProcessOrderModal(false);
      alert('발주 요청이 성공적으로 처리되었습니다.');

      // API 응답 데이터로 로컬 상태를 정확하게 업데이트
      if (updatedOrder) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? {
              ...order,
              status: updatedOrder.status || action,
              processedBy: processedBy,
              processedAt: new Date().toLocaleString('ko-KR')
            } : order
          )
        );
      }

    } catch (err) {
      console.error('발주 요청 상태 업데이트 오류:', err);
      setError(err.message);
      alert(`오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 지점 데이터 가져오기
  const fetchBranches = async () => {
    try {
      console.log('가맹점 데이터 조회 시작');
      const response = await fetch(`${API_BASE_URL}/branches`);
      console.log('가맹점 API 응답:', response);

      if (response.ok) {
        const data = await response.json();
        console.log('가맹점 API 응답 데이터:', data);
        console.log('가맹점 데이터 구조:', data.map(b => ({
          id: b.id,
          branchName: b.branchName,
          branchCode: b.branchCode,
          name: b.name,
          code: b.code
        })));

        setBranches(data);
        console.log('branches 상태 업데이트 완료:', data);
      } else {
        console.error('가맹점 API 응답 오류:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('지점 데이터 조회 오류:', err);
    }
  };

  // 자재 데이터 가져오기
  const fetchMaterials = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/materials`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('자재 데이터 조회 오류:', err);
    }
  };

  // 샘플 데이터 로드 (API 오류 시 사용)
  const loadSampleData = () => {
    const sampleBranches = [
      { id: 1, name: '강남점', code: 'GN001', region: '서울', status: 'active' },
      { id: 2, name: '홍대점', code: 'HD001', region: '서울', status: 'active' },
      { id: 3, name: '부산점', code: 'BS001', region: '부산', status: 'active' },
      { id: 4, name: '대구점', code: 'DG001', region: '대구', status: 'active' },
      { id: 5, name: '인천점', code: 'IC001', region: '인천', status: 'active' }
    ];

    const sampleProducts = [
      { id: 1, name: '아메리카노', code: 'AM001', category: '음료', unit: '개', price: 4500 },
      { id: 2, name: '카페라떼', code: 'CL001', category: '음료', unit: '개', price: 5500 },
      { id: 3, name: '카푸치노', code: 'CP001', category: '음료', unit: '개', price: 5500 },
      { id: 4, name: '샌드위치', code: 'SW001', category: '식품', unit: '개', price: 8000 },
      { id: 5, name: '샐러드', code: 'SL001', category: '식품', unit: '개', price: 12000 },
      { id: 6, name: '티라미수', code: 'TR001', category: '디저트', unit: '개', price: 6500 },
      { id: 7, name: '치즈케이크', code: 'CK001', category: '디저트', unit: '개', price: 7000 },
      { id: 8, name: '감자튀김', code: 'FF001', category: '사이드', unit: '개', price: 3500 }
    ];

    const sampleOrders = [
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        branchId: 1,
        branchName: '강남점',
        branchCode: 'GN001',
        orderDate: '2024-03-15',
        deliveryDate: '2024-03-20',
        status: 'PENDING',
        totalAmount: 150000,
        items: [
          { productId: 1, productName: '아메리카노', quantity: 50, unit: '개', unitPrice: 4500, totalPrice: 225000 },
          { productId: 2, productName: '카페라떼', quantity: 30, unit: '개', unitPrice: 5500, totalPrice: 165000 },
          { productId: 4, productName: '샌드위치', quantity: 20, unit: '개', unitPrice: 8000, totalPrice: 160000 }
        ],
        requestNote: '신메뉴 출시 준비로 인한 대량 발주',
        priority: 'HIGH',
        processedBy: null,
        processedAt: null
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-002',
        branchId: 2,
        branchName: '홍대점',
        branchCode: 'HD001',
        orderDate: '2024-03-14',
        deliveryDate: '2024-03-19',
        status: 'APPROVED',
        totalAmount: 98000,
        items: [
          { productId: 3, productName: '카푸치노', quantity: 25, unit: '개', unitPrice: 5500, totalPrice: 137500 },
          { productId: 6, productName: '티라미수', quantity: 15, unit: '개', unitPrice: 6500, totalPrice: 97500 }
        ],
        requestNote: '주말 이벤트 준비',
        priority: 'NORMAL',
        processedBy: '김본사',
        processedAt: '2024-03-15 14:30'
      },
      {
        id: 3,
        orderNumber: 'ORD-2024-003',
        branchId: 3,
        branchName: '부산점',
        branchCode: 'BS001',
        orderDate: '2024-03-13',
        deliveryDate: '2024-03-18',
        status: 'CANCELLED',
        totalAmount: 200000,
        items: [
          { productId: 5, productName: '샐러드', quantity: 40, unit: '개', unitPrice: 12000, totalPrice: 480000 },
          { productId: 7, productName: '치즈케이크', quantity: 30, unit: '개', unitPrice: 7000, totalPrice: 210000 }
        ],
        requestNote: '건강식품 트렌드 대응',
        priority: 'URGENT',
        processedBy: '김본사',
        processedAt: '2024-03-14 09:15',
        rejectReason: '재고 부족으로 인한 발주 거절'
      },
      {
        id: 4,
        orderNumber: 'ORD-2024-004',
        branchId: 4,
        branchName: '대구점',
        branchCode: 'DG001',
        orderDate: '2024-03-12',
        deliveryDate: '2024-03-17',
        status: 'DELIVERED',
        totalAmount: 75000,
        items: [
          { productId: 8, productName: '감자튀김', quantity: 100, unit: '개', unitPrice: 3500, totalPrice: 350000 },
          { productId: 1, productName: '아메리카노', quantity: 20, unit: '개', unitPrice: 4500, totalPrice: 90000 }
        ],
        requestNote: '일반 발주',
        priority: 'LOW',
        processedBy: '이본사',
        processedAt: '2024-03-13 11:20'
      },
      {
        id: 5,
        orderNumber: 'ORD-2024-005',
        branchId: 5,
        branchName: '인천점',
        branchCode: 'IC001',
        orderDate: '2024-03-11',
        deliveryDate: '2024-03-16',
        status: 'IN_TRANSIT',
        totalAmount: 120000,
        items: [
          { productId: 2, productName: '카페라떼', quantity: 35, unit: '개', unitPrice: 5500, totalPrice: 192500 },
          { productId: 4, productName: '샌드위치', quantity: 15, unit: '개', unitPrice: 8000, totalPrice: 120000 }
        ],
        requestNote: '신규 메뉴 테스트',
        priority: 'NORMAL',
        processedBy: '박본사',
        processedAt: '2024-03-12 16:45'
      }
    ];

    setBranches(sampleBranches);
    setProducts(sampleProducts);
    setOrders(sampleOrders);
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    // 가맹점 데이터와 자재 데이터만 먼저 로드
    const loadData = async () => {
      try {
        console.log('데이터 로딩 시작');
        await fetchBranches();
        console.log('가맹점 데이터 로딩 완료');
        await fetchMaterials();
        console.log('자재 데이터 로딩 완료');
      } catch (error) {
        console.error('데이터 로딩 중 오류:', error);
      }
    };
    loadData();
  }, []);

  // branches 상태가 변경될 때 발주 요청 데이터 로드
  useEffect(() => {
    if (branches.length > 0) {
      console.log('branches 상태 변경됨, 발주 요청 데이터 로드 시작');
      fetchSupplyRequests();
    }
  }, [branches]);

  // 지점 변경 시 해당 지점의 발주 요청 조회
  useEffect(() => {
    if (selectedBranch !== 'all') {
      fetchSupplyRequestsByBranch(parseInt(selectedBranch));
    } else {
      fetchSupplyRequests();
    }
  }, [selectedBranch]);

  const handleProcessOrder = (orderId, action, processedBy, notes = '') => {
    updateSupplyRequestStatus(orderId, action, processedBy, notes);
  };

  const handleExportOrderData = () => {
    // 실제 구현에서는 Excel 또는 CSV 파일로 내보내기
    console.log('발주 데이터 내보내기');

    // CSV 형식으로 데이터 내보내기
    const csvContent = generateCSVContent();
    downloadCSV(csvContent, 'supply_requests.csv');
  };

  // CSV 내용 생성
  const generateCSVContent = () => {
    const headers = ['발주번호', '가맹점', '발주일', '배송예정일', '발주 내용', '총 금액', '우선순위', '상태', '처리자', '요청사항'];
    const rows = filteredOrders.map(order => {
      // 발주 내용 생성
      let orderContent = '';
      if (order.items && order.items.length > 0) {
        orderContent = order.items.map(item => {
          const productName = item.productName || item.materialName || 'Unknown';
          const quantity = item.quantity || item.requestedQuantity || 0;
          const unit = item.unit || '개';
          return `${productName} ${quantity}${unit}`;
        }).join(', ');
      } else {
        orderContent = '발주 상품 없음';
      }

      return [
        order.orderNumber || `SR-${order.id}`,
        order.branchName || 'Unknown',
        order.orderDate || 'N/A',
        order.deliveryDate || 'N/A',
        orderContent,
        (order.totalAmount || 0).toLocaleString(),
        getPriorityText(order.priority),
        getStatusText(order.status),
        order.processedBy ? `${order.processedBy} (${order.processedAt || '-'})` : '미처리',
        order.requestNote || ''
      ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // CSV 파일 다운로드
  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.orderNumber || `SR-${order.id}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.branchName || '').toLowerCase().includes(searchTerm.toLowerCase());

    // 상태 매칭 로직
    let matchesStatus = selectedStatus === 'all';
    if (selectedStatus !== 'all') {
      matchesStatus = order.status === selectedStatus;
    }

    const matchesBranch = selectedBranch === 'all' ||
      (order.branchId === parseInt(selectedBranch)) ||
      (order.requestingBranchId === parseInt(selectedBranch));
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': '대기중',
      'APPROVED': '승인',
      'CANCELLED': '취소됨',
      'IN_TRANSIT': '배송중',
      'DELIVERED': '배송완료'
    };

    // 상태값이 null이거나 undefined인 경우 처리
    if (!status) return '대기중';

    // 정확한 매칭을 위해 원본 상태값 확인
    return statusMap[status] || status;
  };

  const getPriorityText = (priority) => {
    const priorityMap = {
      'LOW': '낮음',
      'NORMAL': '보통',
      'HIGH': '높음',
      'URGENT': '긴급'
    };

    // 우선순위값이 null이거나 undefined인 경우 처리
    if (!priority) return '보통';

    return priorityMap[priority] || priority;
  };



  const getStatusColor = (status) => {
    const colorMap = {
      'PENDING': '#f59e0b',
      'APPROVED': '#10b981',
      'CANCELLED': '#ef4444',
      'IN_TRANSIT': '#3b82f6',
      'DELIVERED': '#6b7280'
    };

    // 디버깅을 위한 로그 추가 (상태 변경 시에만 로그 출력)
    if (status && (status === 'APPROVED' || status === 'IN_TRANSIT')) {
      console.log('getStatusColor 호출:', { status, type: typeof status });
    }

    // 상태값이 null이거나 undefined인 경우 처리
    if (!status) return '#f59e0b';

    // 정확한 매칭을 위해 원본 상태값 확인
    const color = colorMap[status] || '#6b7280';

    if (status && (status === 'APPROVED' || status === 'IN_TRANSIT')) {
      console.log('상태 색상 결과:', { status, color });
    }

    return color;
  };

  const getBranchName = (branchId) => {
    console.log('getBranchName 호출:', { branchId, branches, branchesLength: branches?.length });

    if (!branchId) {
      console.log('branchId가 없음');
      return 'Unknown';
    }

    if (!branches || branches.length === 0) {
      console.log('branches 배열이 비어있음');
      return 'Unknown';
    }

    // branchId를 숫자로 변환 (API에서 문자열로 올 수 있음)
    const numericBranchId = typeof branchId === 'string' ? parseInt(branchId) : branchId;

    console.log('가맹점 검색:', {
      branchId,
      numericBranchId,
      branchesIds: branches.map(b => ({ id: b.id, name: b.branchName || b.name }))
    });

    const branch = branches.find(b => b.id === numericBranchId);
    console.log('찾은 가맹점:', branch);

    if (!branch) {
      console.log(`가맹점 ID ${numericBranchId}에 해당하는 가맹점을 찾을 수 없음`);
      return `가맹점${numericBranchId}`;
    }

    // Branches.java 엔티티의 branchName 필드 사용
    const branchName = branch.branchName || branch.name || `가맹점${numericBranchId}`;
    console.log('최종 가맹점명:', branchName);

    return branchName;
  };

  const getBranchCode = (branchId) => {
    if (!branchId) {
      return '';
    }

    if (!branches || branches.length === 0) {
      return '';
    }

    // branchId를 숫자로 변환 (API에서 문자열로 올 수 있음)
    const numericBranchId = typeof branchId === 'string' ? parseInt(branchId) : branchId;

    const branch = branches.find(b => b.id === numericBranchId);

    if (!branch) {
      return '';
    }

    // Branches.java 엔티티의 branchCode 필드 사용
    return branch.branchCode || branch.code || '';
  };

  const getTotalItems = (order) => {
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className={styles['order-status']}>
        <div className={styles['loading']}>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['order-status']}>
        <div className={styles['error']}>
          <p>오류가 발생했습니다: {error}</p>
          <button onClick={fetchSupplyRequests}>다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['order-status']}>
      <div className={styles['order-status-header']}>
        <h1>발주 현황</h1>
        <p>가맹점들의 발주 요청을 관리하고 처리할 수 있습니다.</p>
      </div>

      <div className={styles['tab-container']}>
        <button
          className={`${styles['tab-button']} ${activeTab === 'order-management' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('order-management')}
        >
          발주 관리
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'order-analysis' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('order-analysis')}
        >
          발주 분석
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'delivery-tracking' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('delivery-tracking')}
        >
          배송 추적
        </button>
      </div>

      {activeTab === 'order-management' && (
        <div className={styles['order-management']}>
          <div className={styles['search-filter-container']}>
            <div className={styles['search-box']}>
              <div className={styles['search-input-container']}>
                <img
                  src={searchIcon}
                  alt="검색"
                  className={styles['search-icon']}
                />
                <input
                  type="text"
                  placeholder="발주번호 또는 가맹점명으로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles['search-input']}
                />
              </div>
            </div>
            <div className={styles['filter-box']}>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={styles['filter-select']}
              >
                <option value="all">전체 상태</option>
                <option value="PENDING">대기중</option>
                <option value="APPROVED">승인</option>
                <option value="CANCELLED">취소됨</option>
                <option value="IN_TRANSIT">배송중</option>
                <option value="DELIVERED">배송완료</option>
              </select>
            </div>
            <div className={styles['filter-box']}>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className={styles['filter-select']}
              >
                <option value="all">전체 가맹점</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branchName || branch.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className={`btn btn-primary ${styles['export-button']}`}
              onClick={handleExportOrderData}
            >
              <img src={downloadIcon} alt="내보내기" className={styles['button-icon']} />
              데이터 내보내기
            </button>
          </div>

          <div className={styles['order-summary']}>
            <div className={styles['summary-card']}>
              <h3>전체 발주</h3>
              <p className={styles['summary-number']}>{filteredOrders.length}건</p>
            </div>
            <div className={styles['summary-card']}>
              <h3>대기중</h3>
              <p className={styles['summary-number']}>
                {filteredOrders.filter(o => o.status === 'PENDING').length}건
              </p>
            </div>
            <div className={styles['summary-card']}>
              <h3>배송중</h3>
              <p className={styles['summary-number']}>
                {filteredOrders.filter(o => o.status === 'IN_TRANSIT').length}건
              </p>
            </div>
            <div className={styles['summary-card']}>
              <h3>총 발주금액</h3>
              <p className={styles['summary-number']}>
                {filteredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}원
              </p>
            </div>
          </div>

          <div className={styles['orders-container']}>
            <div className={styles['orders-list']}>
              <table className={styles['orders-table']}>
                <thead className={styles['orders-table-header']}>
                  <tr>
                    <th>발주번호</th>
                    <th>가맹점</th>
                    <th>발주일</th>
                    <th>배송예정일</th>
                    <th>발주 내용</th>
                    <th>총 금액</th>
                    <th>우선순위</th>
                    <th>상태</th>
                    <th>처리자</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <div className={styles['order-info']}>
                          <span className={styles['order-number']}>
                            {order.orderNumber || `SR-${order.id}`}
                          </span>
                          <span className={styles['order-note']}>
                            {order.requestNote || order.notes || ''}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles['branch-info']}>
                          <span className={styles['branch-name']}>
                            {order.branchName || getBranchName(order.branchId || order.requestingBranchId)}
                          </span>
                          {(order.branchCode || getBranchCode(order.branchId || order.requestingBranchId)) && (
                            <span className={styles['branch-code']}>
                              {order.branchCode || getBranchCode(order.branchId || order.requestingBranchId)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {order.orderDate || (order.requestDate ? new Date(order.requestDate).toLocaleDateString('ko-KR') : 'N/A')}
                      </td>
                      <td>
                        {order.deliveryDate || order.expectedDeliveryDate || 'N/A'}
                      </td>
                      <td>
                        <div className={styles['orderItems']}>
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, index) => {
                              //console.log('표시할 아이템:', item); // 디버깅용 로그

                              // 메뉴 이름과 옵션을 분리
                              const parts = item.productName ? [item.productName] :
                                (item.materialName ? [item.materialName] : ['Unknown']);
                              const menuName = parts[0];
                              const options = parts.slice(1).join(', ');

                              return (
                                <div key={index} className={styles['orderItem']}>
                                  <span className={styles['menu-name']}>
                                    {menuName}
                                  </span>
                                  {item.quantity && (
                                    <span className={styles['menu-options']}>
                                      {' '}x{item.quantity}{item.unit || '개'}
                                    </span>
                                  )}
                                  {options && (
                                    <span className={styles['menu-options']}>
                                      {' '}{options}
                                    </span>
                                  )}
                                </div>
                              );
                            })
                          ) : (
                            <div className={styles['no-items']}>
                              발주 상품 없음
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{(order.totalAmount || 0).toLocaleString()}원</td>
                      <td>
                        <span
                          className={`${styles['priority-badge']} ${styles[`priority-${order.priority?.toLowerCase() || 'normal'}`]}`}
                        >
                          {getPriorityText(order.priority)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={styles['status-badge']}
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>
                        {order.processedBy ? (
                          <div className={styles['processor-info']}>
                            <span className={styles['processor-name']}>{order.processedBy}</span>
                            <span className={styles['process-time']}>
                              {order.processedAt || '-'}
                            </span>
                          </div>
                        ) : (
                          <span className={styles['no-processor']}>미처리</span>
                        )}
                      </td>
                      <td>
                        <div className={styles['action-buttons']}>
                          {(order.status === 'PENDING') && (
                            <>
                              <button
                                className={`btn btn-small btn-primary ${styles['btn-small']}`}
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowProcessOrderModal(true);
                                }}
                              >
                                처리
                              </button>
                            </>
                          )}
                          <button
                            className={`btn btn-small btn-primary ${styles['btn-small']}`}
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowProcessOrderModal(true);
                            }}
                          >
                            처리
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'order-analysis' && (
        <div className={styles['order-analysis']}>
          <div className={styles['analysis-header']}>
            <h2>발주 분석</h2>
            <p>가맹점별 발주 현황과 통계를 분석합니다.</p>
          </div>

          <div className={styles['analysis-grid']}>
            {branches.map(branch => {
              const branchOrders = orders.filter(order =>
                (order.branchId === branch.id) || (order.requestingBranchId === branch.id)
              );
              const totalAmount = branchOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
              const avgOrderAmount = branchOrders.length > 0 ? totalAmount / branchOrders.length : 0;
              const pendingOrders = branchOrders.filter(order =>
                order.status === 'PENDING'
              ).length;

              return (
                <div key={branch.id} className={styles['analysis-card']}>
                  <div className={styles['analysis-header']}>
                    <h3>{branch.branchName || branch.name}</h3>
                    <span className={styles['branch-code']}>{branch.branchCode || branch.code}</span>
                  </div>
                  <div className={styles['analysis-stats']}>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>총 발주:</span>
                      <span className={styles['stat-value']}>{branchOrders.length}건</span>
                    </div>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>총 발주금액:</span>
                      <span className={styles['stat-value']}>{totalAmount.toLocaleString()}원</span>
                    </div>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>평균 발주금액:</span>
                      <span className={styles['stat-value']}>{avgOrderAmount.toLocaleString()}원</span>
                    </div>
                    <div className={styles['stat-item']}>
                      <span className={styles['stat-label']}>대기중 발주:</span>
                      <span className={styles['stat-value']}>{pendingOrders}건</span>
                    </div>
                  </div>
                  <div className={styles['recent-orders']}>
                    <h4>최근 발주</h4>
                    {branchOrders.slice(0, 3).map(order => (
                      <div key={order.id} className={styles['recent-order-item']}>
                        <span className={styles['order-number']}>
                          {order.orderNumber || `SR-${order.id}`}
                        </span>
                        <span
                          className={styles['order-status']}
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {getStatusText(order.status)}
                        </span>
                        <span className={styles['order-amount']}>
                          {(order.totalAmount || 0).toLocaleString()}원
                        </span>
                      </div>
                    ))}
                    {branchOrders.length === 0 && (
                      <div className={styles['no-orders']}>
                        <p>발주 내역이 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'delivery-tracking' && (
        <div className={styles['delivery-tracking']}>
          <div className={styles['tracking-header']}>
            <h2>배송 추적</h2>
            <p>승인된 발주의 배송 현황을 추적합니다.</p>
          </div>

          <div className={styles['tracking-grid']}>
            {orders.filter(order =>
              order.status === 'IN_TRANSIT' ||
              order.status === 'DELIVERED'
            ).map(order => (
              <div key={order.id} className={styles['tracking-card']}>
                <div className={styles['tracking-header']}>
                  <h3>{order.orderNumber || `SR-${order.id}`}</h3>
                  <span
                    className={styles['tracking-status']}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className={styles['tracking-info']}>
                  <div className={styles['info-row']}>
                    <span className={styles['info-label']}>가맹점:</span>
                    <span className={styles['info-value']}>
                      {order.branchName || getBranchName(order.branchId || order.requestingBranchId)}
                      {(order.branchCode || getBranchCode(order.branchId || order.requestingBranchId)) && (
                        <span className={styles['branch-code-info']}>
                          {' '}({order.branchCode || getBranchCode(order.branchId || order.requestingBranchId)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className={styles['info-row']}>
                    <span className={styles['info-label']}>발주일:</span>
                    <span className={styles['info-value']}>
                      {order.orderDate || (order.requestDate ? new Date(order.requestDate).toLocaleDateString('ko-KR') : 'N/A')}
                    </span>
                  </div>
                  <div className={styles['info-row']}>
                    <span className={styles['info-label']}>배송예정일:</span>
                    <span className={styles['info-value']}>
                      {order.deliveryDate || order.expectedDeliveryDate || 'N/A'}
                    </span>
                  </div>
                  <div className={styles['info-row']}>
                    <span className={styles['info-label']}>총 금액:</span>
                    <span className={styles['info-value']}>
                      {(order.totalAmount || 0).toLocaleString()}원
                    </span>
                  </div>
                </div>
                <div className={styles['delivery-progress']}>
                  <div className={styles['progress-steps']}>
                    <div className={`${styles['progress-step']} ${styles['completed']}`}>
                      <span className={styles['step-icon']}>✓</span>
                      <span className={styles['step-text']}>발주 접수</span>
                    </div>
                    <div className={`${styles['progress-step']} ${styles['completed']}`}>
                      <span className={styles['step-icon']}>✓</span>
                      <span className={styles['step-text']}>승인</span>
                    </div>
                    <div className={`${styles['progress-step']} ${order.status === 'IN_TRANSIT' || order.status === 'DELIVERED' ? styles['completed'] : ''}`}>
                      <span className={styles['step-icon']}>
                        {order.status === 'IN_TRANSIT' || order.status === 'DELIVERED' ? '✓' : '○'}
                      </span>
                      <span className={styles['step-text']}>배송중</span>
                    </div>
                    <div className={`${styles['progress-step']} ${order.status === 'DELIVERED' ? styles['completed'] : ''}`}>
                      <span className={styles['step-icon']}>
                        {order.status === 'DELIVERED' ? '✓' : '○'}
                      </span>
                      <span className={styles['step-text']}>배송완료</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {orders.filter(order =>
              order.status === 'IN_TRANSIT' ||
              order.status === 'DELIVERED'
            ).length === 0 && (
                <div className={styles['no-deliveries']}>
                  <p>배송 중인 발주가 없습니다.</p>
                </div>
              )}
          </div>
        </div>
      )}

      {/* 발주 처리 모달 */}
      {showProcessOrderModal && selectedOrder && (
        <ProcessOrderModal
          order={selectedOrder}
          onProcess={handleProcessOrder}
          onClose={() => setShowProcessOrderModal(false)}
        />
      )}
    </div>
  );
}

// 발주 처리 모달 컴포넌트
function ProcessOrderModal({ order, onProcess, onClose }) {
  const [action, setAction] = useState('approved');
  const [processedBy, setProcessedBy] = useState('김본사');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onProcess(order.id, action, processedBy, notes);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>발주 처리</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles['edit-form']}>
          <div className={styles['order-info-display']}>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>발주번호:</span>
              <span className={styles['info-value']}>
                {order.orderNumber || `SR-${order.id}`}
              </span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>가맹점:</span>
              <span className={styles['info-value']}>
                {order.branchName || 'Unknown'}
              </span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>발주일:</span>
              <span className={styles['info-value']}>
                {order.orderDate || (order.requestDate ? new Date(order.requestDate).toLocaleDateString('ko-KR') : 'N/A')}
              </span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>총 금액:</span>
              <span className={styles['info-value']}>
                {(order.totalAmount || 0).toLocaleString()}원
              </span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>요청사항:</span>
              <span className={styles['info-value']}>
                {order.requestNote || order.notes || ''}
              </span>
            </div>
          </div>

          <div className={styles['order-items']}>
            <h4>발주 상품</h4>
            <div className={styles['items-list']}>
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div key={index} className={styles['item-row']}>
                    <span className={styles['item-name']}>
                      {item.productName || item.materialName || 'Unknown'}
                    </span>
                    <span className={styles['item-quantity']}>
                      {item.quantity || item.requestedQuantity || 0} {item.unit || '개'}
                    </span>
                    <span className={styles['item-price']}>
                      {(item.unitPrice || item.costPerUnit || 0).toLocaleString()}원
                    </span>
                    <span className={styles['item-total']}>
                      {(item.totalPrice || item.totalCost || 0).toLocaleString()}원
                    </span>
                  </div>
                ))
              ) : (
                <div className={styles['no-items']}>
                  <p>발주 상품 정보가 없습니다.</p>
                </div>
              )}
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>처리 유형 *</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                required
              >
                <option value="APPROVED">승인</option>
                <option value="CANCELLED">취소</option>
                <option value="IN_TRANSIT">배송 시작</option>
                <option value="DELIVERED">배송 완료</option>
              </select>
            </div>
            <div className={styles['form-group']}>
              <label>처리자 *</label>
              <input
                type="text"
                value={processedBy}
                onChange={(e) => setProcessedBy(e.target.value)}
                required
                placeholder="처리자명을 입력하세요"
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label>처리 메모</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="처리 메모를 입력하세요"
              rows="3"
            />
          </div>

          <div className={styles['modal-actions']}>
            <button type="button" className="btn btn-primary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              발주 처리
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 