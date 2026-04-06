import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Email is required.');
    if (!password) return setError('Password is required.');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      const token = res.data?.data?.token;
      if (!token) { setError('No token returned. Please try again.'); return; }
      auth.login(token);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) { setError('Cannot reach the server. Make sure the backend is running on port 8000.'); return; }
      const status = err.response.status;
      const msg = err.response.data?.error;
      if (status === 422) setError(msg || 'Validation error.');
      else if (status === 401) setError(msg || 'Invalid email or password.');
      else if (status === 403) setError(msg || 'Account is inactive.');
      else if (status >= 500) setError(`Server error (${status}).`);
      else setError(msg || `Error (${status}).`);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0A0A0A 0%, #121212 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>

      {/* Subtle ambient — gold, not blue */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 420, animation: 'slideUp 0.25s ease-out' }}>
        {/* Gold border glow card */}
        <div style={{ borderRadius: 16, padding: 1, background: 'linear-gradient(145deg, rgba(212,175,55,0.2), rgba(38,38,38,0.8), rgba(212,175,55,0.06))' }}>
          <div style={{ borderRadius: 15, padding: 36, background: 'linear-gradient(160deg, #1C1C1C 0%, #171717 100%)' }}>

            {/* Logo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1F1F1F', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>💰</div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#F5F5F5', letterSpacing: '-0.02em', margin: 0 }}>Welcome back</h1>
              <p style={{ fontSize: '0.875rem', color: '#737373', marginTop: 4 }}>Sign in to Finance Data System</p>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Email address</label>
                <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Password</label>
                <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #262626', borderRadius: 8, padding: '10px 14px', fontSize: '0.75rem', color: '#525252' }}>
                Your role is assigned at registration or by an Admin.
              </div>

              {error && <div className="alert-error"><span>⚠</span><span>{error}</span></div>}

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 4 }}>
                {loading ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(245,245,245,0.2)', borderTopColor: '#F5F5F5', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Signing in…</> : 'Sign in'}
              </button>
            </form>

            <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.875rem', color: '#525252' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#D4AF37', fontWeight: 500, textDecoration: 'none' }}>Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
