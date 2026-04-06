import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const EMPTY_FORM = { name: '', saved: '', target: '', deadline: '' };

function progressColor(pct) {
  if (pct >= 70) return '#22C55E';
  if (pct >= 35) return '#D4AF37';
  return '#EF4444';
}

function GoalCard({ goal, onEdit, onDelete }) {
  const pct = Math.min(100, Math.round((goal.saved / goal.target) * 100));
  const remaining = Math.max(0, goal.target - goal.saved);
  const color = progressColor(pct);

  let daysLeft = null;
  if (goal.deadline) {
    const diff = Math.ceil((new Date(goal.deadline) - new Date()) / 86400000);
    daysLeft = diff;
  }

  return (
    <div className="card-static" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#e8e8e8', margin: 0 }}>{goal.name}</h3>
          {daysLeft !== null && (
            <span style={{ fontSize: '0.6875rem', color: daysLeft < 7 ? '#EF4444' : '#737373', marginTop: 3, display: 'block' }}>
              {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onEdit(goal)} style={{ background: 'none', border: '1px solid #222', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#737373', fontSize: 12 }} title="Edit">✎</button>
          <button onClick={() => onDelete(goal.id)} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#EF4444', fontSize: 12 }} title="Delete">✕</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.75rem', color: '#737373' }}>Progress</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color }}>{pct}%</span>
        </div>
        <div style={{ height: 6, background: '#1e2025', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ height: 6, borderRadius: 3, width: `${pct}%`, background: color, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Amounts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          ['Saved', fmt.format(goal.saved), '#22C55E'],
          ['Target', fmt.format(goal.target), '#e8e8e8'],
          ['Remaining', fmt.format(remaining), remaining === 0 ? '#22C55E' : '#737373'],
        ].map(([label, val, color]) => (
          <div key={label} style={{ background: '#111316', border: '1px solid #1e2025', borderRadius: 8, padding: '8px 10px' }}>
            <p style={{ fontSize: '0.6875rem', color: '#737373', margin: 0 }}>{label}</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color, margin: '3px 0 0' }}>{val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalModal({ goal, onSave, onClose }) {
  const [form, setForm] = useState(goal ? { name: goal.name, saved: goal.saved, target: goal.target, deadline: goal.deadline || '' } : EMPTY_FORM);
  const [err, setErr] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setErr('Goal name is required.');
    if (!form.target || parseFloat(form.target) <= 0) return setErr('Target amount must be greater than 0.');
    if (parseFloat(form.saved) < 0) return setErr('Saved amount cannot be negative.');
    onSave({ ...form, saved: parseFloat(form.saved) || 0, target: parseFloat(form.target) });
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#151821', border: '1px solid #222', borderRadius: 14, padding: 28, width: '100%', maxWidth: 420, animation: 'fadeIn 0.15s ease' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#e8e8e8', marginBottom: 20 }}>{goal ? 'Edit Goal' : 'Add New Goal'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Goal Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Emergency Fund" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Amount Saved ($)</label>
              <input className="input" type="number" min="0" step="0.01" value={form.saved} onChange={e => setForm(f => ({ ...f, saved: e.target.value }))} placeholder="0.00" />
            </div>
            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Target Amount ($)</label>
              <input className="input" type="number" min="0.01" step="0.01" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} placeholder="1000.00" />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 }}>Deadline (optional)</label>
            <input className="input" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
          </div>
          {err && <div className="alert-error" style={{ padding: '8px 12px' }}><span>⚠</span><span>{err}</span></div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Goal</button>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [goals, setGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fds_goals') || '[]'); } catch { return []; }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => { localStorage.setItem('fds_goals', JSON.stringify(goals)); }, [goals]);

  function handleSave(form) {
    if (editingGoal) {
      setGoals(gs => gs.map(g => g.id === editingGoal.id ? { ...g, ...form } : g));
    } else {
      setGoals(gs => [...gs, { ...form, id: Date.now().toString() }]);
    }
    setModalOpen(false); setEditingGoal(null);
  }

  function handleEdit(goal) { setEditingGoal(goal); setModalOpen(true); }
  function handleDelete(id) { if (window.confirm('Delete this goal?')) setGoals(gs => gs.filter(g => g.id !== id)); }

  const totalSaved  = goals.reduce((s, g) => s + (g.saved  || 0), 0);
  const totalTarget = goals.reduce((s, g) => s + (g.target || 0), 0);
  const overallPct  = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <AppLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="section-title">Goal Tracker</h1>
            <p className="section-sub">Track your savings goals and progress</p>
          </div>
          <button onClick={() => { setEditingGoal(null); setModalOpen(true); }} className="btn-primary">
            + Add Goal
          </button>
        </div>

        {/* Summary */}
        {goals.length > 0 && (
          <div className="card-static" style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: '0.6875rem', color: '#737373', marginBottom: 4 }}>Total Saved</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#22C55E', margin: 0 }}>{fmt.format(totalSaved)}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.6875rem', color: '#737373', marginBottom: 4 }}>Total Target</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e8e8e8', margin: 0 }}>{fmt.format(totalTarget)}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.6875rem', color: '#737373', marginBottom: 4 }}>Overall Progress</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, color: progressColor(overallPct), margin: 0 }}>{overallPct}%</p>
              </div>
            </div>
            <div style={{ height: 6, background: '#1e2025', borderRadius: 3 }}>
              <div style={{ height: 6, borderRadius: 3, width: `${overallPct}%`, background: progressColor(overallPct), transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}

        {/* Goals grid */}
        {goals.length === 0 ? (
          <div className="card-static" style={{ padding: 48, textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: 12 }}>◎</p>
            <p style={{ color: '#737373', fontSize: '0.9375rem', marginBottom: 6 }}>No goals yet</p>
            <p style={{ color: '#4a4a4a', fontSize: '0.8125rem', marginBottom: 20 }}>Start tracking your savings goals</p>
            <button onClick={() => setModalOpen(true)} className="btn-primary">+ Add Your First Goal</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {goals.map(g => <GoalCard key={g.id} goal={g} onEdit={handleEdit} onDelete={handleDelete} />)}
          </div>
        )}
      </div>

      {modalOpen && <GoalModal goal={editingGoal} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingGoal(null); }} />}
    </AppLayout>
  );
}
