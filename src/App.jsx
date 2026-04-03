import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import Các Lớp Bảo Vệ
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleBasedRoute from "./routes/RoleBasedRoute";
import HomePage from "./pages/HomePage";
import AdminLayout from "./layouts/AdminLayout";
import LoginPage from "./pages/LoginPage";
import UserListPage from "./pages/admin/UserListPage";
import RoomManagement from "./pages/admin/RoomManagement";
import InventoryManagement from "./pages/admin/InventoryManagement";
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import HousekeeperDashboard from "./pages/housekeeper/HousekeeperDashboard";
import GuestDashboard from "./pages/guest/GuestDashboard";
import RegisterPage from "./pages/RegisterPage"; 
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import WarehouseManagement from "./pages/admin/WarehouseManagement";
import LossAndDamageManagement from "./pages/admin/LossAndDamageManagement";
import AuditLogsPage from "./pages/admin/AuditLogsPage"; 
import HousekeepingManagement from './pages/admin/HousekeepingManagement';


const NotFoundPage = () => <h1>404 - Đường dẫn này không tồn tại 😢</h1>;
const UnauthorizedPage = () => (
  <h1>403 - BẠN KHÔNG CÓ QUYỀN VÀO KHU VỰC NÀY 🛑</h1>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/homepage" replace />} />

        {/* 2. TUYẾN ĐƯỜNG TỰ DO (Chưa đăng nhập cũng vào được) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/homepage" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        
        {/* ĐÃ BẾ TRANG LOSS-AND-DAMAGE KHỎI ĐÂY VÌ NÓ LÀ VÙNG CẤM */}

        {/* 3. VÙNG CẤM CHUNG (Chỉ cần có Token là lọt qua lớp 1) */}
        <Route element={<ProtectedRoute />}>

          {/* --- KHU VỰC DÙNG CHUNG CHO ADMIN & LỄ TÂN --- */}
          <Route element={<RoleBasedRoute allowedRoles={["Admin", "Receptionist"]} />}>
            <Route element={<AdminLayout />}>
              {/* Trang đền bù phải nằm trong này, bọc layout đàng hoàng */}
              <Route path="/admin/warehouse" element={<WarehouseManagement />} />
              <Route path="/admin/loss-and-damage" element={<LossAndDamageManagement />} />
            </Route>
          </Route>

          {/* --- KHU VỰC DÀNH RIÊNG CHO ADMIN (Giám Đốc) --- */}
          <Route element={<RoleBasedRoute allowedRoles={["Admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/users" element={<UserListPage />} />
              <Route path="/admin/rooms" element={<RoomManagement />} />
              <Route path="/admin/inventory" element={<InventoryManagement />} />
              <Route path="/admin/audit" element={<AuditLogsPage />} />
              <Route path="/admin/housekeeping" element={<HousekeepingManagement />} />
            </Route>
          </Route>
          
          {/* --- KHU VỰC DÀNH CHO RECEPTIONIST (Lễ Tân) --- */}
          <Route element={<RoleBasedRoute allowedRoles={["Receptionist"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/receptionist/dashboard" element={<ReceptionistDashboard />} />
            </Route>
          </Route>

          {/* --- KHU VỰC DÀNH CHO HOUSEKEEPER (Lao Công) --- */}
          <Route element={<RoleBasedRoute allowedRoles={["Housekeeping"]} />}>
            <Route path="/housekeeper/dashboard" element={<HousekeeperDashboard />} />
            <Route path="/admin/housekeeping" element={<HousekeepingManagement />} />
          </Route>

          {/* --- KHU VỰC DÀNH CHO GUEST (Khách Hàng) --- */}
          <Route element={<RoleBasedRoute allowedRoles={["Guest"]} />}>
            <Route path="/guest/dashboard" element={<GuestDashboard />} />
          </Route>
          
        </Route>

        {/* 4. Bắt lỗi nhập sai link */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;