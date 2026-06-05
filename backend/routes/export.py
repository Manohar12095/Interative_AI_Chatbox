"""
Export route — export chat session.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse
from models import ExportRequest
from services import session_manager

router = APIRouter()


@router.post("/export/{session_id}")
async def export_chat(session_id: str, data: ExportRequest):
    """Export a chat session as text or markdown."""
    try:
        content = session_manager.export_session(
            session_id,
            fmt=data.format,
            include_timestamps=data.include_timestamps,
            include_tool_results=data.include_tool_results
        )
        media_type = "text/markdown" if data.format == "md" else "text/plain"
        return PlainTextResponse(content=content, media_type=media_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
