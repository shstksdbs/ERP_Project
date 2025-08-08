import React, { useState, useEffect } from 'react';
import styles from './OrderHistory.module.css';
import searchIcon from '../../assets/search_icon.png';
import historyIcon from '../../assets/history_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import downloadIcon from '../../assets/download_icon.png';

export default function OrderHistory() {
  const [activeTab, setActiveTab] = useState('order-history');
  const [orderHistory, setOrderHistory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 샘플 데이터
  useEffect(() => {
    // 지점 데이터
    setBranches([
      { id: 1, name: '강남점', region: '서울' },
      { id: 2, name: '홍대점', region: '서울' },
      { id: 3, name: '부산점', region: '부산' },
      { id: 4, name: '대구점', region: '대구' },
      { id: 5, name: '인천점', region: '인천' }
    ]);

    // 상품 데이터
    setProducts([
      { id: 1, name: '아메리카노', category: '음료' },
      { id: 2, name: '카페라떼', category: '음료' },
      { id: 3, name: '카푸치노', category: '음료' },
      { id: 4, name: '티라떼', category: '음료' },
      { id: 5, name: '에스프레소', category: '음료' }
    ]);

    // 발주 이력 데이터
    setOrderHistory([
      {
        id: 1,
        orderNumber: 'ORD-2024-001',
        branchId: 1,
        branchName: '강남점',
        orderDate: '2024-01-15',
        deliveryDate: '2024-01-18',
        status: 'delivered',
        totalAmount: 250000,
        totalItems: 15,
        processor: '김관리',
        processedDate: '2024-01-16',
        items: [
          { productId: 1, productName: '아메리카노', quantity: 50, unitPrice: 5000, totalPrice: 250000 },
          { productId: 2, productName: '카페라떼', quantity: 30, unitPrice: 6000, totalPrice: 180000 }
        ]
      },
      {
        id: 2,
        orderNumber: 'ORD-2024-002',
        branchId: 2,
        branchName: '홍대점',
        orderDate: '2024-01-14',
        deliveryDate: '2024-01-17',
        status: 'delivered',
        totalAmount: 180000,
        totalItems: 12,
        processor: '이처리',
        processedDate: '2024-01-15',
        items: [
          { productId: 3, productName: '카푸치노', quantity: 40, unitPrice: 5500, totalPrice: 220000 },
          { productId: 4, productName: '티라떼', quantity: 25, unitPrice: 6500, totalPrice: 162500 }
        ]
      },
      {
        id: 3,
        orderNumber: 'ORD-2024-003',
        branchId: 3,
        branchName: '부산점',
        orderDate: '2024-01-13',
        deliveryDate: '2024-01-16',
        status: 'delivered',
        totalAmount: 320000,
        totalItems: 20,
        processor: '박승인',
        processedDate: '2024-01-14',
        items: [
          { productId: 1, productName: '아메리카노', quantity: 60, unitPrice: 5000, totalPrice: 300000 },
          { productId: 5, productName: '에스프레소', quantity: 20, unitPrice: 4000, totalPrice: 80000 }
        ]
      },
      {
        id: 4,
        orderNumber: 'ORD-2024-004',
        branchId: 1,
        branchName: '강남점',
        orderDate: '2024-01-12',
        deliveryDate: '2024-01-15',
        status: 'rejected',
        totalAmount: 150000,
        totalItems: 10,
        processor: '김관리',
        processedDate: '2024-01-13',
        items: [
          { productId: 2, productName: '카페라떼', quantity: 25, unitPrice: 6000, totalPrice: 150000 }
        ]
      },
      {
        id: 5,
        orderNumber: 'ORD-2024-005',
        branchId: 4,
        branchName: '대구점',
        orderDate: '2024-01-11',
        deliveryDate: '2024-01-14',
        status: 'delivered',
        totalAmount: 280000,
        totalItems: 18,
        processor: '최처리',
        processedDate: '2024-01-12',
        items: [
          { productId: 3, productName: '카푸치노', quantity: 35, unitPrice: 5500, totalPrice: 192500 },
          { productId: 4, productName: '티라떼', quantity: 30, unitPrice: 6500, totalPrice: 195000 }
        ]
      }
    ]);
  }, []);

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleExportHistoryData = () => {
    console.log('발주 이력 데이터 내보내기');
  };

  const filteredOrderHistory = orderHistory.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.branchName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesBranch = selectedBranch === 'all' || order.branchId === parseInt(selectedBranch);
    const matchesPeriod = selectedPeriod === 'all' || 
                         (selectedPeriod === 'recent' && new Date(order.orderDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
                         (selectedPeriod === 'month' && new Date(order.orderDate).getMonth() === new Date().getMonth());
    
    return matchesSearch && matchesStatus && matchesBranch && matchesPeriod;
  });

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return '배송완료';
      case 'shipping': return '배송중';
      case 'approved': return '승인됨';
      case 'rejected': return '거절됨';
      case 'pending': return '대기중';
      default: return '알 수 없음';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'shipping': return '#3b82f6';
      case 'approved': return '#8b5cf6';
      case 'rejected': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : '알 수 없음';
  };

  const getTotalItems = (order) => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  // 통계 계산
  const totalOrders = orderHistory.length;
  const totalAmount = orderHistory.reduce((sum, order) => sum + order.totalAmount, 0);
  const averageAmount = totalOrders > 0 ? Math.round(totalAmount / totalOrders) : 0;
  const deliveredOrders = orderHistory.filter(order => order.status === 'delivered').length;
  const rejectedOrders = orderHistory.filter(order => order.status === 'rejected').length;

  return (
    <div className={styles['order-history']}>
      <div className={styles['order-history-header']}>
        <h1>발주 이력</h1>
        <p>가맹점들의 발주 이력을 조회하고 분석할 수 있습니다.</p>
      </div>

      <div className={styles['tab-container']}>
        <button
          className={`${styles['tab-button']} ${activeTab === 'order-history' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('order-history')}
        >
          발주 이력 관리
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'history-analysis' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('history-analysis')}
        >
          이력 분석
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'statistics-report' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('statistics-report')}
        >
          통계 보고서
        </button>
      </div>

      {activeTab === 'order-history' && (
        <div className={styles['order-history-content']}>
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
                  placeholder="발주번호 또는 지점명으로 검색"
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
                <option value="delivered">배송완료</option>
                <option value="shipping">배송중</option>
                <option value="approved">승인됨</option>
                <option value="rejected">거절됨</option>
                <option value="pending">대기중</option>
              </select>
            </div>
            <div className={styles['filter-box']}>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className={styles['filter-select']}
              >
                <option value="all">전체 지점</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
            <div className={styles['filter-box']}>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className={styles['filter-select']}
              >
                <option value="all">전체 기간</option>
                <option value="recent">최근 30일</option>
                <option value="month">이번 달</option>
              </select>
            </div>
            <button
              className={`btn btn-primary ${styles['export-button']}`}
              onClick={handleExportHistoryData}
            >
              <img src={downloadIcon} alt="내보내기" className={styles['button-icon']} />
              발주 이력 데이터 내보내기
            </button>
          </div>

          <div className={styles['order-summary']}>
            <div className={styles['summary-card']}>
              <h3>총 발주 건수</h3>
              <p className={styles['summary-number']}>{totalOrders.toLocaleString()}건</p>
            </div>
            <div className={styles['summary-card']}>
              <h3>총 발주 금액</h3>
              <p className={styles['summary-number']}>{totalAmount.toLocaleString()}원</p>
            </div>
            <div className={styles['summary-card']}>
              <h3>평균 발주 금액</h3>
              <p className={styles['summary-number']}>{averageAmount.toLocaleString()}원</p>
            </div>
            <div className={styles['summary-card']}>
              <h3>배송완료율</h3>
              <p className={styles['summary-number']}>
                {totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className={styles['orders-container']}>
            <div className={styles['orders-list']}>
              <table className={styles['orders-table']}>
                <thead className={styles['orders-table-header']}>
                  <tr>
                    <th>발주번호</th>
                    <th>지점명</th>
                    <th>발주일</th>
                    <th>배송일</th>
                    <th>총 금액</th>
                    <th>총 수량</th>
                    <th>상태</th>
                    <th>처리자</th>
                    <th>처리일</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrderHistory.map(order => (
                    <tr key={order.id}>
                      <td>{order.orderNumber}</td>
                      <td>{order.branchName}</td>
                      <td>{order.orderDate}</td>
                      <td>{order.deliveryDate}</td>
                      <td>{order.totalAmount.toLocaleString()}원</td>
                      <td>{getTotalItems(order)}개</td>
                      <td>
                        <span 
                          className={styles['status-badge']}
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>{order.processor}</td>
                      <td>{order.processedDate}</td>
                      <td>
                        <div className={styles['action-buttons']}>
                          <button
                            className={`btn btn-small ${styles['btn-detail']}`}
                            onClick={() => handleViewDetail(order)}
                          >
                            
                            상세보기
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

      {activeTab === 'history-analysis' && (
        <div className={styles['history-analysis']}>
          <div className={styles['analysis-header']}>
            <h2>이력 분석</h2>
            <p>발주 이력에 대한 상세한 분석을 제공합니다.</p>
          </div>
          <div className={styles['analysis-grid']}>
            <div className={styles['analysis-card']}>
              <h3>지점별 발주 현황</h3>
              <div className={styles['branch-analysis']}>
                {branches.map(branch => {
                  const branchOrders = orderHistory.filter(order => order.branchId === branch.id);
                  const totalAmount = branchOrders.reduce((sum, order) => sum + order.totalAmount, 0);
                  const deliveredCount = branchOrders.filter(order => order.status === 'delivered').length;
                  
                  return (
                    <div key={branch.id} className={styles['branch-item']}>
                      <div className={styles['branch-info']}>
                        <h4>{branch.name}</h4>
                        <p>{branch.region}</p>
                      </div>
                      <div className={styles['branch-stats']}>
                        <div className={styles['stat-item']}>
                          <span className={styles['stat-label']}>총 발주</span>
                          <span className={styles['stat-value']}>{branchOrders.length}건</span>
                        </div>
                        <div className={styles['stat-item']}>
                          <span className={styles['stat-label']}>총 금액</span>
                          <span className={styles['stat-value']}>{totalAmount.toLocaleString()}원</span>
                        </div>
                        <div className={styles['stat-item']}>
                          <span className={styles['stat-label']}>배송완료</span>
                          <span className={styles['stat-value']}>{deliveredCount}건</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles['analysis-card']}>
              <h3>상태별 통계</h3>
              <div className={styles['status-analysis']}>
                <div className={styles['status-item']}>
                  <div className={styles['status-info']}>
                    <span className={styles['status-label']}>배송완료</span>
                    <span className={styles['status-count']}>{deliveredOrders}건</span>
                  </div>
                  <div className={styles['status-bar']}>
                    <div 
                      className={styles['status-progress']} 
                      style={{ 
                        width: `${totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0}%`,
                        backgroundColor: '#10b981'
                      }}
                    ></div>
                  </div>
                </div>
                <div className={styles['status-item']}>
                  <div className={styles['status-info']}>
                    <span className={styles['status-label']}>거절됨</span>
                    <span className={styles['status-count']}>{rejectedOrders}건</span>
                  </div>
                  <div className={styles['status-bar']}>
                    <div 
                      className={styles['status-progress']} 
                      style={{ 
                        width: `${totalOrders > 0 ? (rejectedOrders / totalOrders) * 100 : 0}%`,
                        backgroundColor: '#ef4444'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'statistics-report' && (
        <div className={styles['statistics-report']}>
          <div className={styles['report-header']}>
            <h2>통계 보고서</h2>
            <p>발주 이력에 대한 종합적인 통계 보고서를 제공합니다.</p>
          </div>
          <div className={styles['report-grid']}>
            <div className={styles['report-card']}>
              <h3>월별 발주 통계</h3>
              <div className={styles['monthly-stats']}>
                <div className={styles['monthly-item']}>
                  <span className={styles['month-label']}>1월</span>
                  <span className={styles['month-value']}>15건</span>
                  <span className={styles['month-amount']}>2,500,000원</span>
                </div>
                <div className={styles['monthly-item']}>
                  <span className={styles['month-label']}>2월</span>
                  <span className={styles['month-value']}>12건</span>
                  <span className={styles['month-amount']}>1,800,000원</span>
                </div>
                <div className={styles['monthly-item']}>
                  <span className={styles['month-label']}>3월</span>
                  <span className={styles['month-value']}>18건</span>
                  <span className={styles['month-amount']}>3,200,000원</span>
                </div>
              </div>
            </div>

            <div className={styles['report-card']}>
              <h3>상품별 발주 현황</h3>
              <div className={styles['product-stats']}>
                {products.map(product => {
                  const productOrders = orderHistory.filter(order => 
                    order.items.some(item => item.productId === product.id)
                  );
                  const totalQuantity = productOrders.reduce((sum, order) => {
                    const item = order.items.find(item => item.productId === product.id);
                    return sum + (item ? item.quantity : 0);
                  }, 0);
                  
                  return (
                    <div key={product.id} className={styles['product-item']}>
                      <div className={styles['product-info']}>
                        <h4>{product.name}</h4>
                        <p>{product.category}</p>
                      </div>
                      <div className={styles['product-stats']}>
                        <span className={styles['quantity']}>{totalQuantity}개</span>
                        <span className={styles['orders']}>{productOrders.length}건</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          onClose={() => setShowDetailModal(false)} 
        />
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>발주 상세 정보</h2>
          <button className={styles['modal-close']} onClick={onClose}>×</button>
        </div>
        <div className={styles['modal-body']}>
          <div className={styles['order-info']}>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>발주번호:</span>
              <span className={styles['info-value']}>{order.orderNumber}</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>지점명:</span>
              <span className={styles['info-value']}>{order.branchName}</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>발주일:</span>
              <span className={styles['info-value']}>{order.orderDate}</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>배송일:</span>
              <span className={styles['info-value']}>{order.deliveryDate}</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>처리자:</span>
              <span className={styles['info-value']}>{order.processor}</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>처리일:</span>
              <span className={styles['info-value']}>{order.processedDate}</span>
            </div>
          </div>
          
          <div className={styles['order-items']}>
            <h4>발주 상품 목록</h4>
            <table className={styles['items-table']}>
              <thead>
                <tr>
                  <th>상품명</th>
                  <th>수량</th>
                  <th>단가</th>
                  <th>총액</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.productName}</td>
                    <td>{item.quantity}개</td>
                    <td>{item.unitPrice.toLocaleString()}원</td>
                    <td>{item.totalPrice.toLocaleString()}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles['total-amount']}>
              <span>총 금액: {order.totalAmount.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 