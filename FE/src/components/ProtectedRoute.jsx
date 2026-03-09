import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles = [], internal = false }) => {
  const { user, internalUser, loading } = useAuth();

  if (loading) return null;

  const currentUser = internal ? internalUser : user;

  if (!currentUser) {
    return (
      <Navigate to={internal ? "/internal/login" : "/login"} replace />
    );
  }

  if (allowedRoles.length && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;