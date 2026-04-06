import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TOOLTIP = {
  contentStyle: { background: '#1C1C1C', border: '1px solid #262626', borderRadius: 10, color: '#F5F5F5', fontSize: 12 },
  labelStyle: { color: '#737373' },
  itemStyle: { color: '#F5F5F5' },
};

const TrendChart = ({ data = [] }) => (
  <div className="card-static" style={{ padding: 20 }}>
    <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>
      Income vs Expenses
    </p>
    {data.length === 0 ? (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#525252', fontSize: '0.875rem' }}>No trend data yet.</p>
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }} barSize={10}>
          <XAxis dataKey="period" tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#737373', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip {...TOOLTIP} />
          <Legend wrapperStyle={{ color: '#A1A1AA', fontSize: 12 }} />
          <Bar dataKey="income"   name="Income"   fill="#22C55E" radius={[4, 4, 0, 0]} opacity={0.85} />
          <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} opacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
);

export default TrendChart;
