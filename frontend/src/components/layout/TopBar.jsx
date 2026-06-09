import { useState } from 'react';
import { Menu, PanelRightOpen, PanelRightClose, Trash2, Download, Edit3, Check, Zap, ChevronDown } from 'lucide-react';
import { TOOL_DEFINITIONS } from '../../utils/constants';

export default function TopBar({
  sessionName, onRenameSession, enabledTools,
  onClearMemory, onExport, onToggleSidebar, onToggleTools,
  sidebarOpen, toolsPanelOpen
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(sessionName);
  const [showAllTools, setShowAllTools] = useState(false);

  const startEditing = () => {
    setEditName(sessionName);
    setIsEditing(true);
  };

  const confirmEdit = () => {
    if (editName.trim()) onRenameSession(editName.trim());
    setIsEditing(false);
  };

  const activeTools = TOOL_DEFINITIONS.filter(t => enabledTools.includes(t.id));
  const visibleTools = activeTools.slice(0, 5);
  const hiddenCount = activeTools.length - 5;

  return (
    <div
      className="flex items-center gap-2 px-4 relative"
      style={{
        height: '54px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Hamburger — shown when sidebar closed */}
      {!sidebarOpen && (
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg transition-all flex-shrink-0 flex items-center justify-center"
          style={{ color: 'var(--text-muted)', width: '34px', height: '34px' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          title="Open sidebar"
        >
          <Menu size={17} />
        </button>
      )}

      {/* Session name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') setIsEditing(false); }}
              autoFocus
              className="bg-transparent outline-none text-[14px] font-semibold px-2 py-1 rounded-lg"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--accent)', fontFamily: 'var(--font-heading)' }}
            />
            <button
              onClick={confirmEdit}
              className="p-1.5 rounded-lg transition-all"
              style={{ background: 'var(--brand-primary-light)', color: 'var(--accent)' }}
            >
              <Check size={14} />
            </button>
          </div>
        ) : (
          <button onClick={startEditing} className="flex items-center gap-2 group min-w-0" title="Click to rename">
            <h2
              className="text-[14px] font-semibold truncate"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}
            >
              {sessionName}
            </h2>
            <Edit3 size={11} className="opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>

      {/* Tool pills — center, hidden on small screens */}
      <div className="hidden lg:flex items-center gap-1 overflow-x-auto max-w-[340px] no-scrollbar flex-shrink-0">
        {visibleTools.map(t => (
          <span
            key={t.id}
            className="flex items-center gap-1 whitespace-nowrap"
            style={{
              height: '22px',
              padding: '0 8px',
              borderRadius: '999px',
              background: 'var(--brand-primary-light)',
              border: '1px solid var(--border-glass)',
              color: 'var(--accent)',
              fontSize: '10px',
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: '5px', height: '5px',
                borderRadius: '50%', background: 'var(--accent)',
                display: 'inline-block', flexShrink: 0,
              }}
            />
            {t.name}
          </span>
        ))}
        {hiddenCount > 0 && (
          <button
            className="flex items-center gap-1 whitespace-nowrap transition-all"
            style={{
              height: '22px',
              padding: '0 8px',
              borderRadius: '999px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              fontSize: '10px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            onClick={() => setShowAllTools(!showAllTools)}
          >
            +{hiddenCount}
            <ChevronDown size={10} style={{ transform: showAllTools ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
          </button>
        )}
      </div>

      {/* All tools tooltip */}
      {showAllTools && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowAllTools(false)} />
          <div
            className="absolute z-50 p-3 rounded-xl shadow-2xl"
            style={{
              right: '60px',
              top: '58px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              minWidth: '220px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-2.5">
              <Zap size={11} style={{ color: 'var(--accent)' }} />
              <p className="text-[10px] uppercase font-semibold tracking-wider" style={{ color: 'var(--text-muted)' }}>Active Tools</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeTools.map(t => (
                <span
                  key={t.id}
                  className="flex items-center gap-1"
                  style={{
                    height: '22px',
                    padding: '0 8px',
                    borderRadius: '999px',
                    background: 'var(--brand-primary-light)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--accent)',
                    fontSize: '10px',
                    fontWeight: 500,
                  }}
                >
                  <span style={{ fontSize: '10px' }}>{t.icon}</span>
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={onClearMemory}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
          title="Clear memory"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,69,96,0.1)'; e.currentTarget.style.color = '#FF4560'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Trash2 size={15} />
        </button>
        <button
          onClick={onExport}
          className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg transition-all"
          title="Export chat"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Download size={15} />
        </button>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: 'var(--border-subtle)' }} />

        <button
          onClick={onToggleTools}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
          title={toolsPanelOpen ? 'Hide tools panel' : 'Show tools panel'}
          style={{
            color: toolsPanelOpen ? 'var(--accent)' : 'var(--text-muted)',
            background: toolsPanelOpen ? 'var(--brand-primary-light)' : 'transparent',
          }}
          onMouseEnter={e => { if (!toolsPanelOpen) { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
          onMouseLeave={e => { if (!toolsPanelOpen) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
        >
          {toolsPanelOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
        </button>
      </div>
    </div>
  );
}
