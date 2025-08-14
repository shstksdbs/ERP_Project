import React, { useState } from 'react';
import styles from './Header.module.css';
import logo from '../../assets/logo.png';
import userIcon from '../../assets/user_icon.png';
import noticeIcon from '../../assets/notice_icon.png';
import bellIcon from '../../assets/bell_icon.png';


export default function Header({ activeTab, setActiveTab, onLogout }) {

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
            <img src={noticeIcon} alt="공지사항" className={styles['header-icon']} />
            <img src={bellIcon} alt="알림" className={styles['header-icon']} />
          </div>
          <div className={styles['user-info']}>
            <img src={userIcon} alt="사용자" className={styles['user-icon']} />
            <span className={styles['user-name']}>홍길동님</span>
          </div>
          <button 
            className={`btn btn-secondary ${styles['logout-button']}`}
            onClick={onLogout}
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}