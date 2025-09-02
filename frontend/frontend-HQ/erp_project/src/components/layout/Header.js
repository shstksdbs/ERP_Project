import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';
import logo from '../../assets/logo.png';
import userIcon from '../../assets/user_icon.png';
import noticeIcon from '../../assets/notice_icon.png';
import bellIcon from '../../assets/bell_icon.png';


export default function Header({ activeTab, setActiveTab, onLogout }) {
  const [userInfo, setUserInfo] = useState({ username: '', realName: '', branchName: '', role: '', lastLogin: '' });

  useEffect(() => {
    const loginData = localStorage.getItem('erpLoginData');
    if (loginData) {
      try {
        const parsedData = JSON.parse(loginData);
        setUserInfo({
          username: parsedData.username || '',
          realName: parsedData.realName || parsedData.username || '사용자',
          branchName: parsedData.branchName || '본사',
          role: parsedData.role || 'ADMIN',
          lastLogin: parsedData.lastLogin || ''
        });
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <header className={styles['erp-header']}>
      <div className={styles['header-container']}>
        {/* 로고 영역 */}
        <div className={styles['header-logo']}>
          <img
            src={logo}
            alt="ERP 시스템 로고"
            className={styles['logo-image']}
            onClick={() => setActiveTab(['dashboard'])}
            style={{ cursor: 'pointer' }}
          />
        </div>



        {/* 사용자 정보 영역 */}
        <div className={styles['header-user']}>
          <div className={styles['header-icon-container']}>
            {/* <img src={noticeIcon} alt="공지사항" className={styles['header-icon']} /> */}
            <img src={bellIcon} alt="알림" className={styles['header-icon']} />
          </div>
          <div className={styles['user-info']}>
            <img src={userIcon} alt="사용자" className={styles['user-icon']} />
            <div className={styles['user-details']}>
              <span className={styles['user-name']}>
                {userInfo.realName ? `${userInfo.realName}님` : '사용자님'}
                {userInfo.branchName && userInfo.role && (
                  <span className={styles['user-info-detail']}>
                    [ {userInfo.branchName} / {userInfo.role} ]
                  </span>
                )}
              </span>
              {userInfo.lastLogin && (
                <span className={styles['last-login']}>
                  마지막 로그인: {new Date(userInfo.lastLogin).toLocaleString('ko-KR')}
                </span>
              )}
            </div>
          </div>
          <button 
            className={`btn btn-secondary ${styles['logout-button']}`}
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}