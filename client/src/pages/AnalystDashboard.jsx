import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';
import { useTheme } from '../context/ThemeContext';
import SummaryCard from '../components/SummaryCard';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const PIE_COLORS = ['#D4AF37','#22C55E','#EF4444','#a1a1aa','#737373','#F97316','#e8e8e8','#4a4a4a'];

function InsightCard({ icon, label, value, sub }) {
  return (
    <div className="stat-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
      </div>
      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#e8e8e8', margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

function TrendBadge({ value, label }) {
  if (value === null || value === undefined) return <span style={{ fontSize: '0.75rem', color: '#737373' }}>—</span>;
  const up = value >= 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', fontWeight: 600, color: up ? '#EF4444' : '#22C55E' }}>
      {up ? '↑' : '↓'} {Math.abs(value)}%
      <span style={{ color: '#737373', fontWeight: 400, fontSize: '0.75rem', marginLeft: 2 }}>{label}</span>
    </span>
  );
}

export default function AnalystDashboard() {
  const { dark } = useTheme();
  const TT = {
    contentStyle: { background: dark ? '#151821' : '#fff', border: `1px solid ${dark ? '#222' : '#e5e7eb'}`, borderRadius: 8, color: dark ? '#e8e8e8' : '#111', fontSize: 12 },
    labelStyle: { color: dark ? '#737373' : '#6b7280' },
  };
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [anomalyThreshold, setAnomalyThreshold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/summary'), api.get('/analytics/insights'),
      api.get('/analytics/monthly-trends'), api.get('/analytics/category-breakdown'),
      api.get('/analytics/anomalies'),
    ])
      .then(([s, i, t, c, a]) => {
        setSummary(s.data.data); setInsights(i.data.data);
        setTrends(t.data.data ?? []); setCategories(c.data.data ?? []);
        setAnomalies(a.data.data ?? []); setAnomalyThreshold(a.data.threshold ?? 0);
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  async function exportCSV() {
    try {
      const res = await api.get('/transactions?limit=1000');
      const rows = (res.data.data ?? []).map((t) => `${new Date(t.date).toLocaleDateString()},${t.type},${t.category},${t.amount},"${t.description || ''}"`);
      const csv = ['Date,Type,Category,Amount,Description', ...rows].join('\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'transactions.csv'; a.click();
    } catch { alert('Export failed.'); }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify({ summary, insights, trends, categories }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'analytics.json'; a.click();
  }

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>}
        {error && <div className="alert-error"><span>⚠</span><span>{error}</span></div>}

        {!loading && !error && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h1 className="section-title">Analytics Dashboard</h1>
                <p className="section-sub">Data intelligence & insights</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={exportCSV} className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '7px 12px' }}>⬇ CSV</button>
                <button onClick={exportJSON} className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '7px 12px' }}>⬇ JSON</button>
              </div>
            </div>

            {/* 3 summary cards — one row */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <SummaryCard label="Total Income"   value={summary?.totalIncome   ?? 0} variant="income"  />
              <SummaryCard label="Total Expenses" value={summary?.totalExpenses ?? 0} variant="expense" />
              <SummaryCard label="Net Balance"    value={summary?.netBalance    ?? 0} variant="balance" />
            </section>

            {/* Month-over-month */}
            {insights?.trends && (
              <section className="card-static" style={{ padding: 20 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e8e8e8', marginBottom: 16 }}>Month-over-Month</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
                  {[
                    ['This Month Income',   insights.thisMonth?.totalIncome   ?? 0, '#22C55E'],
                    ['Last Month Income',   insights.lastMonth?.totalIncome   ?? 0, '#a1a1aa'],
                    ['This Month Expenses', insights.thisMonth?.totalExpenses ?? 0, '#EF4444'],
                    ['Last Month Expenses', insights.lastMonth?.totalExpenses ?? 0, '#a1a1aa'],
                  ].map(([label, val, color]) => (
                    <div key={label}>
                      <p style={{ fontSize: '0.6875rem', color: '#737373', marginBottom: 4 }}>{label}</p>
                      <p style={{ fontWeight: 700, fontSize: '0.9375rem', color, margin: 0 }}>{fmt.format(val)}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 32, paddingTop: 14, borderTop: '1px solid #1e2025', flexWrap: 'wrap' }}>
                  <div><p style={{ fontSize: '0.6875rem', color: '#737373', marginBottom: 4 }}>Income Change</p><TrendBadge value={insights.trends.incomeChange} label="vs last month" /></div>
                  <div><p style={{ fontSize: '0.6875rem', color: '#737373', marginBottom: 4 }}>Expense Change</p><TrendBadge value={insights.trends.expenseChange} label="vs last month" /></div>
                </div>
              </section>
            )}

            {/* 4 insight cards — one row */}
            {insights && (
              <section>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e8e8e8', marginBottom: 12 }}>Key Insights</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                  <InsightCard icon="🏆" label="Top Spending Category" value={insights.topSpendingCategory?.category ?? 'N/A'} sub={insights.topSpendingCategory ? fmt.format(insights.topSpendingCategory.amount) : ''} />
                  <InsightCard icon="📅" label="Highest Expense Day"   value={insights.highestExpenseDay?.date ?? 'N/A'}         sub={insights.highestExpenseDay ? fmt.format(insights.highestExpenseDay.amount) : ''} />
                  <InsightCard icon="💰" label="Top Income Source"     value={insights.highestIncomeSource?.category ?? 'N/A'}   sub={insights.highestIncomeSource ? fmt.format(insights.highestIncomeSource.amount) : ''} />
                  <InsightCard icon="📊" label="Avg Daily Spending"    value={fmt.format(insights.avgDailySpending ?? 0)}         sub="per day (expenses)" />
                </div>
              </section>
            )}

            {/* Charts — 2 columns, full width */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              <div className="card-static" style={{ padding: 20 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e8e8e8', marginBottom: 16 }}>Monthly Income vs Expenses</h3>
                {trends.length === 0 ? (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#4a4a4a', fontSize: '0.875rem' }}>No data yet.</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={trends}>
                      <XAxis dataKey="period" tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TT} />
                      <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12 }} />
                      <Line type="monotone" dataKey="income"   name="Income"   stroke="#22C55E" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="card-static" style={{ padding: 20 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e8e8e8', marginBottom: 16 }}>Category Breakdown</h3>
                {categories.length === 0 ? (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#4a4a4a', fontSize: '0.875rem' }}>No data yet.</p></div>
                ) : (
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <div style={{ flexShrink: 0 }}>
                      <ResponsiveContainer width={160} height={160}>
                        <PieChart>
                          <Pie data={categories} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={72} innerRadius={36} strokeWidth={0}>
                            {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip {...TT} formatter={(v, _n, p) => [`${fmt.format(v)} · ${p.payload.percentage ?? 0}%`, p.payload.category]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {categories.map((item, i) => (
                        <div key={item.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                            <span style={{ fontSize: '0.8125rem', color: '#a1a1aa' }}>{item.category}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                            <span style={{ fontSize: '0.75rem', color: '#737373' }}>{item.percentage ?? 0}%</span>
                            <span style={{ fontSize: '0.8125rem', color: '#e8e8e8', fontWeight: 500 }}>{fmt.format(item.total)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Anomalies */}
            {anomalies.length > 0 && (
              <section style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#D4AF37', marginBottom: 12 }}>⚠ Anomaly Detection — Expenses above {fmt.format(anomalyThreshold)}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {anomalies.map((tx) => (
                    <div key={tx._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, background: '#111316', border: '1px solid #1e2025', borderRadius: 8, padding: '9px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#D4AF37' }}>⚠ UNUSUAL</span>
                        <span style={{ fontSize: '0.875rem', color: '#e8e8e8' }}>{tx.category}</span>
                        {tx.description && <span style={{ fontSize: '0.75rem', color: '#737373' }}>{tx.description}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '0.75rem', color: '#737373' }}>{new Date(tx.date).toLocaleDateString()}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#EF4444' }}>{fmt.format(tx.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <Link to="/analyst/transactions" className="btn-primary" style={{ alignSelf: 'flex-start' }}>View All Transactions →</Link>
          </>
        )}
      </div>
    </AppLayout>
  );
}
