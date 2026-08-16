"""
APEX — Agentic AI Assistant Backend
FastAPI application entry point.
"""
import sys
from pathlib import Path

# Add backend dir to path so modules can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from config import UPLOADS_DIR

# Import routers
from routes.chat import router as chat_router
from routes.upload import router as upload_router
from routes.voice import router as voice_router
from routes.tools import router as tools_router
from routes.export import router as export_router
from routes.files import router as files_router
from routes.config import router as config_router

app = FastAPI(
    title="APEX — Agentic AI Assistant",
    description="Backend API for the APEX AI chatbot with 15+ tools",
    version="1.0.0"
)

# CORS — allow any origin (including Vercel deployments and localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
app.mount("/static/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Register routers
app.include_router(chat_router, tags=["Chat"])
app.include_router(upload_router, tags=["Upload"])
app.include_router(voice_router, tags=["Voice"])
app.include_router(tools_router, tags=["Tools"])
app.include_router(export_router, tags=["Export"])
app.include_router(files_router, tags=["Files"])
app.include_router(config_router, tags=["Config"])


@app.get("/")
async def root():
    return {
        "name": "APEX — Agentic AI Assistant",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
