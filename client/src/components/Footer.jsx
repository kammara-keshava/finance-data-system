export default function Footer({ dark = true }) {
  return (
    <footer className="footer" style={{ borderTop: `1px solid ${dark ? '#1e2025' : '#e5e7eb'}`, background: dark ? '#0d0f12' : '#f4f5f7' }}>
      <p style={{ fontSize: '0.6875rem', color: dark ? '#3a3a3a' : '#9ca3af', margin: 0 }}>
        © 2026 Finance Data System — Built for performance and clarity
        <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
        v1.0
      </p>
    </footer>
  );
}
