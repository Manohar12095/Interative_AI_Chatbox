"""
Voice service — audio transcription.
"""
from pathlib import Path


def transcribe_audio(audio_path: str) -> str:
    """Transcribe audio file to text using SpeechRecognition."""
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
