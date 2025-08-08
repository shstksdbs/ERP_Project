import React, { useState } from 'react';
import Layout from './components/layout/Layout';
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
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState(['dashboard']);

  // 라우팅 로직
  const renderContent = () => {
    // activeTab이 배열인 경우 마지막 선택된 탭을 사용
    const currentTab = Array.isArray(activeTab) ? activeTab[activeTab.length - 1] : activeTab;
    
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'branch-register':
        return <BranchRegister />;
      case 'branch-status':
        return <BranchStatus />;
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
        return <NoticeRegister />;
      case 'notice-list':
        return <NoticeList />;
      case 'notice-target-setting':
        return <NoticeTargetSetting />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;
