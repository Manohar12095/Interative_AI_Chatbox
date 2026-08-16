import { useState, useRef } from 'react';
import { Copy, Check, Play, Terminal } from 'lucide-react';

export default function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState(null);
  const iframeRef = useRef(null);

  const isJs = language === 'javascript' || language === 'js';
  const isPython = language === 'python' || language === 'py';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunJs = () => {
    setOutput('Running...');
    try {
      // Create a blob URL for a sandboxed iframe to capture console.log
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <script>
            let logs = [];
            console.log = (...args) => { logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')); };
            console.error = (...args) => { logs.push('Error: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')); };
            window.onerror = function(msg, url, line) { logs.push('Error: ' + msg); return false; };
            
            window.addEventListener('message', function(e) {
              if (e.data.type === 'EXECUTE') {
                try {
                  const result = eval(e.data.code);
                  if (result !== undefined && logs.length === 0) {
                    logs.push(String(result));
                  }
                } catch (err) {
                  logs.push('Error: ' + err.message);
                }
                window.parent.postMessage({ type: 'RESULT', output: logs.join('\\n') || 'No output' }, '*');
              }
            });
          </script>
        </head>
        <body></body>
        </html>
      `;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      
      const messageHandler = (e) => {
        if (e.data.type === 'RESULT') {
          setOutput(e.data.output);
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
          window.removeEventListener('message', messageHandler);
        }
      };
      window.addEventListener('message', messageHandler);
      
      iframe.onload = () => {
        iframe.contentWindow.postMessage({ type: 'EXECUTE', code }, '*');
      };
      
      // Cleanup fallback
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
          window.removeEventListener('message', messageHandler);
          if (output === 'Running...') setOutput('Execution timed out.');
        }
      }, 5000);
      
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2" style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="text-[11px] font-mono" style={{ color: '#8b949e' }}>{language}</span>
        
        <div className="flex items-center gap-1">
          {isJs && (
            <button
              onClick={handleRunJs}
              className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md transition-all hover:bg-white/10 text-blue-400"
            >
              <Play size={12} /> Run
            </button>
          )}
          {isPython && (
            <button
              disabled
              className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md transition-all opacity-50 cursor-not-allowed"
              style={{ color: '#8b949e' }}
              title="Python execution sandbox not yet connected"
            >
              <Terminal size={12} /> Run (via backend)
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md transition-all hover:bg-white/10"
            style={{ color: copied ? '#22c55e' : '#8b949e' }}
          >
            {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
      </div>
      
      {/* Code */}
      <pre className="overflow-x-auto p-4 !m-0 !border-0 !rounded-none" style={{ background: 'transparent' }}>
        <code className="text-[13px] leading-6" style={{ color: '#e6edf3', fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace" }}>
          {code}
        </code>
      </pre>
      
      {/* Output Terminal */}
      {output && (
        <div className="border-t px-4 py-3 bg-[#050505]" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="text-[10px] uppercase font-bold tracking-wider mb-1" style={{ color: '#8b949e' }}>Output</div>
          <pre className="text-[12px] font-mono whitespace-pre-wrap break-words" style={{ color: output.startsWith('Error:') ? '#ff7b72' : '#a5d6ff' }}>
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
