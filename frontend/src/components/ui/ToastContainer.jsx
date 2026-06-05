import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null;

  const icons = {
    success: <CheckCircle size={16} style={{ color: '#22c55e' }} />,
    error: <AlertCircle size={16} style={{ color: '#ef4444' }} />,
    info: <Info size={16} style={{ color: '#3b82f6' }} />,
  };

  const bgColors = {
    success: 'rgba(34, 197, 94, 0.1)',
    error: 'rgba(239, 68, 68, 0.1)',
    info: 'rgba(59, 130, 246, 0.1)',
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast flex items-center gap-3"
             style={{ background: bgColors[t.type] || bgColors.info, color: 'var(--text-primary)' }}>
          {icons[t.type] || icons.info}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
