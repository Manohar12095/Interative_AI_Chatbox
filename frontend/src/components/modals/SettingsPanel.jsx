import { useState, useEffect, useRef } from 'react';
import { X, Key, Palette, Volume2, Database, Info, Cpu, CheckCircle2, AlertCircle, Loader2, Zap, Target, ToggleLeft, ToggleRight, ChevronDown, ChevronRight, Save, Trash2 } from 'lucide-react';
import { API_BASE } from '../../utils/constants';
import { TOOL_DEFINITIONS, TOPIC_CATEGORIES } from '../../utils/constants';

const THEMES = [
  { id: 'dark', label: 'Dark', color: '#212121', border: '#00C6FF' },
  { id: 'light', label: 'Light', color: '#f0f4f8', border: '#3b82f6' },
  { id: 'aiva', label: 'Olive', color: '#fdfaf6', border: '#4a5c44' },
  { id: 'neon', label: 'Neon', color: '#0a0a12', border: '#ff2a8f' },
  { id: 'ocean', label: 'Ocean', color: '#09131f', border: '#00b4d8' },
  { id: 'sunset', label: 'Sunset', color: '#fff5eb', border: '#ff7e67' },
  { id: 'dracula', label: 'Dracula', color: '#282a36', border: '#bd93f9' },
];

// Accent color presets - each is a [color1, color2] gradient pair
const ACCENT_PRESETS = [
  { id: 'default', label: 'Cosmic', from: '#00C6FF', to: '#7B2FFF' },
  { id: 'ocean', label: 'Ocean', from: '#0077B6', to: '#00B4D8' },
  { id: 'sunset', label: 'Sunset', from: '#FF7E67', to: '#FF4560' },
  { id: 'forest', label: 'Forest', from: '#2D6A4F', to: '#52B788' },
  { id: 'rose', label: 'Rose', from: '#E63946', to: '#FF9FB2' },
  { id: 'mono', label: 'Mono', from: '#AAAAAA', to: '#EEEEEE' },
];

const PROVIDER_MODELS = {
  groq: [
    { value: 'llama-3.1-8b-instant', label: 'LLaMA 3.1 8B Instant' },
    { value: 'llama-3.3-70b-versatile', label: 'LLaMA 3.3 70B Versatile' },
    { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
    { value: 'gemma2-9b-it', label: 'Gemma 2 9B' },
    { value: 'llama-3.2-1b-preview', label: 'LLaMA 3.2 1B Preview' },
    { value: 'llama-3.2-3b-preview', label: 'LLaMA 3.2 3B Preview' },
    { value: 'llama-3.2-11b-vision-preview', label: 'LLaMA 3.2 11B Vision' },
    { value: 'llama-3.2-90b-vision-preview', label: 'LLaMA 3.2 90B Vision' },
    { value: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill LLaMA 70B' },
    { value: 'qwen-2.5-32b', label: 'Qwen 2.5 32B' },
    { value: 'qwen-2.5-coder-32b', label: 'Qwen 2.5 Coder 32B' }
  ],
  openai: [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'o1-mini', label: 'o1-mini' }
  ],
  gemini: [
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash' }
  ],
  ollama: []
};

const PROVIDER_INFO = {
  groq: { label: 'Groq API Key', placeholder: 'gsk_xxxxxxxxxxxxxxxx' },
  openai: { label: 'OpenAI API Key', placeholder: 'sk-proj-xxxxxxxxxxxxxxxx' },
  gemini: { label: 'Gemini API Key', placeholder: 'AIzaSyxxxxxxxxxxxxxxxx' },
  ollama: { label: null, placeholder: null }
};

const TABS = [
  { id: 'general', label: 'API', icon: Key },
  { id: 'tools', label: 'Tools', icon: Zap },
  { id: 'appearance', label: 'Look', icon: Palette },
  { id: 'voice', label: 'Voice', icon: Volume2 },
  { id: 'memory', label: 'Data', icon: Database },
  { id: 'about', label: 'About', icon: Info },
];

// Apply an accent preset or custom colors live
function applyAccent(from, to) {
  const root = document.documentElement;
  root.style.setProperty('--accent', from);
  root.style.setProperty('--accent-hover', to);
  root.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${from}, ${to})`);
  root.style.setProperty('--brand-primary', from);
  root.style.setProperty('--brand-primary-light', `${from}18`);
  root.style.setProperty('--accent-glow', `${from}26`);
}

export default function SettingsPanel({
  onClose, settings, updateSetting, sessions, backendConfig, initialTab = 'general',
  enabledTools, onToggleTool, onToggleAll, selectedTopic, onSelectTopic
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showKey, setShowKey] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState(null);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [voices, setVoices] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loadoutName, setLoadoutName] = useState('');
  const [customAccentFrom, setCustomAccentFrom] = useState(settings.accent_from || '#00C6FF');
  const [customAccentTo, setCustomAccentTo] = useState(settings.accent_to || '#7B2FFF');

  const activeProvider = settings.provider || 'groq';
  const ttsEngine = settings.tts_engine || 'local';
  const sttModelSize = settings.stt_model_size || 'base';
  const allEnabled = enabledTools?.length === TOOL_DEFINITIONS.length;
  const loadouts = settings.loadouts || [];

  // Apply stored accent on mount
  useEffect(() => {
    if (settings.accent_from && settings.accent_to) {
      applyAccent(settings.accent_from, settings.accent_to);
    }
  }, []);

  // Sync active tab if initialTab changes
  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);

  // Fetch voices whenever TTS engine changes
  useEffect(() => {
    if (activeTab !== 'voice') return;
    const fetchVoices = async () => {
      setLoadingVoices(true);
      try {
        const res = await fetch(`${API_BASE}/tts/voices?engine=${ttsEngine}`);
        if (res.ok) {
          const data = await res.json();
          setVoices(data.voices || []);
          if (data.voices?.length > 0 && (!settings.tts_voice || !data.voices.find(v => v.id === settings.tts_voice))) {
            updateSetting('tts_voice', data.voices[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to fetch voices:', e);
      } finally {
        setLoadingVoices(false);
      }
    };
    fetchVoices();
  }, [ttsEngine, activeTab]);

  const handleProviderChange = (newProvider) => {
    updateSetting('provider', newProvider);
    const defaultModel = PROVIDER_MODELS[newProvider]?.[0]?.value || '';
    updateSetting('model', defaultModel);
    setOllamaStatus(null);
    setOllamaModels([]);
  };

  const testOllamaConnection = async () => {
    setOllamaStatus('testing');
    const baseUrl = settings.ollama_url || 'http://localhost:11434';
    try {
      const res = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const models = (data.models || []).map(m => m.name);
      setOllamaModels(models);
      setOllamaStatus('ok');
      if (models.length > 0 && !settings.model) updateSetting('model', models[0]);
    } catch (e) {
      setOllamaStatus('error');
      setOllamaModels([]);
    }
  };

  const applyPreset = (preset) => {
    applyAccent(preset.from, preset.to);
    updateSetting('accent_from', preset.from);
    updateSetting('accent_to', preset.to);
    setCustomAccentFrom(preset.from);
    setCustomAccentTo(preset.to);
  };

  const applyCustomAccent = (from, to) => {
    applyAccent(from, to);
    updateSetting('accent_from', from);
    updateSetting('accent_to', to);
  };

  const saveLoadout = () => {
    if (!loadoutName.trim()) return;
    const newLoadout = {
      id: Date.now().toString(),
      name: loadoutName.trim(),
      theme: settings.theme,
      accent_from: settings.accent_from,
      accent_to: settings.accent_to,
    };
    const updated = [...loadouts, newLoadout];
    updateSetting('loadouts', updated);
    setLoadoutName('');
  };

  const applyLoadout = (loadout) => {
    if (loadout.theme) updateSetting('theme', loadout.theme);
    if (loadout.accent_from && loadout.accent_to) {
      updateSetting('accent_from', loadout.accent_from);
      updateSetting('accent_to', loadout.accent_to);
      applyAccent(loadout.accent_from, loadout.accent_to);
      setCustomAccentFrom(loadout.accent_from);
      setCustomAccentTo(loadout.accent_to);
    }
  };

  const deleteLoadout = (id) => {
    updateSetting('loadouts', loadouts.filter(l => l.id !== id));
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50 animate-fade-in" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 w-[400px] max-w-full z-50 flex flex-col animate-slide-in-right"
        style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-subtle)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>Settings</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
            <X size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto no-scrollbar" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap"
                style={{
                  background: active ? 'var(--brand-primary-light)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  border: active ? '1px solid var(--border-glass)' : '1px solid transparent',
                }}
              >
                <Icon size={12} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto">

          {/* ───── API Tab ───── */}
          {activeTab === 'general' && (
            <div className="p-6 space-y-6">
              {/* Connection Mode */}
              <div>
                <label className="text-xs block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Connection Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {['serverless', 'remote'].map(mode => (
                    <button key={mode}
                      onClick={() => updateSetting('connection_mode', mode)}
                      className="py-2 px-3 rounded-xl text-xs font-semibold border transition-all capitalize"
                      style={{
                        background: settings.connection_mode === mode ? 'var(--accent)' : 'var(--bg-card)',
                        color: settings.connection_mode === mode ? 'white' : 'var(--text-secondary)',
                        borderColor: settings.connection_mode === mode ? 'var(--accent)' : 'var(--border-glass)'
                      }}
                    >
                      {mode === 'serverless' ? 'Serverless (Direct)' : 'Remote Server'}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
                  {settings.connection_mode === 'serverless'
                    ? 'Calls API directly from your browser — zero server logs.'
                    : 'Routes through the deployed Python agent backend.'}
                </p>
              </div>

              {/* Provider */}
              <div>
                <label className="text-xs block mb-1.5" style={{ color: 'var(--text-secondary)' }}>API Provider</label>
                <select value={activeProvider} onChange={e => handleProviderChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}>
                  <option value="groq">Groq</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="ollama">🦙 Local Ollama</option>
                </select>
              </div>

              {/* Ollama fields */}
              {activeProvider === 'ollama' && (
                <div className="space-y-3 p-3 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
                  <div className="flex items-center gap-2">
                    <Cpu size={13} style={{ color: 'var(--accent)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Local Ollama Server</span>
                  </div>
                  <input type="text" value={settings.ollama_url || ''} onChange={e => updateSetting('ollama_url', e.target.value)}
                    placeholder="http://localhost:11434" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }} />
                  {ollamaModels.length > 0 ? (
                    <select value={settings.model || ''} onChange={e => updateSetting('model', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}>
                      {ollamaModels.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  ) : (
                    <input type="text" value={settings.model || ''} onChange={e => updateSetting('model', e.target.value)}
                      placeholder="e.g. llama3.1, mistral, phi3" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }} />
                  )}
                  <button onClick={testOllamaConnection} disabled={ollamaStatus === 'testing'}
                    className="w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                    style={{
                      background: ollamaStatus === 'ok' ? 'rgba(0,200,100,0.15)' : ollamaStatus === 'error' ? 'rgba(255,69,96,0.12)' : 'var(--accent-gradient)',
                      color: ollamaStatus === 'ok' ? '#00c864' : ollamaStatus === 'error' ? '#FF4560' : 'white',
                    }}>
                    {ollamaStatus === 'testing' && <Loader2 size={12} className="animate-spin" />}
                    {ollamaStatus === 'ok' && <CheckCircle2 size={12} />}
                    {ollamaStatus === 'error' && <AlertCircle size={12} />}
                    {ollamaStatus === 'ok' ? `Connected — ${ollamaModels.length} model(s)` :
                     ollamaStatus === 'error' ? 'Cannot reach Ollama' :
                     ollamaStatus === 'testing' ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              )}

              {/* API Key */}
              {activeProvider !== 'ollama' && !(settings.connection_mode === 'remote' && backendConfig?.has_backend_api_key) && (
                <div>
                  <label className="text-xs block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {PROVIDER_INFO[activeProvider]?.label || 'API Key'}
                  </label>
                  <div className="relative">
                    <input type={showKey ? 'text' : 'password'} value={settings.api_key || ''}
                      onChange={e => updateSetting('api_key', e.target.value)}
                      placeholder={PROVIDER_INFO[activeProvider]?.placeholder || 'Paste key here'}
                      className="w-full px-3 py-2.5 rounded-xl text-sm outline-none pr-16"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                      id="settings-api-key" />
                    <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium"
                      style={{ color: 'var(--accent)' }}>{showKey ? 'Hide' : 'Show'}</button>
                  </div>
                </div>
              )}

              {activeProvider !== 'ollama' && settings.connection_mode === 'remote' && backendConfig?.has_backend_api_key && (
                <div className="p-3 rounded-xl border flex items-center gap-2" style={{ background: 'rgba(0,198,255,0.05)', borderColor: 'rgba(0,198,255,0.2)' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--accent)' }} />
                  <span className="text-[11px]" style={{ color: 'var(--accent)' }}>Using backend configured API key</span>
                </div>
              )}

              {/* Model */}
              {activeProvider !== 'ollama' && (
                <div>
                  <label className="text-xs block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Model</label>
                  <select value={settings.model || ''} onChange={e => updateSetting('model', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}>
                    {settings.connection_mode === 'remote' && backendConfig?.models ? (
                      <>
                        <option value={backendConfig.models.text}>{backendConfig.models.text} (Remote Text)</option>
                        {backendConfig.models.vision && <option value={backendConfig.models.vision}>{backendConfig.models.vision} (Remote Vision)</option>}
                      </>
                    ) : (
                      (PROVIDER_MODELS[activeProvider] || []).map(m => <option key={m.value} value={m.value}>{m.label}</option>)
                    )}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* ───── Tools Tab ───── */}
          {activeTab === 'tools' && (
            <div className="p-5 space-y-5">
              {/* Topic Focus */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target size={13} style={{ color: 'var(--accent)' }} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Topic Focus</span>
                </div>
                {selectedTopic && (
                  <div className="mb-3 px-3 py-2 rounded-lg flex justify-between items-center" style={{ background: 'var(--brand-primary-light)', border: '1px solid var(--border-glass)' }}>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>{selectedTopic}</span>
                    <button onClick={() => onSelectTopic?.(null)} style={{ color: 'var(--accent)' }}><X size={11} /></button>
                  </div>
                )}
                <div className="space-y-1 max-h-[200px] overflow-y-auto pr-0.5 no-scrollbar">
                  {(TOPIC_CATEGORIES || []).map(cat => {
                    const isExpanded = expandedCategory === cat.category;
                    return (
                      <div key={cat.category} className="rounded-lg overflow-hidden"
                        style={{ background: isExpanded ? 'var(--bg-card)' : 'transparent', border: isExpanded ? '1px solid var(--border-glass)' : '1px solid transparent' }}>
                        <button className="w-full flex items-center justify-between px-2.5 py-2 text-[12px] font-medium transition-all rounded-lg"
                          style={{ color: isExpanded ? 'var(--accent)' : 'var(--text-secondary)', background: isExpanded ? 'var(--brand-primary-light)' : 'transparent' }}
                          onClick={() => setExpandedCategory(isExpanded ? null : cat.category)}>
                          <span className="truncate pr-2">{cat.category}</span>
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                        {isExpanded && (
                          <div className="px-1.5 pb-1.5 space-y-0.5" style={{ background: 'var(--bg-primary)' }}>
                            {cat.topics.map(topic => {
                              const isSelected = selectedTopic === topic;
                              return (
                                <button key={topic} onClick={() => onSelectTopic?.(isSelected ? null : topic)}
                                  className="w-full text-left px-2.5 py-1.5 text-[11px] rounded-md transition-all"
                                  style={{ background: isSelected ? 'var(--accent-gradient)' : 'transparent', color: isSelected ? 'white' : 'var(--text-muted)' }}>
                                  {topic}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ height: '1px', background: 'var(--border-subtle)' }} />

              {/* Agent Tools */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap size={13} style={{ color: 'var(--accent)' }} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Agent Tools</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: 'var(--brand-primary-light)', color: 'var(--accent)' }}>
                      {enabledTools?.length}/{TOOL_DEFINITIONS.length}
                    </span>
                  </div>
                  <button onClick={() => onToggleAll?.(!allEnabled)}
                    className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-lg transition-all"
                    style={{ color: allEnabled ? 'var(--accent)' : 'var(--text-muted)', background: allEnabled ? 'var(--brand-primary-light)' : 'transparent', border: `1px solid ${allEnabled ? 'var(--border-glass)' : 'transparent'}` }}>
                    {allEnabled ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                    {allEnabled ? 'All On' : 'All Off'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-[360px] overflow-y-auto pr-0.5 no-scrollbar">
                  {TOOL_DEFINITIONS.map(tool => {
                    const enabled = enabledTools?.includes(tool.id);
                    return (
                      <button key={tool.id} onClick={() => onToggleTool?.(tool.id)}
                        className="text-left cursor-pointer transition-all relative overflow-hidden"
                        style={{ background: enabled ? 'var(--brand-primary-light)' : 'var(--bg-card)', border: enabled ? '1px solid var(--border-glass)' : '1px solid var(--border-subtle)', borderRadius: '10px', padding: '10px 10px 8px' }}>
                        {enabled && <div className="absolute top-0 right-0 w-1 h-full rounded-r" style={{ background: 'var(--accent-gradient)' }} />}
                        <div className="flex items-start justify-between mb-1.5">
                          <span className="text-[18px] leading-none">{tool.icon}</span>
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: enabled ? 'var(--accent)' : 'var(--border-subtle)', marginTop: '2px' }} />
                        </div>
                        <p className="text-[11px] font-semibold mb-0.5 leading-tight" style={{ color: enabled ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{tool.name}</p>
                        <p className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{tool.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status footer */}
              <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{enabledTools?.length}</span> active tools
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--success)' }}>Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* ───── Appearance Tab ───── */}
          {activeTab === 'appearance' && (
            <div className="p-6 space-y-7">
              {/* Theme presets */}
              <div>
                <label className="text-xs font-semibold block mb-3" style={{ color: 'var(--text-secondary)' }}>Base Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {THEMES.map(t => (
                    <button key={t.id} onClick={() => updateSetting('theme', t.id)}
                      className="flex items-center gap-3 p-2.5 rounded-xl transition-all border text-left"
                      style={{ borderColor: settings.theme === t.id ? t.border : 'var(--border-glass)', background: settings.theme === t.id ? 'var(--bg-card-hover)' : 'var(--bg-card)' }}>
                      <div className="w-5 h-5 rounded-full shrink-0" style={{ background: t.color, boxShadow: settings.theme === t.id ? `0 0 0 2px ${t.border}` : 'none' }} />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent presets */}
              <div>
                <label className="text-xs font-semibold block mb-3" style={{ color: 'var(--text-secondary)' }}>Accent Color</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {ACCENT_PRESETS.map(preset => (
                    <button key={preset.id} onClick={() => applyPreset(preset)} title={preset.label}
                      className="flex flex-col items-center gap-1.5 group">
                      <div className="w-9 h-9 rounded-full transition-all group-hover:scale-110 group-hover:shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${preset.from}, ${preset.to})`,
                          boxShadow: settings.accent_from === preset.from ? `0 0 0 3px var(--bg-secondary), 0 0 0 5px ${preset.from}` : 'none',
                        }} />
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{preset.label}</span>
                    </button>
                  ))}
                </div>

                {/* Custom color pickers */}
                <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
                  <p className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Custom Gradient</p>
                  <div className="flex gap-4 items-center">
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Start Color</label>
                      <input type="color" value={customAccentFrom}
                        onChange={e => { setCustomAccentFrom(e.target.value); applyCustomAccent(e.target.value, customAccentTo); }}
                        className="w-full h-10 rounded-lg cursor-pointer border-0 outline-none"
                        style={{ background: 'none', padding: '2px' }} />
                    </div>
                    <div className="w-8 h-8 rounded-full flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${customAccentFrom}, ${customAccentTo})` }} />
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>End Color</label>
                      <input type="color" value={customAccentTo}
                        onChange={e => { setCustomAccentTo(e.target.value); applyCustomAccent(customAccentFrom, e.target.value); }}
                        className="w-full h-10 rounded-lg cursor-pointer border-0 outline-none"
                        style={{ background: 'none', padding: '2px' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Font size */}
              <div>
                <label className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>Font Size</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map(s => (
                    <button key={s} onClick={() => updateSetting('font_size', s)}
                      className="flex-1 py-2 rounded-xl text-xs capitalize transition-all font-medium"
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

              {/* Loadouts */}
              <div>
                <label className="text-xs font-semibold block mb-3" style={{ color: 'var(--text-secondary)' }}>Saved Loadouts</label>
                {loadouts.length === 0 ? (
                  <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>No loadouts saved yet. Customize above and save one!</p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {loadouts.map(l => (
                      <div key={l.id} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)' }}>
                        <div className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ background: l.accent_from ? `linear-gradient(135deg, ${l.accent_from}, ${l.accent_to})` : 'var(--border-subtle)' }} />
                        <span className="text-[12px] font-medium flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{l.name}</span>
                        <button onClick={() => applyLoadout(l)}
                          className="text-[10px] font-medium px-2 py-1 rounded-lg transition-all"
                          style={{ color: 'var(--accent)', background: 'var(--brand-primary-light)' }}>
                          Apply
                        </button>
                        <button onClick={() => deleteLoadout(l.id)} style={{ color: 'var(--text-muted)' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={loadoutName} onChange={e => setLoadoutName(e.target.value)}
                    placeholder="Loadout name (e.g. Work Mode)"
                    className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                    onKeyDown={e => e.key === 'Enter' && saveLoadout()} />
                  <button onClick={saveLoadout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: 'var(--accent-gradient)', color: 'white' }}>
                    <Save size={12} />
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ───── Voice Tab ───── */}
          {activeTab === 'voice' && (
            <div className="p-6 space-y-5">
              {/* TTS Engine */}
              <div>
                <label className="text-xs block mb-1.5" style={{ color: 'var(--text-secondary)' }}>TTS Engine</label>
                <div className="grid grid-cols-2 gap-2">
                  {['local', 'edge'].map(e => (
                    <button key={e} onClick={() => updateSetting('tts_engine', e)}
                      className="py-2 px-3 rounded-xl text-xs font-semibold border transition-all"
                      style={{
                        background: ttsEngine === e ? 'var(--accent)' : 'var(--bg-card)',
                        color: ttsEngine === e ? 'white' : 'var(--text-secondary)',
                        borderColor: ttsEngine === e ? 'var(--accent)' : 'var(--border-glass)'
                      }}>
                      {e === 'local' ? 'Offline (Local)' : 'Edge (Online)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Picker */}
              <div>
                <label className="text-xs block mb-1.5" style={{ color: 'var(--text-secondary)' }}>Voice</label>
                <div className="flex gap-2">
                  <select value={settings.tts_voice || ''} onChange={e => updateSetting('tts_voice', e.target.value)}
                    disabled={loadingVoices || voices.length === 0}
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none disabled:opacity-50"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}>
                    {loadingVoices ? <option>Loading voices...</option>
                      : voices.length === 0 ? <option>No voices available</option>
                      : voices.map(v => <option key={v.id} value={v.id}>{v.name} {v.locale ? `(${v.locale})` : ''}</option>)}
                  </select>
                  <button
                    onClick={async () => {
                      if (previewingVoice || !settings.tts_voice) return;
                      setPreviewingVoice(true);
                      try {
                        const { fetchTts } = await import('../../utils/api');
                        const url = await fetchTts('Hello, this is a voice preview.', settings.tts_voice, ttsEngine);
                        const audio = new Audio(url);
                        audio.onended = () => setPreviewingVoice(false);
                        audio.onerror = () => setPreviewingVoice(false);
                        audio.play();
                      } catch (e) {
                        console.error(e);
                        setPreviewingVoice(false);
                      }
                    }}
                    disabled={previewingVoice || !settings.tts_voice}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-50"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)' }}>
                    {previewingVoice ? '...' : 'Preview'}
                  </button>
                </div>
              </div>

              {/* STT Model Size */}
              <div>
                <label className="text-xs block mb-1.5" style={{ color: 'var(--text-secondary)' }}>STT Model Size (Offline)</label>
                <select value={sttModelSize} onChange={e => updateSetting('stt_model_size', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}>
                  <option value="tiny">Tiny (Fastest, Low Quality)</option>
                  <option value="base">Base (Fast, Okay Quality)</option>
                  <option value="small">Small (Balanced)</option>
                  <option value="medium">Medium (Slow, High Quality)</option>
                </select>
              </div>
            </div>
          )}

          {/* ───── Memory Tab ───── */}
          {activeTab === 'memory' && (
            <div className="p-6">
              <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Stored Sessions</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sessions?.length || 0} sessions in history</p>
            </div>
          )}

          {/* ───── About Tab ───── */}
          {activeTab === 'about' && (
            <div className="p-6 space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <p><strong style={{ color: 'var(--text-secondary)' }}>IN NET CREATION</strong> — Reversed Creation</p>
              <p>Version 1.0.0 (Round 4)</p>
              <p>Powered by Groq + LLaMA 3.3 70B</p>
              <p className="mt-4">Created by Manohar_S</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
