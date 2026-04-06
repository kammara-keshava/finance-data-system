import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleRoute — protects a route group for a specific role.
 * If not logged in → /login
 * If logged in but wrong role → redirect to their own dashboard
 */
export default function RoleRoute({ allowedRole }) {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  if (user?.role !== allowedRole) {
    // Redirect to the correct dashboard for their actual role
    const roleBase = {
      Admin: '/admin/dashboard',
      Analyst: '/analyst/dashboard',
      Viewer: '/viewer/dashboard',
    };
    return <Navigate to={roleBase[user?.role] || '/login'} replace />;
  }

  return <Outlet />;
}
