import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function roleBase(role) {
  if (role === 'Admin') return '/admin';
  if (role === 'Analyst') return '/analyst';
  return '/viewer';
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose, dark = true }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const base = roleBase(user?.role);

  function handleLogout() { logout(); navigate('/login'); }

  const links = [
    { to: `${base}/dashboard`,    label: 'Dashboard',    icon: '▣' },
    { to: `${base}/transactions`, label: 'Transactions', icon: '⇄' },
    { to: `${base}/goals`,        label: 'Goals',        icon: '◎' },
    ...(user?.role === 'Admin' ? [
      { to: '/admin/insights',   label: 'Insights',    icon: '◈' },
      { to: '/admin/adminpanel', label: 'Admin Panel', icon: '⚙' },
    ] : []),
  ];

  const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : '??';

  const bg      = dark ? '#0f1115' : '#ffffff';
  const border  = dark ? '#1e2025' : '#e5e7eb';
  const textMuted = dark ? '#737373' : '#9ca3af';
  const textMain  = dark ? '#e8e8e8' : '#111';
  const activeBg  = dark ? '#1e2025' : '#f3f4f6';
  const hoverBg   = dark ? '#1a1c21' : '#f9fafb';

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? 'mobile-open' : ''}`} onClick={onMobileClose} />

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        style={{ background: bg, borderRight: `1px solid ${border}` }}>

        {/* Logo + collapse */}
        <div style={{ position: 'relative' }}>
          <Link to={`${base}/dashboard`} className="sidebar-logo" onClick={onMobileClose}
            style={{ borderBottom: `1px solid ${border}` }}>
            <div className="sidebar-logo-icon" style={{ background: dark ? '#1a1c21' : '#f3f4f6', border: `1px solid ${dark ? '#2a2a2a' : '#e5e7eb'}` }}>💰</div>
            {!collapsed && <span className="sidebar-logo-text" style={{ color: textMain }}>Finance Data System</span>}
          </Link>
          <button className="sidebar-collapse-btn" onClick={onToggle}
            style={{ background: dark ? '#1a1c21' : '#f3f4f6', border: `1px solid ${dark ? '#2a2a2a' : '#e5e7eb'}`, color: textMuted }}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {!collapsed && <div className="sidebar-section-label" style={{ color: dark ? '#3a3a3a' : '#d1d5db' }}>Menu</div>}
          {links.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                className="sidebar-link"
                style={{ color: active ? textMain : textMuted, background: active ? activeBg : 'transparent' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = textMain; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? textMain : textMuted; }}
                onClick={onMobileClose}
                title={collapsed ? label : undefined}>
                <span className="sidebar-link-icon">{icon}</span>
                {!collapsed && <span className="sidebar-link-label">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom" style={{ borderTop: `1px solid ${border}` }}>
          <div className="sidebar-user">
            <div className="sidebar-avatar" style={{ background: dark ? '#1e2025' : '#f3f4f6', border: `1px solid ${dark ? '#2a2a2a' : '#e5e7eb'}`, color: textMuted }}>
              {initials}
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name" style={{ color: textMain }}>{user?.name || 'User'}</div>
                <div className="sidebar-user-role" style={{ color: textMuted }}>{user?.role}</div>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="sidebar-link"
            style={{ marginTop: 4, color: textMuted, width: '100%', background: 'transparent', border: 'none' }}
            onMouseEnter={e => { e.currentTarget.style.background = hoverBg; e.currentTarget.style.color = textMain; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = textMuted; }}
            title={collapsed ? 'Sign out' : undefined}>
            <span className="sidebar-link-icon" style={{ fontSize: 13 }}>→</span>
            {!collapsed && <span className="sidebar-link-label">Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
