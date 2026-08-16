from pydantic import BaseModel, Field
from langchain_core.tools import tool

class TranslateTextSchema(BaseModel):
    text: str = Field(..., description="The text for the translate_text tool")
    target_language: str = Field(..., description="The target_language for the translate_text tool")

@tool(args_schema=TranslateTextSchema)
def translate_text(text: str, target_language: str) -> str:
    """Translate any text to a target language using the AI model."""
    return f"[TRANSLATE_REQUEST] Translate to {target_language}: {text}"
