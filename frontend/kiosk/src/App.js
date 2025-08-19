import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import KioskLayout from './components/KioskLayout';
import MenuScreen from './components/MenuScreen';
import CartScreen from './components/CartScreen';
import PaymentScreen from './components/PaymentScreen';
import OrderCompleteScreen from './components/OrderCompleteScreen';

function App() {
  const [selectedBranch, setSelectedBranch] = useState(null);

  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);
    console.log('선택된 지점:', branch);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<KioskLayout selectedBranch={selectedBranch} onBranchChange={handleBranchChange} />}>
            <Route index element={<MenuScreen selectedBranch={selectedBranch} />} />
            <Route path="cart" element={<CartScreen selectedBranch={selectedBranch} />} />
            <Route path="payment" element={<PaymentScreen selectedBranch={selectedBranch} />} />
            <Route path="complete" element={<OrderCompleteScreen selectedBranch={selectedBranch} />} />
            <Route path="order-complete" element={<OrderCompleteScreen selectedBranch={selectedBranch} />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
