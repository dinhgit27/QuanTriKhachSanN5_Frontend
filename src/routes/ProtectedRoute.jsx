import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';

const ProtectedRoute = () => {
    const token = useAdminAuthStore((state) => state.token);

    // Nếu không có Token, "đá" ngay về trang login [cite: 709, 710]
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Nếu có Token, cho phép truy cập vào các trang con bên trong [cite: 706]
    return <Outlet />;
};

export default ProtectedRoute;