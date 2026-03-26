import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Các Lớp Bảo Vệ
import ProtectedRoute from './routes/ProtectedRoute';
import RoleBasedRoute from './routes/RoleBasedRoute';

// Import Layout & Pages
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import UserListPage from './pages/admin/UserListPage';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import HousekeeperDashboard from './pages/housekeeper/HousekeeperDashboard';
import GuestDashboard from './pages/guest/GuestDashboard';
import RegisterPage from './pages/RegisterPage'; 
import ForgotPasswordPage from './pages/ForgotPasswordPage'; 

const DashboardPage = () => <h1>ĐÂY LÀ TRANG ADMIN 🚀</h1>;
const NotFoundPage = () => <h1>404 - Đường dẫn này không tồn tại 😢</h1>;
const UnauthorizedPage = () => <h1>403 - BẠN KHÔNG CÓ QUYỀN VÀO KHU VỰC NÀY 🛑</h1>;

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 1. Tuyến đường mặc định */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* 2. TUYẾN ĐƯỜNG TỰ DO */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* 3. VÙNG CẤM (Đã được ProtectedRoute cho qua) */}
                <Route element={<ProtectedRoute />}>

                    {/* ADMIN */}
                    <Route element={<RoleBasedRoute allowedRoles={['Admin']} />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/admin/dashboard" element={<DashboardPage />} />
                            <Route path="/admin/users" element={<UserListPage />} />
                        </Route>
                    </Route>

                    {/* RECEPTIONIST */}
                    <Route element={<RoleBasedRoute allowedRoles={['Receptionist', 'Lễ tân']} />}>
                        <Route element={<AdminLayout />}>
                            <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
                        </Route>
                    </Route>

                    {/* HOUSEKEEPER */}
                    <Route element={<RoleBasedRoute allowedRoles={['Housekeeper', 'Lao công']} />}>
                        <Route path="/housekeeper/dashboard" element={<HousekeeperDashboard />} />
                    </Route>

                    {/* GUEST - Đã sửa lỗi thẻ đóng và đưa vào Layout chuẩn */}
                    <Route element={<AdminLayout />}>   
                        <Route path="/guest/dashboard" element={<GuestDashboard />} />
                    </Route>

                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;