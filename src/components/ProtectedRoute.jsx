import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isAdminEmail, isSpecialEmail } from '../utils/roles';

const ProtectedRoute = ({ children, adminOnly = false, intimateOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="section loading-state">
        <div className="spinner" />
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && !isAdminEmail(user.email)) {
    return <Navigate to="/" replace />;
  }

  if (intimateOnly && !isAdminEmail(user.email) && !isSpecialEmail(user.email)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
