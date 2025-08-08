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

  // 샘플 데이터
  useEffect(() => {
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
        status: 'pending',
        totalAmount: 150000,
        items: [
          { productId: 1, productName: '아메리카노', quantity: 50, unitPrice: 4500, totalPrice: 225000 },
          { productId: 2, productName: '카페라떼', quantity: 30, unitPrice: 5500, totalPrice: 165000 },
          { productId: 4, productName: '샌드위치', quantity: 20, unitPrice: 8000, totalPrice: 160000 }
        ],
        requestNote: '신메뉴 출시 준비로 인한 대량 발주',
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
        status: 'approved',
        totalAmount: 98000,
        items: [
          { productId: 3, productName: '카푸치노', quantity: 25, unitPrice: 5500, totalPrice: 137500 },
          { productId: 6, productName: '티라미수', quantity: 15, unitPrice: 6500, totalPrice: 97500 }
        ],
        requestNote: '주말 이벤트 준비',
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
        status: 'rejected',
        totalAmount: 200000,
        items: [
          { productId: 5, productName: '샐러드', quantity: 40, unitPrice: 12000, totalPrice: 480000 },
          { productId: 7, productName: '치즈케이크', quantity: 30, unitPrice: 7000, totalPrice: 210000 }
        ],
        requestNote: '건강식품 트렌드 대응',
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
        status: 'delivered',
        totalAmount: 75000,
        items: [
          { productId: 8, productName: '감자튀김', quantity: 100, unitPrice: 3500, totalPrice: 350000 },
          { productId: 1, productName: '아메리카노', quantity: 20, unitPrice: 4500, totalPrice: 90000 }
        ],
        requestNote: '일반 발주',
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
        status: 'shipping',
        totalAmount: 120000,
        items: [
          { productId: 2, productName: '카페라떼', quantity: 35, unitPrice: 5500, totalPrice: 192500 },
          { productId: 4, productName: '샌드위치', quantity: 15, unitPrice: 8000, totalPrice: 120000 }
        ],
        requestNote: '신규 메뉴 테스트',
        processedBy: '박본사',
        processedAt: '2024-03-12 16:45'
      }
    ];

    setBranches(sampleBranches);
    setProducts(sampleProducts);
    setOrders(sampleOrders);
  }, []);

  const handleProcessOrder = (orderId, action, processedBy) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: action,
          processedBy: processedBy,
          processedAt: new Date().toLocaleString('ko-KR'),
          ...(action === 'rejected' && { rejectReason: '재고 부족으로 인한 발주 거절' })
        };
      }
      return order;
    });
    setOrders(updatedOrders);
    setShowProcessOrderModal(false);
  };

  const handleExportOrderData = () => {
    // 실제 구현에서는 Excel 또는 CSV 파일로 내보내기
    console.log('발주 데이터 내보내기');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.branchName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesBranch = selectedBranch === 'all' || order.branchId === parseInt(selectedBranch);
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '대기중',
      'approved': '승인',
      'rejected': '거절',
      'shipping': '배송중',
      'delivered': '배송완료'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': '#f59e0b',
      'approved': '#10b981',
      'rejected': '#ef4444',
      'shipping': '#3b82f6',
      'delivered': '#6b7280'
    };
    return colorMap[status] || '#6b7280';
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : 'Unknown';
  };

  const getTotalItems = (order) => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

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
                <option value="pending">대기중</option>
                <option value="approved">승인</option>
                <option value="rejected">거절</option>
                <option value="shipping">배송중</option>
                <option value="delivered">배송완료</option>
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
                    {branch.name}
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
                {filteredOrders.filter(o => o.status === 'pending').length}건
              </p>
            </div>
            <div className={styles['summary-card']}>
              <h3>총 발주금액</h3>
              <p className={styles['summary-number']}>
                {filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}원
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
                    <th>상품 수</th>
                    <th>총 금액</th>
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
                          <span className={styles['order-number']}>{order.orderNumber}</span>
                          <span className={styles['order-note']}>{order.requestNote}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles['branch-info']}>
                          <span className={styles['branch-name']}>{order.branchName}</span>
                          <span className={styles['branch-code']}>{order.branchCode}</span>
                        </div>
                      </td>
                      <td>{order.orderDate}</td>
                      <td>{order.deliveryDate}</td>
                      <td>{getTotalItems(order)}개</td>
                      <td>{order.totalAmount.toLocaleString()}원</td>
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
                            <span className={styles['process-time']}>{order.processedAt}</span>
                          </div>
                        ) : (
                          <span className={styles['no-processor']}>미처리</span>
                        )}
                      </td>
                      <td>
                        <div className={styles['action-buttons']}>
                          {order.status === 'pending' && (
                            <>
                              <button
                                className={`btn btn-small btn-primary ${styles['btn-small']}`}
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowProcessOrderModal(true);
                                }}
                              >
                                <img src={pencilIcon} alt="처리" className={styles['action-icon']} />
                              </button>
                            </>
                          )}
                          <button
                            className={`btn btn-small ${styles['btn-small']} ${styles['btn-detail']}`}
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowProcessOrderModal(true);
                            }}
                          >
                            상세
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
              const branchOrders = orders.filter(order => order.branchId === branch.id);
              const totalAmount = branchOrders.reduce((sum, order) => sum + order.totalAmount, 0);
              const avgOrderAmount = branchOrders.length > 0 ? totalAmount / branchOrders.length : 0;
              const pendingOrders = branchOrders.filter(order => order.status === 'pending').length;

              return (
                <div key={branch.id} className={styles['analysis-card']}>
                  <div className={styles['analysis-header']}>
                    <h3>{branch.name}</h3>
                    <span className={styles['branch-code']}>{branch.code}</span>
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
                        <span className={styles['order-number']}>{order.orderNumber}</span>
                        <span 
                          className={styles['order-status']}
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {getStatusText(order.status)}
                        </span>
                        <span className={styles['order-amount']}>{order.totalAmount.toLocaleString()}원</span>
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
            {orders.filter(order => order.status === 'shipping' || order.status === 'delivered').map(order => (
              <div key={order.id} className={styles['tracking-card']}>
                <div className={styles['tracking-header']}>
                  <h3>{order.orderNumber}</h3>
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
                    <span className={styles['info-value']}>{order.branchName}</span>
                  </div>
                  <div className={styles['info-row']}>
                    <span className={styles['info-label']}>발주일:</span>
                    <span className={styles['info-value']}>{order.orderDate}</span>
                  </div>
                  <div className={styles['info-row']}>
                    <span className={styles['info-label']}>배송예정일:</span>
                    <span className={styles['info-value']}>{order.deliveryDate}</span>
                  </div>
                  <div className={styles['info-row']}>
                    <span className={styles['info-label']}>총 금액:</span>
                    <span className={styles['info-value']}>{order.totalAmount.toLocaleString()}원</span>
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
                    <div className={`${styles['progress-step']} ${order.status === 'shipping' || order.status === 'delivered' ? styles['completed'] : ''}`}>
                      <span className={styles['step-icon']}>
                        {order.status === 'shipping' || order.status === 'delivered' ? '✓' : '○'}
                      </span>
                      <span className={styles['step-text']}>배송중</span>
                    </div>
                    <div className={`${styles['progress-step']} ${order.status === 'delivered' ? styles['completed'] : ''}`}>
                      <span className={styles['step-icon']}>
                        {order.status === 'delivered' ? '✓' : '○'}
                      </span>
                      <span className={styles['step-text']}>배송완료</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {orders.filter(order => order.status === 'shipping' || order.status === 'delivered').length === 0 && (
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
  const [rejectReason, setRejectReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onProcess(order.id, action, processedBy);
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
              <span className={styles['info-value']}>{order.orderNumber}</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>가맹점:</span>
              <span className={styles['info-value']}>{order.branchName}</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>발주일:</span>
              <span className={styles['info-value']}>{order.orderDate}</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>총 금액:</span>
              <span className={styles['info-value']}>{order.totalAmount.toLocaleString()}원</span>
            </div>
            <div className={styles['info-row']}>
              <span className={styles['info-label']}>요청사항:</span>
              <span className={styles['info-value']}>{order.requestNote}</span>
            </div>
          </div>

          <div className={styles['order-items']}>
            <h4>발주 상품</h4>
            <div className={styles['items-list']}>
              {order.items.map((item, index) => (
                <div key={index} className={styles['item-row']}>
                  <span className={styles['item-name']}>{item.productName}</span>
                  <span className={styles['item-quantity']}>{item.quantity}개</span>
                  <span className={styles['item-price']}>{item.unitPrice.toLocaleString()}원</span>
                  <span className={styles['item-total']}>{item.totalPrice.toLocaleString()}원</span>
                </div>
              ))}
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
                <option value="approved">승인</option>
                <option value="rejected">거절</option>
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

          {action === 'rejected' && (
            <div className={styles['form-group']}>
              <label>거절 사유</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="거절 사유를 입력하세요"
                rows="3"
              />
            </div>
          )}

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