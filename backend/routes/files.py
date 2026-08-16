"""
Files route — serves generated files (PDFs, etc.) with proper headers.
Cleans up files older than 24h automatically.
"""
import time
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

try:
    from config import DATA_DIR
    PDF_DIR = DATA_DIR / "pdfs"
except Exception:
    PDF_DIR = Path(__file__).resolve().parent.parent / "data" / "pdfs"

PDF_DIR.mkdir(parents=True, exist_ok=True)

MAX_AGE_SECONDS = 86400  # 24 hours


def _cleanup_old_files():
    """Delete generated files older than 24h."""
    now = time.time()
    for f in PDF_DIR.iterdir():
        if f.is_file() and (now - f.stat().st_mtime) > MAX_AGE_SECONDS:
            try:
                f.unlink()
            except Exception:
                pass


@router.get("/api/files/{filename}")
async def serve_file(filename: str):
    """Serve a generated file by filename."""
    _cleanup_old_files()

    # Security: prevent path traversal
    safe_name = Path(filename).name
    filepath = PDF_DIR / safe_name

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found or expired.")

    # Determine media type
    ext = filepath.suffix.lower()
    media_types = {
        ".pdf": "application/pdf",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".txt": "text/plain",
    }
    media_type = media_types.get(ext, "application/octet-stream")

    return FileResponse(
        path=str(filepath),
        media_type=media_type,
        filename=safe_name,
        headers={"Content-Disposition": f'attachment; filename="{safe_name}"'},
    )
