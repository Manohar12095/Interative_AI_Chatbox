"""
Auto-title service — generates a short conversation title after the first exchange.
"""
import asyncio
from config import GROQ_API_KEY, LLAMA_MODEL

TITLE_PROMPT = (
    "Summarize the topic of this exchange in 3-6 words. "
    "Use Title Case. No punctuation at the end. "
    "Reply with ONLY the title, nothing else."
)


async def generate_title(user_msg: str, ai_msg: str, api_key: str = None, provider: str = "groq", model: str = None) -> str:
    """
    Generate a short title for the conversation.
    Falls back to the first 5 words of the user message on any error.
    """
    try:
        exchange = f"User: {user_msg[:300]}\nAssistant: {ai_msg[:300]}"
        key = api_key or GROQ_API_KEY
        m = model or LLAMA_MODEL or "llama-3.1-8b-instant"

        if provider == "openai":
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(api_key=key, model=m, max_tokens=20, temperature=0.3)
        elif provider == "gemini":
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(google_api_key=key, model=m, max_output_tokens=20, temperature=0.3)
        elif provider == "ollama":
            from langchain_ollama import ChatOllama
            llm = ChatOllama(model=m, num_predict=20, temperature=0.3)
        else:
            # Default: Groq with the fastest small model
            from langchain_groq import ChatGroq
            llm = ChatGroq(api_key=key, model_name="llama-3.1-8b-instant", max_tokens=20, temperature=0.3)

        from langchain_core.messages import SystemMessage, HumanMessage
        result = await llm.ainvoke([
            SystemMessage(content=TITLE_PROMPT),
            HumanMessage(content=exchange)
        ])
        title = result.content.strip().strip('"').strip("'").strip(".")
        if title:
            return title[:60]  # Hard cap for UI safety
    except Exception as e:
        print(f"[auto_title] LLM title generation failed: {e}")

    # Fallback: first 5 words of the user message
    words = user_msg.strip().split()
    fallback = " ".join(words[:5])
    if not fallback:
        return "New Chat"
    return fallback.title()
