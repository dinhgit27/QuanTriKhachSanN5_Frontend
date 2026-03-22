import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // LƯU Ý: Đã bỏ BrowserRouter khỏi đây

// Import các component
import Login from './components/Login';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import RoomManagement from './pages/admin/RoomManagement';

function App() {
  return (
    // KHÔNG bọc BrowserRouter ở đây nữa vì main.jsx đã bọc rồi
    <Routes>
      {/* 1. Trang Đăng nhập */}
      <Route path="/login" element={<Login />} />

      {/* 2. Mặc định chưa vào đâu thì đẩy ra Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 3. Cụm trang Admin (Có khung Layout) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} /> 
        <Route path="rooms" element={<RoomManagement />} />
      </Route>

      {/* 4. Trang của User khách hàng */}
      <Route path="/user" element={<h2>Trang khách hàng (Đang xây dựng)</h2>} />
      
      {/* 5. Link linh tinh thì về Login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;