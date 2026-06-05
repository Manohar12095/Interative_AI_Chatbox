import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { exportChat } from '../../utils/api';

export default function ExportModal({ sessionId, sessionName, onClose, addToast }) {
  const [format, setFormat] = useState('txt');
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [includeToolResults, setIncludeToolResults] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const content = await exportChat(sessionId, format, includeTimestamps, includeToolResults);
      const blob = new Blob([content], { type: format === 'md' ? 'text/markdown' : 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sessionName || 'apex-chat'}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Chat exported successfully', 'success');
      onClose();
    } catch {
      addToast('Failed to export chat', 'error');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] max-w-[90vw] z-50 glass-card p-6 animate-scale-pop">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Export Chat</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10"><X size={16} style={{ color: 'var(--text-secondary)' }} /></button>
        </div>

        {/* Format */}
        <div className="mb-4">
          <label className="text-xs block mb-2" style={{ color: 'var(--text-secondary)' }}>Format</label>
          <div className="flex gap-2">
            {['txt', 'md'].map(f => (
              <button key={f} onClick={() => setFormat(f)}
                      className="flex-1 py-2 rounded-xl text-sm font-medium transition-all uppercase"
                      style={{
                        background: format === f ? 'var(--accent)' : 'var(--bg-card)',
                        color: format === f ? 'white' : 'var(--text-secondary)',
                        border: '1px solid var(--border-glass)'
                      }}>
                {f === 'txt' ? 'Plain Text' : 'Markdown'}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={includeTimestamps} onChange={e => setIncludeTimestamps(e.target.checked)}
                   className="w-4 h-4 rounded accent-blue-500" />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Include timestamps</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={includeToolResults} onChange={e => setIncludeToolResults(e.target.checked)}
                   className="w-4 h-4 rounded accent-blue-500" />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Include tool results</span>
          </label>
        </div>

        {/* Download */}
        <button onClick={handleExport} disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'var(--accent-gradient)' }}>
          <Download size={16} />
          {loading ? 'Exporting...' : 'Download'}
        </button>
      </div>
    </>
  );
}
