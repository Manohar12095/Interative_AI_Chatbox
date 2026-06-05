from langchain_core.tools import tool

@tool
def translate_text(text: str, target_language: str) -> str:
    """Translate any text to a target language using the AI model."""
    return f"[TRANSLATE_REQUEST] Translate to {target_language}: {text}"
