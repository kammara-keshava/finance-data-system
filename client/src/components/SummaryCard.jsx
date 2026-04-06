const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const VARIANTS = {
  income:  { icon: '↑', iconColor: '#D4AF37', valueColor: '#D4AF37', borderAccent: 'rgba(212,175,55,0.18)' },
  expense: { icon: '↓', iconColor: '#EF4444', valueColor: '#EF4444', borderAccent: 'rgba(239,68,68,0.15)' },
  balance: { icon: '◈', iconColor: '#a1a1aa', valueColor: null,      borderAccent: '#222' },
  default: { icon: '◆', iconColor: '#737373', valueColor: '#e8e8e8', borderAccent: '#222' },
};

export default function SummaryCard({ label, value, variant = 'default' }) {
  const v = VARIANTS[variant] || VARIANTS.default;
  const formatted = fmt.format(value ?? 0);
  let valueColor = v.valueColor;
  if (variant === 'balance') valueColor = (value ?? 0) >= 0 ? '#22C55E' : '#EF4444';

  return (
    <div className={`stat-card ${variant === 'income' ? 'income' : ''}`}
      style={{ padding: 18, borderColor: v.borderAccent }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
        <span style={{ fontSize: 13, color: v.iconColor }}>{v.icon}</span>
      </div>
      <span style={{ fontSize: '1.375rem', fontWeight: 700, color: valueColor, letterSpacing: '-0.02em' }}>
        {formatted}
      </span>
    </div>
  );
}
