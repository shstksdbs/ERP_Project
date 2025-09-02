import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './components/login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import OrderList from './components/OrderManagement/OrderList';
import OrderStatus from './components/OrderManagement/OrderStatus';
import OrderHistory from './components/OrderManagement/OrderHistory';
import InventoryStatus from './components/InventoryManagement/InventoryStatus';
import InventoryAlert from './components/InventoryManagement/InventoryAlert';
import InventoryHistory from './components/InventoryManagement/InventoryHistory';
import OrderRequest from './components/OrderingManagement/OrderRequest';
import OrderingStatus from './components/OrderingManagement/OrderingStatus';
import OrderingHistory from './components/OrderingManagement/OrderingHistory';
import DailySales from './components/SalesManagement/DailySales';
import MonthlySales from './components/SalesManagement/MonthlySales';
import ProductSales from './components/SalesManagement/ProductSales';
import EmployeeList from './components/EmployeeManagement/EmployeeList';
import EmployeeSchedule from './components/EmployeeManagement/EmployeeSchedule';
import EmployeeAttendance from './components/EmployeeManagement/EmployeeAttendance';
import NoticeList from './components/Notice/NoticeList';
import NoticeDetail from './components/Notice/NoticeDetail';
import SettingsBasic from './components/Settings/SettingsBasic';
import SettingsLog from './components/Settings/SettingsLog';
import SettingsBackup from './components/Settings/SettingsBackup';
import NotificationCenter from './components/NotificationManagement/NotificationCenter';
import './App.css';

// 지점 ID를 받는 컴포넌트
function AppContent() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(['dashboard']);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState(null);

  // 로그인 상태 확인 (로컬 스토리지에서)
  useEffect(() => {
    const savedLoginData = localStorage.getItem('erpLoginData');
    if (savedLoginData) {
      try {
        const parsedData = JSON.parse(savedLoginData);
        setLoginData(parsedData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('로그인 데이터 파싱 오류:', error);
        localStorage.removeItem('erpLoginData');
      }
    }
  }, []);

  // 지점 ID가 없으면 기본값으로 리다이렉트
  useEffect(() => {
    if (!branchId) {
      navigate('/login');
    }
  }, [branchId, navigate]);



  // 로그아웃 처리 함수
  const handleLogout = () => {
    localStorage.removeItem('erpLoginData');
    setLoginData(null);
    setIsLoggedIn(false);
    navigate('/login');
  };

  // 라우팅 로직
  const renderContent = () => {
    // 마지막으로 선택된 "콘텐츠 탭"(하위메뉴)을 우선으로 사용
    const allTabs = Array.isArray(activeTab) ? activeTab : (activeTab ? [activeTab] : []);
    const contentTabKeys = [
      'notifications',
      'order-list',
      'order-status',
      'order-history',
      'inventory-status',
      'inventory-alert',
      'inventory-history',
      'order-request',
      'ordering-status',
      'ordering-history',
      'daily-sales',
      'monthly-sales',
      'product-sales',
      'employee-list',
      'employee-schedule',
      'employee-attendance',
      'notice-list',
      'notice-detail',
      'settings-basic',
      'settings-log',
      'settings-backup',
    ];
    const currentTab = [...allTabs].reverse().find((key) => contentTabKeys.includes(key)) || 'dashboard';
    
    // 모든 컴포넌트에 branchId prop 전달
    const commonProps = { branchId: parseInt(branchId) };
    
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard {...commonProps} loginData={loginData} />;
      case 'notifications':
        return <NotificationCenter {...commonProps} />;
      case 'order-list':
        return <OrderList {...commonProps} />;
      case 'order-status':
        return <OrderStatus {...commonProps} loginData={loginData} />;
      case 'order-history':
        return <OrderHistory {...commonProps} loginData={loginData} />;
      case 'inventory-status':
        return <InventoryStatus {...commonProps} />;
      case 'inventory-alert':
        return <InventoryAlert {...commonProps} />;
      case 'inventory-history':
        return <InventoryHistory {...commonProps} />;
      case 'order-request':
        return <OrderRequest {...commonProps} loginData={loginData} />;
      case 'ordering-status':
        return <OrderingStatus {...commonProps} />;
      case 'ordering-history':
        return <OrderingHistory {...commonProps} />;
      case 'daily-sales':
        return <DailySales {...commonProps} />;
      case 'monthly-sales':
        return <MonthlySales {...commonProps} />;
      case 'product-sales':
        return <ProductSales {...commonProps} />;
      case 'employee-list':
        return <EmployeeList {...commonProps} />;
      case 'employee-schedule':
        return <EmployeeSchedule {...commonProps} />;
      case 'employee-attendance':
        return <EmployeeAttendance {...commonProps} />;
      case 'notice-list':
        return <NoticeList {...commonProps} />;
      case 'notice-detail':
        return <NoticeDetail {...commonProps} loginData={loginData} />;
      case 'settings-basic':
        return <SettingsBasic {...commonProps} />;
      case 'settings-log':
        return <SettingsLog {...commonProps} />;
      case 'settings-backup':
        return <SettingsBackup {...commonProps} />;
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  // 로그인되지 않은 경우 로그인 화면 표시
  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} branchId={branchId} onLogout={handleLogout} loginData={loginData}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/branch/:branchId" element={<AppContent />} />
        <Route path="/" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
