export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(7,13,24,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-px animate-slide-up"
        style={{ background: 'linear-gradient(145deg, rgba(239,68,68,0.3), rgba(31,41,55,0.8))' }}>
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(145deg, #141E2E, #111827)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <span className="text-danger text-lg">⚠</span>
          </div>
          <h3 className="text-primary font-semibold text-base mb-2">{title}</h3>
          <p className="text-secondary text-sm mb-6 leading-relaxed">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary flex-1">{' '}Cancel</button>
            <button onClick={onConfirm} className="btn-danger flex-1">{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
