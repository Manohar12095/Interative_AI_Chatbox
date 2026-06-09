"""
Pydantic models / schemas for APEX API.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    enabled_tools: list[str] = Field(default_factory=list)
    api_key: Optional[str] = None  # User-provided override
    provider: Optional[str] = None # User-provided provider ("groq", "openai", "gemini")
    model: Optional[str] = None    # User-provided model override
    file_context: Optional[str] = None  # Pre-analysed file content
    topic_context: Optional[str] = None  # Selected conversation topic
    history: list[dict] = Field(default_factory=list)  # Past conversation history from frontend

class MessageInfo(BaseModel):
    role: str  # "user" | "assistant"
    content: str
    timestamp: str
    tool_calls: list[dict] = Field(default_factory=list)
    tool_results: list[dict] = Field(default_factory=list)


class ToolInfo(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    enabled: bool = True
    category: str = "general"


class ExportRequest(BaseModel):
    format: str = "txt"  # "txt" | "md" | "pdf"
    include_timestamps: bool = True
    include_tool_results: bool = True


class UploadResponse(BaseModel):
    filename: str
    file_type: str
    analysis: str
    file_path: str
