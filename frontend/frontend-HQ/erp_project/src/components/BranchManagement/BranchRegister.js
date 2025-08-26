import React, { useState } from 'react';
import axios from 'axios';
import styles from './BranchRegister.module.css';

export default function BranchRegister() {
  const [formData, setFormData] = useState({
    branchName: '',
    branchCode: '',
    address: '',
    phone: '',
    manager: '',
    openingTime: '',
    closingTime: '',
    openDate: '',
    status: 'active'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // API 기본 설정
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 에러 메시지 초기화
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // 필수 필드 검증
      if (!formData.branchName.trim() || !formData.branchCode.trim()) {
        throw new Error('지점명과 지점 코드는 필수 입력 항목입니다.');
      }

      // 운영시간 검증
      if (formData.openingTime && formData.closingTime) {
        if (formData.openingTime >= formData.closingTime) {
          throw new Error('시작시간은 종료시간보다 빨라야 합니다.');
        }
      }

      // API 호출을 위한 데이터 변환
      const apiData = {
        branchName: formData.branchName.trim(),
        branchCode: formData.branchCode.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        managerName: formData.manager.trim(),
        operatingHours: formData.openingTime && formData.closingTime 
          ? JSON.stringify({ open: formData.openingTime, close: formData.closingTime })
          : '',
        openDate: formData.openDate || null,
        status: formData.status
      };

      // API 호출
      const response = await axios.post(`${API_BASE_URL}/branches`, apiData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      setSuccess('지점이 성공적으로 등록되었습니다!');
      
      // 폼 초기화
      setFormData({
        branchName: '',
        branchCode: '',
        address: '',
        phone: '',
        manager: '',
        openingTime: '',
        closingTime: '',
        openDate: '',
        status: 'active'
      });

      console.log('지점 등록 성공:', response.data);
      
    } catch (error) {
      let errorMessage = '지점 등록에 실패했습니다.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.details) {
        // 검증 오류인 경우
        const details = error.response.data.details;
        errorMessage = Object.values(details).join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      console.error('지점 등록 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // 폼 초기화
    setFormData({
      branchName: '',
      branchCode: '',
      address: '',
      phone: '',
      manager: '',
      openingTime: '',
      closingTime: '',
      openDate: '',
      status: 'active'
    });
    setError('');
    setSuccess('');
  };

  return (
    <div className={styles['branch-register']}>
      <div className={styles['branch-register-header']}>
        <h1>지점 등록</h1>
      </div>

      <div className={styles['register-form-container']}>
        <form onSubmit={handleSubmit} className={styles['register-form']}>
          <div className={styles['form-section']}>
            <h2>기본 정보</h2>
            
            {/* 에러 메시지 표시 */}
            {error && (
              <div className={styles['error-message']}>
                {error}
              </div>
            )}
            
            {/* 성공 메시지 표시 */}
            {success && (
              <div className={styles['success-message']}>
                {success}
              </div>
            )}

            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="branchName">지점명 *</label>
                <input
                  type="text"
                  id="branchName"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  required
                  placeholder="지점명을 입력하세요"
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="branchCode">지점 코드 *</label>
                <input
                  type="text"
                  id="branchCode"
                  name="branchCode"
                  value={formData.branchCode}
                  onChange={handleInputChange}
                  required
                  placeholder="지점 코드를 입력하세요"
                />
              </div>
            </div>

            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="manager">지점장</label>
                <input
                  type="text"
                  id="manager"
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  placeholder="지점장 이름을 입력하세요"
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="status">상태</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="pending">대기</option>
                </select>
              </div>
            </div>

            <div className={`${styles['form-row']} ${styles['time-row']}`}>
              <div className={styles['form-group']}>
                <label htmlFor="openingTime">운영시간 (시작)</label>
                <input
                  type="time"
                  id="openingTime"
                  name="openingTime"
                  value={formData.openingTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="closingTime">운영시간 (종료)</label>
                <input
                  type="time"
                  id="closingTime"
                  name="closingTime"
                  value={formData.closingTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles['form-group']}>
                <label htmlFor="openDate">오픈날짜</label>
                <input
                  type="date"
                  id="openDate"
                  name="openDate"
                  value={formData.openDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className={styles['form-section']}>
            <h2>연락처 정보</h2>
            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="address">주소</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="지점 주소를 입력하세요"
                />
              </div>
            </div>

            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label htmlFor="phone">전화번호</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="000-0000-0000"
                />
              </div>
            </div>
          </div>
          <div className={styles['form-actions']}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? '등록 중...' : '지점 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 