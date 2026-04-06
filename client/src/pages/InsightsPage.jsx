import { useEffect, useState } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';
import { useTheme } from '../context/ThemeContext';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const PIE_COLORS = ['#D4AF37','#22C55E','#EF4444','#a1a1aa','#737373','#F97316','#e8e8e8','#4a4a4a'];

function TrendBadge({ value }) {
  if (value === null || value === undefined) return <span style={{ color: '#737373', fontSize: '0.75rem' }}>—</span>;
  const up = value >= 0;
  return (
    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: up ? '#EF4444' : '#22C55E' }}>
      {up ? '↑' : '↓'} {Math.abs(value)}%
    </span>
  );
}

export default function InsightsPage() {
  const { dark } = useTheme();
  const [insights, setInsights] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [anomalyThreshold, setAnomalyThreshold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TT = {
    contentStyle: { background: dark ? '#151821' : '#fff', border: `1px solid ${dark ? '#222' : '#e5e7eb'}`, borderRadius: 8, color: dark ? '#e8e8e8' : '#111', fontSize: 12 },
    labelStyle: { color: dark ? '#737373' : '#6b7280' },
  };

  useEffect(() => {
    Promise.all([
      api.get('/analytics/insights'),
      api.get('/analytics/monthly-trends'),
      api.get('/analytics/category-breakdown'),
      api.get('/analytics/anomalies'),
    ])
      .then(([i, t, c, a]) => {
        setInsights(i.data.data);
        setTrends(t.data.data ?? []);
        setCategories(c.data.data ?? []);
        setAnomalies(a.data.data ?? []);
        setAnomalyThreshold(a.data.threshold ?? 0);
      })
      .catch(e => setError(e.response?.data?.error || 'Failed to load insights.'))
      .finally(() => setLoading(false));
  }, []);

  const cardBg = dark ? '#151821' : '#fff';
  const cardBorder = dark ? '#222' : '#e5e7eb';
  const textMain = dark ? '#e8e8e8' : '#111';
  const textMuted = dark ? '#737373' : '#6b7280';

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>}
        {error && <div className="alert-error"><span>⚠</span><span>{error}</span></div>}

        {!loading && !error && insights && (
          <>
            {/* Month-over-month */}
            <section style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: textMain, marginBottom: 16 }}>Month-over-Month Comparison</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
                {[
                  ['This Month Income',   insights.thisMonth?.totalIncome   ?? 0, '#22C55E'],
                  ['Last Month Income',   insights.lastMonth?.totalIncome   ?? 0, textMuted],
                  ['This Month Expenses', insights.thisMonth?.totalExpenses ?? 0, '#EF4444'],
                  ['Last Month Expenses', insights.lastMonth?.totalExpenses ?? 0, textMuted],
                ].map(([label, val, color]) => (
                  <div key={label}>
                    <p style={{ fontSize: '0.6875rem', color: textMuted, marginBottom: 4 }}>{label}</p>
                    <p style={{ fontWeight: 700, fontSize: '0.9375rem', color, margin: 0 }}>{fmt.format(val)}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 32, paddingTop: 14, borderTop: `1px solid ${dark ? '#1e2025' : '#f3f4f6'}` }}>
                <div><p style={{ fontSize: '0.6875rem', color: textMuted, marginBottom: 4 }}>Income Change</p><TrendBadge value={insights.trends?.incomeChange} /></div>
                <div><p style={{ fontSize: '0.6875rem', color: textMuted, marginBottom: 4 }}>Expense Change</p><TrendBadge value={insights.trends?.expenseChange} /></div>
              </div>
            </section>

            {/* Key insight cards */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {[
                ['🏆', 'Top Spending Category', insights.topSpendingCategory?.category ?? 'N/A', insights.topSpendingCategory ? fmt.format(insights.topSpendingCategory.amount) : ''],
                ['📅', 'Highest Expense Day',   insights.highestExpenseDay?.date ?? 'N/A',         insights.highestExpenseDay ? fmt.format(insights.highestExpenseDay.amount) : ''],
                ['💰', 'Top Income Source',     insights.highestIncomeSource?.category ?? 'N/A',   insights.highestIncomeSource ? fmt.format(insights.highestIncomeSource.amount) : ''],
                ['📊', 'Avg Daily Spending',    fmt.format(insights.avgDailySpending ?? 0),         'per day (expenses)'],
              ].map(([icon, label, value, sub]) => (
                <div key={label} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
                    <span style={{ fontSize: '1rem' }}>{icon}</span>
                  </div>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: textMain, margin: 0 }}>{value}</p>
                  {sub && <p style={{ fontSize: '0.75rem', color: textMuted, marginTop: 3 }}>{sub}</p>}
                </div>
              ))}
            </section>

            {/* Charts */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: textMain, marginBottom: 16 }}>Monthly Income vs Expenses</h3>
                {trends.length === 0 ? (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#4a4a4a' }}>No data yet.</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={trends}>
                      <XAxis dataKey="period" tick={{ fill: textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TT} />
                      <Legend wrapperStyle={{ color: textMuted, fontSize: 12 }} />
                      <Line type="monotone" dataKey="income"   name="Income"   stroke="#22C55E" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: textMain, marginBottom: 16 }}>Category Breakdown</h3>
                {categories.length === 0 ? (
                  <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#4a4a4a' }}>No data yet.</p></div>
                ) : (
                  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie data={categories} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={72} innerRadius={36} strokeWidth={0}>
                          {categories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip {...TT} formatter={(v, _n, p) => [`${fmt.format(v)} · ${p.payload.percentage ?? 0}%`, p.payload.category]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {categories.map((item, i) => (
                        <div key={item.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                            <span style={{ fontSize: '0.8125rem', color: textMuted }}>{item.category}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span style={{ fontSize: '0.75rem', color: textMuted }}>{item.percentage ?? 0}%</span>
                            <span style={{ fontSize: '0.8125rem', color: textMain, fontWeight: 500 }}>{fmt.format(item.total)}</span>
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
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#D4AF37', marginBottom: 12 }}>
                  ⚠ Anomaly Detection — Expenses above {fmt.format(anomalyThreshold)}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {anomalies.map(tx => (
                    <div key={tx._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, background: dark ? '#111316' : '#f9fafb', border: `1px solid ${dark ? '#1e2025' : '#e5e7eb'}`, borderRadius: 8, padding: '9px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#D4AF37' }}>⚠ UNUSUAL</span>
                        <span style={{ fontSize: '0.875rem', color: textMain }}>{tx.category}</span>
                        {tx.description && <span style={{ fontSize: '0.75rem', color: textMuted }}>{tx.description}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '0.75rem', color: textMuted }}>{new Date(tx.date).toLocaleDateString()}</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#EF4444' }}>{fmt.format(tx.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
