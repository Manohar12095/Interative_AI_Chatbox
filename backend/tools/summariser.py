from langchain_core.tools import tool

@tool
def summarise_text(text: str, length: str = "short") -> str:
    """Summarise any long text. Length options: short, medium, detailed."""
    word_count = len(text.split())
    return f"[SUMMARISE] ({length} summary requested, {word_count} words input)\n{text[:3000]}"
