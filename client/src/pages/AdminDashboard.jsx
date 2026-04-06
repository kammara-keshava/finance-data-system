import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';
import { useTheme } from '../context/ThemeContext';

const fmtMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const fmtNum   = new Intl.NumberFormat('en-US');

function StatCard({ icon, label, value, color = '#e8e8e8', isMoney = false }) {
  const display = isMoney ? fmtMoney.format(value ?? 0) : fmtNum.format(value ?? 0);
  return (
    <div className="stat-card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
        <span style={{ fontSize: 13, color }}>{icon}</span>
      </div>
      <span style={{ fontSize: '1.375rem', fontWeight: 700, color, letterSpacing: '-0.02em' }}>{display}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const { dark } = useTheme();
  const TT = { contentStyle: { background: dark ? '#151821' : '#fff', border: `1px solid ${dark ? '#222' : '#e5e7eb'}`, borderRadius: 8, color: dark ? '#e8e8e8' : '#111', fontSize: 12 } };
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme-aware colors
  const cardBg     = dark ? '#151821' : '#ffffff';
  const cardBorder = dark ? '#222'    : '#e5e7eb';
  const textMain   = dark ? '#e8e8e8' : '#111111';
  const textMuted  = dark ? '#737373' : '#6b7280';
  const trackBg    = dark ? '#1e2025' : '#f3f4f6';

  useEffect(() => {
    api.get('/analytics/admin-stats')
      .then((r) => setStats(r.data.data))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load stats.'))
      .finally(() => setLoading(false));
  }, []);

  const netBalance = stats ? (stats.totalIncome ?? 0) - (stats.totalExpenses ?? 0) : 0;
  const netColor = netBalance >= 0 ? '#22C55E' : '#EF4444';

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>}
        {error && <div className="alert-error"><span>⚠</span><span>{error}</span></div>}

        {!loading && !error && stats && (
          <>
            {/* 6 cards — one row, no section title needed */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
              <StatCard icon="👥" label="Total Users"    value={stats.totalUsers}        color="#e8e8e8" isMoney={false} />
              <StatCard icon="✅" label="Active Users"   value={stats.activeUsers}       color="#22C55E" isMoney={false} />
              <StatCard icon="🔄" label="Transactions"   value={stats.totalTransactions} color="#a1a1aa" isMoney={false} />
              <StatCard icon="↑"  label="Total Income"   value={stats.totalIncome}       color="#D4AF37" isMoney={true}  />
              <StatCard icon="↓"  label="Total Expenses" value={stats.totalExpenses}     color="#EF4444" isMoney={true}  />
              <StatCard icon="◈"  label="Net Balance"    value={netBalance}              color={netColor} isMoney={true} />
            </section>

            {/* Charts */}
            <section style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 20 }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 18 }}>Users by Role</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {Object.entries(stats.usersByRole || {}).map(([role, count]) => {
                    const pct = Math.round((count / Math.max(stats.totalUsers, 1)) * 100);
                    const barColor = role === 'Admin' ? '#D4AF37' : role === 'Analyst' ? '#a1a1aa' : '#4a4a4a';
                    return (
                      <div key={role}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: '0.875rem', color: textMain }}>{role}</span>
                          <span style={{ fontSize: '0.75rem', color: textMuted }}>{count} · {pct}%</span>
                        </div>
                        <div style={{ height: 4, background: trackBg, borderRadius: 2 }}>
                          <div style={{ height: 4, borderRadius: 2, width: `${pct}%`, background: barColor, transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 20 }}>
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Transactions (Last 30 Days)</p>
                {!stats.txPerDay?.length ? (
                  <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#4a4a4a', fontSize: '0.875rem' }}>No data yet.</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={stats.txPerDay} barSize={28} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                      <XAxis dataKey="_id" tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip {...TT} />
                      <Bar dataKey="count" name="Transactions" radius={[4, 4, 0, 0]} fill="#D4AF37" opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            {/* Recent users */}
            <section style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>Recently Registered Users</p>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ minWidth: 500 }}>
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr></thead>
                  <tbody>
                    {(stats.recentUsers || []).map((u) => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: 500, color: textMain }}>{u.name}</td>
                        <td style={{ color: textMuted }}>{u.email}</td>
                        <td><span className={u.role === 'Admin' ? 'badge-admin' : u.role === 'Analyst' ? 'badge-analyst' : 'badge-viewer'}>{u.role}</span></td>
                        <td><span className={u.status === 'Active' ? 'badge-active' : 'badge-inactive'}>{u.status}</span></td>
                        <td style={{ color: textMuted, fontSize: '0.75rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
