"""
Voice service — audio transcription.
"""
from pathlib import Path
import os
try:
    from faster_whisper import WhisperModel
    has_faster_whisper = True
except ImportError:
    has_faster_whisper = False

# Cache model instances to avoid reloading
_whisper_models = {}

def get_whisper_model(model_size="base"):
    if not has_faster_whisper:
        return None
    if model_size not in _whisper_models:
        try:
            # compute_type="int8" for better compatibility without GPU
            _whisper_models[model_size] = WhisperModel(model_size, device="cpu", compute_type="int8")
        except Exception as e:
            print(f"Error loading whisper model {model_size}: {e}")
            return None
    return _whisper_models[model_size]

def transcribe_audio(audio_path: str, model_size: str = "base") -> str:
    """Transcribe audio file to text using faster-whisper (offline), falling back to SpeechRecognition (online)."""
    if has_faster_whisper:
        model = get_whisper_model(model_size)
        if model:
            try:
                segments, info = model.transcribe(audio_path, beam_size=5)
                text = " ".join([segment.text for segment in segments])
                return text.strip()
            except Exception as e:
                print(f"Faster-whisper error: {e}, falling back to SpeechRecognition")

    # Fallback
    try:
        import speech_recognition as sr
        from pydub import AudioSegment

        ext = Path(audio_path).suffix.lower()
        wav_path = audio_path
        if ext != '.wav':
            audio = AudioSegment.from_file(audio_path)
            wav_path = str(Path(audio_path).with_suffix('.wav'))
            audio.export(wav_path, format='wav')

        r = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = r.record(source)
        text = r.recognize_google(audio_data)
        return text
    except Exception as e:
        return f"Transcription error: {e}"
