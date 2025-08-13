import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import KioskLayout from './components/KioskLayout';
import MenuScreen from './components/MenuScreen';
import CartScreen from './components/CartScreen';
import PaymentScreen from './components/PaymentScreen';
import OrderCompleteScreen from './components/OrderCompleteScreen';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<KioskLayout />}>
            <Route index element={<MenuScreen />} />
            <Route path="cart" element={<CartScreen />} />
            <Route path="payment" element={<PaymentScreen />} />
            <Route path="complete" element={<OrderCompleteScreen />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
