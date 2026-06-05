from langchain_core.tools import tool

@tool
def explain_code(code: str, language: str = "python") -> str:
    """Explain what a piece of code does, find bugs, or suggest improvements."""
    return f"[CODE_EXPLAIN] Language: {language}\n```{language}\n{code}\n```"
