import { useAuth } from '../context/AuthContext';
import ViewerDashboard from './ViewerDashboard';
import AnalystDashboard from './AnalystDashboard';
import AdminDashboard from './AdminDashboard';

// Route to the correct dashboard based on role
export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'Admin') return <AdminDashboard />;
  if (user?.role === 'Analyst') return <AnalystDashboard />;
  return <ViewerDashboard />;
}
