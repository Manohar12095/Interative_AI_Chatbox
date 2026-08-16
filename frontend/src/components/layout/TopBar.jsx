import { useState, useRef, useEffect } from 'react';
import { Menu, Trash2, Download, Edit3, Check, Settings, Zap, ToggleLeft, ToggleRight, X, Target, ChevronDown, ChevronRight } from 'lucide-react';
import { TOOL_DEFINITIONS, TOPIC_CATEGORIES } from '../../utils/constants';

export default function TopBar({
  sessionName, onRenameSession, enabledTools, onToggleTool,
  onClearMemory, onExport, onToggleSidebar, onOpenSettings,
  sidebarOpen
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(sessionName);
  const [showToolsPopover, setShowToolsPopover] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [titleAnimating, setTitleAnimating] = useState(false);
  const prevNameRef = useRef(sessionName);

  // Animate when the session name changes (auto-title arriving)
  useEffect(() => {
    if (prevNameRef.current !== sessionName) {
      setTitleAnimating(true);
      const t = setTimeout(() => setTitleAnimating(false), 600);
      prevNameRef.current = sessionName;
      return () => clearTimeout(t);
    }
  }, [sessionName]);

  const startEditing = () => {
    setEditName(sessionName);
    setIsEditing(true);
  };

  const confirmEdit = () => {
    if (editName.trim()) onRenameSession(editName.trim());
    setIsEditing(false);
  };

  const activeCount = enabledTools?.length || 0;
  const allEnabled = activeCount === TOOL_DEFINITIONS.length;

  return (
    <div
      className="flex items-center gap-2 px-4 relative"
      style={{
        height: '54px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Hamburger */}
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
              className="text-[14px] font-semibold truncate transition-all"
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--text-primary)',
                opacity: titleAnimating ? 0 : 1,
                transform: titleAnimating ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
              }}
            >
              {sessionName}
            </h2>
            <Edit3 size={11} className="opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-0.5 flex-shrink-0">

        {/* Tools popover button */}
        <div className="relative">
          <button
            onClick={() => setShowToolsPopover(v => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
            title="Toggle agent tools"
            style={{
              color: showToolsPopover ? 'var(--accent)' : 'var(--text-muted)',
              background: showToolsPopover ? 'var(--brand-primary-light)' : 'transparent',
              border: showToolsPopover ? '1px solid var(--border-glass)' : '1px solid transparent',
            }}
            onMouseEnter={e => { if (!showToolsPopover) { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
            onMouseLeave={e => { if (!showToolsPopover) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}}
          >
            <Zap size={13} />
            <span className="hidden sm:inline">Tools</span>
            {activeCount > 0 && (
              <span
                className="text-[9px] font-bold px-1 py-0.5 rounded-full"
                style={{ background: 'var(--accent)', color: '#fff', minWidth: '16px', textAlign: 'center' }}
              >
                {activeCount}
              </span>
            )}
          </button>

          {/* Tools Popover */}
          {showToolsPopover && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowToolsPopover(false)} />
              <div
                className="absolute z-50 rounded-2xl shadow-2xl"
                style={{
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '300px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                  overflow: 'hidden',
                }}
              >
                {/* Popover header */}
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center gap-2">
                    <Zap size={13} style={{ color: 'var(--accent)' }} />
                    <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>Agent Tools</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--brand-primary-light)', color: 'var(--accent)' }}>
                      {activeCount}/{TOOL_DEFINITIONS.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleTool && TOOL_DEFINITIONS.forEach(t => {
                        const shouldEnable = !allEnabled;
                        const isEnabled = enabledTools?.includes(t.id);
                        if (shouldEnable && !isEnabled) onToggleTool(t.id);
                        else if (!shouldEnable && isEnabled) onToggleTool(t.id);
                      })}
                      className="text-[10px] font-medium px-2 py-1 rounded-lg transition-all"
                      style={{ color: 'var(--accent)', background: 'var(--brand-primary-light)' }}
                    >
                      {allEnabled ? 'All Off' : 'All On'}
                    </button>
                    <button onClick={() => setShowToolsPopover(false)} style={{ color: 'var(--text-muted)' }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Quick tool toggles */}
                <div className="p-3 max-h-[320px] overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-2 gap-1.5">
                    {TOOL_DEFINITIONS.map(tool => {
                      const enabled = enabledTools?.includes(tool.id);
                      return (
                        <button
                          key={tool.id}
                          onClick={() => onToggleTool?.(tool.id)}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-left transition-all"
                          style={{
                            background: enabled ? 'var(--brand-primary-light)' : 'var(--bg-card)',
                            border: enabled ? '1px solid var(--border-glass)' : '1px solid var(--border-subtle)',
                          }}
                        >
                          <span className="text-[14px]">{tool.icon}</span>
                          <span className="text-[11px] font-medium truncate flex-1" style={{ color: enabled ? 'var(--accent)' : 'var(--text-secondary)' }}>
                            {tool.name}
                          </span>
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: enabled ? 'var(--accent)' : 'var(--border-subtle)' }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer link to full settings */}
                <div
                  className="px-4 py-2.5 flex items-center justify-between"
                  style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
                    <span className="text-[10px]" style={{ color: 'var(--success)' }}>{activeCount} active</span>
                  </div>
                  <button
                    onClick={() => { setShowToolsPopover(false); onOpenSettings?.('tools'); }}
                    className="text-[10px] font-medium transition-all"
                    style={{ color: 'var(--accent)' }}
                  >
                    Manage in Settings →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

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

        <div className="w-px h-5 mx-1" style={{ background: 'var(--border-subtle)' }} />

        <button
          onClick={() => onOpenSettings?.('general')}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
          title="Settings"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
}
