import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import OrderForm from './pages/OrderForm';
import MyOrders from './pages/MyOrders';
import PhoneRequest from './pages/PhoneRequest';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/order/:type" element={<OrderForm />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/phone" element={<PhoneRequest />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
