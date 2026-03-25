import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const RoleBasedRoute = ({ allowedRoles }) => {
    // Móc thẻ của người dùng từ trong ví (localStorage) ra kiểm tra
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    // Tìm chức vụ (tùy thuộc vào lúc Login ní lưu vào chữ gì, thường là roleName hoặc role)
    const userRole = user?.roleName; 

    // 1. Nếu chưa có thẻ (chưa đăng nhập) -> Đuổi ra cổng Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Nếu có thẻ nhưng chức vụ KHÔNG NẰM TRONG danh sách được phép -> Đuổi ra trang Cấm
    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    // 3. Đúng người, đúng tội -> Mở cửa cho vào (<Outlet /> là hiển thị các trang con bên trong)
    return <Outlet />;
};

export default RoleBasedRoute;