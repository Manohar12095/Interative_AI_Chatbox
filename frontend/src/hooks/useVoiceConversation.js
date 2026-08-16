/**
 * useVoiceConversation — manages the full continuous-voice conversation loop.
 *
 * States: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
 *
 * Flow:
 *   startListening() → VAD detects speech end → transcribe → onSend(transcript)
 *   → wait for isStreaming to go false → speak reply via TTS → startListening() again
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { transcribeAudio, fetchTts } from '../utils/api';

export default function useVoiceConversation({ isStreaming, messages, settings, addToast }) {
  const [voiceState, setVoiceState] = useState('idle'); // idle | listening | thinking | speaking | error
  const [transcript, setTranscript] = useState('');
  const [captions, setCaptions] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioRef = useRef(null);
  const activeRef = useRef(false); // true while AI Mode is running
  const silenceTimerRef = useRef(null);
  const hasSpeechRef = useRef(false);
  const prevStreamingRef = useRef(isStreaming);
  const lastAiMsgRef = useRef('');

  // Detect when streaming finishes — TTS the AI reply
  useEffect(() => {
    if (!activeRef.current) return;
    if (prevStreamingRef.current && !isStreaming && voiceState === 'thinking') {
      // Find the last assistant message
      const lastAi = [...messages].reverse().find(m => m.role === 'assistant');
      if (lastAi && lastAi.content && lastAi.content !== lastAiMsgRef.current) {
        lastAiMsgRef.current = lastAi.content;
        speakText(lastAi.content);
      } else {
        // No new message, go back to listening
        startListening();
      }
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming, voiceState, messages]);

  const stopAll = useCallback(() => {
    // Stop media recorder
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    // Stop VAD animation frame
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!activeRef.current) return;
    setVoiceState('listening');
    setTranscript('');
    hasSpeechRef.current = false;
    audioChunksRef.current = [];

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      setErrorMsg('Microphone access denied.');
      setVoiceState('error');
      return;
    }

    // VAD via AnalyserNode
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;
    const buf = new Uint8Array(analyser.frequencyBinCount);

    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };

    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      audioCtx.close();
      if (!activeRef.current) return;
      if (!hasSpeechRef.current) {
        // No speech detected — restart listening
        startListening();
        return;
      }
      // Transcribe
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      try {
        const data = await transcribeAudio(blob, settings.stt_model_size || 'base');
        const text = data.transcription?.trim();
        if (text) {
          setTranscript(text);
          setCaptions(text);
          setVoiceState('thinking');
          // onSend is called via the returned sendFn
          sendFnRef.current?.(text);
        } else {
          startListening();
        }
      } catch (e) {
        addToast?.('STT failed, retrying...', 'warning');
        startListening();
      }
    };

    recorder.start();

    // VAD loop: detect speech / silence
    const vadLoop = () => {
      if (!activeRef.current) return;
      analyser.getByteFrequencyData(buf);
      const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
      const isSpeaking = avg > 12; // threshold

      if (isSpeaking) {
        hasSpeechRef.current = true;
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } else if (hasSpeechRef.current && !silenceTimerRef.current) {
        // Start silence timer
        silenceTimerRef.current = setTimeout(() => {
          if (activeRef.current && mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }, 1400); // 1.4s silence = end of utterance
      }

      animFrameRef.current = requestAnimationFrame(vadLoop);
    };
    vadLoop();
  }, [settings.stt_model_size]);

  const speakText = useCallback(async (text) => {
    if (!activeRef.current) return;
    setVoiceState('speaking');
    // Strip markdown for TTS
    const clean = text.replace(/```[\s\S]*?```/g, '').replace(/[*_`#>\[\]()]/g, '').substring(0, 1200);
    setCaptions(clean);

    try {
      const url = await fetchTts(clean, settings.tts_voice || '', settings.tts_engine || 'local');
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        if (activeRef.current) startListening();
      };
      audio.onerror = () => {
        if (activeRef.current) startListening();
      };
      audio.play();
    } catch (e) {
      console.warn('[AiMode] TTS failed, continuing...', e);
      if (activeRef.current) startListening();
    }
  }, [settings.tts_voice, settings.tts_engine, startListening]);

  // Barge-in: if user speaks while AI is speaking, stop and listen
  useEffect(() => {
    if (voiceState !== 'speaking') return;
    // We don't actively monitor while speaking; handled by startListening overriding
  }, [voiceState]);

  const sendFnRef = useRef(null);

  const start = useCallback((onSend) => {
    activeRef.current = true;
    sendFnRef.current = onSend;
    lastAiMsgRef.current = '';
    startListening();
  }, [startListening]);

  const stop = useCallback(() => {
    activeRef.current = false;
    stopAll();
    setVoiceState('idle');
    setTranscript('');
    setCaptions('');
  }, [stopAll]);

  const interruptAndListen = useCallback(() => {
    if (voiceState === 'speaking') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      startListening();
    }
  }, [voiceState, startListening]);

  return { voiceState, transcript, captions, errorMsg, start, stop, interruptAndListen };
}
