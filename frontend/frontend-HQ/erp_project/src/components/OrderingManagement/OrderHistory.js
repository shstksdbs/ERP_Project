import React, { useState, useEffect } from 'react';
import styles from './OrderHistory.module.css';
import searchIcon from '../../assets/search_icon.png';
import historyIcon from '../../assets/history_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import downloadIcon from '../../assets/download_icon.png';
import { supplyRequestAPI, branchAPI, materialAPI, userAPI } from '../../services/api';

export default function OrderHistory() {
  const [activeTab, setActiveTab] = useState('order-history');
  const [orderHistory, setOrderHistory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 데이터 로딩 함수들
  const loadBranches = async () => {
    try {
      const branchesData = await branchAPI.getAllBranches();
      setBranches(branchesData);
    } catch (error) {
      console.error('지점 데이터 로딩 실패:', error);
      setError('지점 데이터를 불러오는데 실패했습니다.');
    }
  };

  const loadMaterials = async () => {
    try {
      const materialsData = await materialAPI.getAllMaterials();
      setMaterials(materialsData);
    } catch (error) {
      console.error('재료 데이터 로딩 실패:', error);
      setError('재료 데이터를 불러오는데 실패했습니다.');
    }
  };

  const loadSupplyRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      let requestsData;

      if (selectedStatus !== 'all') {
        requestsData = await supplyRequestAPI.getSupplyRequestsByStatus(selectedStatus);
      } else if (selectedBranch !== 'all') {
        requestsData = await supplyRequestAPI.getSupplyRequestsByBranch(selectedBranch);
      } else {
        requestsData = await supplyRequestAPI.getAllSupplyRequests();
      }

      // 데이터 변환 및 가공
      const processedData = await Promise.all(
        requestsData.map(async (request) => {
          // 디버깅을 위한 로그 (필요시 주석 해제)
          // console.log('원본 발주 요청 데이터:', request);

          // 지점 정보 가져오기
          const branch = branches.find(b => b.id === request.requestingBranchId);
          if (!branch) {
            console.warn(`지점을 찾을 수 없음: branchId=${request.requestingBranchId}, available branches:`, branches.map(b => ({ id: b.id, name: b.branchName })));
          }

          // 요청자 정보 가져오기
          let requester = {};
          if (request.requesterId) {
            try {
              requester = await userAPI.getUserById(request.requesterId);
            } catch (error) {
              console.error('요청자 정보 로딩 실패:', error);
            }
          }

          // 발주 아이템 정보 가져오기 (백엔드에서 이미 포함되어 있음)
          const items = request.items || [];

          const processedOrder = {
            id: request.id,
            orderNumber: `SUP-${request.id.toString().padStart(6, '0')}`,
            branchId: request.requestingBranchId,
            branchName: branch ? branch.branchName : '알 수 없음',
            orderDate: request.requestDate ? new Date(request.requestDate).toLocaleDateString('ko-KR') : '알 수 없음',
            deliveryDate: request.expectedDeliveryDate || '미정',
            status: request.status?.toLowerCase() || 'pending',
            totalAmount: request.totalCost || 0,
            totalItems: items.length,
            processor: request.processedBy || request.processed_by || '미처리',
            processedDate: request.processedAt ? new Date(request.processedAt).toLocaleDateString('ko-KR') :
              (request.processed_at ? new Date(request.processed_at).toLocaleDateString('ko-KR') : '미처리'),
            priority: request.priority || 'NORMAL',
            notes: request.notes || '',
            items: items,
            originalData: request
          };

          // console.log('가공된 발주 데이터:', processedOrder);
          return processedOrder;
        })
      );

      // 기간 필터링 적용
      if (selectedPeriod !== 'all') {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        processedData = processedData.filter(request => {
          const orderDate = new Date(request.originalData.requestDate);

          if (selectedPeriod === 'recent') {
            return orderDate >= thirtyDaysAgo;
          } else if (selectedPeriod === 'month') {
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
          }
          return true;
        });
      }

      setOrderHistory(processedData);
    } catch (error) {
      console.error('발주 요청 데이터 로딩 실패:', error);
      setError('발주 요청 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    loadBranches();
    loadMaterials();
  }, []);

  // 필터 변경 시 데이터 재로딩
  useEffect(() => {
    if (branches.length > 0 && materials.length > 0) {
      loadSupplyRequests();
    }
  }, [selectedStatus, selectedBranch, selectedPeriod, branches, materials]);

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleExportHistoryData = () => {
    console.log('발주 이력 데이터 내보내기');
    // CSV 내보내기 로직 구현
  };

  const filteredOrderHistory = orderHistory.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.branchName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return '배송완료';
      case 'in_transit': return '배송중';
      case 'approved': return '승인됨';
      case 'cancelled': return '취소됨';
      case 'pending': return '대기중';
      default: return '알 수 없음';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'in_transit': return '#3b82f6';
      case 'approved': return '#8b5cf6';
      case 'cancelled': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'LOW': return '낮음';
      case 'NORMAL': return '보통';
      case 'HIGH': return '높음';
      case 'URGENT': return '긴급';
      default: return '보통';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return '#6b7280';
      case 'NORMAL': return '#3b82f6';
      case 'HIGH': return '#f59e0b';
      case 'URGENT': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const getTotalItems = (order) => {
    return order.items ? order.items.length : 0;
  };

  // 통계 계산
  const totalOrders = orderHistory.length;
  const totalAmount = orderHistory.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const averageAmount = totalOrders > 0 ? Math.round(totalAmount / totalOrders) : 0;
  const deliveredOrders = orderHistory.filter(order => order.status === 'delivered').length;
  const pendingOrders = orderHistory.filter(order => order.status === 'pending').length;
  const rejectedOrders = orderHistory.filter(order => order.status === 'cancelled').length;

  if (error) {
    return (
      <div className={styles['error-container']}>
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>새로고침</button>
      </div>
    );
  }

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
                <option value="pending">대기중</option>
                <option value="approved">승인됨</option>
                <option value="in_transit">배송중</option>
                <option value="delivered">배송완료</option>
                <option value="cancelled">취소됨</option>
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
              <h3>대기중인 발주</h3>
              <p className={styles['summary-number']}>{pendingOrders}건</p>
            </div>
          </div>

          <div className={styles['orders-container']}>
            {loading ? (
              <div className={styles['loading-container']}>
                <p>데이터를 불러오는 중...</p>
              </div>
            ) : (
              <div className={styles['orders-list']}>
                <table className={styles['orders-table']}>
                  <thead className={styles['orders-table-header']}>
                    <tr>
                      <th>발주번호</th>
                      <th>지점명</th>
                      <th>발주일</th>
                      <th>배송일</th>
                      <th>우선순위</th>
                      <th>총 금액</th>
                      <th>상태</th>
                      <th>처리자</th>
                      <th>처리일</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrderHistory.length > 0 ? (
                      filteredOrderHistory.map(order => (
                        <tr key={order.id}>
                          <td>{order.orderNumber}</td>
                          <td>{order.branchName}</td>
                          <td>{order.orderDate}</td>
                          <td>{order.deliveryDate}</td>
                          <td>
                            <span
                              className={styles['priority-badge']}
                              style={{ backgroundColor: getPriorityColor(order.priority) }}
                            >
                              {getPriorityText(order.priority)}
                            </span>
                          </td>
                          <td>{order.totalAmount ? order.totalAmount.toLocaleString() : 0}원</td>
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
                                className={`btn btn-small ${styles['btn-small']}`}
                                onClick={() => handleViewDetail(order)}
                              >
                                상세
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className={styles['no-data']}>
                          발주 이력이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
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
                  const totalAmount = branchOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                  const deliveredCount = branchOrders.filter(order => order.status === 'delivered').length;

                  return (
                    <div key={branch.id} className={styles['branch-item']}>
                      <div className={styles['branch-info']}>
                        <div className={styles['branch-info-header']}>
                          <h4>{branch.branchName}</h4>
                          <div className={styles['branch-code']}>
                            <span className={styles['code-label']}></span>
                            <span className={styles['code-value']}>{branch.branchCode || branch.id}</span>
                          </div>
                        </div>

                        <p className={styles['branch-address']}>{branch.address || '주소 정보 없음'}</p>
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
                 {(() => {
                   const months = [];
                   const now = new Date();
                   for (let i = 11; i >= 0; i--) {
                     const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
                     const monthOrders = orderHistory.filter(order => {
                       const orderDate = new Date(order.originalData.requestDate);
                       return orderDate.getFullYear() === month.getFullYear() && 
                              orderDate.getMonth() === month.getMonth();
                     });
                     const monthAmount = monthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                     
                     months.push({
                       label: `${month.getMonth() + 1}월`,
                       count: monthOrders.length,
                       amount: monthAmount
                     });
                   }
                   
                   return months.map((month, index) => (
                     <div key={index} className={styles['monthly-item']}>
                       <span className={styles['month-label']}>{month.label}</span>
                       <span className={styles['month-value']}>{month.count}건</span>
                       <span className={styles['month-amount']}>{month.amount.toLocaleString()}원</span>
                     </div>
                   ));
                 })()}
               </div>
             </div>

             <div className={styles['report-card']}>
               <h3>상품별 발주 현황</h3>
               <div className={styles['product-stats']}>
                 {materials.map(material => {
                   const materialOrders = orderHistory.filter(order =>
                     order.items.some(item => item.productId === material.id)
                   );
                   const totalQuantity = materialOrders.reduce((sum, order) => {
                     const item = order.items.find(item => item.productId === material.id);
                     return sum + (item ? item.quantity : 0);
                   }, 0);
                   const totalAmount = materialOrders.reduce((sum, order) => {
                     const item = order.items.find(item => item.productId === material.id);
                     return sum + (item ? (item.totalPrice || 0) : 0);
                   }, 0);

                   return (
                     <div key={material.id} className={styles['product-item']}>
                       <div className={styles['product-info']}>
                         <h4>{material.name}</h4>
                         <p>{material.category || '카테고리 없음'}</p>
                       </div>
                       <div className={styles['product-stats']}>
                         <span className={styles['quantity']}>{totalQuantity}개</span>
                         <span className={styles['orders']}>{materialOrders.length}건</span>
                         <span className={styles['amount']}>{totalAmount.toLocaleString()}원</span>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>

             <div className={styles['report-card']}>
               <h3>지점별 발주 성과</h3>
               <div className={styles['branch-performance']}>
                 {branches.map(branch => {
                   const branchOrders = orderHistory.filter(order => order.branchId === branch.id);
                   const totalAmount = branchOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                   const deliveredCount = branchOrders.filter(order => order.status === 'delivered').length;
                   const pendingCount = branchOrders.filter(order => order.status === 'pending').length;
                   const deliveryRate = branchOrders.length > 0 ? Math.round((deliveredCount / branchOrders.length) * 100) : 0;
                   
                   return (
                     <div key={branch.id} className={styles['branch-performance-item']}>
                       <div className={styles['branch-performance-info']}>
                         <h4>{branch.branchName}</h4>
                         <p>{branch.address || '주소 정보 없음'}</p>
                       </div>
                       <div className={styles['branch-performance-stats']}>
                         <div className={styles['performance-stat']}>
                           <span className={styles['performance-label']}>총 발주</span>
                           <span className={styles['performance-value']}>{branchOrders.length}건</span>
                         </div>
                         <div className={styles['performance-stat']}>
                           <span className={styles['performance-label']}>총 금액</span>
                           <span className={styles['performance-value']}>{totalAmount.toLocaleString()}원</span>
                         </div>
                         <div className={styles['performance-stat']}>
                           <span className={styles['performance-label']}>배송완료율</span>
                           <span className={styles['performance-value']}>{deliveryRate}%</span>
                         </div>
                         <div className={styles['performance-stat']}>
                           <span className={styles['performance-label']}>대기중</span>
                           <span className={styles['performance-value']}>{pendingCount}건</span>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>

             <div className={styles['report-card']}>
               <h3>우선순위별 발주 분석</h3>
               <div className={styles['priority-analysis-report']}>
                 {(() => {
                   const priorities = [
                     { key: 'URGENT', label: '긴급', color: '#ef4444' },
                     { key: 'HIGH', label: '높음', color: '#f59e0b' },
                     { key: 'NORMAL', label: '보통', color: '#3b82f6' },
                     { key: 'LOW', label: '낮음', color: '#6b7280' }
                   ];
                   
                   return priorities.map(priority => {
                     const priorityOrders = orderHistory.filter(order => order.priority === priority.key);
                     const priorityAmount = priorityOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
                     const deliveredCount = priorityOrders.filter(order => order.status === 'delivered').length;
                     const deliveryRate = priorityOrders.length > 0 ? Math.round((deliveredCount / priorityOrders.length) * 100) : 0;
                     
                     return (
                       <div key={priority.key} className={styles['priority-report-item']}>
                         <div className={styles['priority-report-header']}>
                           <span 
                             className={styles['priority-report-dot']} 
                             style={{ backgroundColor: priority.color }}
                           ></span>
                           <span className={styles['priority-report-label']}>{priority.label}</span>
                         </div>
                         <div className={styles['priority-report-stats']}>
                           <div className={styles['priority-report-stat']}>
                             <span className={styles['priority-report-count']}>{priorityOrders.length}건</span>
                             <span className={styles['priority-report-percentage']}>
                               {totalOrders > 0 ? Math.round((priorityOrders.length / totalOrders) * 100) : 0}%
                             </span>
                           </div>
                           <div className={styles['priority-report-amount']}>
                             {priorityAmount.toLocaleString()}원
                           </div>
                           <div className={styles['priority-report-delivery']}>
                             배송완료율: {deliveryRate}%
                           </div>
                         </div>
                       </div>
                     );
                   });
                 })()}
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