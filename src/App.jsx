import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import { useAdminAuthStore } from './store/adminAuthStore';

// --- BƯỚC 1: TẠO CÁC COMPONENT GIẢ (PLACEHOLDER) ĐỂ TEST ---
// Vì mình chưa tạo trang thật, nên tôi làm mấy cái trang giả để ní test luồng chạy trước nhé.
const LoginPage = () => {
    const setAuth = useAdminAuthStore((state) => state.setAuth);
    
    const handleFakeLogin = () => {
        // Giả lập hành động đăng nhập thành công, lưu Token giả vào Zustand và localStorage
        setAuth('fake-jwt-token-123', { fullName: 'Đỉnh Nguyễn' }, ['admin.view']);
        window.location.href = '/admin/dashboard'; // Chuyển hướng vào trong
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <h1>ĐĂNG NHẬP</h1>
            <button onClick={handleFakeLogin} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                Bấm vào đây để giả lập Đăng Nhập
            </button>
        </div>
    );
};

const DashboardPage = () => <h1>ĐÂY LÀ TRANG ADMIN 🚀</h1>;
const UserListPage = () => <h1>Đây là khu vực Quản lý Nhân sự 👥</h1>;
const NotFoundPage = () => <h1>404 - Đường dẫn này không tồn tại 😢</h1>;

// --- BƯỚC 2: CẤU HÌNH ROUTER CHÍNH ---
function App() {
    return (
        // BrowserRouter là vỏ bọc bắt buộc để Web có thể chuyển trang mà không bị load lại (SPA)
        <BrowserRouter>
            <Routes>
                {/* 1. Mặc định vào Web sẽ tự động đá sang trang Login */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* 2. Tuyến đường TỰ DO (Ai cũng vào được) */}
                <Route path="/login" element={<LoginPage />} />

                {/* 3. VÙNG CẤM (Phải có Token mới được vào) */}
                {/* Lớp bảo vệ 1: Kiểm tra Token */}
                <Route element={<ProtectedRoute />}>
                    {/* Lớp vỏ 2: Gắn cái Khung Layout (Sidebar, Header) */}
                    <Route element={<AdminLayout />}>
                        {/* Các trang con sẽ được nhét vào thẻ <Outlet /> trong AdminLayout */}
                        <Route path="/admin/dashboard" element={<DashboardPage />} />
                        <Route path="/admin/users" element={<UserListPage />} />
                    </Route>
                </Route>

                {/* 4. Bắt lỗi nhập sai link */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;