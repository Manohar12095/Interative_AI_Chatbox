import { useState } from 'react';
import { Bot, User, Copy, Check, Volume2, VolumeX, ThumbsUp, ThumbsDown } from 'lucide-react';
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
        className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-1"
        style={{
          background: isUser ? 'var(--accent-gradient)' : 'var(--bg-card)',
          border: isUser ? 'none' : '1px solid var(--border-subtle)'
        }}
      >
        {isUser ? <User size={14} color="white" /> : <Bot size={14} style={{ color: 'var(--accent)' }} />}
      </div>

      {/* Content */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%] min-w-0`}>
        {/* Tool results (before AI message) */}
        {!isUser && message.tool_results?.length > 0 && (
          <div className="w-full space-y-2 mb-2">
            {message.tool_results.map((tr, i) => (
              <ToolResultCard key={i} result={tr} />
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
            borderTopRightRadius: isUser ? '4px' : undefined,
            borderTopLeftRadius: !isUser ? '4px' : undefined,
            borderRadius: '14px',
            ...(isUser ? { borderTopRightRadius: '4px' } : { borderTopLeftRadius: '4px' }),
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
        <div className={`flex items-center gap-2 mt-1.5 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{timestamp}</span>

          {!isUser && message.content && (
            <>
              <button onClick={handleCopy} className="p-1 rounded-md hover:bg-white/10 transition-colors" title="Copy">
                {copied ? <Check size={12} style={{ color: '#00E5A0' }} /> : <Copy size={12} style={{ color: 'var(--text-muted)' }} />}
              </button>
              <button onClick={handleTTS} className="p-1 rounded-md hover:bg-white/10 transition-colors" title="Read aloud">
                {speaking ? <VolumeX size={12} style={{ color: 'var(--accent)' }} /> : <Volume2 size={12} style={{ color: 'var(--text-muted)' }} />}
              </button>
              <button
                onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                className="p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <ThumbsUp size={12} style={{ color: feedback === 'up' ? '#00E5A0' : 'var(--text-muted)' }} />
              </button>
              <button
                onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                className="p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <ThumbsDown size={12} style={{ color: feedback === 'down' ? '#FF4560' : 'var(--text-muted)' }} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
