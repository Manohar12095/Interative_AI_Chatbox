import { useState } from 'react';
import { Bot, User, Copy, Check, Volume2, VolumeX, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import FlowBlock from './FlowBlock';
import ToolResultCard from './ToolResultCard';
import AttachmentPreview from './AttachmentPreview';
import ImageLightbox from './ImageLightbox';

export default function MessageBubble({ message, index, onReply }) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'up' | 'down' | null
  const [lightboxImage, setLightboxImage] = useState(null);

  const isUser = message.role === 'user';
  const timestamp = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTTS = async () => {
    if (speaking) {
      // Assuming a global or ref audio object if we wanted to stop it, but for simplicity we can just track state
      setSpeaking(false);
      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
      }
      return;
    }
    
    setSpeaking(true);
    try {
      // Default to edge or local if provided via settings in a broader context, but we will use 'local' default for now
      // To get the user's settings we'd need to pass them down, or fetch them here.
      // Assuming 'edge' for demonstration if it's high quality, or 'local' as instructed.
      const savedSettings = JSON.parse(localStorage.getItem('apex_settings') || '{}');
      const engine = savedSettings.tts_engine || 'local';
      const voice_id = savedSettings.tts_voice || '';
      
      const { fetchTts } = await import('../../utils/api');
      const audioUrl = await fetchTts(message.content, voice_id, engine);
      
      const audio = new Audio(audioUrl);
      window.currentAudio = audio;
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => setSpeaking(false);
      audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      setSpeaking(false);
    }
  };

  return (
    <>
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

        {/* Attachments */}
        {message.attachments?.length > 0 && (
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full mb-1`}>
            {message.attachments.map((file, i) => (
              <AttachmentPreview key={i} file={file} onImageClick={setLightboxImage} />
            ))}
          </div>
        )}

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
                  a({ node, children, href, ...props }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent)] underline hover:opacity-80 transition-opacity font-medium"
                        {...props}
                      >
                        {children}
                      </a>
                    );
                  },
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    if (!inline && match) {
                      const lang = match[1];
                      if (lang === 'flow') {
                        return <FlowBlock code={String(children).replace(/\n$/, '')} />;
                      }
                      return <CodeBlock language={lang} code={String(children).replace(/\n$/, '')} />;
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
                  onClick={() => onReply && onReply(message)}
                  className="p-1.5 rounded-lg transition-all"
                  title="Reply"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"></polyline><path d="M20 18v-2a4 4 0 0 0-4-4H4"></path></svg>
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
      {lightboxImage && (
        <ImageLightbox src={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
    </>
  );
}
