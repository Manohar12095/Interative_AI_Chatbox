import { ArrowRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function FlowBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const steps = code.split('->').map(s => s.trim()).filter(Boolean);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 relative group" style={{ background: 'var(--bg-card-hover)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
      {/* Header */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-[var(--border-subtle)]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Process Flow</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded opacity-50 hover:opacity-100 hover:bg-white/10 transition-all"
        >
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-[var(--text-muted)]" />}
        </button>
      </div>

      {/* Flow Steps */}
      <div className="p-4 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-3 min-w-max">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div 
                className="px-4 py-2 rounded-lg font-mono text-[12px] shadow-sm"
                style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)' 
                }}
              >
                {step}
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight size={16} style={{ color: 'var(--accent)' }} className="flex-shrink-0 animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
