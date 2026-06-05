"""
Sessions routes — CRUD for chat sessions.
"""
from fastapi import APIRouter, HTTPException
from models import SessionCreate, SessionRename
from services import session_manager

router = APIRouter()


@router.get("/sessions")
async def list_sessions():
    return session_manager.list_sessions()


@router.post("/sessions")
async def create_session(data: SessionCreate):
    return session_manager.create_session(data.name)


@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    session = session_manager.load_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.patch("/sessions/{session_id}")
async def rename_session(session_id: str, data: SessionRename):
    result = session_manager.rename_session(session_id, data.name)
    if not result:
        raise HTTPException(status_code=404, detail="Session not found")
    return result


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    if session_manager.delete_session(session_id):
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Session not found")


@router.post("/sessions/{session_id}/clear")
async def clear_session(session_id: str):
    session_manager.clear_messages(session_id)
    return {"status": "cleared"}
