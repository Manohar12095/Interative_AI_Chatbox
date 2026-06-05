"""
Upload route — file upload and analysis.
"""
import time
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File
from config import UPLOADS_DIR
from services.file_handler import analyse_file

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload a file for analysis."""
    try:
        # Save file
        timestamp = int(time.time())
        safe_name = f"{timestamp}_{file.filename}"
        file_path = UPLOADS_DIR / safe_name

        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Analyse the file
        analysis = analyse_file(str(file_path))

        return {
            "filename": file.filename,
            "file_type": Path(file.filename).suffix.lower(),
            "analysis": analysis,
            "file_path": f"/static/uploads/{safe_name}",
            "size": len(content)
        }
    except Exception as e:
        return {"error": str(e)}
