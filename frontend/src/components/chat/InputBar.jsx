import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, X, FileText, StopCircle, Sparkles } from 'lucide-react';

export default function InputBar({ onSend, isStreaming, onFileAttach, attachedFile, onRemoveFile, addToast }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const shouldRestartRef = useRef(false);
  const isRecordingRef = useRef(false);

  // Keep ref in sync with state so callbacks see the latest value
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    if ((!text.trim() && !attachedFile) || isStreaming) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileAttach(file);
    e.target.value = '';
  };

  const interimTextRef = useRef('');

  const startRecognitionInstance = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const finalWord = event.results[i][0].transcript;
          setText(prev => {
            const trimmed = prev.trimEnd();
            return (trimmed ? trimmed + ' ' : '') + finalWord + ' ';
          });
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInterimText(interim);
      interimTextRef.current = interim;
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldRestartRef.current = false;
        setIsRecording(false);
        isRecordingRef.current = false;
        setInterimText('');
        interimTextRef.current = '';
        addToast('Microphone access denied. Please allow mic access in your browser.', 'error');
      } else if (event.error === 'network' || event.error === 'no-speech') {
        // Silence or network blip — onend will auto-restart
      } else {
        shouldRestartRef.current = false;
        setIsRecording(false);
        isRecordingRef.current = false;
        setInterimText('');
        interimTextRef.current = '';
        addToast(`Voice input error: ${event.error}`, 'error');
      }
    };

    recognition.onend = () => {
      if (shouldRestartRef.current && isRecordingRef.current) {
        try {
          setTimeout(() => {
            if (shouldRestartRef.current && isRecordingRef.current) {
              startRecognitionInstance();
            }
          }, 100);
        } catch (_) {}
      } else {
        setIsRecording(false);
        isRecordingRef.current = false;
        setInterimText('');
        interimTextRef.current = '';
      }
    };

    recognitionRef.current = recognition;
    shouldRestartRef.current = true;
    isRecordingRef.current = true;

    try {
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      shouldRestartRef.current = false;
      isRecordingRef.current = false;
      addToast('Failed to start voice recording.', 'error');
    }
  };

  const startRecording = async () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      addToast('Speech recognition is not supported. Please use Chrome or Edge.', 'error');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        addToast('Microphone permission denied. Check your browser site settings.', 'error');
      } else {
        addToast(`Cannot access microphone: ${err.message}`, 'error');
      }
      return;
    }
    startRecognitionInstance();
  };

  const stopRecording = () => {
    shouldRestartRef.current = false;
    isRecordingRef.current = false;
    setIsRecording(false);
    if (interimTextRef.current) {
      setText(prev => {
        const trimmed = prev.trimEnd();
        return (trimmed ? trimmed + ' ' : '') + interimTextRef.current + ' ';
      });
    }
    setInterimText('');
    interimTextRef.current = '';
    try {
      recognitionRef.current?.stop();
    } catch (_) {}
  };

  const toggleRecording = () => {
    if (isRecordingRef.current || isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const canSend = (text.trim() || attachedFile) && !isStreaming;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '12px 20px 16px',
      }}
    >
      <div className="w-full mx-auto" style={{ maxWidth: '760px' }}>

        {/* Attached file chip */}
        {attachedFile && (
          <div className="flex items-center gap-2 mb-2 animate-fade-slide-up">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px]"
              style={{ background: 'var(--brand-primary-light)', border: '1px solid var(--border-glass)', color: 'var(--accent)' }}
            >
              <FileText size={13} />
              <span className="truncate max-w-[200px] font-medium">{attachedFile.name}</span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                ({(attachedFile.size / 1024).toFixed(1)} KB)
              </span>
              <button
                onClick={onRemoveFile}
                className="p-0.5 rounded hover:bg-white/20 transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                <X size={11} />
              </button>
            </div>
          </div>
        )}

        {/* Recording status bar */}
        {isRecording && (
          <div
            className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl animate-fade-slide-up"
            style={{ background: 'rgba(255,69,96,0.08)', border: '1px solid rgba(255,69,96,0.25)' }}
          >
            <div className="w-2 h-2 rounded-full bg-[#FF4560] animate-record-pulse flex-shrink-0" />
            <span className="text-[12px] font-semibold" style={{ color: '#FF4560' }}>Listening</span>
            {interimText && (
              <span className="text-[12px] italic truncate flex-1" style={{ color: 'var(--text-muted)' }}>
                "{interimText}"
              </span>
            )}
            <button
              onClick={stopRecording}
              className="ml-auto text-[11px] px-2.5 py-1 rounded-lg font-medium transition-all flex-shrink-0"
              style={{ border: '1px solid rgba(255,69,96,0.5)', color: '#FF4560' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,69,96,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Stop
            </button>
          </div>
        )}

        {/* Main Input container */}
        <div
          className="transition-all"
          style={{
            background: 'var(--bg-card)',
            border: isFocused
              ? '1px solid var(--accent)'
              : isRecording
              ? '1px solid rgba(255,69,96,0.4)'
              : '1px solid var(--border-subtle)',
            borderRadius: '16px',
            boxShadow: isFocused
              ? '0 0 0 3px var(--brand-primary-light), 0 4px 20px rgba(0,0,0,0.2)'
              : '0 2px 12px rgba(0,0,0,0.1)',
          }}
        >
          {/* Textarea row */}
          <div className="flex items-end gap-2 px-4 pt-3 pb-2">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isRecording ? 'Speak now — transcription appears here…' : 'Ask RAHONAM anything...'}
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-[14px] py-1 min-h-[34px]"
              style={{
                color: 'var(--text-primary)',
                maxHeight: '160px',
                lineHeight: '1.6',
              }}
              id="chat-input"
            />
            {/* Character counter */}
            {text.length > 500 && (
              <span
                className="text-[10px] flex-shrink-0 self-end pb-1.5"
                style={{ color: text.length > 4000 ? '#FF4560' : 'var(--text-muted)' }}
              >
                {text.length}
              </span>
            )}
          </div>

          {/* Bottom toolbar row */}
          <div
            className="flex items-center justify-between px-3 pb-2.5 pt-1"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            {/* Left tools */}
            <div className="flex items-center gap-0.5">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,audio/*,video/*,.pdf,.docx,.xlsx,.csv,.txt,.py,.js,.json"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                title="Attach file"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Paperclip size={14} />
                <span className="hidden sm:inline">Attach</span>
              </button>
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  isRecording ? 'ring-1 ring-[#FF4560]/40' : ''
                }`}
                title={isRecording ? 'Stop voice input' : 'Voice input'}
                style={{
                  color: isRecording ? '#FF4560' : 'var(--text-muted)',
                  background: isRecording ? 'rgba(255,69,96,0.1)' : 'transparent',
                }}
                onMouseEnter={e => { if (!isRecording) { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                onMouseLeave={e => { if (!isRecording) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
              >
                {isRecording
                  ? <StopCircle size={14} className="animate-pulse" />
                  : <Mic size={14} />
                }
                <span className="hidden sm:inline">{isRecording ? 'Stop' : 'Voice'}</span>
              </button>
            </div>

            {/* Right — hint + send */}
            <div className="flex items-center gap-2.5">
              <span className="hidden md:block text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Enter to send · Shift+Enter for new line
              </span>
              <button
                onClick={handleSend}
                disabled={!canSend}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-[12px] transition-all ${
                  canSend ? 'hover:scale-105 active:scale-95' : 'cursor-not-allowed'
                } ${isStreaming ? 'animate-send-pulse' : ''}`}
                style={{
                  background: canSend ? 'var(--accent-gradient)' : 'var(--border-subtle)',
                  color: 'white',
                  opacity: canSend ? 1 : 0.4,
                  boxShadow: canSend ? '0 4px 16px var(--accent-glow)' : 'none',
                }}
                id="send-btn"
              >
                <Send size={13} />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-[10px] mt-2" style={{ color: 'var(--text-dim, var(--text-muted))' }}>
          RAHONAM may make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
