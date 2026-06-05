import { useState } from 'react';
import { Menu, PanelRightOpen, PanelRightClose, Trash2, Download, Edit3, Check, Settings } from 'lucide-react';
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
  const visibleTools = activeTools.slice(0, 6);
  const hiddenCount = activeTools.length - 6;

  return (
    <div
      className="flex items-center gap-3 px-5 relative"
      style={{
        height: '52px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Hamburger */}
      {!sidebarOpen && (
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-full transition-all flex-shrink-0"
          style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Menu size={18} style={{ color: 'var(--text-muted)' }} />
        </button>
      )}

      {/* Session name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmEdit()}
              autoFocus
              className="bg-transparent outline-none text-[14px] font-semibold px-2 py-1 rounded-lg"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--accent)', fontFamily: 'var(--font-heading)' }}
            />
            <button onClick={confirmEdit} className="p-1 rounded-lg transition-colors" onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <Check size={16} style={{ color: 'var(--accent)' }} />
            </button>
          </div>
        ) : (
          <button onClick={startEditing} className="flex items-center gap-2 group" title="Click to rename">
            <h2 className="text-[14px] font-semibold truncate" style={{ fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              {sessionName}
            </h2>
            <Edit3 size={12} className="opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>

      {/* Tool pills — hidden on small screens */}
      <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto max-w-[380px] no-scrollbar">
        {visibleTools.map(t => (
          <span
            key={t.id}
            className="flex items-center gap-1.5 whitespace-nowrap animate-breathe"
            style={{
              height: '24px',
              padding: '0 10px',
              borderRadius: '999px',
              background: 'var(--brand-primary-light)',
              border: '1px solid var(--border-glass)',
              color: 'var(--accent)',
              fontSize: '11px',
              fontWeight: 500,
            }}
          >
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'inline-block',
              flexShrink: 0,
            }} />
            {t.name}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span
            className="whitespace-nowrap cursor-pointer transition-all relative"
            style={{
              height: '24px',
              padding: '0 10px',
              borderRadius: '999px',
              background: 'var(--brand-primary-light)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-muted)',
              fontSize: '11px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={() => setShowAllTools(!showAllTools)}
          >
            +{hiddenCount} more
          </span>
        )}
      </div>

      {/* All tools tooltip */}
      {showAllTools && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowAllTools(false)} />
          <div
            className="absolute right-20 top-[48px] z-50 p-3 rounded-xl shadow-2xl"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              minWidth: '200px',
            }}
          >
            <p className="text-[10px] uppercase font-semibold mb-2 tracking-wider" style={{ color: 'var(--text-muted)' }}>All Active Tools</p>
            <div className="flex flex-wrap gap-1.5">
              {activeTools.map(t => (
                <span
                  key={t.id}
                  className="flex items-center gap-1.5"
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
                  <span style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: 'var(--accent)', display: 'inline-block',
                  }} />
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onClearMemory}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
          title="Clear memory"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Trash2 size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        <button
          onClick={onExport}
          className="w-8 h-8 rounded-full items-center justify-center transition-all hidden sm:flex"
          title="Export chat"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Download size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        <button
          onClick={onToggleTools}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
          title="Toggle tools panel"
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {toolsPanelOpen ? <PanelRightClose size={16} style={{ color: 'var(--text-muted)' }} /> : <PanelRightOpen size={16} style={{ color: 'var(--text-muted)' }} />}
        </button>
      </div>
    </div>
  );
}
