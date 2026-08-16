import { useState } from 'react';
import { ChevronDown, ChevronRight, Download, Image as ImageIcon, FileText, BarChart2, Code2, Brain } from 'lucide-react';
import LocationCard from './LocationCard';
import { API_BASE } from '../../utils/constants';

/**
 * Force-download a file by fetching as blob and triggering a synthetic click.
 * Works reliably across all browsers, unlike <a download> which fails for
 * cross-origin or proxied URLs.
 */
async function forceDownload(url, filename) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (err) {
    // Fallback: open in new tab so user can save manually
    console.error('Download failed, opening in new tab:', err);
    window.open(url, '_blank');
  }
}

export default function ToolResultCard({ result }) {
  const [expanded, setExpanded] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Try to parse structured payload
  let payload = null;
  try {
    if (typeof result.result === 'string' && result.result.trim().startsWith('{')) {
      payload = JSON.parse(result.result);
    } else if (typeof result.result === 'object') {
      payload = result.result;
    }
  } catch (e) {
    // normal text
  }

  const handleDownload = async (url, filename) => {
    if (downloading) return;
    setDownloading(true);
    try {
      await forceDownload(url, filename);
    } finally {
      setDownloading(false);
    }
  };

  const renderContent = () => {
    const fileUrl = (payload?.url && payload.url.startsWith('/')) ? `${API_BASE}${payload.url}` : payload?.url;

    if (payload && payload.type === 'image') {
      return (
        <div className="flex flex-col gap-2">
          <div className="w-full flex justify-center bg-black/20 rounded-md p-2 overflow-hidden border border-[var(--border-subtle)]">
            <img 
              src={fileUrl} 
              alt={payload.alt || 'Tool result'} 
              className="max-w-full max-h-[250px] object-contain rounded-sm bg-white/5"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="hidden text-[var(--text-muted)] text-xs text-center p-4">
              Image failed to load.<br/>
              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] underline mt-1 block">Open URL</a>
            </div>
          </div>
          <button
            onClick={() => handleDownload(fileUrl, payload.filename || 'image.png')}
            disabled={downloading}
            className="flex items-center justify-center gap-2 w-full py-1.5 px-3 rounded text-xs font-medium bg-[var(--accent-gradient)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Download size={14} /> {downloading ? 'Downloading...' : 'Download Image'}
          </button>
        </div>
      );
    }
    
    if (payload && payload.type === 'location') {
      return <LocationCard location={payload} />;
    }

    if (payload && payload.type === 'file') {
      return (
        <div className="flex flex-col gap-2 p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded bg-[var(--brand-primary-light)] text-[var(--accent)]">
              <FileText size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[13px] truncate" style={{ color: 'var(--text-primary)' }}>{payload.filename}</p>
              <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{payload.text}</p>
            </div>
          </div>
          <button
            onClick={() => handleDownload(fileUrl, payload.filename || 'file')}
            disabled={downloading}
            className="flex items-center justify-center gap-2 w-full py-1.5 px-3 mt-1 rounded text-xs font-medium bg-[var(--accent-gradient)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Download size={14} /> {downloading ? 'Downloading...' : 'Download File'}
          </button>
        </div>
      );
    }

    // Chart
    if (payload && payload.type === 'chart') {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{payload.title}</span>
          </div>
          <div className="w-full overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border-subtle)' }}>
            <img
              src={payload.url}
              alt={payload.title || 'Chart'}
              className="w-full object-contain"
              style={{ maxHeight: '400px', background: '#1a1a2e' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden items-center justify-center p-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              Chart failed to load. <a href={payload.url} target="_blank" rel="noopener noreferrer" className="ml-1 underline" style={{ color: 'var(--accent)' }}>Open directly</a>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{payload.text}</p>
        </div>
      );
    }

    // Python code execution result
    if (payload && payload.type === 'code_result') {
      const hasError = payload.error;
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Code2 size={14} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{payload.description || 'Python Code Result'}</span>
          </div>
          {payload.code && (
            <pre className="rounded p-2 text-[11px] overflow-x-auto" style={{ background: 'var(--bg-primary)', color: '#a9dc76', border: '1px solid var(--border-subtle)', fontFamily: 'monospace' }}>
              {payload.code}
            </pre>
          )}
          <div className={`rounded p-2 text-[11px] font-mono whitespace-pre-wrap`} style={{ background: hasError ? 'rgba(255,60,60,0.08)' : 'rgba(0,198,100,0.08)', border: `1px solid ${hasError ? 'rgba(255,60,60,0.3)' : 'rgba(0,198,100,0.3)'}`, color: hasError ? '#ff6b6b' : '#69db7c' }}>
            {hasError ? (payload.stderr || 'Error occurred') : (payload.stdout || '(no output)')}
          </div>
        </div>
      );
    }
    
    // Fallback to text
    const textContent = payload ? (payload.text || JSON.stringify(payload, null, 2)) : String(result.result);
    return textContent;
  };

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
          <div className="rounded-lg p-2.5 text-xs leading-relaxed whitespace-pre-wrap break-words" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
}
