import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';
import SummaryCard from '../components/SummaryCard';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function ViewerDashboard() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/analytics/summary'), api.get('/analytics/recent-activity')])
      .then(([s, r]) => { setSummary(s.data.data); setRecent(r.data.data ?? []); })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load data.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div>
            <h1 className="section-title">Dashboard</h1>
            <p className="section-sub">Overview of your financial data</p>
          </div>
          <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 6, border: '1px solid #222', background: '#111316', fontSize: '0.6875rem', color: '#737373' }}>
            👁 Read-only
          </span>
        </div>

        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>}
        {error && <div className="alert-error"><span>⚠</span><span>{error}</span></div>}

        {!loading && !error && (
          <>
            {/* 3 cards — one row */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <SummaryCard label="Total Income"   value={summary?.totalIncome   ?? 0} variant="income"  />
              <SummaryCard label="Total Expenses" value={summary?.totalExpenses ?? 0} variant="expense" />
              <SummaryCard label="Net Balance"    value={summary?.netBalance    ?? 0} variant="balance" />
            </section>

            {/* Recent transactions */}
            <section className="card-static" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e8e8e8', margin: 0 }}>Recent Transactions</h3>
                <Link to="/viewer/transactions" style={{ fontSize: '0.75rem', color: '#D4AF37', textDecoration: 'none' }}>View all →</Link>
              </div>
              {recent.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <p style={{ color: '#737373', fontSize: '0.875rem' }}>No transactions yet.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ minWidth: 400 }}>
                    <tbody>
                      {recent.map((tx) => (
                        <tr key={tx._id}>
                          <td style={{ color: '#737373', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                            {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td><span className={tx.type === 'Income' ? 'badge-income' : 'badge-expense'}>{tx.type}</span></td>
                          <td style={{ color: '#a1a1aa' }}>{tx.category}</td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: tx.type === 'Income' ? '#22C55E' : '#EF4444' }}>
                              {tx.type === 'Income' ? '+' : '-'}{fmt.format(Math.abs(tx.amount))}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AppLayout>
  );
}
