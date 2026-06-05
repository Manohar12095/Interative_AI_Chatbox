import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function ToolResultCard({ result }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="glass-card overflow-hidden animate-scale-pop" style={{ fontSize: '13px' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors"
      >
        <span className="text-base">{result.icon || '🔧'}</span>
        <span className="font-medium text-xs" style={{ color: 'var(--text-primary)' }}>
          {result.display_name || result.tool}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: 'var(--accent)', color: 'white', opacity: 0.8 }}>
          result
        </span>
        {expanded ? <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 pt-1 animate-fade-in">
          <div className="rounded-lg p-2.5 text-xs leading-relaxed whitespace-pre-wrap" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
            {result.result}
          </div>
        </div>
      )}
    </div>
  );
}
