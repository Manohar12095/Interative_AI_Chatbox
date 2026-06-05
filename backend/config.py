"""
APEX Backend Configuration
Loads environment variables from the parent .env file.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root (parent of backend/)
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
VISION_API_KEY = os.getenv("VISION_API_KEY", "")

LLAMA_MODEL = "llama-3.3-70b-versatile"
VISION_MODEL = "llava-v1.5-7b-4096-preview"

# Paths
BACKEND_DIR = Path(__file__).resolve().parent
DATA_DIR = BACKEND_DIR / "data"
SESSIONS_DIR = DATA_DIR / "sessions"
UPLOADS_DIR = DATA_DIR / "uploads"

# Create directories
SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
