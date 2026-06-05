import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2" style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="text-[11px] font-mono" style={{ color: '#8b949e' }}>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md transition-all hover:bg-white/10"
          style={{ color: copied ? '#22c55e' : '#8b949e' }}
        >
          {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      {/* Code */}
      <pre className="overflow-x-auto p-4 !m-0 !border-0 !rounded-none" style={{ background: 'transparent' }}>
        <code className="text-[13px] leading-6" style={{ color: '#e6edf3', fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace" }}>
          {code}
        </code>
      </pre>
    </div>
  );
}
