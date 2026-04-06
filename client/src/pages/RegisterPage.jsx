import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Viewer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  function handleChange(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Name is required.');
    if (!form.email.trim()) return setError('Email is required.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role });
      const token = res.data?.data?.token;
      if (!token) { setError('No token returned. Please sign in.'); return; }
      auth.login(token);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) { setError('Cannot reach the server.'); return; }
      const status = err.response.status;
      const msg = err.response.data?.error;
      if (status === 409) setError('This email is already registered.');
      else if (status === 422) setError(msg || 'Validation failed.');
      else if (status >= 500) setError(`Server error (${status}).`);
      else setError(msg || `Error (${status}).`);
    } finally { setLoading(false); }
  }

  const labelStyle = { display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0A0A0A 0%, #121212 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, animation: 'slideUp 0.25s ease-out' }}>
        <div style={{ borderRadius: 16, padding: 1, background: 'linear-gradient(145deg, rgba(212,175,55,0.2), rgba(38,38,38,0.8), rgba(212,175,55,0.06))' }}>
          <div style={{ borderRadius: 15, padding: 36, background: 'linear-gradient(160deg, #1C1C1C 0%, #171717 100%)' }}>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1F1F1F', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>💰</div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#F5F5F5', letterSpacing: '-0.02em', margin: 0 }}>Create account</h1>
              <p style={{ fontSize: '0.875rem', color: '#737373', marginTop: 4 }}>Get started with Finance Data System</p>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { id: 'name', label: 'Full name', type: 'text', placeholder: 'John Doe', autoComplete: 'name' },
                { id: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
                { id: 'password', label: 'Password (min. 6 chars)', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
              ].map(({ id, label, type, placeholder, autoComplete }) => (
                <div key={id}>
                  <label style={labelStyle}>{label}</label>
                  <input id={id} name={id} type={type} autoComplete={autoComplete} value={form[id]} onChange={handleChange} className="input" placeholder={placeholder} />
                </div>
              ))}

              <div>
                <label style={labelStyle}>Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="select">
                  <option value="Viewer">Viewer — read-only access</option>
                  <option value="Analyst">Analyst — view + insights</option>
                  <option value="Admin">Admin — full access</option>
                </select>
              </div>

              {error && <div className="alert-error"><span>⚠</span><span>{error}</span></div>}

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 4 }}>
                {loading ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(245,245,245,0.2)', borderTopColor: '#F5F5F5', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />Creating…</> : 'Create account'}
              </button>
            </form>

            <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.875rem', color: '#525252' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#D4AF37', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
