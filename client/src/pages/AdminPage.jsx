import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/Toast';
import { useNotifications } from '../context/NotificationContext';

const CATEGORIES = ['Food', 'Salary', 'Rent', 'Transport', 'Healthcare', 'Entertainment', 'Other'];
const ROLES = ['Viewer', 'Analyst', 'Admin'];
const emptyTxForm = { amount: '', type: 'Income', category: 'Food', date: '', description: '' };
const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const L = { fontSize: '0.6875rem', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 6 };
const SORT_OPTIONS = [
  { value: 'date|desc', label: 'Date (Newest First)' },
  { value: 'date|asc',  label: 'Date (Oldest First)' },
  { value: 'amount|desc', label: 'Amount (High → Low)' },
  { value: 'amount|asc',  label: 'Amount (Low → High)' },
];

// ─── Transaction Modal ────────────────────────────────────────────────────────
function TxModal({ tx, onSave, onClose, submitting }) {
  const [form, setForm] = useState(tx ? {
    amount: tx.amount, type: tx.type, category: tx.category,
    date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : '',
    description: tx.description || '',
  } : emptyTxForm);
  const [err, setErr] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return setErr('Amount must be greater than 0.');
    if (!form.date) return setErr('Date is required.');
    setErr('');
    onSave({ ...form, amount: parseFloat(form.amount) });
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#151821', border: '1px solid #222', borderRadius: 14, padding: 28, width: '100%', maxWidth: 440, animation: 'fadeIn 0.15s ease' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#e8e8e8', marginBottom: 20 }}>{tx ? 'Edit Transaction' : 'Add Transaction'}</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={L}>Amount ($)</label><input className="input" type="number" step="0.01" min="0.01" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" /></div>
            <div><label style={L}>Type</label>
              <select className="select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div><label style={L}>Category</label>
              <select className="select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={L}>Date</label><input className="input" type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          </div>
          <div><label style={L}>Description (optional)</label><input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional note" /></div>
          {err && <div className="alert-error" style={{ padding: '8px 12px' }}><span>⚠</span><span>{err}</span></div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1 }}>{submitting ? 'Saving…' : tx ? 'Save Changes' : 'Add Transaction'}</button>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────
function EditUserModal({ user: u, currentUserId, onSave, onClose, submitting }) {
  const isSelf = u._id === currentUserId;
  const [form, setForm] = useState({ name: u.name || '', role: u.role, status: u.status });
  const [err, setErr] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return setErr('Name cannot be empty.');
    setErr('');
    onSave(u._id, { name: form.name.trim(), ...(!isSelf && { role: form.role, status: form.status }) });
  }

  const initials = form.name ? form.name.slice(0, 2).toUpperCase() : '??';

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#151821', border: '1px solid #222', borderRadius: 14, padding: 28, width: '100%', maxWidth: 400, animation: 'fadeIn 0.15s ease' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1e2025', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#a1a1aa' }}>{initials}</div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#e8e8e8', margin: 0 }}>Edit User</h3>
            <p style={{ fontSize: '0.75rem', color: '#737373', margin: '2px 0 0' }}>{u.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label style={L}>Full Name</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" /></div>
          <div><label style={L}>Email (read-only)</label><input className="input" value={u.email} readOnly style={{ opacity: 0.5, cursor: 'not-allowed' }} /></div>

          <div><label style={L}>Role {isSelf && <span style={{ color: '#4a4a4a', fontWeight: 400, textTransform: 'none' }}>— cannot change own role</span>}</label>
            <select className="select" value={form.role} disabled={isSelf} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={isSelf ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div><label style={L}>Status {isSelf && <span style={{ color: '#4a4a4a', fontWeight: 400, textTransform: 'none' }}>— cannot deactivate yourself</span>}</label>
            <select className="select" value={form.status} disabled={isSelf} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={isSelf ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {u.updatedAt && <p style={{ fontSize: '0.6875rem', color: '#4a4a4a' }}>Last updated: {new Date(u.updatedAt).toLocaleString()}</p>}
          {err && <div className="alert-error" style={{ padding: '8px 12px' }}><span>⚠</span><span>{err}</span></div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1 }}>{submitting ? 'Saving…' : 'Save Changes'}</button>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
function Confirm({ title, message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#151821', border: '1px solid #222', borderRadius: 14, padding: 24, width: '100%', maxWidth: 360, animation: 'fadeIn 0.15s ease' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#e8e8e8', marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: '0.875rem', color: '#737373', marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
          <button onClick={onConfirm} className="btn-danger" style={{ flex: 1 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user } = useAuth();
  const toast = useToast();
  const { add: addNotif } = useNotifications();
  // Fix 5: default tab is Transactions, no Overview
  const [activeTab, setActiveTab] = useState('transactions');

  return (
    <AppLayout>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <h1 className="section-title">Admin Panel</h1>
          <p className="section-sub">Manage transactions, users, and system data</p>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #1e2025', gap: 0 }}>
          {[['transactions','Transactions'],['users','Users']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`tab-item ${activeTab === key ? 'active' : ''}`}>{label}</button>
          ))}
        </div>

        {activeTab === 'transactions' && <TransactionsTab toast={toast} addNotif={addNotif} />}
        {activeTab === 'users'        && <UsersTab currentUserId={user?.id} toast={toast} addNotif={addNotif} />}
      </div>
    </AppLayout>
  );
}

// ─── Transactions Tab ─────────────────────────────────────────────────────────
function TransactionsTab({ toast, addNotif }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [txModal, setTxModal] = useState(null); // null | 'new' | tx object
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortValue, setSortValue] = useState('date|desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  async function fetchTx() {
    setLoading(true); setError(null);
    const [sortBy, order] = sortValue.split('|');
    const params = new URLSearchParams({ page, limit, sortBy, order });
    if (search) params.set('search', search);
    if (filterType) params.set('type', filterType);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    try {
      const res = await api.get(`/transactions?${params.toString()}`);
      setTransactions(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
      setTotalPages(res.data.totalPages ?? 1);
    } catch (e) { setError(e.response?.data?.error || 'Failed to load.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchTx(); }, [search, filterType, startDate, endDate, sortValue, page, limit]);

  async function handleSaveTx(form) {
    setSubmitting(true);
    try {
      if (txModal && txModal !== 'new') {
        await api.put(`/transactions/${txModal._id}`, form);
        toast.success('Transaction updated.');
        addNotif('Transaction updated successfully.');
      } else {
        await api.post('/transactions', form);
        toast.success('Transaction created.');
        addNotif('New transaction added.');
      }
      setTxModal(null); setPage(1); await fetchTx();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to save.'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete() {
    try { await api.delete(`/transactions/${deleteTarget}`); setDeleteTarget(null); toast.success('Deleted.'); addNotif('Transaction deleted.'); await fetchTx(); }
    catch (e) { toast.error(e.response?.data?.error || 'Failed to delete.'); setDeleteTarget(null); }
  }

  function handleExport() {
    const [sortBy, order] = sortValue.split('|');
    const params = new URLSearchParams({ sortBy, order });
    if (search) params.set('search', search);
    if (filterType) params.set('type', filterType);
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    fetch(`/api/transactions/export?${params.toString()}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.blob()).then(blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'transactions.csv'; a.click(); toast.success('Exported.'); })
      .catch(() => toast.error('Export failed.'));
  }

  const toInputDate = d => d ? new Date(d).toISOString().split('T')[0] : '';
  const hasFilter = search || filterType || startDate || endDate || sortValue !== 'date|desc';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {txModal !== null && <TxModal tx={txModal === 'new' ? null : txModal} onSave={handleSaveTx} onClose={() => setTxModal(null)} submitting={submitting} />}
      {deleteTarget && <Confirm title="Delete Transaction" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}

      {/* Filter bar */}
      <div className="card-static" style={{ padding: 16 }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search description or category…" className="input" style={{ marginBottom: 12 }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
          {[
            { label: 'Start Date', el: <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); setPage(1); }} className="input" /> },
            { label: 'End Date',   el: <input type="date" value={endDate}   onChange={e => { setEndDate(e.target.value);   setPage(1); }} className="input" /> },
            { label: 'Type', el: <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }} className="select"><option value="">All Types</option><option value="Income">Income</option><option value="Expense">Expense</option></select> },
            { label: 'Sort', el: <select value={sortValue} onChange={e => { setSortValue(e.target.value); setPage(1); }} className="select">{SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select> },
            { label: 'Per page', el: <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="select" style={{ width: 80 }}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select> },
          ].map(({ label, el }) => (
            <div key={label} style={{ minWidth: 130 }}><label style={L}>{label}</label>{el}</div>
          ))}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            {hasFilter && <button onClick={() => { setSearch(''); setFilterType(''); setStartDate(''); setEndDate(''); setSortValue('date|desc'); setPage(1); }} className="btn-ghost" style={{ border: '1px solid #222', borderRadius: 8, padding: '8px 12px' }}>Clear</button>}
            <button onClick={handleExport} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8125rem' }}>⬇ Export</button>
            <button onClick={() => setTxModal('new')} className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.8125rem' }}>+ Add Transaction</button>
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: 10 }}>{total} record{total !== 1 ? 's' : ''}</p>
      </div>

      {error && <ErrorBox msg={error} />}

      {loading ? <Spinner /> : (
        <div className="card-static" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead style={{ position: 'sticky', top: 0, background: '#151821', zIndex: 1 }}>
                <tr><th>Date</th><th>Type</th><th>Category</th><th style={{ textAlign: 'right' }}>Amount</th><th>Description</th><th style={{ textAlign: 'center' }}>Actions</th></tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: '#737373' }}>No transactions found.</td></tr>
                ) : transactions.map(tx => (
                  <tr key={tx._id}>
                    <td style={{ color: '#a1a1aa', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>{new Date(tx.date).toLocaleDateString()}</td>
                    <td><span className={tx.type === 'Income' ? 'badge-income' : 'badge-expense'}>{tx.type}</span></td>
                    <td style={{ color: '#a1a1aa' }}>{tx.category}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: tx.type === 'Income' ? '#22C55E' : '#EF4444' }}>
                      {tx.type === 'Income' ? '+' : '-'}{fmt.format(Math.abs(tx.amount))}
                    </td>
                    <td style={{ color: '#737373', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description || '—'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                        <button onClick={() => setTxModal({ ...tx, date: toInputDate(tx.date) })} style={{ background: 'none', border: '1px solid #222', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#a1a1aa', fontSize: '0.75rem' }}>Edit</button>
                        <button onClick={() => setDeleteTarget(tx._id)} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#EF4444', fontSize: '0.75rem' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #1e2025' }}>
              <span style={{ fontSize: '0.75rem', color: '#737373' }}>Page {page} of {totalPages}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['«', () => setPage(1), page <= 1], ['‹', () => setPage(p => p-1), page <= 1], ['›', () => setPage(p => p+1), page >= totalPages], ['»', () => setPage(totalPages), page >= totalPages]].map(([l, fn, dis]) => (
                  <button key={l} onClick={fn} disabled={dis} className="btn-ghost" style={{ padding: '5px 10px', border: '1px solid #222', borderRadius: 6, opacity: dis ? 0.3 : 1, cursor: dis ? 'not-allowed' : 'pointer' }}>{l}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab({ currentUserId, toast, addNotif }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function fetchUsers() {
    setLoading(true); setError(null);
    try { const r = await api.get('/users'); setUsers(r.data.data ?? []); }
    catch (e) { setError(e.response?.data?.error || 'Failed to load users.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handleEditSave(id, data) {
    setSubmitting(true);
    // Optimistic update — reflect changes in UI immediately
    setUsers(prev => prev.map(u => u._id === id ? { ...u, ...data } : u));
    setEditingUser(null); // close modal immediately
    try {
      await api.put(`/users/${id}`, data);
      toast.success('User updated successfully.');
      addNotif(`User "${data.name}" updated.`);
      // Refetch in background to sync with server
      fetchUsers();
    } catch (e) {
      // Revert optimistic update on failure
      await fetchUsers();
      toast.error(e.response?.data?.error || 'Failed to update.');
    }
    finally { setSubmitting(false); }
  }

  async function handleRoleChange(id, role) {
    if (id === currentUserId) return toast.warning('Cannot change your own role.');
    try { await api.patch(`/users/${id}/role`, { role }); toast.success('Role updated.'); addNotif(`User role changed to ${role}.`); await fetchUsers(); }
    catch (e) { toast.error(e.response?.data?.error || 'Failed.'); }
  }

  async function handleToggleStatus(id, status) {
    if (id === currentUserId) return toast.warning('Cannot change your own status.');
    const newStatus = status === 'Active' ? 'Inactive' : 'Active';
    try { await api.patch(`/users/${id}/status`, { status: newStatus }); toast.success(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'}.`); addNotif(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'}.`); await fetchUsers(); }
    catch (e) { toast.error(e.response?.data?.error || 'Failed.'); }
  }

  async function confirmDelete() {
    if (!deleteTarget || deleteTarget === currentUserId) return;
    try { await api.delete(`/users/${deleteTarget}`); setDeleteTarget(null); toast.success('User deleted.'); addNotif('User deleted.'); setSelected(s => { const n = new Set(s); n.delete(deleteTarget); return n; }); await fetchUsers(); }
    catch (e) { toast.error(e.response?.data?.error || 'Failed.'); setDeleteTarget(null); }
  }

  async function handleBulkAction(action) {
    const ids = [...selected].filter(id => id !== currentUserId);
    if (ids.length === 0) return toast.warning('No eligible users selected.');
    try {
      await Promise.all(ids.map(id => {
        if (action === 'activate')   return api.patch(`/users/${id}/status`, { status: 'Active' });
        if (action === 'deactivate') return api.patch(`/users/${id}/status`, { status: 'Inactive' });
        if (action === 'delete')     return api.delete(`/users/${id}`);
        return Promise.resolve();
      }));
      setSelected(new Set()); toast.success(`Bulk ${action} applied.`); await fetchUsers();
    } catch (e) { toast.error(e.response?.data?.error || 'Bulk action failed.'); }
  }

  function exportCSV() {
    const rows = filtered.map(u => `${u.name},${u.email},${u.role},${u.status},${new Date(u.createdAt).toLocaleDateString()}`);
    const csv = ['Name,Email,Role,Status,Joined', ...rows].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'users.csv'; a.click(); toast.success('Exported.');
  }

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    return (!search || u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      && (!filterRole || u.role === filterRole)
      && (!filterStatus || u.status === filterStatus);
  }), [users, search, filterRole, filterStatus]);

  const toggleSelect = id => {
    if (id === currentUserId) return; // never select self
    const s = new Set(selected); s.has(id) ? s.delete(id) : s.add(id); setSelected(s);
  };
  const toggleAll = () => {
    const eligible = filtered.filter(u => u._id !== currentUserId).map(u => u._id);
    selected.size === eligible.length ? setSelected(new Set()) : setSelected(new Set(eligible));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {editingUser && <EditUserModal user={editingUser} currentUserId={currentUserId} onSave={handleEditSave} onClose={() => setEditingUser(null)} submitting={submitting} />}
      {deleteTarget && <Confirm title="Delete User" message="This action cannot be undone." onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}

      {error && <ErrorBox msg={error} />}

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email…" className="input" style={{ flex: 1, minWidth: 200 }} />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="select" style={{ width: 130 }}>
          <option value="">All Roles</option>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="select" style={{ width: 130 }}>
          <option value="">All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
        </select>
        <button onClick={exportCSV} className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '8px 12px' }}>⬇ Export</button>
        <span style={{ fontSize: '0.75rem', color: '#737373' }}>{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: 8, padding: '10px 14px' }}>
          <span style={{ fontSize: '0.875rem', color: '#D4AF37' }}>{selected.size} selected</span>
          <button onClick={() => handleBulkAction('activate')}   style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(34,197,94,0.08)',  border: '1px solid rgba(34,197,94,0.18)',  color: '#22C55E', borderRadius: 6, cursor: 'pointer' }}>Activate</button>
          <button onClick={() => handleBulkAction('deactivate')} style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(232,232,232,0.05)', border: '1px solid #2a2a2a',              color: '#a1a1aa', borderRadius: 6, cursor: 'pointer' }}>Deactivate</button>
          <button onClick={() => handleBulkAction('delete')}     style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(239,68,68,0.08)',  border: '1px solid rgba(239,68,68,0.18)',  color: '#EF4444', borderRadius: 6, cursor: 'pointer' }}>Delete</button>
          <button onClick={() => setSelected(new Set())} style={{ fontSize: '0.75rem', color: '#737373', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto' }}>Clear</button>
        </div>
      )}

      {loading ? <Spinner /> : (
        <div className="card-static" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 600 }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input type="checkbox" checked={selected.size > 0 && selected.size === filtered.filter(u => u._id !== currentUserId).length} onChange={toggleAll} />
                  </th>
                  <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#737373' }}>No users found.</td></tr>
                ) : filtered.map(u => {
                  const isSelf = u._id === currentUserId;
                  return (
                    <tr key={u._id} style={{ background: selected.has(u._id) ? 'rgba(212,175,55,0.03)' : undefined }}>
                      <td>
                        <input type="checkbox" disabled={isSelf} checked={selected.has(u._id)} onChange={() => toggleSelect(u._id)} style={isSelf ? { opacity: 0.2, cursor: 'not-allowed' } : {}} />
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {u.name || '—'}
                        {isSelf && <span style={{ marginLeft: 8, fontSize: '0.6875rem', color: '#4a4a4a' }}>Current User</span>}
                      </td>
                      <td style={{ color: '#a1a1aa' }}>{u.email}</td>
                      <td>
                        <select value={u.role} disabled={isSelf} onChange={e => handleRoleChange(u._id, e.target.value)}
                          className="select" style={{ width: 'auto', padding: '4px 8px', fontSize: '0.75rem', ...(isSelf ? { opacity: 0.4, cursor: 'not-allowed' } : {}) }}>
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td><span className={u.status === 'Active' ? 'badge-active' : 'badge-inactive'}>{u.status}</span></td>
                      <td style={{ color: '#737373', fontSize: '0.75rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                          {!isSelf && (
                            <>
                              <button onClick={() => handleToggleStatus(u._id, u.status)}
                                style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: 6, cursor: 'pointer', background: 'none', border: `1px solid ${u.status === 'Inactive' ? 'rgba(34,197,94,0.2)' : '#2a2a2a'}`, color: u.status === 'Inactive' ? '#22C55E' : '#a1a1aa' }}>
                                {u.status === 'Inactive' ? 'Activate' : 'Deactivate'}
                              </button>
                              <button onClick={() => setDeleteTarget(u._id)} style={{ background: 'none', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#EF4444', fontSize: '0.75rem' }}>Delete</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared ───────────────────────────────────────────────────────────────────
function Spinner() { return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>; }
function ErrorBox({ msg }) { return <div className="alert-error"><span>⚠</span><span>{msg}</span></div>; }
