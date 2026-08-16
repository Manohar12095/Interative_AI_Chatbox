import { useEffect } from 'react';
import { Mic, MicOff, Sparkles, X, Radio, Loader2 } from 'lucide-react';
import useVoiceConversation from '../../hooks/useVoiceConversation';

const STATE_CONFIG = {
  idle: {
    label: 'Initializing…',
    orbColor: 'var(--border-subtle)',
    pulse: false,
  },
  listening: {
    label: 'Listening…',
    orbColor: 'var(--accent)',
    pulse: true,
  },
  thinking: {
    label: 'Thinking…',
    orbColor: '#7B2FFF',
    pulse: false,
  },
  speaking: {
    label: 'Speaking…',
    orbColor: 'var(--success)',
    pulse: true,
  },
  error: {
    label: 'Error',
    orbColor: 'var(--error)',
    pulse: false,
  },
};

export default function AiModeOverlay({ onClose, onSend, isStreaming, addToast, settings, messages }) {
  const { voiceState, transcript, captions, errorMsg, start, stop, interruptAndListen } =
    useVoiceConversation({ isStreaming, messages, settings, addToast });

  // Start conversation loop on mount
  useEffect(() => {
    start(onSend);
    return () => stop();
  }, []);

  const handleClose = () => {
    stop();
    onClose();
  };

  const cfg = STATE_CONFIG[voiceState] || STATE_CONFIG.idle;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: 'rgba(4, 8, 18, 0.96)', backdropFilter: 'blur(24px)' }}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 p-2.5 rounded-full transition-all"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
      >
        <X size={18} />
      </button>

      {/* AI Mode badge */}
      <div
        className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold"
        style={{ background: 'var(--brand-primary-light)', border: '1px solid var(--border-glass)', color: 'var(--accent)' }}
      >
        <Radio size={11} className="animate-pulse" />
        AI Mode
      </div>

      {/* Central Orb */}
      <div className="relative flex items-center justify-center mb-10" style={{ width: '180px', height: '180px' }}>
        {/* Outer ripple rings — only when listening or speaking */}
        {cfg.pulse && (
          <>
            <div className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ background: cfg.orbColor, animationDuration: '1.6s' }} />
            <div className="absolute inset-4 rounded-full animate-ping opacity-15"
              style={{ background: cfg.orbColor, animationDuration: '1.6s', animationDelay: '0.3s' }} />
          </>
        )}

        {/* Glow */}
        <div className="absolute inset-0 rounded-full blur-3xl opacity-20"
          style={{ background: cfg.orbColor }} />

        {/* Spinning arc — only when thinking */}
        {voiceState === 'thinking' && (
          <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
            style={{
              borderTopColor: '#7B2FFF',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              animationDuration: '0.9s',
            }} />
        )}

        {/* Main orb */}
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500"
          style={{
            background: `radial-gradient(circle at 40% 40%, ${cfg.orbColor}CC, ${cfg.orbColor}44)`,
            boxShadow: `0 0 60px ${cfg.orbColor}55, 0 0 120px ${cfg.orbColor}22`,
            transform: voiceState === 'listening' ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          {voiceState === 'listening' && <Mic size={36} color="white" />}
          {voiceState === 'thinking' && <Loader2 size={36} color="white" className="animate-spin" />}
          {voiceState === 'speaking' && <Sparkles size={36} color="white" />}
          {voiceState === 'idle' && <Radio size={36} color="white" />}
          {voiceState === 'error' && <MicOff size={36} color="white" />}
        </div>
      </div>

      {/* State label */}
      <p
        className="text-lg font-semibold mb-2 transition-all"
        style={{ color: cfg.orbColor, fontFamily: 'var(--font-heading)' }}
      >
        {cfg.label}
      </p>

      {/* Captions / transcript */}
      <div
        className="max-w-lg text-center px-8 min-h-[52px] flex items-center justify-center"
      >
        {errorMsg ? (
          <p className="text-[13px]" style={{ color: 'var(--error)' }}>{errorMsg}</p>
        ) : (
          <p
            className="text-[14px] leading-relaxed transition-all"
            style={{
              color: voiceState === 'speaking' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontStyle: voiceState === 'listening' ? 'italic' : 'normal',
            }}
          >
            {captions || (voiceState === 'listening' ? 'Say something…' : '')}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-10">
        {/* Interrupt / Barge-in button — only relevant while speaking */}
        {voiceState === 'speaking' && (
          <button
            onClick={interruptAndListen}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[12px] font-semibold transition-all"
            style={{
              background: 'var(--brand-primary-light)',
              border: '1px solid var(--border-glass)',
              color: 'var(--accent)',
            }}
          >
            <Mic size={13} />
            Interrupt
          </button>
        )}

        {/* Exit button */}
        <button
          onClick={handleClose}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[12px] font-semibold transition-all"
          style={{
            background: 'rgba(255,69,96,0.1)',
            border: '1px solid rgba(255,69,96,0.3)',
            color: '#FF4560',
          }}
        >
          <X size={13} />
          Exit AI Mode
        </button>
      </div>

      {/* Subtle hint */}
      <p className="absolute bottom-8 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        All conversations are saved to your chat history
      </p>
    </div>
  );
}
