import { useRef, useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, Sparkles, Zap, Globe, Code2, Brain } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { SUGGESTED_PROMPTS } from '../../utils/constants';

const FEATURE_PILLS = [
  { icon: <Zap size={12} />, label: '15+ AI Tools' },
  { icon: <Globe size={12} />, label: 'Web Search' },
  { icon: <Code2 size={12} />, label: 'Code Analysis' },
  { icon: <Brain size={12} />, label: 'Memory' },
];

export default function ChatArea({ messages, isStreaming, onSuggestedPrompt, onReply }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollBtn(!isNearBottom);
    setAutoScroll(isNearBottom);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setAutoScroll(true);
  };

  // ── Empty / Welcome Screen ──────────────────────────────────────
  if (messages.length === 0) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center overflow-y-auto grid-bg"
        style={{ padding: '24px 20px' }}
      >
        <div
          className="animate-fade-slide-up text-center w-full"
          style={{ maxWidth: '800px' }}
        >
          {/* Glowing Logo */}
          <div className="relative mx-auto mb-6" style={{ width: '72px', height: '72px' }}>
            <div
              className="absolute animate-glow-pulse rounded-3xl"
              style={{
                inset: '-14px',
                background: 'linear-gradient(135deg, rgba(0,198,255,0.2), rgba(123,47,255,0.2))',
                filter: 'blur(18px)',
              }}
            />
            <div
              className="relative w-full h-full rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00C6FF, #7B2FFF)' }}
            >
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L36 20L20 36L4 20L20 4Z" fill="white" fillOpacity="0.9"/>
                <path d="M20 10L30 20L20 30L10 20L20 10Z" fill="white" fillOpacity="0.3"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2
            className="font-bold mb-2"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
              fontSize: '26px',
              letterSpacing: '-0.5px',
            }}
          >
            Welcome to <span className="gradient-text">IN NET CREATION</span>
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.7 }}>
            Your agentic AI assistant. Ask anything, analyze files, search the web, write code and more.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-7">
            {FEATURE_PILLS.map((f, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 font-medium"
                style={{
                  fontSize: '11px',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: 'var(--brand-primary-light)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--accent)',
                }}
              >
                {f.icon}
                {f.label}
              </span>
            ))}
          </div>

          {/* Quick Prompt Grid */}
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}
          >
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onSuggestedPrompt(prompt.text)}
                className="prompt-card flex items-center gap-3 text-left transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--bg-card-hover)';
                  e.currentTarget.style.boxShadow = '0 4px 20px var(--accent-glow)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'var(--brand-primary-light)',
                    border: '1px solid var(--border-glass)',
                    fontSize: '14px',
                  }}
                >
                  {prompt.icon}
                </span>
                <span className="flex-1 font-medium leading-snug">{prompt.text}</span>
                <ArrowRight size={13} className="prompt-arrow flex-shrink-0" style={{ color: 'var(--accent)' }} />
              </button>
            ))}
          </div>

          <p
            className="mt-6 uppercase tracking-[1.5px]"
            style={{ fontSize: '10px', color: 'var(--text-muted)', opacity: 0.5 }}
          >
            Powered by IN NET CREATION AI
          </p>
        </div>
      </div>
    );
  }

  // ── Active chat ──────────────────────────────────────────────────
  return (
    <div
      className="flex-1 overflow-y-auto relative grid-bg"
      ref={containerRef}
      onScroll={handleScroll}
      style={{ minWidth: 0 }}
    >
      {/* Messages — centered with a generous max-width that uses available space */}
      <div
        className="mx-auto w-full px-4 py-6 space-y-5"
        style={{ maxWidth: '1000px' }}
      >
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} index={i} onReply={onReply} />
        ))}

        {isStreaming
          && messages[messages.length - 1]?.role === 'assistant'
          && !messages[messages.length - 1]?.content
          && <TypingIndicator />
        }

        <div ref={bottomRef} />
      </div>

      {/* Scroll-to-bottom — positioned inside the chat column using sticky footer trick */}
      {showScrollBtn && (
        <div
          className="sticky bottom-6 flex justify-center pointer-events-none"
          style={{ zIndex: 30 }}
        >
          <button
            onClick={scrollToBottom}
            className="pointer-events-auto p-2.5 rounded-full shadow-xl transition-all hover:scale-110 animate-fade-in"
            style={{
              background: 'var(--accent-gradient)',
              color: 'white',
              boxShadow: '0 4px 20px var(--accent-glow)',
            }}
          >
            <ArrowDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
