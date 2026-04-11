import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getUserRoles } from "../utils/auth";

const RoleBasedRoute = ({ allowedRoles }) => {
  const roles = getUserRoles();

  console.log("RoleBasedRoute debug:", { roles, allowedRoles });

  const isAllowed = roles.some((r) => allowedRoles.includes(r));

  console.log("isAllowed:", isAllowed);

  if (!isAllowed) {
    console.error("403: No matching role. Redirecting to unauthorized.");
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;