import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import FilterBar from '../components/FilterBar';
import TransactionTable from '../components/TransactionTable';

const DEFAULT_FILTERS = {
  startDate: '', endDate: '', category: '', type: '',
  search: '', sortBy: 'date', order: 'desc',
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const isViewer = user?.role === 'Viewer';
  const isAnalystOrAdmin = user?.role === 'Analyst' || user?.role === 'Admin';

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [anomalyThreshold, setAnomalyThreshold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAnalystOrAdmin) {
      api.get('/analytics/anomalies').then((r) => setAnomalyThreshold(r.data.threshold ?? 0)).catch(() => {});
    }
  }, [isAnalystOrAdmin]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate)   params.set('endDate',   filters.endDate);
    if (filters.category)  params.set('category',  filters.category);
    if (filters.type)      params.set('type',       filters.type);
    if (filters.search)    params.set('search',     filters.search);
    if (filters.sortBy)    params.set('sortBy',     filters.sortBy);
    if (filters.order)     params.set('order',      filters.order);
    params.set('page', page);
    params.set('limit', limit);

    api.get(`/transactions?${params.toString()}`)
      .then((res) => {
        setTransactions(res.data.data ?? []);
        setTotal(res.data.total ?? 0);
        setTotalPages(res.data.totalPages ?? 1);
      })
      .catch((err) => setError(err.response?.data?.error || err.message || 'Failed to load transactions.'))
      .finally(() => setLoading(false));
  }, [filters, page, limit]);

  function handleFiltersChange(updated) { setFilters(updated); setPage(1); }
  function handleLimitChange(e) { setLimit(Number(e.target.value)); setPage(1); }

  return (
    <AppLayout>
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#F5F5F5', margin: 0 }}>Transactions</h2>
            {isViewer && (
              <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: 3 }}>👁 Viewer Mode — Read-only</p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {total > 0 && (
              <span style={{ fontSize: '0.8125rem', color: '#737373' }}>
                {total} record{total !== 1 ? 's' : ''}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: '0.75rem', color: '#737373' }}>Per page:</label>
              <select value={limit} onChange={handleLimitChange} className="select"
                style={{ width: 72, padding: '6px 10px', fontSize: '0.8125rem' }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        <FilterBar filters={filters} onChange={handleFiltersChange} />

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 160 }}>
            <div className="spinner" />
          </div>
        )}

        {error && <div className="alert-error"><span>⚠</span><span>{error}</span></div>}

        {!loading && !error && (
          <TransactionTable
            data={transactions}
            total={total}
            page={page}
            limit={limit}
            totalPages={totalPages}
            onPageChange={setPage}
            anomalyThreshold={anomalyThreshold}
          />
        )}
      </div>
    </AppLayout>
  );
}
