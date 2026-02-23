import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getToken } from './api/client';
import Login from './pages/Login';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';

function PrivateRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="/orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
