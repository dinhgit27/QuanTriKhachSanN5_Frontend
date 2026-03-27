import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Các Lớp Bảo Vệ
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleBasedRoute from "./routes/RoleBasedRoute";

// Import Layout & Pages
<<<<<<< HEAD
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import UserListPage from './pages/admin/UserListPage';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import HousekeeperDashboard from './pages/housekeeper/HousekeeperDashboard';
import GuestDashboard from './pages/guest/GuestDashboard';
import RegisterPage from './pages/RegisterPage'; 
import ForgotPasswordPage from './pages/ForgotPasswordPage'; 
=======
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/LoginPage";
import UserListPage from "./pages/admin/UserListPage";
// Import mấy trang anh em mình vừa làm
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import HousekeeperDashboard from "./pages/housekeeper/HousekeeperDashboard";
import GuestDashboard from "./pages/guest/GuestDashboard";
import RegisterPage from "./pages/RegisterPage"; // Nhớ tạo file này
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; // Nhớ tạo file này
>>>>>>> origin/tuan

const DashboardPage = () => <h1>ĐÂY LÀ TRANG ADMIN 🚀</h1>;
const NotFoundPage = () => <h1>404 - Đường dẫn này không tồn tại 😢</h1>;
const UnauthorizedPage = () => (
  <h1>403 - BẠN KHÔNG CÓ QUYỀN VÀO KHU VỰC NÀY 🛑</h1>
);

function App() {
<<<<<<< HEAD
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
=======
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Mặc định vào Web sẽ tự động đá sang trang Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 2. TUYẾN ĐƯỜNG TỰ DO (Chưa đăng nhập cũng vào được) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* 3. VÙNG CẤM CHUNG (Chỉ cần có Token là lọt qua lớp 1) */}
        <Route element={<ProtectedRoute />}>
          {/* --- KHU VỰC DÀNH CHO ADMIN (Giám Đốc) --- */}
          <Route element={<RoleBasedRoute allowedRoles={["Admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/users" element={<UserListPage />} />
            </Route>
          </Route>

          {/* --- KHU VỰC DÀNH CHO RECEPTIONIST (Lễ Tân) --- */}
          {/* Giả sử Lễ tân cũng xài chung Layout với Admin cho đẹp */}
          <Route
            element={
              <RoleBasedRoute allowedRoles={["Receptionist"]} />
            }
          >
            <Route element={<AdminLayout />}>
              <Route
                path="/receptionist/dashboard"
                element={<ReceptionistDashboard />}
              />
            </Route>
          </Route>

          {/* --- KHU VỰC DÀNH CHO HOUSEKEEPER (Lao Công) --- */}
          <Route
            element={
              <RoleBasedRoute allowedRoles={["Housekeeping"]} />
            }
          >
            {/* Lao công thường xem trên điện thoại, không cần AdminLayout rườm rà */}
            <Route
              path="/housekeeper/dashboard"
              element={<HousekeeperDashboard />}
            />
          </Route>

          {/* --- KHU VỰC DÀNH CHO GUEST (Khách Hàng) --- */}
          <Route
            element={
              <RoleBasedRoute
                allowedRoles={["Guest"]}
              />
            }
          >
            <Route path="/guest/dashboard" element={<GuestDashboard />} />
          </Route>
        </Route>

        {/* 4. Bắt lỗi nhập sai link */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
>>>>>>> origin/tuan
}

export default App;
