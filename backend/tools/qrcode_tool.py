from pydantic import BaseModel, Field
import time
import json
import qrcode
from pathlib import Path
from langchain_core.tools import tool
from config import UPLOADS_DIR

class GenerateQrCodeSchema(BaseModel):
    text: str = Field(..., description="The text for the generate_qr_code tool")

@tool(args_schema=GenerateQrCodeSchema)
def generate_qr_code(text: str) -> str:
    """
    Generate a QR code image ONLY when the user explicitly requests a QR code
    (e.g., 'generate a QR code', 'create a QR code for this URL', 'make me a QR code').
    DO NOT call this tool automatically for general web search results, sharing links, or listing URLs.
    """
    try:
        img = qrcode.make(text)
        filename = f"qr_{int(time.time())}.png"
        path = UPLOADS_DIR / filename
        img.save(str(path))
        
        payload = {
            "type": "image",
            "url": f"/static/uploads/{filename}",
            "alt": f"QR code for {text}",
            "text": f"QR code generated successfully at /static/uploads/{filename}"
        }
        return json.dumps(payload)
    except Exception as e:
        return json.dumps({"type": "error", "message": f"QR error: {e}", "text": f"QR error: {e}"})
