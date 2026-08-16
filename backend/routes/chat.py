"""
Chat route — SSE streaming endpoint with auto-titling.
"""
import json
import asyncio
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from models import ChatRequest
from services.agent import run_agent_stream
from services.session_manager import load_session, set_auto_title
from services.auto_title import generate_title

router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest):
    """Send a message to APEX and receive a streamed SSE response."""
    collected_ai_response = []

    async def event_generator():
        async for event in run_agent_stream(
            user_input=request.message,
            session_id=request.session_id,
            enabled_tools=request.enabled_tools,
            api_key=request.api_key,
            provider=request.provider,
            model=request.model,
            ollama_url=request.ollama_url,
            file_context=request.file_context,
            topic_context=request.topic_context,
            history=request.history
        ):
            # Collect AI tokens so we can build the response for auto-titling
            try:
                data = json.loads(event.replace("data: ", "").strip())
                if data.get("type") == "token":
                    collected_ai_response.append(data.get("content", ""))
                elif data.get("type") == "done":
                    # Yield the done event first, then fire auto-title async
                    yield event
                    # Auto-title: only on first-ever message in the session
                    if request.session_id:
                        session = load_session(request.session_id)
                        if not session.get("auto_titled", False) and session.get("name", "New Chat") == "New Chat":
                            ai_text = "".join(collected_ai_response)
                            try:
                                title = await generate_title(
                                    user_msg=request.message,
                                    ai_msg=ai_text,
                                    api_key=request.api_key,
                                    provider=request.provider or "groq",
                                    model=request.model
                                )
                                set_auto_title(request.session_id, title)
                                # Stream session_title event so frontend can update sidebar instantly
                                title_event = json.dumps({"type": "session_title", "title": title, "session_id": request.session_id})
                                yield f"data: {title_event}\n\n"
                            except Exception as e:
                                print(f"[chat] Auto-title error: {e}")
                    return
            except Exception:
                pass
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
