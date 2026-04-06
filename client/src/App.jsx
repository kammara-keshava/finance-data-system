import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import RoleRoute from './components/RoleRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AdminPage from './pages/AdminPage';
import GoalsPage from './pages/GoalsPage';
import InsightsPage from './pages/InsightsPage';

function RoleRedirect({ to, adminOnly = false }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  const role = user?.role;
  if (adminOnly && role !== 'Admin') {
    const base = role === 'Analyst' ? '/analyst' : '/viewer';
    return <Navigate to={`${base}/dashboard`} replace />;
  }
  const base = role === 'Admin' ? '/admin' : role === 'Analyst' ? '/analyst' : '/viewer';
  return <Navigate to={`${base}/${to}`} replace />;
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Admin */}
              <Route element={<RoleRoute allowedRole="Admin" />}>
                <Route path="/admin/dashboard"    element={<DashboardPage />} />
                <Route path="/admin/transactions" element={<TransactionsPage />} />
                <Route path="/admin/adminpanel"   element={<AdminPage />} />
                <Route path="/admin/goals"        element={<GoalsPage />} />
                <Route path="/admin/insights"     element={<InsightsPage />} />
              </Route>

              {/* Analyst */}
              <Route element={<RoleRoute allowedRole="Analyst" />}>
                <Route path="/analyst/dashboard"    element={<DashboardPage />} />
                <Route path="/analyst/transactions" element={<TransactionsPage />} />
                <Route path="/analyst/goals"        element={<GoalsPage />} />
              </Route>

              {/* Viewer */}
              <Route element={<RoleRoute allowedRole="Viewer" />}>
                <Route path="/viewer/dashboard"    element={<DashboardPage />} />
                <Route path="/viewer/transactions" element={<TransactionsPage />} />
                <Route path="/viewer/goals"        element={<GoalsPage />} />
              </Route>

              <Route path="/dashboard"    element={<RoleRedirect to="dashboard" />} />
              <Route path="/transactions" element={<RoleRedirect to="transactions" />} />
              <Route path="/admin"        element={<RoleRedirect to="adminpanel" adminOnly />} />
              <Route path="/"             element={<RoleRedirect to="dashboard" />} />
              <Route path="*"             element={<RoleRedirect to="dashboard" />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
