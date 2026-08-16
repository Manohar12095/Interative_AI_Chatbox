from pydantic import BaseModel, Field
from langchain_core.tools import tool

class SummariseTextSchema(BaseModel):
    text: str = Field(..., description="The text for the summarise_text tool")
    length: str = Field(default="short", description="The length for the summarise_text tool")

@tool(args_schema=SummariseTextSchema)
def summarise_text(text: str, length: str = "short") -> str:
    """Summarise any long text. Length options: short, medium, detailed."""
    word_count = len(text.split())
    return f"[SUMMARISE] ({length} summary requested, {word_count} words input)\n{text[:3000]}"
