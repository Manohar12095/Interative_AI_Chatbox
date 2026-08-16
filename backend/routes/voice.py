"""
Voice route — audio transcription.
"""
import time
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from config import UPLOADS_DIR
from services.voice import transcribe_audio
from services.tts import generate_tts, list_edge_voices, list_local_voices

router = APIRouter()


from fastapi import APIRouter, UploadFile, File, Form, HTTPException

@router.post("/voice")
async def voice_transcribe(
    file: UploadFile = File(...),
    model_size: str = Form("base")
):
    """Upload audio blob and get transcription."""
    try:
        timestamp = int(time.time())
        safe_name = f"voice_{timestamp}_{file.filename or 'recording.wav'}"
        file_path = UPLOADS_DIR / safe_name

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        text = transcribe_audio(str(file_path), model_size)
        return {"transcription": text}
    except Exception as e:
        return {"error": str(e)}

class TTSRequest(BaseModel):
    text: str
    voice_id: str
    engine: str = "local"

@router.get("/tts/voices")
async def get_tts_voices(engine: str = "local"):
    try:
        if engine == "edge":
            voices = await list_edge_voices()
            return {"voices": voices}
        else:
            voices = await list_local_voices()
            return {"voices": voices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tts")
async def create_tts(req: TTSRequest):
    try:
        url = await generate_tts(req.text, req.voice_id, req.engine)
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
