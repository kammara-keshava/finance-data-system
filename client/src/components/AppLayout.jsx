import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'Good Morning';
  if (h >= 12 && h < 17) return 'Good Afternoon';
  if (h >= 17 && h < 22) return 'Good Evening';
  return 'Good Night';
}

function getPageTitle(pathname) {
  if (pathname.includes('dashboard'))    return 'Dashboard';
  if (pathname.includes('transactions')) return 'Transactions';
  if (pathname.includes('adminpanel'))   return 'Admin Panel';
  if (pathname.includes('goals'))        return 'Goal Tracker';
  if (pathname.includes('insights'))     return 'Insights';
  return 'Finance Data System';
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AppLayout({ children, onExport }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const { dark, toggle } = useTheme();
  const { user } = useAuth();
  const { notifications, remove, clear } = useNotifications();
  const location = useLocation();

  const isDashboard = location.pathname.includes('dashboard');
  const pageTitle = getPageTitle(location.pathname);
  const unread = notifications.length;

  const topbarBg     = dark ? '#0d0f12' : '#ffffff';
  const topbarBorder = dark ? '#1e2025' : '#e5e7eb';
  const textMain     = dark ? '#e8e8e8' : '#111';
  const textMuted    = dark ? '#737373' : '#6b7280';

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        dark={dark}
      />

      <div className={`main-area ${collapsed ? 'collapsed' : ''}`}>

        {/* ── Topbar ── */}
        <div className="topbar" style={{ background: topbarBg, borderBottom: `1px solid ${topbarBorder}`, justifyContent: 'space-between' }}>

          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="topbar-hamburger btn-ghost"
              style={{ display: 'none', padding: '6px 8px', fontSize: '1.1rem' }}
              onClick={() => setMobileOpen(true)} aria-label="Open menu">☰</button>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: textMain }}>{pageTitle}</span>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(o => !o)}
                style={{ width: 34, height: 34, borderRadius: 8, background: 'transparent', border: `1px solid ${dark ? '#222' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 15, position: 'relative' }}>
                🔔
                {unread > 0 && (
                  <span style={{ position: 'absolute', top: 3, right: 3, minWidth: 14, height: 14, borderRadius: 7, background: '#EF4444', border: `1px solid ${topbarBg}`, fontSize: 9, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div style={{ position: 'absolute', top: 42, right: 0, width: 280, background: dark ? '#151821' : '#fff', border: `1px solid ${dark ? '#222' : '#e5e7eb'}`, borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 50 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Notifications</span>
                    {notifications.length > 0 && (
                      <button onClick={clear} style={{ fontSize: '0.6875rem', color: textMuted, background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>
                    )}
                  </div>
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.8125rem', color: textMuted, padding: '12px 14px', textAlign: 'center' }}>No notifications</p>
                    ) : notifications.map((n, i) => (
                      <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '9px 14px', borderTop: i > 0 ? `1px solid ${dark ? '#1e2025' : '#f3f4f6'}` : 'none' }}>
                        <div>
                          <p style={{ fontSize: '0.8125rem', color: textMain, margin: 0 }}>{n.text}</p>
                          <p style={{ fontSize: '0.6875rem', color: textMuted, margin: '2px 0 0' }}>{timeAgo(n.time)}</p>
                        </div>
                        <button onClick={() => remove(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, fontSize: 14, marginLeft: 8, flexShrink: 0 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Export */}
            {onExport && (
              <button onClick={onExport} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8125rem', height: 34 }}>
                ⬇ Export
              </button>
            )}

            {/* Role badge */}
            {user?.role && (
              <span className={user.role === 'Admin' ? 'badge-admin' : user.role === 'Analyst' ? 'badge-analyst' : 'badge-viewer'} style={{ fontSize: '0.6875rem' }}>
                {user.role}
              </span>
            )}
          </div>
        </div>

        {/* Greeting only on dashboard — no page title duplication */}
        {isDashboard && (
          <div style={{ padding: '18px 24px 0', background: dark ? '#0d0f12' : '#f9fafb' }}>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: textMain, margin: 0 }}>
              {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
            </h2>
            <p style={{ fontSize: '0.8125rem', color: textMuted, marginTop: 3 }}>
              Here's your financial summary for today.
            </p>
          </div>
        )}

        <main className="page-content">{children}</main>
        <Footer dark={dark} />
      </div>
    </div>
  );
}
