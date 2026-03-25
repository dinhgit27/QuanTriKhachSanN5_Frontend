import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuthStore } from "../store/adminAuthStore";
import { getUserRoles } from "../utils/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const roles = getUserRoles();

  console.log("Roles:", roles); // debug

  if (!roles.length) {
    return <Navigate to="/login" />;
  }

  const isAllowed = roles.some((r) => allowedRoles.includes(r));

  if (!isAllowed) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
