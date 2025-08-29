import React from 'react';
import styles from './Sidebar.module.css';
import dashboardIcon from '../../assets/dashboard_icon.png';
import downIcon from '../../assets/down_icon.png';
import rightIcon from '../../assets/right_icon.png';
import warehouseIcon from '../../assets/warehouse_icon.png';
import plusIcon from '../../assets/plus_icon.png';
import usersIcon from '../../assets/users_icon.png';
import pencilIcon from '../../assets/pencil_icon.png';
import dollorIcon from '../../assets/dollor_icon.png';
import percentIcon from '../../assets/percent_icon.png';
import productIcon from '../../assets/product_icon.png';
import tagsIcon from '../../assets/tags_icon.png';
import rotateIcon from '../../assets/rotate_icon.png';
import historyIcon from '../../assets/history_icon.png';
import packageInIcon from '../../assets/packageIn_icon.png';
import packageOutIcon from '../../assets/packageOut_icon.png';
import truckIcon from '../../assets/truck_icon.png';
import usercheckIcon from '../../assets/userCheck_icon.png';
import chartIcon from '../../assets/chart_icon.png';
import chartPieIcon from '../../assets/chartPie_icon.png';
import chartLinearIcon from '../../assets/chartLinear_icon.png';
import trendingUpIcon from '../../assets/trendingUp_icon.png';
import noticeIcon from '../../assets/notice_icon.png';
import sendIcon from '../../assets/send_icon.png';
import settingIcon from '../../assets/setting_icon.png';
import downloadIcon from '../../assets/download_icon.png';
import logIcon from '../../assets/log_icon.png';
import bellIcon from '../../assets/bell_icon.png';
import searchIcon from '../../assets/search_icon.png';

export default function Sidebar({ activeTab, setActiveTab }) {
  // activeTab이 문자열인 경우 배열로 변환
  const activeTabs = Array.isArray(activeTab) ? activeTab : (activeTab ? [activeTab] : []);

  const handleTabClick = (tabName) => {
    if (tabName === 'dashboard') {
      // 대시보드 클릭 시 - 대시보드로 이동
      setActiveTab('dashboard');
    } else if (tabName === 'order') {
      // 주문관리 버튼 클릭 시 - 단순히 열고 닫기만
      if (activeTabs.includes('order') || activeTabs.some(tab => isOrderSubmenu(tab))) {
        // 해당 메뉴와 하위 메뉴들을 모두 제거
        const newActiveTabs = activeTabs.filter(tab =>
          tab !== 'order' && !isOrderSubmenu(tab)
        );
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      } else {
        // 해당 메뉴 추가 (현재 선택된 하위 메뉴 유지)
        const newActiveTabs = [...activeTabs, 'order'];
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      }
    } else if (tabName === 'inventory') {
      // 재고관리 버튼 클릭 시 - 단순히 열고 닫기만
      if (activeTabs.includes('inventory') || activeTabs.some(tab => isInventorySubmenu(tab))) {
        const newActiveTabs = activeTabs.filter(tab =>
          tab !== 'inventory' && !isInventorySubmenu(tab)
        );
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      } else {
        const newActiveTabs = [...activeTabs, 'inventory'];
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      }
    } else if (tabName === 'ordering') {
      // 발주관리 버튼 클릭 시 - 단순히 열고 닫기만
      if (activeTabs.includes('ordering') || activeTabs.some(tab => isOrderingSubmenu(tab))) {
        const newActiveTabs = activeTabs.filter(tab =>
          tab !== 'ordering' && !isOrderingSubmenu(tab)
        );
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      } else {
        const newActiveTabs = [...activeTabs, 'ordering'];
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      }
    } else if (tabName === 'sales') {
      // 매출관리 버튼 클릭 시 - 단순히 열고 닫기만
      if (activeTabs.includes('sales') || activeTabs.some(tab => isSalesSubmenu(tab))) {
        const newActiveTabs = activeTabs.filter(tab =>
          tab !== 'sales' && !isSalesSubmenu(tab)
        );
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      } else {
        const newActiveTabs = [...activeTabs, 'sales'];
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      }
    } else if (tabName === 'employees') {
      // 직원관리 버튼 클릭 시 - 단순히 열고 닫기만
      if (activeTabs.includes('employees') || activeTabs.some(tab => isEmployeesSubmenu(tab))) {
        const newActiveTabs = activeTabs.filter(tab =>
          tab !== 'employees' && !isEmployeesSubmenu(tab)
        );
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      } else {
        const newActiveTabs = [...activeTabs, 'employees'];
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      }
    } else if (tabName === 'notice') {
      // 공지사항 관리 버튼 클릭 시 - 단순히 열고 닫기만
      if (activeTabs.includes('notice') || activeTabs.some(tab => isNoticeSubmenu(tab))) {
        const newActiveTabs = activeTabs.filter(tab =>
          tab !== 'notice' && !isNoticeSubmenu(tab)
        );
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      } else {
        const newActiveTabs = [...activeTabs, 'notice'];
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      }
    } else if (tabName === 'settings') {
      // 설정 버튼 클릭 시 - 단순히 열고 닫기만
      if (activeTabs.includes('settings') || activeTabs.some(tab => isSettingsSubmenu(tab))) {
        const newActiveTabs = activeTabs.filter(tab =>
          tab !== 'settings' && !isSettingsSubmenu(tab)
        );
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      } else {
        const newActiveTabs = [...activeTabs, 'settings'];
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      }
    } else {
      // 다른 버튼들
      if (activeTabs.includes(tabName)) {
        const newActiveTabs = activeTabs.filter(tab => tab !== tabName);
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      } else {
        const newActiveTabs = [...activeTabs, tabName];
        setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
      }
    }
  };

  const handleSubmenuClick = (submenuTab) => {
    // 해당 하위 메뉴가 이미 선택되어 있는지 확인
    if (activeTabs.includes(submenuTab)) {
      // 이미 선택되어 있으면 제거 (선택 해제)
      const newActiveTabs = activeTabs.filter(tab => tab !== submenuTab);
      setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
    } else {
      // 선택되어 있지 않으면 모든 하위 메뉴를 제거하고 새로운 하위 메뉴만 추가
      let newActiveTabs = activeTabs.filter(tab => {
        // 대시보드는 제거
        if (tab === 'dashboard') {
          return false;
        }
        // 메인 메뉴들은 유지
        if (tab === 'order' || tab === 'inventory' || tab === 'ordering' || 
            tab === 'sales' || tab === 'employees' || tab === 'notice' || tab === 'settings') {
          return true;
        }
        // 모든 하위 메뉴는 제거 (하나만 선택되도록)
        return false;
      });
      
      // 새로운 하위 메뉴 추가
      newActiveTabs = [...newActiveTabs, submenuTab];
      setActiveTab(newActiveTabs.length === 1 ? newActiveTabs[0] : newActiveTabs);
    }
  };

  // 주문관리 하위 메뉴인지 확인하는 함수
  const isOrderSubmenu = (tab) => {
    return tab === 'order-list' || tab === 'order-status' || tab === 'order-history';
  };

  // 재고관리 하위 메뉴인지 확인하는 함수
  const isInventorySubmenu = (tab) => {
    return tab === 'inventory-status' || tab === 'inventory-alert' || tab === 'inventory-history';
  };

  // 발주관리 하위 메뉴인지 확인하는 함수
  const isOrderingSubmenu = (tab) => {
    return tab === 'order-request' || tab === 'ordering-status' || tab === 'ordering-history';
  };

  // 매출관리 하위 메뉴인지 확인하는 함수
  const isSalesSubmenu = (tab) => {
    return tab === 'daily-sales' || tab === 'monthly-sales' || tab === 'product-sales';
  };

  // 직원관리 하위 메뉴인지 확인하는 함수
  const isEmployeesSubmenu = (tab) => {
    return tab === 'employee-list' || tab === 'employee-schedule' || tab === 'employee-attendance';
  };

  // 공지사항 관리 하위 메뉴인지 확인하는 함수
  const isNoticeSubmenu = (tab) => {
    return tab === 'notice-list' || tab === 'notice-detail';
  };

  // 설정 하위 메뉴인지 확인하는 함수
  const isSettingsSubmenu = (tab) => {
    return tab === 'settings-basic' || tab === 'settings-log' || tab === 'settings-backup';
  };

  return (
    <aside className={styles['erp-sidebar']}>
      <nav className={styles['sidebar-nav']}>
        <ul className={styles['sidebar-ul']}>
          <li>
            <button className={`btn ${styles['sidebar-button']} ${activeTabs.includes('dashboard') ? 'btn-selected' : 'btn-secondary'}`} onClick={() => handleTabClick('dashboard')}>
              <img src={dashboardIcon} alt="대시보드" className={styles['sidebar-icon']} />
              대시보드
            </button>
          </li>
          
          
          
          <li>
            <button className={`btn ${styles['sidebar-button']} btn-secondary`} onClick={() => handleTabClick('order')}>
              <img src={packageOutIcon} alt="주문관리" className={styles['sidebar-icon']} />
              주문관리
              <img
                src={activeTabs.includes('order') || activeTabs.some(tab => isOrderSubmenu(tab)) ? downIcon : rightIcon}
                alt={activeTabs.includes('order') || activeTabs.some(tab => isOrderSubmenu(tab)) ? "접기" : "펼치기"}
                className={styles['sidebar-icon']}
                style={{ marginLeft: 'auto' }}
              />
            </button>
            {/* 주문관리 하위 메뉴 */}
            {(activeTabs.includes('order') || activeTabs.some(tab => isOrderSubmenu(tab))) && (
              <ul className={styles['submenu-ul']}>
                
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('order-status') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('order-status')}
                  >
                    <img src={pencilIcon} alt="주문목록" className={styles['sidebar-icon']} />
                    주문목록
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('order-history') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('order-history')}
                  >
                    <img src={historyIcon} alt="주문이력" className={styles['sidebar-icon']} />
                    주문이력
                  </button>
                </li>
              </ul>
            )}
          </li>
          <li>
            <button className={`btn ${styles['sidebar-button']} btn-secondary`} onClick={() => handleTabClick('inventory')}>
              <img src={warehouseIcon} alt="재고관리" className={styles['sidebar-icon']} />
              재고관리
              <img
                src={activeTabs.includes('inventory') || activeTabs.some(tab => isInventorySubmenu(tab)) ? downIcon : rightIcon}
                alt={activeTabs.includes('inventory') || activeTabs.some(tab => isInventorySubmenu(tab)) ? "접기" : "펼치기"}
                className={styles['sidebar-icon']}
                style={{ marginLeft: 'auto' }}
              />
            </button>
            {/* 재고관리 하위 메뉴 */}
            {(activeTabs.includes('inventory') || activeTabs.some(tab => isInventorySubmenu(tab))) && (
              <ul className={styles['submenu-ul']}>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('inventory-status') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('inventory-status')}
                  >
                    <img src={pencilIcon} alt="재고현황" className={styles['sidebar-icon']} />
                    재고현황
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('inventory-alert') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('inventory-alert')}
                  >
                    <img src={bellIcon} alt="재고알림" className={styles['sidebar-icon']} />
                    재고알림
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('inventory-history') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('inventory-history')}
                  >
                    <img src={historyIcon} alt="재고이력" className={styles['sidebar-icon']} />
                    재고이력
                  </button>
                </li>
              </ul>
            )}
          </li>
          <li>
            <button className={`btn ${styles['sidebar-button']} btn-secondary`} onClick={() => handleTabClick('ordering')}>
              <img src={truckIcon} alt="발주관리" className={styles['sidebar-icon']} />
              발주관리
              <img
                src={activeTabs.includes('ordering') || activeTabs.some(tab => isOrderingSubmenu(tab)) ? downIcon : rightIcon}
                alt={activeTabs.includes('ordering') || activeTabs.some(tab => isOrderingSubmenu(tab)) ? "접기" : "펼치기"}
                className={styles['sidebar-icon']}
                style={{ marginLeft: 'auto' }}
              />
            </button>
            {/* 발주관리 하위 메뉴 */}
            {(activeTabs.includes('ordering') || activeTabs.some(tab => isOrderingSubmenu(tab))) && (
              <ul className={styles['submenu-ul']}>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('order-request') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('order-request')}
                  >
                    <img src={plusIcon} alt="발주신청" className={styles['sidebar-icon']} />
                    발주신청
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('ordering-status') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('ordering-status')}
                  >
                    <img src={packageInIcon} alt="발주상태" className={styles['sidebar-icon']} />
                    발주상태
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('ordering-history') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('ordering-history')}
                  >
                    <img src={historyIcon} alt="발주이력" className={styles['sidebar-icon']} />
                    발주이력
                  </button>
                </li>
              </ul>
            )}
          </li>
          <li>
            <button className={`btn ${styles['sidebar-button']} btn-secondary`} onClick={() => handleTabClick('sales')}>
              <img src={chartIcon} alt="매출관리" className={styles['sidebar-icon']} />
              매출관리
              <img
                src={activeTabs.includes('sales') || activeTabs.some(tab => isSalesSubmenu(tab)) ? downIcon : rightIcon}
                alt={activeTabs.includes('sales') || activeTabs.some(tab => isSalesSubmenu(tab)) ? "접기" : "펼치기"}
                className={styles['sidebar-icon']}
                style={{ marginLeft: 'auto' }}
              />
            </button>
            {/* 매출관리 하위 메뉴 */}
            {(activeTabs.includes('sales') || activeTabs.some(tab => isSalesSubmenu(tab))) && (
              <ul className={styles['submenu-ul']}>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('daily-sales') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('daily-sales')}
                  >
                    <img src={trendingUpIcon} alt="일별매출" className={styles['sidebar-icon']} />
                    일별매출
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('monthly-sales') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('monthly-sales')}
                  >
                    <img src={chartPieIcon} alt="월별매출" className={styles['sidebar-icon']} />
                    월별매출
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('product-sales') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('product-sales')}
                  >
                    <img src={chartLinearIcon} alt="상품별매출" className={styles['sidebar-icon']} />
                    상품별매출
                  </button>
                </li>
              </ul>
            )}
          </li>
          <li>
            <button className={`btn ${styles['sidebar-button']} btn-secondary`} onClick={() => handleTabClick('employees')}>
              <img src={usersIcon} alt="직원관리" className={styles['sidebar-icon']} />
              직원관리
              <img
                src={activeTabs.includes('employees') || activeTabs.some(tab => isEmployeesSubmenu(tab)) ? downIcon : rightIcon}
                alt={activeTabs.includes('employees') || activeTabs.some(tab => isEmployeesSubmenu(tab)) ? "접기" : "펼치기"}
                className={styles['sidebar-icon']}
                style={{ marginLeft: 'auto' }}
              />
            </button>
            {/* 직원관리 하위 메뉴 */}
            {(activeTabs.includes('employees') || activeTabs.some(tab => isEmployeesSubmenu(tab))) && (
              <ul className={styles['submenu-ul']}>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('employee-list') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('employee-list')}
                  >
                    <img src={usercheckIcon} alt="직원목록" className={styles['sidebar-icon']} />
                    직원목록
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('employee-schedule') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('employee-schedule')}
                  >
                    <img src={pencilIcon} alt="근무스케줄" className={styles['sidebar-icon']} />
                    근무스케줄
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('employee-attendance') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('employee-attendance')}
                  >
                    <img src={historyIcon} alt="출/퇴근관리" className={styles['sidebar-icon']} />
                    출/퇴근관리
                  </button>
                </li>
              </ul>
            )}
          </li>
          <li>
            <button className={`btn ${styles['sidebar-button']} btn-secondary`} onClick={() => handleTabClick('notice')}>
              <img src={noticeIcon} alt="공지사항" className={styles['sidebar-icon']} />
              공지사항
              <img
                src={activeTabs.includes('notice') || activeTabs.some(tab => isNoticeSubmenu(tab)) ? downIcon : rightIcon}
                alt={activeTabs.includes('notice') || activeTabs.some(tab => isNoticeSubmenu(tab)) ? "접기" : "펼치기"}
                className={styles['sidebar-icon']}
                style={{ marginLeft: 'auto' }}
              />
            </button>
            {/* 공지사항 하위 메뉴 */}
            {(activeTabs.includes('notice') || activeTabs.some(tab => isNoticeSubmenu(tab))) && (
              <ul className={styles['submenu-ul']}>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('notice-list') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('notice-list')}
                  >
                    <img src={pencilIcon} alt="공지사항 목록" className={styles['sidebar-icon']} />
                    공지사항 목록
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('notice-detail') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('notice-detail')}
                  >
                    <img src={sendIcon} alt="공지사항 상세" className={styles['sidebar-icon']} />
                    공지사항 상세
                  </button>
                </li>
              </ul>
            )}
          </li>
          {/* 통합 알림 관리 메뉴 */}
          <li>
            <button className={`btn ${styles['sidebar-button']} ${activeTabs.includes('notifications') ? 'btn-selected' : 'btn-secondary'}`} onClick={() => handleTabClick('notifications')}>
              <img src={bellIcon} alt="알림 관리" className={styles['sidebar-icon']} />
              알림 관리
            </button>
          </li>
          <li>
            <button className={`btn ${styles['sidebar-button']} btn-secondary`} onClick={() => handleTabClick('settings')}>
              <img src={settingIcon} alt="설정" className={styles['sidebar-icon']} />
              설정
              <img
                src={activeTabs.includes('settings') || activeTabs.some(tab => isSettingsSubmenu(tab)) ? downIcon : rightIcon}
                alt={activeTabs.includes('settings') || activeTabs.some(tab => isSettingsSubmenu(tab)) ? "접기" : "펼치기"}
                className={styles['sidebar-icon']}
                style={{ marginLeft: 'auto' }}
              />
            </button>
            {/* 설정 하위 메뉴 */}
            {(activeTabs.includes('settings') || activeTabs.some(tab => isSettingsSubmenu(tab))) && (
              <ul className={styles['submenu-ul']}>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('settings-log') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('settings-log')}
                  >
                    <img src={logIcon} alt="로그 기록 보기" className={styles['sidebar-icon']} />
                    로그 기록 보기
                  </button>
                </li>
                <li>
                  <button
                    className={`btn ${styles['submenu-button']} ${activeTabs.includes('settings-backup') ? 'btn-selected' : 'btn-secondary'}`}
                    onClick={() => handleSubmenuClick('settings-backup')}
                  >
                    <img src={downloadIcon} alt="데이터 백업/복원" className={styles['sidebar-icon']} />
                    데이터 백업/복원
                  </button>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </aside>
  );
}