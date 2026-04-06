import { useAuth } from '../context/AuthContext';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function TransactionTable({
  data = [], total = 0, page = 1, limit = 10,
  totalPages: totalPagesProp, onPageChange, anomalyThreshold = 0,
}) {
  const totalPages = totalPagesProp ?? Math.max(1, Math.ceil(total / limit));

  const btnPage = 'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div className="card-static overflow-hidden">
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl opacity-20">📋</span>
                    <p className="text-secondary text-sm">No transactions found.</p>
                    <p className="text-muted text-xs">Try adjusting your filters.</p>
                  </div>
                </td>
              </tr>
            ) : data.map((tx) => {
              const isIncome = tx.type === 'Income';
              const isAnomaly = anomalyThreshold > 0 && !isIncome && tx.amount > anomalyThreshold;
              return (
                <tr key={tx._id} style={isAnomaly ? { borderLeft: '2px solid #D4AF37' } : {}}>
                  <td className="text-secondary text-xs whitespace-nowrap">
                    {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <span className={isIncome ? 'badge-income' : 'badge-expense'}>{tx.type}</span>
                  </td>
                  <td className="text-secondary">{tx.category}</td>
                  <td className="text-muted truncate max-w-[180px]">
                    {tx.description || '—'}
                    {isAnomaly && <span className="ml-2 text-yellow-400 text-xs font-semibold">⚠ Unusual</span>}
                  </td>
                  <td className="text-right">
                    <span className={`font-semibold text-sm ${isIncome ? 'text-success' : 'text-danger'}`}>
                      {isIncome ? '+' : '-'}{fmt.format(Math.abs(tx.amount))}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-surface">
        <span className="text-xs text-muted">
          {total > 0 ? `Page ${page} of ${totalPages} · ${total} records` : 'No results'}
        </span>
        <div className="flex gap-1.5">
          <button onClick={() => onPageChange(1)} disabled={page <= 1}
            className={`${btnPage} bg-surface hover:bg-surface-hover text-secondary`}>«</button>
          <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
            className={`${btnPage} bg-surface hover:bg-surface-hover text-secondary px-4`}>Prev</button>
          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
            className={`${btnPage} bg-surface hover:bg-surface-hover text-secondary px-4`}>Next</button>
          <button onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}
            className={`${btnPage} bg-surface hover:bg-surface-hover text-secondary`}>»</button>
        </div>
      </div>
    </div>
  );
}
