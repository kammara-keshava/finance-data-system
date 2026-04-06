import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// No blue — neutral + gold + green + red palette
const COLORS = ['#D4AF37', '#22C55E', '#EF4444', '#A1A1AA', '#737373', '#F97316', '#E5E7EB', '#525252'];

const fmtMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const TOOLTIP = {
  contentStyle: { background: '#1C1C1C', border: '1px solid #262626', borderRadius: 10, color: '#F5F5F5', fontSize: 12 },
  formatter: (value, _name, props) => {
    const pct = props.payload?.percentage;
    return [`${fmtMoney.format(value)}${pct != null ? ` · ${pct}%` : ''}`, props.payload?.category];
  },
};

const CategoryChart = ({ data = [] }) => (
  <div className="card-static" style={{ padding: 20 }}>
    <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 16 }}>
      Spending by Category
    </p>
    {data.length === 0 ? (
      <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#525252', fontSize: '0.875rem' }}>No category data yet.</p>
      </div>
    ) : (
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Fix 5: NO label prop on Pie — labels were overlapping. Use external legend instead. */}
        <div style={{ flexShrink: 0 }}>
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                strokeWidth={0}
              >
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...TOOLTIP} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Clean external legend — no overlap possible */}
        <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.map((item, i) => (
            <div key={item.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                <span style={{ fontSize: '0.8125rem', color: '#A1A1AA' }}>{item.category}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: '#737373' }}>{item.percentage ?? 0}%</span>
                <span style={{ fontSize: '0.8125rem', color: '#F5F5F5', fontWeight: 500 }}>{fmtMoney.format(item.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default CategoryChart;
