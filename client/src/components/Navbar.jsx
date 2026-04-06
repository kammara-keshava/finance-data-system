import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function roleBase(role) {
  if (role === 'Admin') return '/admin';
  if (role === 'Analyst') return '/analyst';
  return '/viewer';
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const base = roleBase(user?.role);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() { logout(); navigate('/login'); }

  const links = [
    { to: `${base}/dashboard`, label: 'Dashboard' },
    { to: `${base}/transactions`, label: 'Transactions' },
    ...(user?.role === 'Admin' ? [{ to: '/admin/adminpanel', label: 'Admin Panel' }] : []),
  ];

  return (
    <header style={{
      background: 'rgba(23,23,23,0.95)',
      borderBottom: '1px solid #262626',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      position: 'sticky', top: 0, zIndex: 20,
      boxShadow: '0 1px 0 rgba(255,255,255,0.03)',
    }}>
      <div style={{ width: '100%', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to={`${base}/dashboard`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 0', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: '#1F1F1F', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💰</div>
          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#F5F5F5', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            Finance Data System
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', marginLeft: 32 }} className="hidden-mobile">
          {links.map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                className={`tab-item ${active ? 'active' : ''}`}
                style={{ paddingTop: 14, paddingBottom: 14 }}>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right: user info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="hidden-mobile">
          {user?.name && <span style={{ fontSize: '0.8125rem', color: '#737373' }}>{user.name}</span>}
          {user?.role && (
            <span className={user.role === 'Admin' ? 'badge-admin' : user.role === 'Analyst' ? 'badge-analyst' : 'badge-viewer'}>
              {user.role}
            </span>
          )}
          <button onClick={handleLogout} className="btn-ghost" style={{ fontSize: '0.8125rem' }}>Sign out</button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="show-mobile btn-ghost"
          style={{ fontSize: '1.25rem', padding: '8px 10px' }}
          aria-label="Toggle menu">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ borderTop: '1px solid #262626', background: '#171717', padding: '12px 24px 16px' }}>
          {links.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '10px 0', fontSize: '0.9375rem', color: location.pathname === to ? '#F5F5F5' : '#737373', textDecoration: 'none', borderBottom: '1px solid #262626' }}>
              {label}
            </Link>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user?.name && <span style={{ fontSize: '0.8125rem', color: '#737373' }}>{user.name}</span>}
              {user?.role && <span className={user.role === 'Admin' ? 'badge-admin' : user.role === 'Analyst' ? 'badge-analyst' : 'badge-viewer'}>{user.role}</span>}
            </div>
            <button onClick={handleLogout} className="btn-ghost" style={{ fontSize: '0.8125rem' }}>Sign out</button>
          </div>
        </div>
      )}
    </header>
  );
}
