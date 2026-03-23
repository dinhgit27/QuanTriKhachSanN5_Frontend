import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';

const ProtectedRoute = () => {
    const token = useAdminAuthStore((state) => state.token);

    // Kiểm tra JWT: Nếu không có token, chuyển hướng về /login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Nếu hợp lệ, cho phép đi tiếp vào các component con (<Outlet />)
    return <Outlet />;
};

export default ProtectedRoute;