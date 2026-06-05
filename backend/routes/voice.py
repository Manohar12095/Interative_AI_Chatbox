"""
Voice route — audio transcription.
"""
import time
from fastapi import APIRouter, UploadFile, File
from config import UPLOADS_DIR
from services.voice import transcribe_audio

router = APIRouter()


@router.post("/voice")
async def voice_transcribe(file: UploadFile = File(...)):
    """Upload audio blob and get transcription."""
    try:
        timestamp = int(time.time())
        safe_name = f"voice_{timestamp}_{file.filename or 'recording.wav'}"
        file_path = UPLOADS_DIR / safe_name

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        text = transcribe_audio(str(file_path))
        return {"transcription": text}
    except Exception as e:
        return {"error": str(e)}
