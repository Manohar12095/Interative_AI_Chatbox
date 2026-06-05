import { X, Target, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { TOOL_DEFINITIONS, TOPIC_CATEGORIES } from '../../utils/constants';

export default function ToolsPanel({ isOpen, enabledTools, onToggleTool, onToggleAll, onClose, selectedTopic, onSelectTopic }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const allEnabled = enabledTools.length === TOOL_DEFINITIONS.length;

  if (!isOpen) return null;

  return (
    <div
      className="flex flex-col h-full transition-all duration-300 max-md:fixed max-md:right-0 max-md:top-0 max-md:bottom-0 max-md:z-50 max-md:w-[300px] max-md:max-w-[85vw] max-md:animate-slide-in-right shadow-2xl md:shadow-none"
      style={{
        width: '300px',
        minWidth: '300px',
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-subtle)',
      }}
    >
      {/* Conversation Topic Section */}
      <div className="flex-none p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={14} style={{ color: 'var(--text-muted)' }} />
            <h4 className="text-[11px] font-semibold uppercase tracking-[1px]" style={{ color: 'var(--text-muted)' }}>
              Conversation Topic
            </h4>
          </div>
          <button onClick={onClose} className="md:hidden p-1 rounded-lg transition-colors" onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <X size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Selected topic badge */}
        {selectedTopic && (
          <div
            className="mb-3 px-3 py-2 rounded-lg flex justify-between items-center"
            style={{ background: 'var(--brand-primary-light)', border: '1px solid var(--border-glass)' }}
          >
            <span className="text-[11px] font-medium" style={{ color: 'var(--accent)' }}>{selectedTopic}</span>
            <button onClick={() => onSelectTopic(null)} className="p-0.5 hover:bg-white/10 rounded">
              <X size={12} style={{ color: 'var(--accent)' }} />
            </button>
          </div>
        )}

        {/* Categories Accordion */}
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {TOPIC_CATEGORIES.map((cat) => {
            const isExpanded = expandedCategory === cat.category;
            return (
              <div key={cat.category} className="rounded-lg overflow-hidden transition-all" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <button
                  className="w-full flex items-center justify-between p-2 text-[12px] font-medium transition-colors"
                  style={{ color: isExpanded ? 'var(--accent)' : 'var(--text-secondary)', background: isExpanded ? 'var(--bg-card-hover)' : 'transparent' }}
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.category)}
                  onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="truncate pr-2 text-left">{cat.category}</span>
                  {isExpanded ? <ChevronDown size={14} className="flex-shrink-0" /> : <ChevronRight size={14} className="flex-shrink-0" />}
                </button>
                
                {isExpanded && (
                  <div className="p-1.5 space-y-0.5" style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border-subtle)' }}>
                    {cat.topics.map(topic => {
                      const isSelected = selectedTopic === topic;
                      return (
                        <button
                          key={topic}
                          onClick={() => onSelectTopic(isSelected ? null : topic)}
                          className="w-full text-left px-3 py-1.5 text-[11px] rounded transition-all"
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
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-[1px]" style={{ color: 'var(--text-muted)' }}>
          Agent Tools
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>All</span>
          <div
            className={`toggle-switch ${allEnabled ? 'active' : ''}`}
            onClick={() => onToggleAll(!allEnabled)}
            style={{ transform: 'scale(0.8)' }}
          />
        </div>
      </div>
      <div className="mx-4 mb-3" style={{ height: '1px', background: 'var(--border-subtle)' }} />

      {/* Tools grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
        <div className="grid grid-cols-2 gap-2">
          {TOOL_DEFINITIONS.map(tool => {
            const enabled = enabledTools.includes(tool.id);
            return (
              <div
                key={tool.id}
                className="tool-card cursor-pointer transition-all"
                onClick={() => onToggleTool(tool.id)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px',
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[20px] leading-none">{tool.icon}</span>
                  <div className={`toggle-switch ${enabled ? 'active' : ''}`} style={{ transform: 'scale(0.65)' }} />
                </div>
                <p className="text-[12px] font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>{tool.name}</p>
                <p
                  className="text-[10px] leading-tight overflow-hidden"
                  style={{
                    color: 'var(--text-muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {tool.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          {enabledTools.length} of {TOOL_DEFINITIONS.length} tools active
        </p>
      </div>
    </div>
  );
}
