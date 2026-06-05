import time
import qrcode
from pathlib import Path
from langchain_core.tools import tool
from config import UPLOADS_DIR

@tool
def generate_qr_code(text: str) -> str:
    """Generate a QR code image for any URL, text, or data."""
    try:
        img = qrcode.make(text)
        filename = f"qr_{int(time.time())}.png"
        path = UPLOADS_DIR / filename
        img.save(str(path))
        return f"QR code generated: /static/uploads/{filename}"
    except Exception as e:
        return f"QR error: {e}"
