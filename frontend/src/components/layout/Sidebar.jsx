import { useState } from 'react';
import { Plus, Search, Settings, Moon, Sun, Trash2, Edit3, MessageSquare, X, HelpCircle, User } from 'lucide-react';

export default function Sidebar({
  isOpen, sessions, activeSessionId, onSelectSession,
  onNewChat, onDeleteSession, onRenameSession, onToggle,
  onOpenSettings, onOpenProfile, settings, updateSetting, userEmail, onLogout
}) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const filtered = sessions.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const startRename = (e, s) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditName(s.name);
  };

  const confirmRename = (id) => {
    if (editName.trim()) onRenameSession(id, editName.trim());
    setEditingId(null);
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <div
      className={`flex flex-col h-full transition-all duration-300 ease-in-out z-50
        ${isOpen ? 'w-[260px] min-w-[260px]' : 'w-0 min-w-0 overflow-hidden'}
        max-md:fixed max-md:left-0 max-md:top-0 max-md:bottom-0 max-md:w-[260px] max-md:max-w-[85vw]
        ${isOpen ? 'max-md:translate-x-0 shadow-2xl md:shadow-none' : 'max-md:-translate-x-full'}`}
      style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-subtle)'
      }}
    >
      {/* Logo Area */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <div className="relative">
          <img src="/logo.png" alt="RAHONAM" className="w-9 h-9 rounded-xl object-contain animate-logo-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-bold tracking-tight gradient-text" style={{ fontFamily: 'var(--font-heading)' }}>
            RAHONAM
          </h1>
          <p className="text-[10px] tracking-[2px] uppercase" style={{ color: 'var(--text-muted)' }}>REVERSED CREATION</p>
        </div>
        <button onClick={onToggle} className="ml-auto md:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <X size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Gradient Divider */}
      <div className="mx-5 mb-4" style={{ height: '1px', background: 'var(--accent-gradient)', opacity: 0.8 }} />

      {/* New Chat Button */}
      <div className="px-4 mb-3">
        <button
          onClick={onNewChat}
          className="shimmer-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] font-bold text-white text-[13px] transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'var(--accent-gradient)', height: '40px', boxShadow: 'var(--shadow-glow)' }}
          id="new-chat-btn"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search chats..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none transition-all focus:border-[var(--accent)]"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              height: '36px',
              borderRadius: '8px',
              fontSize: '13px'
            }}
            id="session-search"
          />
        </div>
      </div>

      {/* Section Label */}
      <div className="px-5 mb-2">
        <span className="text-[10px] font-semibold tracking-[1.5px] uppercase" style={{ color: 'var(--text-muted)' }}>
          RECENT CHATS
        </span>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-2">
        {filtered.map(s => (
          <div
            key={s.id}
            onClick={() => onSelectSession(s.id, s.name)}
            className={`group flex items-center gap-2.5 px-3 py-2.5 cursor-pointer transition-all text-[13px]
              ${activeSessionId === s.id ? 'font-medium' : ''}`}
            style={{
              background: activeSessionId === s.id ? 'var(--bg-card-hover)' : 'transparent',
              color: activeSessionId === s.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderLeft: activeSessionId === s.id ? '2px solid transparent' : '2px solid transparent',
              borderImage: activeSessionId === s.id ? 'var(--accent-gradient) 1' : 'none',
              borderRadius: activeSessionId === s.id ? '0 8px 8px 0' : '8px',
            }}
            onMouseEnter={(e) => {
              if (activeSessionId !== s.id) {
                e.currentTarget.style.background = 'var(--bg-card-hover)';
                e.currentTarget.style.borderLeft = '2px solid var(--accent)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSessionId !== s.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderLeft = '2px solid transparent';
              }
            }}
          >
            <MessageSquare size={14} style={{ flexShrink: 0, color: activeSessionId === s.id ? 'var(--accent)' : 'var(--text-muted)' }} />
            {editingId === s.id ? (
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={() => confirmRename(s.id)}
                onKeyDown={e => e.key === 'Enter' && confirmRename(s.id)}
                autoFocus
                className="flex-1 bg-transparent outline-none text-[13px]"
                style={{ color: 'var(--text-primary)' }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <>
                <span className="flex-1 truncate">{s.name || 'Untitled'}</span>
                <span className="text-[10px] flex-shrink-0 opacity-0 group-hover:opacity-0" style={{ color: 'var(--text-muted)' }}>
                  {formatTime(s.updated_at || s.created_at)}
                </span>
              </>
            )}
            <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
              <button onClick={(e) => startRename(e, s)} className="p-1 rounded hover:bg-white/10 transition-colors" title="Rename">
                <Edit3 size={12} style={{ color: 'var(--text-muted)' }} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }} className="p-1 rounded hover:bg-red-500/20 transition-colors" title="Delete">
                <Trash2 size={12} style={{ color: '#FF4560' }} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-8 text-[13px]" style={{ color: 'var(--text-muted)' }}>
            {search ? 'No matching chats' : 'No chats yet'}
          </p>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0 16px' }} />
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'transparent', border: '1px solid transparent' }}
          title="Settings"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Settings size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        <button
          onClick={() => {
            const themes = ['dark', 'light', 'aiva', 'neon', 'ocean', 'sunset', 'dracula'];
            const current = themes.indexOf(settings.theme);
            updateSetting('theme', themes[(current + 1) % themes.length]);
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'transparent' }}
          title={`Theme: ${settings.theme}`}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {settings.theme === 'dark' ? <Moon size={16} style={{ color: 'var(--text-muted)' }} /> : <Sun size={16} style={{ color: 'var(--text-muted)' }} />}
        </button>
        <button
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'transparent' }}
          title="Profile"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <User size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'transparent' }}
          title="Help"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <HelpCircle size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        {/* Avatar */}
        <button
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white gradient-border cursor-pointer transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'var(--accent-gradient)',
          }}
          title="Profile"
        >
          {userEmail ? userEmail[0].toUpperCase() : 'U'}
        </button>
      </div>
    </div>
  );
}
