import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuthStore } from "../store/adminAuthStore";
import { getUserRoles } from "../utils/auth";

const ProtectedRoute = () => {
<<<<<<< HEAD
    // const token = useAdminAuthStore((state) => state.token); // Tạm thời comment dòng này

    // BƯỚC LÁCH LUẬT: Cho token luôn bằng true để máy hiểu là đã login
    const token = true; 

    // Nếu không có Token, "đá" ngay về trang login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Nếu có Token, cho phép truy cập vào các trang con bên trong
    return <Outlet />;
=======
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
>>>>>>> origin/tuan
};

export default ProtectedRoute;
