import React, { useState } from 'react';
import styles from './BranchRegister.module.css';

export default function BranchRegister() {
  const [formData, setFormData] = useState({
    branchName: '',
    branchCode: '',
    address: '',
    phone: '',
    manager: '',
    email: '',
    businessNumber: '',
    status: 'active'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('지점 등록 데이터:', formData);
    // API 호출 로직 추가
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
                <label htmlFor="businessNumber">사업자등록번호</label>
                <input
                  type="text"
                  id="businessNumber"
                  name="businessNumber"
                  value={formData.businessNumber}
                  onChange={handleInputChange}
                  placeholder="000-00-00000"
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
              <div className={styles['form-group']}>
                <label htmlFor="email">이메일</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                />
              </div>
            </div>
          </div>
          <div className={styles['form-actions']}>
            <button type="button" className="btn btn-primary">
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              지점 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 