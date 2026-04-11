import { jwtDecode } from "jwt-decode";

export const getUserRoles = () => {
  const token = localStorage.getItem("token");
  if (!token) return [];

  try {
    const decoded = jwtDecode(token);

    // Try multiple common role claim keys
    const claimKeys = [
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
      "role",
      "roles",
      "user_roles",
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/roles"
    ];

    let roles = null;
    for (const key of claimKeys) {
      roles = decoded[key];
      if (roles) break;
    }

    console.log("Decoded token claims:", Object.keys(decoded));
    console.log("Found roles:", roles);

    if (!roles || roles.length === 0) return [];

    if (Array.isArray(roles)) return roles;

    return [roles];
  } catch (err) {
    console.error("JWT decode error:", err);
    return [];
  }
};
