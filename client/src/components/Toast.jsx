import { useEffect, useState } from 'react';

const STYLES = {
  success: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', text: '#86EFAC', icon: '✓' },
  error:   { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  text: '#FCA5A5', icon: '✕' },
  warning: { bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.25)', text: '#FDE68A', icon: '⚠' },
  info:    { bg: 'rgba(245,245,245,0.04)', border: 'rgba(245,245,245,0.1)', text: '#A1A1AA', icon: 'ℹ' },
};

function ToastItem({ id, type = 'info', message, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(id), 3500);
    return () => clearTimeout(t);
  }, [id, onRemove]);

  const s = STYLES[type] || STYLES.info;

  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm max-w-sm w-full animate-slide-in"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        color: s.text,
      }}>
      <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
        style={{ background: s.border, color: s.text }}>
        {s.icon}
      </span>
      <span className="flex-1 text-sm" style={{ color: '#E5E7EB' }}>{message}</span>
      <button onClick={() => onRemove(id)} className="shrink-0 text-muted hover:text-primary transition-colors text-lg leading-none">×</button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState([]);
  function toast(message, type = 'info') {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  }
  function removeToast(id) { setToasts((prev) => prev.filter((t) => t.id !== id)); }
  return {
    toasts, removeToast,
    success: (msg) => toast(msg, 'success'),
    error: (msg) => toast(msg, 'error'),
    info: (msg) => toast(msg, 'info'),
    warning: (msg) => toast(msg, 'warning'),
  };
}
