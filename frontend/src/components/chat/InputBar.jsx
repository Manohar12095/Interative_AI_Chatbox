import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, X, FileText, StopCircle } from 'lucide-react';

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
      // Auto-restart to keep mic open during natural pauses
      if (shouldRestartRef.current && isRecordingRef.current) {
        try {
          setTimeout(() => {
            if (shouldRestartRef.current && isRecordingRef.current) {
              startRecognitionInstance(); // Create a fresh instance for reliability
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

    // Request mic permission explicitly first for a clearer UX
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop()); // Release the test stream
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
    
    // Save any pending interim text
    if (interimTextRef.current) {
      setText(prev => {
        const trimmed = prev.trimEnd();
        return (trimmed ? trimmed + ' ' : '') + interimTextRef.current + ' ';
      });
    }
    
    setInterimText('');
    interimTextRef.current = '';
    
    try {
      recognitionRef.current?.stop(); // Use stop instead of abort to process final results
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
    <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', padding: '14px 20px' }}>
      <div className="max-w-4xl mx-auto">
        {/* Disclaimer */}
        <p className="text-center text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>
          RAHONAM can make mistakes. Verify important information.
        </p>

        {/* Attached file chip */}
        {attachedFile && (
          <div className="flex items-center gap-2 mb-2 animate-fade-slide-up">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px]"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <FileText size={14} />
              <span className="truncate max-w-[200px]">{attachedFile.name}</span>
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                ({(attachedFile.size / 1024).toFixed(1)} KB)
              </span>
              <button onClick={onRemoveFile} className="p-0.5 rounded hover:bg-white/10">
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Recording status bar */}
        {isRecording && (
          <div
            className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-lg animate-fade-slide-up"
            style={{ background: 'rgba(255,69,96,0.08)', border: '1px solid rgba(255,69,96,0.2)' }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF4560] animate-record-pulse flex-shrink-0" />
            <span className="text-[12px] font-medium" style={{ color: '#FF4560' }}>Listening…</span>
            {interimText && (
              <span className="text-[12px] italic truncate flex-1" style={{ color: 'var(--text-muted)' }}>
                "{interimText}"
              </span>
            )}
            <button
              onClick={stopRecording}
              className="ml-auto text-[11px] px-2 py-0.5 rounded-md border border-[#FF4560]/40 text-[#FF4560] hover:bg-[#FF4560]/10 transition-colors flex-shrink-0"
            >
              Stop
            </button>
          </div>
        )}

        {/* Input container */}
        <div
          className="flex items-end gap-2 px-4 py-3 transition-all"
          style={{
            background: 'var(--bg-card)',
            border: isFocused ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
            borderRadius: '14px',
            boxShadow: isFocused ? '0 0 0 3px var(--brand-primary-light)' : 'none',
            outline: isRecording ? '1px solid rgba(255,69,96,0.3)' : 'none',
          }}
        >
          {/* File attach */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg transition-colors flex-shrink-0"
            title="Attach file"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Paperclip size={20} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,audio/*,video/*,.pdf,.docx,.xlsx,.csv,.txt,.py,.js,.json"
          />

          {/* Voice button */}
          <button
            onClick={toggleRecording}
            className={`p-2 rounded-lg transition-all flex-shrink-0 ${
              isRecording
                ? 'bg-[#FF4560]/20 ring-1 ring-[#FF4560]/50'
                : ''
            }`}
            title={isRecording ? 'Stop voice input' : 'Start voice input'}
            style={{ color: isRecording ? '#FF4560' : 'var(--text-muted)' }}
            onMouseEnter={e => { if (!isRecording) e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { if (!isRecording) e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {isRecording
              ? <StopCircle size={20} className="animate-pulse" />
              : <Mic size={20} />
            }
          </button>

          {/* Separator */}
          <div className="self-center flex-shrink-0" style={{ width: '1px', height: '20px', background: 'var(--border-subtle)' }} />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isRecording ? 'Speak now — transcription appears here…' : 'Ask RAHONAM anything...'}
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-[14px] py-2 min-h-[36px]"
            style={{
              color: 'var(--text-primary)',
              maxHeight: '160px',
              fontStyle: text ? 'normal' : 'italic',
            }}
            id="chat-input"
          />

          {/* Character counter */}
          {text.length > 500 && (
            <span className="text-[10px] flex-shrink-0 self-end pb-2" style={{ color: text.length > 4000 ? '#FF4560' : 'var(--text-muted)' }}>
              {text.length}
            </span>
          )}

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`flex-shrink-0 flex items-center justify-center transition-all ${
              canSend
                ? 'hover:scale-105 active:scale-95 send-btn-active'
                : 'cursor-not-allowed'
            } ${isStreaming ? 'animate-send-pulse' : ''}`}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: canSend ? 'var(--accent-gradient)' : 'var(--border-subtle)',
              color: 'white',
              opacity: canSend ? 1 : 0.3,
              boxShadow: canSend ? '0 0 16px var(--accent-glow)' : 'none',
            }}
            id="send-btn"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
