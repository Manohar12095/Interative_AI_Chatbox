import { X, Target, ChevronDown, ChevronRight, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState } from 'react';
import { TOOL_DEFINITIONS, TOPIC_CATEGORIES } from '../../utils/constants';

export default function ToolsPanel({ isOpen, enabledTools, onToggleTool, onToggleAll, onClose, selectedTopic, onSelectTopic }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const allEnabled = enabledTools.length === TOOL_DEFINITIONS.length;

  return (
    <div
      className="max-md:fixed max-md:right-0 max-md:top-0 max-md:bottom-0 max-md:z-50"
      style={{
        width: isOpen ? '290px' : '0px',
        minWidth: isOpen ? '290px' : '0px',
        overflow: 'hidden',
        transition: 'width 0.3s ease, min-width 0.3s ease',
        background: 'var(--bg-secondary)',
        borderLeft: isOpen ? '1px solid var(--border-subtle)' : 'none',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
    {/* Inner wrapper — full 290px, never shrinks */}
    <div style={{ width: '290px', minWidth: '290px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'var(--brand-primary-light)' }}
          >
            <Zap size={12} style={{ color: 'var(--accent)' }} />
          </div>
          <h3 className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            AI Tools
          </h3>
        </div>
        <button
          onClick={onClose}
          className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <X size={14} />
        </button>
      </div>

      <div className="px-4 mb-3" style={{ height: '1px', background: 'var(--border-subtle)' }} />

      {/* Conversation Topic Section */}
      <div className="flex-none px-4 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2 mb-2.5">
          <Target size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[10px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--text-muted)' }}>
            Topic Focus
          </span>
        </div>

        {/* Selected topic badge */}
        {selectedTopic && (
          <div
            className="mb-2.5 px-3 py-2 rounded-lg flex justify-between items-center"
            style={{ background: 'var(--brand-primary-light)', border: '1px solid var(--border-glass)' }}
          >
            <span className="text-[11px] font-medium truncate" style={{ color: 'var(--accent)' }}>{selectedTopic}</span>
            <button
              onClick={() => onSelectTopic(null)}
              className="p-0.5 rounded transition-colors flex-shrink-0 ml-2"
              style={{ color: 'var(--accent)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,198,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <X size={11} />
            </button>
          </div>
        )}

        {/* Categories Accordion */}
        <div className="space-y-1 max-h-[200px] overflow-y-auto pr-0.5 no-scrollbar">
          {TOPIC_CATEGORIES.map((cat) => {
            const isExpanded = expandedCategory === cat.category;
            return (
              <div
                key={cat.category}
                className="rounded-lg overflow-hidden transition-all"
                style={{
                  background: isExpanded ? 'var(--bg-card)' : 'transparent',
                  border: isExpanded ? '1px solid var(--border-glass)' : '1px solid transparent',
                }}
              >
                <button
                  className="w-full flex items-center justify-between px-2.5 py-2 text-[12px] font-medium transition-all rounded-lg"
                  style={{
                    color: isExpanded ? 'var(--accent)' : 'var(--text-secondary)',
                    background: isExpanded ? 'var(--brand-primary-light)' : 'transparent',
                  }}
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.category)}
                  onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="truncate pr-2 text-left">{cat.category}</span>
                  {isExpanded ? <ChevronDown size={12} className="flex-shrink-0" /> : <ChevronRight size={12} className="flex-shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="px-1.5 pb-1.5 space-y-0.5" style={{ background: 'var(--bg-primary)' }}>
                    {cat.topics.map(topic => {
                      const isSelected = selectedTopic === topic;
                      return (
                        <button
                          key={topic}
                          onClick={() => onSelectTopic(isSelected ? null : topic)}
                          className="w-full text-left px-2.5 py-1.5 text-[11px] rounded-md transition-all"
                          style={{
                            background: isSelected ? 'var(--accent-gradient)' : 'transparent',
                            color: isSelected ? 'white' : 'var(--text-muted)',
                          }}
                          onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--brand-primary-light)'; } }}
                          onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; } }}
                        >
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

      {/* Agent Tools Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[1.5px]" style={{ color: 'var(--text-muted)' }}>
            Agent Tools
          </span>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ background: 'var(--brand-primary-light)', color: 'var(--accent)' }}
          >
            {enabledTools.length}/{TOOL_DEFINITIONS.length}
          </span>
        </div>
        <button
          onClick={() => onToggleAll(!allEnabled)}
          className="flex items-center gap-1.5 text-[10px] font-medium px-2 py-1 rounded-lg transition-all"
          style={{
            color: allEnabled ? 'var(--accent)' : 'var(--text-muted)',
            background: allEnabled ? 'var(--brand-primary-light)' : 'transparent',
            border: `1px solid ${allEnabled ? 'var(--border-glass)' : 'transparent'}`,
          }}
          onMouseEnter={e => { if (!allEnabled) { e.currentTarget.style.background = 'var(--bg-card-hover)'; } }}
          onMouseLeave={e => { if (!allEnabled) { e.currentTarget.style.background = 'transparent'; } }}
        >
          {allEnabled ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
          {allEnabled ? 'All On' : 'All Off'}
        </button>
      </div>

      {/* Tools grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 no-scrollbar">
        <div className="grid grid-cols-2 gap-1.5">
          {TOOL_DEFINITIONS.map(tool => {
            const enabled = enabledTools.includes(tool.id);
            return (
              <button
                key={tool.id}
                className="tool-card text-left cursor-pointer transition-all relative overflow-hidden"
                onClick={() => onToggleTool(tool.id)}
                style={{
                  background: enabled ? 'var(--brand-primary-light)' : 'var(--bg-card)',
                  border: enabled ? '1px solid var(--border-glass)' : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px 10px 8px',
                }}
              >
                {/* Active indicator */}
                {enabled && (
                  <div
                    className="absolute top-0 right-0 w-1 h-full rounded-r"
                    style={{ background: 'var(--accent-gradient)' }}
                  />
                )}
                <div className="flex items-start justify-between mb-1.5">
                  <span className="text-[18px] leading-none">{tool.icon}</span>
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: enabled ? 'var(--accent)' : 'var(--border-subtle)', marginTop: '2px' }}
                  />
                </div>
                <p className="text-[11px] font-semibold mb-0.5 leading-tight" style={{ color: enabled ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {tool.name}
                </p>
                <p
                  className="text-[10px] leading-tight"
                  style={{
                    color: 'var(--text-muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {tool.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{enabledTools.length}</span> active
        </p>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
          <span className="text-[10px]" style={{ color: 'var(--success)' }}>Ready</span>
        </div>
      </div>
    </div>
    </div>
  );
}
