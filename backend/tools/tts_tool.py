"""
Text-to-Speech Tool — Generates an audio file from text using edge-tts.
"""
import os
import asyncio
from pydantic import BaseModel, Field
from langchain_core.tools import tool
import edge_tts
from config import UPLOADS_DIR

TTS_DIR = UPLOADS_DIR / "tts"
os.makedirs(TTS_DIR, exist_ok=True)

class TTSInput(BaseModel):
    text: str = Field(description="The text or sentence to convert into speech audio.")

@tool("text_to_speech", args_schema=TTSInput)
def text_to_speech(text: str) -> str:
    """
    Convert a text sentence or paragraph into an audio file.
    Use this tool when the user asks you to convert text into audio, read something out loud as a file, or generate speech.
    Returns a markdown audio link that the user can play or download.
    """
    try:
        # We can use the default voice en-GB-MaisieNeural
        voice_id = "en-GB-MaisieNeural"
        
        filename = f"tts_tool_{hash(text)}_{voice_id}.mp3"
        filepath = TTS_DIR / filename
        
        async def _generate():
            communicate = edge_tts.Communicate(text, voice_id)
            await communicate.save(str(filepath))
            
        # Since this tool runs in a synchronous thread (from asyncio.to_thread in agent.py),
        # we can safely run a new event loop.
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(_generate())
        loop.close()
        
        file_url = f"/static/uploads/tts/{filename}"
        
        # Return a markdown audio element (can be a link that prompts download or an HTML audio tag)
        # We will use an HTML audio tag which ReactMarkdown will strip if rehypeRaw isn't used,
        # so we also provide a direct download link.
        return (
            f"Audio generated successfully!\n\n"
            f"[Download Audio File ({voice_id})]({file_url})"
        )
    except Exception as e:
        return f"Error generating audio: {str(e)}"
