from langchain_core.tools import tool

@tool
def wikipedia_search(topic: str) -> str:
    """Get a detailed Wikipedia summary for any topic."""
    try:
        import wikipedia
        wikipedia.set_lang("en")
        summary = wikipedia.summary(topic, sentences=6, auto_suggest=True)
        page = wikipedia.page(topic)
        return f"📖 {page.title}\n\n{summary}\n\nFull article: {page.url}"
    except Exception as e:
        return f"Wikipedia error: {e}"
