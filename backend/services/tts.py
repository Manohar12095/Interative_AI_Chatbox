import os
import asyncio
import edge_tts
from config import UPLOADS_DIR

TTS_DIR = UPLOADS_DIR / "tts"
os.makedirs(TTS_DIR, exist_ok=True)

async def list_edge_voices():
    voices = await edge_tts.list_voices()
    return [{"id": v["ShortName"], "name": v["FriendlyName"], "gender": v["Gender"], "locale": v["Locale"]} for v in voices if v["Locale"].startswith("en")]

async def list_local_voices():
    # As per user request, use edge-tts voices for the local list as well
    return await list_edge_voices()

async def generate_tts(text: str, voice_id: str, engine: str = "local") -> str:
    """Generates TTS audio and returns the URL path."""
    filename = f"tts_{hash(text)}_{voice_id}_{engine}.mp3"
    filepath = TTS_DIR / filename
    
    if filepath.exists():
        return f"/static/uploads/tts/{filename}"
        
    # Always use edge_tts since local pyttsx3 is deprecated by user preference
    communicate = edge_tts.Communicate(text, voice_id)
    await communicate.save(str(filepath))
        
    return f"/static/uploads/tts/{filename}"
