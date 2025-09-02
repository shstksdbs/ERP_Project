import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './components/login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import BranchRegister from './components/BranchManagement/BranchRegister';
import BranchStatus from './components/BranchManagement/BranchStatus';
import BranchUsers from './components/BranchManagement/BranchUsers';
import ProductRegister from './components/ProductManagement/ProductRegister';
import ProductList from './components/ProductManagement/ProductList';
import ProductCategory from './components/ProductManagement/ProductCategory';
import ProductCost from './components/ProductManagement/ProductCost';
import ProductRecipe from './components/ProductManagement/ProductRecipe';
import ProductLifecycle from './components/ProductManagement/ProductLifecycle';
import ProductPromotion from './components/ProductManagement/ProductPromotion';
import OrderStatus from './components/OrderingManagement/OrderStatus';
import OrderHistory from './components/OrderingManagement/OrderHistory';
import BranchComparison from './components/SalesManagement/BranchComparison';
import FranchiseSalesInquiry from './components/SalesManagement/FranchiseSalesInquiry';
import ProductSalesAnalysis from './components/SalesManagement/ProductSalesAnalysis';
import NoticeRegister from './components/Notice/NoticeRegister';
import NoticeList from './components/Notice/NoticeList';
import NoticeTargetSetting from './components/Notice/NoticeTargetSetting';
import SettingsLog from './components/Settings/SettingsLog';
import SettingsBackup from './components/Settings/SettingsBackup';
import NotificationCenter from './components/NotificationManagement/NotificationCenter';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState(['dashboard']);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const loginData = localStorage.getItem('erpLoginData');
    if (loginData) {
      setIsLoggedIn(true);
    }
  }, []);

  // 로그인 성공 시 호출
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // 로그아웃 시 호출
  const handleLogout = () => {
    localStorage.removeItem('erpLoginData');
    setIsLoggedIn(false);
  };

  // 라우팅 로직
  const renderContent = () => {
    // 마지막으로 선택된 "콘텐츠 탭"(하위메뉴)을 우선으로 사용
    const allTabs = Array.isArray(activeTab) ? activeTab : (activeTab ? [activeTab] : []);
    const contentTabKeys = [
      'branch-register',
      'branch-status',
      'branch-users',
      'product-register',
      'product-list',
      'product-category',
      'product-cost',
      'product-recipe',
      'product-lifecycle',
      'product-promotion',
      'order-status',
      'inventory-history',
      'branch-comparison',
      'franchise-sales-inquiry',
      'sales-analysis',
      'notice-register',
      'notice-list',
      'notice-target-setting',
      'notifications',
      'settings-log',
      'settings-backup',
    ];
    const currentTab = [...allTabs].reverse().find((key) => contentTabKeys.includes(key)) || 'dashboard';
    
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'branch-register':
        return <BranchRegister />;
      case 'branch-status':
        return <BranchStatus setActiveTab={setActiveTab} />;
      case 'branch-users':
        return <BranchUsers />;
      case 'product-register':
        return <ProductRegister />;
      case 'product-list':
        return <ProductList />;
      case 'product-category':
        return <ProductCategory />;
      case 'product-cost':
        return <ProductCost />;
      case 'product-recipe':
        return <ProductRecipe />;
      case 'product-lifecycle':
        return <ProductLifecycle />;
      case 'product-promotion':
        return <ProductPromotion />;
      case 'order-status':
        return <OrderStatus />;
      case 'inventory-history':
        return <OrderHistory />;
      case 'branch-comparison':
        return <BranchComparison />;
      case 'franchise-sales-inquiry':
        return <FranchiseSalesInquiry />;
      case 'sales-analysis':
        return <ProductSalesAnalysis />;
      case 'notice-register':
        return <NoticeRegister setActiveTab={setActiveTab} />;
      case 'notice-list':
        return <NoticeList setActiveTab={setActiveTab} />;
      case 'notice-target-setting':
        return <NoticeTargetSetting />;
      case 'notifications':
        return <NotificationCenter />;
      case 'settings-log':
        return <SettingsLog />;
      case 'settings-backup':
        return <SettingsBackup />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isLoggedIn ? 
            <Navigate to="/dashboard" replace /> : 
            <Login onLoginSuccess={handleLoginSuccess} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isLoggedIn ? 
            <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
              {renderContent()}
            </Layout> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/product-register" 
          element={
            isLoggedIn ? 
            <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
              <ProductRegister />
            </Layout> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/" 
          element={
            isLoggedIn ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
        {/* 다른 경로들도 대시보드로 리다이렉트 */}
        <Route 
          path="*" 
          element={
            isLoggedIn ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
