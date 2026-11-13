
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = ({ title, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h2>AuthSystem</h2>
          <span className="dashboard-subtitle">
            Role-Based Authentication Platform
          </span>
        </div>

        <div className="header-user">
          <div className="header-user-info">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>

          <button
            onClick={handleLogout}
            className="logout-button"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
