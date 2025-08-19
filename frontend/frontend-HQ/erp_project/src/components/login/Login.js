import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import dashboardIcon from '../../assets/dashboard_icon.png';
import logo from '../../assets/logo.png';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    branchId: '99' // 본사 지점 ID를 99로 고정
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // 디버그 로그 추가
    console.log('=== 입력 변경 ===');
    console.log('변경된 필드:', name);
    console.log('변경된 값:', value);
    console.log('변경된 값 타입:', typeof value);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('업데이트된 formData:', newData);
      return newData;
    });
    
    setError(''); // 입력 시 에러 메시지 제거
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 디버그 로그 추가
    console.log('=== 로그인 시도 ===');
    console.log('전체 formData:', formData);
    console.log('username:', formData.username);
    console.log('password:', formData.password);
    console.log('branchId:', formData.branchId);
    console.log('branchId 타입:', typeof formData.branchId);
    
    if (!formData.username || !formData.password || !formData.branchId) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // API 요청 데이터 준비
      const requestData = {
        username: formData.username,
        password: formData.password,
        branchId: parseInt(formData.branchId)
      };
      
      console.log('=== API 요청 데이터 ===');
      console.log('전송할 데이터:', requestData);
      console.log('JSON 변환 후:', JSON.stringify(requestData));

      // 실제 로그인 API 호출
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        // 로그인 성공
        
        // 로그인 성공 - localStorage에 직접 저장
        const loginData = {
          username: formData.username,
          branchId: formData.branchId,
          branchName: '본사', // 본사 지점명 고정
          realName: data.realName,
          role: data.role,
          lastLogin: data.lastLogin,
          loginTime: new Date().toISOString()
        };
        
        // localStorage에 저장
        localStorage.setItem('erpLoginData', JSON.stringify(loginData));
        
        // 로그인 성공 콜백 호출
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        
        // 본사 대시보드로 이동
        navigate('/dashboard');
      } else {
        // 로그인 실패
        setError(data.message || '로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('로그인 오류:', err);
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginContainer}>
        <div className={styles.loginHeader}>
          <div className={styles.logoContainer}>
            <img src={logo} alt="ERP 시스템 로고" className={styles.logo} />
          </div>
          <p className={styles.subtitle}>본사 관리 시스템에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>사용자명</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="사용자명을 입력하세요"
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>비밀번호</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="비밀번호를 입력하세요"
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          {/* 본사 지점 ID는 숨겨진 필드로 처리 */}
          <input
            type="hidden"
            name="branchId"
            value={formData.branchId}
          />

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            문제가 있으시면 시스템 관리자에게 문의하세요
          </p>
        </div>
      </div>
    </div>
  );
}
