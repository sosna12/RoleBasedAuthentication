
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" replace />;

    case "manager":
      return <Navigate to="/manager" replace />;

    case "user":
      return <Navigate to="/user" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRedirect;
