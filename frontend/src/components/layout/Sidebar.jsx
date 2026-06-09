import { useState } from 'react';
import {
  Plus, Search, Settings, Trash2, Edit3, MessageSquare,
  X, User, ChevronUp, LogOut, Palette, Sparkles, Clock, Hash
} from 'lucide-react';

const THEME_ICONS = {
  dark: '🌑', light: '☀️', aiva: '🌿', neon: '⚡',
  ocean: '🌊', sunset: '🌅', dracula: '🧛'
};

export default function Sidebar({
  isOpen, sessions, activeSessionId, onSelectSession,
  onNewChat, onDeleteSession, onRenameSession, onToggle,
  onOpenSettings, onOpenProfile, settings, updateSetting, userEmail, onLogout
}) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const themes = ['dark', 'light', 'aiva', 'neon', 'ocean', 'sunset', 'dracula'];
  const cycleTheme = () => {
    const current = themes.indexOf(settings.theme);
    updateSetting('theme', themes[(current + 1) % themes.length]);
  };

  const userInitial = userEmail ? userEmail[0].toUpperCase() : 'G';
  const displayName = userEmail ? userEmail.split('@')[0] : 'Guest';
  const displayEmail = userEmail || 'guest@rahonam.ai';

  return (
    <div
      style={{
        width: isOpen ? '280px' : '0px',
        minWidth: isOpen ? '280px' : '0px',
        overflow: isOpen ? 'visible' : 'hidden',
        transition: 'width 0.3s ease, min-width 0.3s ease',
        background: 'var(--bg-secondary)',
        borderRight: isOpen ? '1px solid var(--border-subtle)' : 'none',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        zIndex: 50,
        // Mobile: fixed overlay
      }}
      className={`max-md:fixed max-md:left-0 max-md:top-0 max-md:bottom-0 max-md:shadow-2xl
        ${isOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}
        max-md:transition-transform max-md:duration-300`}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div className="relative flex-shrink-0">
          {/* Glow behind logo */}
          <div
            className="absolute rounded-2xl animate-glow-pulse"
            style={{
              inset: '-4px',
              background: 'linear-gradient(135deg, rgba(0,198,255,0.4), rgba(123,47,255,0.4))',
              filter: 'blur(10px)',
            }}
          />
          <img
            src="/logo.png"
            alt="RAHONAM"
            className="relative w-9 h-9 rounded-2xl object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h1
            className="text-[17px] font-bold tracking-tight gradient-text leading-none mb-0.5"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            RAHONAM
          </h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
            <p className="text-[10px] font-medium tracking-[1.5px] uppercase" style={{ color: 'var(--text-muted)' }}>
              AI Assistant
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Gradient Divider */}
      <div className="mx-5 mb-4" style={{ height: '1px', background: 'var(--accent-gradient)', opacity: 0.5 }} />

      {/* ── New Chat Button ── */}
      <div className="px-4 mb-3">
        <button
          onClick={onNewChat}
          className="shimmer-btn w-full flex items-center justify-center gap-2 font-semibold text-white text-[13px] transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'var(--accent-gradient)',
            boxShadow: '0 4px 20px var(--accent-glow)',
            borderRadius: '12px',
            height: '42px',
          }}
          id="new-chat-btn"
        >
          <Plus size={16} strokeWidth={2.5} />
          New Conversation
        </button>
      </div>

      {/* ── Search ── */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full outline-none transition-all"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              borderRadius: '10px',
              height: '36px',
              paddingLeft: '32px',
              paddingRight: '12px',
              fontSize: '12px',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            id="session-search"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Section Label ── */}
      <div className="px-5 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash size={11} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: 'var(--text-muted)' }}>
            Conversations
          </span>
        </div>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{
            background: 'var(--brand-primary-light)',
            color: 'var(--accent)',
          }}
        >
          {sessions.length}
        </span>
      </div>

      {/* ── Sessions List ── */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1 no-scrollbar">
        {filtered.length > 0 ? (
          filtered.map(s => (
            <div
              key={s.id}
              onClick={() => onSelectSession(s.id, s.name)}
              className="group relative cursor-pointer transition-all"
              style={{
                borderRadius: '11px',
                background: activeSessionId === s.id
                  ? 'var(--brand-primary-light)'
                  : 'transparent',
                border: activeSessionId === s.id
                  ? '1px solid var(--border-glass)'
                  : '1px solid transparent',
              }}
              onMouseEnter={e => {
                if (activeSessionId !== s.id) {
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }
              }}
              onMouseLeave={e => {
                if (activeSessionId !== s.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              {/* Active left accent */}
              {activeSessionId === s.id && (
                <div
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
                  style={{ background: 'var(--accent-gradient)' }}
                />
              )}

              <div className="flex items-center gap-2.5 px-3 py-2.5 pl-4">
                {/* Icon */}
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{
                    background: activeSessionId === s.id ? 'var(--brand-primary-light)' : 'var(--bg-tertiary)',
                    border: `1px solid ${activeSessionId === s.id ? 'var(--border-glass)' : 'var(--border-subtle)'}`,
                  }}
                >
                  <MessageSquare
                    size={13}
                    style={{ color: activeSessionId === s.id ? 'var(--accent)' : 'var(--text-muted)' }}
                  />
                </div>

                {/* Text area */}
                <div className="flex-1 min-w-0">
                  {editingId === s.id ? (
                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => confirmRename(s.id)}
                      onKeyDown={e => e.key === 'Enter' && confirmRename(s.id)}
                      autoFocus
                      className="w-full bg-transparent outline-none text-[13px] font-medium"
                      style={{ color: 'var(--text-primary)' }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <p
                        className="text-[12px] font-medium truncate leading-tight"
                        style={{ color: activeSessionId === s.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                      >
                        {s.name || 'Untitled'}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={9} style={{ color: 'var(--text-muted)' }} />
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {formatTime(s.updated_at || s.created_at)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions (shown on hover) */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <button
                    onClick={e => startRename(e, s)}
                    className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
                    title="Rename"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <Edit3 size={11} />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteSession(s.id); }}
                    className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
                    title="Delete"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,69,96,0.12)'; e.currentTarget.style.color = '#FF4560'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
              style={{ background: 'var(--brand-primary-light)', border: '1px solid var(--border-glass)' }}
            >
              <div
                className="absolute inset-0 rounded-2xl animate-glow-pulse"
                style={{ background: 'linear-gradient(135deg, rgba(0,198,255,0.1), rgba(123,47,255,0.1))', filter: 'blur(8px)' }}
              />
              <Sparkles size={22} style={{ color: 'var(--accent)', position: 'relative' }} />
            </div>
            <div>
              <p className="text-[13px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {search ? 'No results found' : 'Start a conversation'}
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {search
                  ? `No chats matching "${search}"`
                  : 'Click "New Conversation" above to begin chatting with RAHONAM AI'}
              </p>
            </div>
            {!search && (
              <button
                onClick={onNewChat}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: 'var(--accent-gradient)', boxShadow: '0 4px 16px var(--accent-glow)' }}
              >
                <Plus size={13} />
                New Chat
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom Footer ── */}
      <div style={{ borderTop: '1px solid var(--border-subtle)' }}>

        {/* Settings + Theme row */}
        <div className="grid grid-cols-2 gap-1.5 px-4 py-3">
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-medium transition-all"
            style={{
              color: 'var(--text-muted)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.background = 'var(--brand-primary-light)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.background = 'var(--bg-card)';
            }}
            title="Settings"
          >
            <Settings size={13} />
            <span>Settings</span>
          </button>
          <button
            onClick={cycleTheme}
            className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-medium transition-all"
            style={{
              color: 'var(--text-muted)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.background = 'var(--brand-primary-light)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.background = 'var(--bg-card)';
            }}
            title={`Theme: ${settings.theme}`}
          >
            <span style={{ fontSize: '13px', lineHeight: 1 }}>
              {THEME_ICONS[settings.theme] || '🎨'}
            </span>
            <span className="capitalize">{settings.theme}</span>
          </button>
        </div>

        {/* User profile card */}
        <div
          className="mx-4 mb-4 cursor-pointer transition-all rounded-xl overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-glass)';
            e.currentTarget.style.background = 'var(--bg-card-hover)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
            e.currentTarget.style.background = 'var(--bg-card)';
          }}
        >
          {/* Main user row */}
          <div
            className="flex items-center gap-3 px-3 py-2.5"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0"
              style={{
                background: 'var(--accent-gradient)',
                boxShadow: '0 2px 10px var(--accent-glow)',
              }}
            >
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {displayName}
              </p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                {displayEmail}
              </p>
            </div>
            <ChevronUp
              size={13}
              style={{
                color: 'var(--text-muted)',
                transform: userMenuOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.25s ease',
                flexShrink: 0,
              }}
            />
          </div>

          {/* Expandable menu */}
          {userMenuOpen && (
            <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => { setUserMenuOpen(false); onOpenProfile(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-medium transition-all text-left"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-primary-light)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <User size={12} />
                View Profile
              </button>
              <button
                onClick={() => { setUserMenuOpen(false); onLogout(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-medium transition-all text-left"
                style={{ color: '#FF4560' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,69,96,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={12} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
