import { useState } from 'react';
import { Bot, User, Copy, Check, Volume2, VolumeX, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import ToolResultCard from './ToolResultCard';

export default function MessageBubble({ message, index }) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'up' | 'down' | null

  const isUser = message.role === 'user';
  const timestamp = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTTS = () => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.onend = () => setSpeaking(false);
    speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  return (
    <div
      className={`flex gap-3 animate-fade-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
        style={{
          background: isUser ? 'var(--accent-gradient)' : 'var(--bg-card)',
          border: isUser ? 'none' : '1px solid var(--border-glass)',
          boxShadow: isUser ? '0 2px 12px var(--accent-glow)' : 'none',
        }}
      >
        {isUser
          ? <User size={13} color="white" />
          : <Sparkles size={13} style={{ color: 'var(--accent)' }} />
        }
      </div>

      {/* Content */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[78%] min-w-0`}>

        {/* Tool results (before AI message) */}
        {!isUser && message.tool_results?.length > 0 && (
          <div className="w-full space-y-2 mb-2">
            {message.tool_results.map((tr, i) => (
              <ToolResultCard key={i} result={tr} />
            ))}
          </div>
        )}

        {/* Tool calls in progress */}
        {!isUser && message.tool_calls?.length > 0 && !message.content && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {message.tool_calls.map((tc, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full animate-breathe"
                style={{
                  background: 'var(--brand-primary-light)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--accent)',
                }}
              >
                <span>{tc.icon || '🔧'}</span>
                {tc.display_name || tc.name}
              </span>
            ))}
          </div>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed`}
          style={{
            background: isUser ? 'var(--user-bubble)' : 'var(--bg-card)',
            border: isUser ? 'none' : '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            borderTopRightRadius: isUser ? '4px' : '14px',
            borderTopLeftRadius: !isUser ? '4px' : '14px',
            boxShadow: isUser
              ? 'none'
              : '0 1px 8px rgba(0,0,0,0.1)',
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="message-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    if (!inline && match) {
                      return <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />;
                    }
                    if (!inline) {
                      return <CodeBlock language="text" code={String(children).replace(/\n$/, '')} />;
                    }
                    return <code className={className} {...props}>{children}</code>;
                  }
                }}
              >
                {message.content || (message.isStreaming ? '●' : '')}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className={`flex items-center gap-1.5 mt-1.5 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{timestamp}</span>

          {!isUser && message.content && (
            <div className="flex items-center gap-0.5 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100"
              style={{ opacity: 1 }}
            >
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg transition-all"
                  title="Copy"
                  style={{ color: copied ? '#00E5A0' : 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                </button>
                <button
                  onClick={handleTTS}
                  className="p-1.5 rounded-lg transition-all"
                  title="Read aloud"
                  style={{ color: speaking ? 'var(--accent)' : 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {speaking ? <VolumeX size={11} /> : <Volume2 size={11} />}
                </button>
                <div className="w-px h-3 mx-0.5" style={{ background: 'var(--border-subtle)' }} />
                <button
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  className="p-1.5 rounded-lg transition-all"
                  title="Good response"
                  style={{ color: feedback === 'up' ? '#00E5A0' : 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <ThumbsUp size={11} />
                </button>
                <button
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  className="p-1.5 rounded-lg transition-all"
                  title="Poor response"
                  style={{ color: feedback === 'down' ? '#FF4560' : 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <ThumbsDown size={11} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
