import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While the /api/auth/me call is in progress, show a loading state
  // This prevents the "flash redirect" to the login page on refresh
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DC143C]"></div>
      </div>
    );
  }

  // 1. Not logged in? 
  // We check for !user or the "anonymousUser" string that Spring Security might return
  if (!user || user.email === "anonymousUser") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role-Based Access Control (RBAC)
  if (adminOnly) {
    // We check both 'user.role' (string) and 'user.roles' (array) for maximum compatibility
    const roles = user.roles || [user.role];
    const hasAdminPermission = Array.isArray(roles) 
      ? roles.includes("ROLE_ADMIN") 
      : roles === "ROLE_ADMIN";

    if (!hasAdminPermission) {
      console.warn("Access denied: User does not have ROLE_ADMIN");
      return <Navigate to="/" replace />;
    }
  }

  // If all checks pass, render the requested component (e.g., Admin Panel)
  return children;
};

export default ProtectedRoute;