from fastapi import APIRouter
import os

router = APIRouter(prefix="/config")

@router.get("/")
async def get_config():
    # Return available configuration to frontend
    return {
        "has_backend_api_key": bool(os.environ.get("GROQ_API_KEY")),
        "models": {
            "text": os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant"),
            "vision": os.environ.get("GROQ_VISION_MODEL", "llama-3.2-90b-vision-preview"),
        }
    }
