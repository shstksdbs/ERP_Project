import React, { useState, useEffect } from 'react';
import styles from './OrderingHistory.module.css';
import searchIcon from '../../assets/search_icon.png';
import packageInIcon from '../../assets/packageIn_icon.png';
import supplyRequestService from '../../services/supplyRequestService';

export default function OrderingHistory({ branchId }) {
  const [supplyRequests, setSupplyRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (branchId) {
      loadSupplyRequests();
    }
  }, [branchId]);

  // 발주 요청 목록 로드
  const loadSupplyRequests = async () => {
    try {
      setLoading(true);
      const data = await supplyRequestService.getSupplyRequests(branchId);
      setSupplyRequests(data);
    } catch (error) {
      console.error('발주 요청 목록 로드 실패:', error);
      setSupplyRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 및 필터링
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
  };

  // 발주 상세 정보 클릭
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };
  
  // 모달 닫기
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  // 발주 삭제
  const handleDeleteOrder = async (orderId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('정말로 이 발주를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      // 실제 삭제 API 호출
      await supplyRequestService.deleteSupplyRequest(orderId);
      
      // 목록에서 제거
      setSupplyRequests(prev => prev.filter(request => request.id !== orderId));
      alert('발주가 삭제되었습니다.');
    } catch (error) {
      console.error('발주 삭제 실패:', error);
      
      // 에러 메시지에서 서버 응답 추출
      let errorMessage = '발주 삭제에 실패했습니다.';
      if (error.message && error.message.includes('message:')) {
        const serverMessage = error.message.split('message:')[1]?.trim();
        if (serverMessage) {
          errorMessage = serverMessage;
        }
      }
      
      alert(errorMessage);
    }
  };

  // 통화 포맷팅
  const formatCurrency = (amount) => {
    if (!amount) return '0원';
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR');
    } catch (error) {
      return dateString;
    }
  };

  // 상태 텍스트 반환
  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return '승인대기';
      case 'APPROVED':
        return '승인완료';
      case 'IN_TRANSIT':
        return '배송중';
      case 'DELIVERED':
        return '배송완료';
      case 'CANCELLED':
        return '취소';
      default:
        return status || '알 수 없음';
    }
  };

  // 상태별 CSS 클래스 반환
  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return styles.statusPending;
      case 'APPROVED':
        return styles.statusApproved;
      case 'IN_TRANSIT':
        return styles.statusDelivered;
      case 'DELIVERED':
        return styles.statusDelivered;
      case 'CANCELLED':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  // 우선순위 텍스트 반환
  const getPriorityText = (priority) => {
    switch (priority) {
      case 'LOW':
        return '낮음';
      case 'NORMAL':
        return '보통';
      case 'HIGH':
        return '높음';
      case 'URGENT':
        return '긴급';
      default:
        return priority || '보통';
    }
  };

  // 발주 상품 목록을 문자열로 변환
  const getOrderItemsText = (items) => {
    if (!items || items.length === 0) return '상품 정보 없음';
    
    return items.map(item => {
      if (item.materialName) {
        return `${item.materialName} x${item.requestedQuantity || 0}${item.unit || ''}`;
      } else {
        return `상품 x${item.requestedQuantity || 0}`;
      }
    }).join('\n');
  };

  // 필터링된 발주 요청 목록
  const filteredRequests = supplyRequests.filter(request => {
    const matchesSearch = request.id?.toString().includes(searchTerm) || 
                         (request.requestDate && new Date(request.requestDate).toLocaleDateString('ko-KR').includes(searchTerm));
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>발주이력</h1>
        <div className={styles.headerActions}>
          <div className={styles.searchContainer}>
            <img src={searchIcon} alt="검색" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="발주번호 또는 날짜로 검색"
              value={searchTerm}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>
          <select
            value={selectedStatus}
            onChange={handleStatusFilter}
            className={styles.statusFilter}
          >
            <option value="all">전체 상태</option>
            <option value="PENDING">승인대기</option>
            <option value="APPROVED">승인완료</option>
            <option value="IN_TRANSIT">배송중</option>
            <option value="DELIVERED">배송완료</option>
            <option value="CANCELLED">취소</option>
          </select>
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : supplyRequests.length === 0 ? (
          <div className={styles.emptyState}>
            <p>발주 이력이 없습니다.</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th>발주번호</th>
                  <th>발주일</th>
                  <th>신청자</th>
                  <th>발주내용</th>
                  <th>총 금액</th>
                  <th>상태</th>
                  <th>우선순위</th>
                                     <th>예상배송일</th>
                   <th>작업</th>
                 </tr>
               </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} onClick={() => handleOrderClick(request)} className={styles.tableRow}>
                                         <td className={styles.orderNumber}>
                       <div>SR{request.id?.toString().padStart(6, '0')}</div>
                       {request.notes && (
                         <div className={styles.orderNotes}>
                           {request.notes}
                         </div>
                       )}
                     </td>
                     <td>{formatDate(request.requestDate)}</td>
                     <td className={styles.requester}>
                       {request.requesterName || '알 수 없음'}
                     </td>
                    <td>
                      <div className={styles.orderItems}>
                        {getOrderItemsText(request.items)}
                      </div>
                    </td>
                    <td className={styles.amount}>{formatCurrency(request.totalCost)}</td>
                    <td>
                      <span className={`${styles.status} ${getStatusClass(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td>
                      <span className={styles.priority}>
                        {getPriorityText(request.priority)}
                      </span>
                    </td>
                                         <td>{formatDate(request.expectedDeliveryDate)}</td>
                                          <td className={styles.actions}>
                        
                        <button 
                          className={styles.deleteButton}
                          disabled={request.status !== 'PENDING'}
                          onClick={(e) => handleDeleteOrder(request.id, e)}
                          title={request.status !== 'PENDING' ? `현재 상태: ${getStatusText(request.status)} - 승인대기 상태에서만 삭제 가능합니다` : '발주 삭제'}
                        >
                          삭제
                        </button>
                        <button 
                          className={styles.detailButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderClick(request);
                          }}
                        >
                          상세
                        </button>
                      </td>
                   </tr>
                 ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* 발주 상세 정보 모달 */}
      {showDetailModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>발주 상세 정보</h3>
              <button onClick={handleCloseModal} className={styles.closeButton}>
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.detailSection}>
                <h4>기본 정보</h4>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <label>발주번호:</label>
                    <span>SR{selectedOrder.id?.toString().padStart(6, '0')}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>발주일:</label>
                    <span>{formatDate(selectedOrder.requestDate)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>신청자:</label>
                    <span>{selectedOrder.requesterName || '알 수 없음'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>상태:</label>
                    <span className={`${styles.status} ${getStatusClass(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>우선순위:</label>
                    <span>{getPriorityText(selectedOrder.priority)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>예상배송일:</label>
                    <span>{formatDate(selectedOrder.expectedDeliveryDate)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <label>총 금액:</label>
                    <span className={styles.amount}>{formatCurrency(selectedOrder.totalCost)}</span>
                  </div>
                  {selectedOrder.notes && (
                    <div className={styles.detailItem}>
                      <label>비고:</label>
                      <span>{selectedOrder.notes}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={styles.detailSection}>
                <h4>발주 원재료 목록</h4>
                <div className={styles.itemsTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>원재료명</th>
                        <th>카테고리</th>
                        <th>수량</th>
                        <th>단위</th>
                        <th>단가</th>
                        <th>소계</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items && selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.materialName || '알 수 없음'}</td>
                          <td>{item.materialCategory || '-'}</td>
                          <td>{item.requestedQuantity || 0}</td>
                          <td>{item.unit || '-'}</td>
                          <td>{formatCurrency(item.costPerUnit)}</td>
                          <td>{formatCurrency(item.totalCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button onClick={handleCloseModal} className={styles.closeButton}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
