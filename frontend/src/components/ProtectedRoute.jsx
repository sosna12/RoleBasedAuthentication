
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();

  // 1. Check whether the user is logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check whether the user's role is allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Allow access to the protected page
  return <Outlet />;
};

export default ProtectedRoute;
