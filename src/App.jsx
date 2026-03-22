import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./components/Login";

function App() {
  return (
    // Đây chính là cái "bản đồ" mà React Router đang đòi hỏi
    <BrowserRouter>
      <Routes>
        {/* Mặc định vào trang web sẽ tự động chuyển hướng sang trang đăng nhập */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Tuyến đường của trang Đăng nhập */}
        <Route path="/login" element={<Login />} />
        
        {/* Sau này bạn sẽ code thêm các trang khác và gắn vào đây */}
        <Route path="/admin" element={<h2>Chào mừng đến trang Admin!</h2>} />
        <Route path="/user" element={<h2>Chào mừng Khách hàng!</h2>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;