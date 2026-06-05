import { useState } from 'react';
import { X, Key, Palette, Volume2, Database, Info, Moon, Sun } from 'lucide-react';

const THEMES = [
  { id: 'dark', label: 'Dark (ChatGPT)', color: '#212121', border: '#10a37f' },
  { id: 'light', label: 'Light (CHAT A.I+)', color: '#f0f4f8', border: '#3b82f6' },
  { id: 'aiva', label: 'Olive (AIVA)', color: '#fdfaf6', border: '#4a5c44' },
  { id: 'neon', label: 'Neon (Cyber)', color: '#0a0a12', border: '#ff2a8f' },
  { id: 'ocean', label: 'Ocean (Deep)', color: '#09131f', border: '#00b4d8' },
  { id: 'sunset', label: 'Sunset (Warm)', color: '#fff5eb', border: '#ff7e67' },
  { id: 'dracula', label: 'Dracula', color: '#282a36', border: '#bd93f9' }
];

export default function SettingsPanel({ onClose, settings, updateSetting, sessions }) {
  const [showKey, setShowKey] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[380px] max-w-full z-50 overflow-y-auto animate-slide-in-right"
        style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-subtle)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Settings</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <div className="p-6 space-y-8">

          {/* API Configuration */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Key size={16} style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>API Configuration</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Groq API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={settings.api_key || ''}
                    onChange={e => updateSetting('api_key', e.target.value)}
                    placeholder="gsk_xxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none pr-16"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                    id="settings-api-key"
                  />
                  <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium"
                    style={{ color: 'var(--accent)' }}>
                    {showKey ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Model</label>
                <select
                  value={settings.model}
                  onChange={e => updateSetting('model', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}>
                  <option value="llama-3.3-70b-versatile">LLaMA 3.3 70B Versatile</option>
                  <option value="llama-3.1-8b-instant">LLaMA 3.1 8B Instant</option>
                  <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                </select>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Palette size={16} style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Appearance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <span className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Theme Configuration</span>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => updateSetting('theme', t.id)}
                      className="flex items-center gap-3 p-2 rounded-xl transition-all border text-left"
                      style={{
                        borderColor: settings.theme === t.id ? t.border : 'var(--border-glass)',
                        background: settings.theme === t.id ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                      }}
                    >
                      <div className="w-5 h-5 rounded-full border border-black/10 dark:border-white/10 shrink-0"
                        style={{ background: t.color, boxShadow: settings.theme === t.id ? `0 0 0 2px ${t.border}` : 'none' }} />
                      <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Font Size</span>
                <div className="flex gap-1">
                  {['small', 'medium', 'large'].map(s => (
                    <button key={s} onClick={() => updateSetting('font_size', s)}
                      className="px-3 py-1 rounded-lg text-xs capitalize transition-all"
                      style={{
                        background: settings.font_size === s ? 'var(--accent)' : 'var(--bg-card)',
                        color: settings.font_size === s ? 'white' : 'var(--text-secondary)',
                        border: '1px solid var(--border-glass)'
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Voice */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Volume2 size={16} style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Voice</h3>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Voice input uses Web Speech API. TTS uses the browser's built-in speech synthesis.
            </p>
          </section>

          {/* Memory */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database size={16} style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Memory</h3>
            </div>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              {sessions.length} sessions stored
            </p>
          </section>

          {/* About */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Info size={16} style={{ color: 'var(--accent)' }} />
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>About</h3>
            </div>
            <div className="space-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p><strong style={{ color: 'var(--text-secondary)' }}>RAHONAM</strong> — Reversed Creation</p>
              <p>Version 1.0.0</p>
              <p>Powered by Groq + LLaMA 3.3 70B</p>
              <p className="mt-3">Created by Manohar</p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
