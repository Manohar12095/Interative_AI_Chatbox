import { useRef, useEffect, useState } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { SUGGESTED_PROMPTS } from '../../utils/constants';

export default function ChatArea({ messages, isStreaming, onSuggestedPrompt }) {
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

  // Empty state — Welcome Screen
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto grid-bg">
        <div className="animate-fade-slide-up text-center max-w-[680px] w-full">
          {/* Glowing Logo Icon */}
          <div className="relative mx-auto mb-8" style={{ width: '80px', height: '80px' }}>
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-2xl animate-glow-pulse"
              style={{
                background: 'linear-gradient(135deg, rgba(0,198,255,0.15), rgba(123,47,255,0.15))',
                filter: 'blur(12px)',
              }}
            />
            {/* Diamond icon */}
            <div
              className="relative w-full h-full rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #00C6FF, #7B2FFF)',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4L36 20L20 36L4 20L20 4Z" fill="white" fillOpacity="0.9"/>
                <path d="M20 10L30 20L20 30L10 20L20 10Z" fill="white" fillOpacity="0.3"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2
            className="text-[32px] font-bold mb-3"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px',
            }}
          >
            Welcome to <span className="gradient-text">RAHONAM</span>
          </h2>

          {/* Subtitle */}
          <p className="text-[14px] mb-10" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Your agentic AI assistant with 15+ live tools. Ask me anything.
          </p>

          {/* Quick Prompt Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onSuggestedPrompt(prompt.text)}
                className="prompt-card flex items-center gap-3 text-left transition-all hover:translate-y-[-2px] active:scale-[0.98]"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.background = 'var(--bg-card-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'var(--bg-card)';
                }}
              >
                {/* Icon badge */}
                <span
                  className="flex-shrink-0 flex items-center justify-center rounded-full text-[14px]"
                  style={{
                    width: '28px',
                    height: '28px',
                    background: 'var(--brand-primary-light)',
                  }}
                >
                  {prompt.icon}
                </span>
                <span className="flex-1 text-[13px]">{prompt.text}</span>
                <ArrowRight size={14} className="prompt-arrow flex-shrink-0" style={{ color: 'var(--accent)' }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto relative grid-bg" ref={containerRef} onScroll={handleScroll}>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} index={i} />
        ))}

        {isStreaming && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
          <TypingIndicator />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-1/2 translate-x-1/2 p-2.5 rounded-full shadow-lg z-30 transition-all hover:scale-110 animate-fade-in"
          style={{ background: 'var(--accent-gradient)', color: 'white' }}
        >
          <ArrowDown size={18} />
        </button>
      )}
    </div>
  );
}
