import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, FolderPlus, Mic, X, StopCircle, Sparkles, Reply, Radio } from 'lucide-react';
import AttachmentChip from './AttachmentChip';

export default function InputBar({ onSend, isStreaming, onFileAttach, attachedFiles = [], onRemoveFile, addToast, replyTo, onCancelReply, onAiMode, settings = {} }) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const shouldRestartRef = useRef(false);
  const isRecordingRef = useRef(false);
  const interimTextRef = useRef('');

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
    if ((!text.trim() && attachedFiles.length === 0) || isStreaming) return;
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
    const files = Array.from(e.target.files || []);
    if (files.length > 0) onFileAttach(files);
    e.target.value = '';
  };

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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const savedSettings = JSON.parse(localStorage.getItem('apex_settings') || '{}');
      const sttModelSize = savedSettings.stt_model_size || 'base';
      
      // If we're using the fallback web api
      // startRecognitionInstance();
      // Wait, let's use media recorder for offline support
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        try {
          setInterimText('Transcribing...');
          
          const { transcribeAudio } = await import('../../utils/api');
          const data = await transcribeAudio(audioBlob, sttModelSize);
          
          if (data.transcription) {
            setText(prev => {
              const trimmed = prev.trimEnd();
              return (trimmed ? trimmed + ' ' : '') + data.transcription + ' ';
            });
          } else if (data.error) {
            // If backend STT fails, try Web Speech API fallback
            addToast(`STT backend error: ${data.error}. Using browser fallback.`, 'warning');
            startRecognitionInstance();
          }
        } catch (e) {
          // Network error — fall back to Web Speech API
          addToast('Backend unavailable, switching to browser voice recognition.', 'info');
          startRecognitionInstance();
        }
        
        setInterimText('');
        setIsRecording(false);
        isRecordingRef.current = false;
      };
      
      mediaRecorder.start(100); // chunk every 100ms
      setIsRecording(true);
      isRecordingRef.current = true;
      setInterimText('Listening...');
      
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        addToast('Microphone permission denied. Check your browser site settings.', 'error');
      } else {
        addToast(`Cannot access microphone: ${err.message}`, 'error');
      }
      return;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    shouldRestartRef.current = false;
    isRecordingRef.current = false;
    setIsRecording(false);
    if (interimTextRef.current && interimTextRef.current !== 'Listening...' && interimTextRef.current !== 'Transcribing...') {
      setText(prev => {
        const trimmed = prev.trimEnd();
        return (trimmed ? trimmed + ' ' : '') + interimTextRef.current + ' ';
      });
    }
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

  const canSend = (text.trim() || attachedFiles.length > 0) && !isStreaming;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '12px 20px 16px',
      }}
    >
      <div className="w-full mx-auto" style={{ maxWidth: '1000px' }}>

        {/* Reply Tag */}
        {replyTo && (
          <div className="flex items-center gap-2 mb-2 animate-fade-slide-up">
            <div
              className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-[12px]"
              style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Reply size={13} style={{ color: 'var(--accent)' }} className="flex-shrink-0" />
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Replying to {replyTo.role === 'user' ? 'yourself' : 'IN NET CREATION'}
                </span>
                <span className="truncate flex-1" style={{ color: 'var(--text-muted)' }}>
                  {replyTo.content.substring(0, 60)}...
                </span>
              </div>
              <button
                onClick={onCancelReply}
                className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0 ml-2"
                title="Cancel reply"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Attached files chips */}
        {attachedFiles.length > 0 && (
          <div className="flex items-center gap-2 mb-2 animate-fade-slide-up overflow-x-auto pb-1 hide-scrollbar">
            {attachedFiles.map((file, idx) => (
              <AttachmentChip key={idx} file={file} onRemove={() => onRemoveFile(idx)} />
            ))}
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
              placeholder={isRecording ? 'Speak now — transcription appears here…' : 'Ask IN NET CREATION anything...'}
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
                multiple
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                title="Attach files"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Paperclip size={14} />
                <span className="hidden sm:inline">File</span>
              </button>

              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.webkitdirectory = true;
                  input.multiple = true;
                  input.onchange = (e) => handleFileSelect(e);
                  input.click();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                title="Attach folder"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <FolderPlus size={14} />
                <span className="hidden sm:inline">Folder</span>
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

              {/* AI Mode button */}
              <button
                onClick={onAiMode}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                title="Start continuous AI voice conversation"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-primary-light)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Radio size={14} />
                <span className="hidden sm:inline">AI Mode</span>
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
          IN NET CREATION may make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
