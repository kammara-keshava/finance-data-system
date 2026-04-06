const CATEGORIES = ['All', 'Food', 'Salary', 'Rent', 'Transport', 'Healthcare', 'Entertainment', 'Other'];
const TYPES = ['All', 'Income', 'Expense'];
const SORT_OPTIONS = [
  { value: 'date|desc',   label: 'Date (Newest First)' },
  { value: 'date|asc',    label: 'Date (Oldest First)' },
  { value: 'amount|desc', label: 'Amount (High → Low)' },
  { value: 'amount|asc',  label: 'Amount (Low → High)' },
];

export default function FilterBar({ filters, onChange }) {
  function handleChange(e) {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  }

  function handleSortChange(e) {
    const [sortBy, order] = e.target.value.split('|');
    onChange({ ...filters, sortBy, order });
  }

  function handleReset() {
    onChange({ startDate: '', endDate: '', category: '', type: '', search: '', sortBy: 'date', order: 'desc' });
  }

  const sortValue = `${filters.sortBy || 'date'}|${filters.order || 'desc'}`;
  const hasActiveFilter = filters.startDate || filters.endDate || filters.category ||
    filters.type || filters.search || filters.sortBy !== 'date' || filters.order !== 'desc';

  return (
    <div className="card-static p-4 space-y-3">
      {/* Search */}
      <input type="text" name="search" value={filters.search || ''} onChange={handleChange}
        placeholder="Search description or category…" className="input" />

      {/* Filter row */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">Start Date</label>
          <input type="date" name="startDate" value={filters.startDate || ''} onChange={handleChange} className="input" />
        </div>
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">End Date</label>
          <input type="date" name="endDate" value={filters.endDate || ''} onChange={handleChange} className="input" />
        </div>
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">Category</label>
          <select name="category" value={filters.category || ''} onChange={handleChange} className="select">
            {CATEGORIES.map((c) => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 min-w-[120px]">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">Type</label>
          <select name="type" value={filters.type || ''} onChange={handleChange} className="select">
            {TYPES.map((t) => <option key={t} value={t === 'All' ? '' : t}>{t}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 min-w-[180px]">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">Sort By</label>
          <select value={sortValue} onChange={handleSortChange} className="select">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        {hasActiveFilter && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs opacity-0">Reset</label>
            <button type="button" onClick={handleReset} className="btn-ghost border border-surface-light px-4 py-2.5 text-xs rounded-xl">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
