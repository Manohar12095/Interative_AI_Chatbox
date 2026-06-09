"""
Chat route — SSE streaming endpoint.
"""
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models import ChatRequest
from services.agent import run_agent_stream

router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest):
    """Send a message to APEX and receive a streamed SSE response."""
    async def event_generator():
        async for event in run_agent_stream(
            user_input=request.message,
            session_id=request.session_id,
            enabled_tools=request.enabled_tools,
            api_key=request.api_key,
            provider=request.provider,
            model=request.model,
            file_context=request.file_context,
            topic_context=request.topic_context,
            history=request.history
        ):
            yield event

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
