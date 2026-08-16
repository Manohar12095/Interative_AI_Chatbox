import { useState } from 'react';
import { Key, ArrowRight } from 'lucide-react';

export default function ApiKeyGateModal({ onComplete, onDismiss }) {
  const [apiKey, setApiKey] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in px-4">
      <div className="glass-card max-w-md w-full p-8 relative flex flex-col items-center">
        
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
             style={{ background: 'var(--bg-card)', color: 'var(--accent)' }}>
          <Key size={32} />
        </div>
        
        <h2 className="text-xl font-bold mb-2 text-center" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
          API Key Required
        </h2>
        
        <p className="text-sm text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
          IN NET CREATION requires a Groq or OpenAI API key to function. Please provide one to continue.
        </p>

        <div className="w-full mb-6">
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Enter API Key (e.g. gsk_... or sk-...)"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/40 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
            autoFocus
          />
        </div>

        <button 
          onClick={() => onComplete(apiKey)} 
          disabled={!apiKey.trim()}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mb-4 flex items-center justify-center gap-2"
          style={{ background: 'var(--accent-gradient)' }}
        >
          Save Key & Enter <ArrowRight size={16} />
        </button>

        <button 
          onClick={onDismiss}
          className="text-[11px] font-medium uppercase tracking-[1px] hover:underline transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          I don't have an API key right now
        </button>
      </div>
    </div>
  );
}
