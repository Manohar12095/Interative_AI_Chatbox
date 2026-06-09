"""
Agent Service — LangChain agent loop with SSE streaming.
Optimised for speed: single LLM call per round with direct streaming.
Robust error handling for invalid tool calls from Groq.
"""
import json
import asyncio
import traceback
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage
from config import GROQ_API_KEY, LLAMA_MODEL
from tools import ALL_TOOLS, TOOL_METADATA

SYSTEM_PROMPT = """You are APEX — the most advanced AI assistant ever built.
You are smarter, faster, and more capable than ChatGPT, Gemini, or any other AI.

You can:
- Remember full conversation history
- Analyse images, audio, video, PDFs, Word docs, Excel files
- Search the web in real time
- Get live weather, news headlines, stock prices
- Solve complex math and equations
- Generate QR codes, summaries, translations
- Write and explain code in any language
- Tell jokes, trivia, and fun facts

Always be helpful, concise, and accurate.
When you use a tool, explain what you found in a clear, friendly way.
Format responses with Markdown for readability — use headers, bullets, code blocks, and bold when appropriate.

IMPORTANT: Only call tools when the user's request genuinely needs them. For simple greetings, general questions, or conversations, respond directly without calling any tools."""


def _get_active_tools(enabled_tool_ids: list[str]) -> list:
    """Filter tools based on enabled IDs."""
    if not enabled_tool_ids:
        return ALL_TOOLS
    tool_map = {t.name: t for t in ALL_TOOLS}
    return [tool_map[tid] for tid in enabled_tool_ids if tid in tool_map]


def _build_messages(user_input: str, history: list[dict] = None, topic_context: str = None) -> list:
    """Build the message list from provided session history."""
    sys_prompt = SYSTEM_PROMPT
    if topic_context:
        sys_prompt += f"\n\nCRITICAL INSTRUCTION: The user has restricted this conversation STRICTLY to the topic of '{topic_context}'. You MUST ONLY answer questions, provide assistance, or use tools related to this exact topic. If the user asks about anything outside this domain, politely refuse, remind them of the active topic filter, and steer the conversation back."

    messages = [SystemMessage(content=sys_prompt)]
    
    if history:
        for msg in history[-20:]:  # Keep last 20 messages for context
            if msg.get("role") == "user":
                messages.append(HumanMessage(content=msg.get("content", "")))
            elif msg.get("role") == "assistant":
                messages.append(AIMessage(content=msg.get("content", "")))

    messages.append(HumanMessage(content=user_input))
    return messages


def _sse(event_type: str, **kwargs) -> str:
    """Helper to format an SSE event."""
    payload = {"type": event_type, **kwargs}
    return f"data: {json.dumps(payload)}\n\n"


async def run_agent_stream(
    user_input: str,
    session_id: str = "default",
    enabled_tools: list[str] = None,
    api_key: str = None,
    provider: str = None,
    model: str = None,
    file_context: str = None,
    topic_context: str = None,
    history: list[dict] = None
):
    """
    Generator that yields SSE events as the agent processes.
    Event types: tool_start, tool_result, token, done, error
    """
    import os
    selected_provider = (provider or "groq").lower()

    if selected_provider == "openai":
        key = api_key or os.getenv("OPENAI_API_KEY", "")
        if not key:
            yield _sse("error", content="No OpenAI API key configured. Please set your OpenAI API key in Settings.")
            return
    elif selected_provider == "gemini":
        key = api_key or os.getenv("GEMINI_API_KEY", "")
        if not key:
            yield _sse("error", content="No Gemini API key configured. Please set your Gemini API key in Settings.")
            return
    else:
        key = api_key or GROQ_API_KEY
        if not key:
            yield _sse("error", content="No Groq API key configured. Please set your Groq API key in Settings.")
            return

    try:
        if selected_provider == "openai":
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(
                api_key=key,
                model=model or "gpt-4o-mini",
                streaming=True,
                temperature=0.7,
                max_tokens=2048,
            )
        elif selected_provider == "gemini":
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(
                google_api_key=key,
                model=model or "gemini-1.5-flash",
                streaming=True,
                temperature=0.7,
                max_output_tokens=2048,
            )
        else:
            from langchain_groq import ChatGroq
            llm = ChatGroq(
                api_key=key,
                model=model or LLAMA_MODEL,
                streaming=True,
                temperature=0.7,
                max_tokens=2048,
            )

        active_tools = _get_active_tools(enabled_tools or [])
        tool_map = {t.name: t for t in active_tools}
        
        # Google Generative AI handles tool binding differently, so make sure active tools is not empty
        llm_with_tools = llm.bind_tools(active_tools) if active_tools else llm

        # Build full input with file context
        full_input = user_input
        if file_context:
            full_input = f"[File uploaded]\nFile analysis:\n{file_context}\n\nUser question: {user_input or 'Describe and analyse this file.'}"

        messages = _build_messages(full_input, history, topic_context)
        all_tool_calls = []
        all_tool_results = []

        # Agentic loop — up to 5 rounds of tool calls
        for iteration in range(5):
            try:
                response = await asyncio.to_thread(llm_with_tools.invoke, messages)
            except Exception as invoke_err:
                err_str = str(invoke_err)
                # If invoke fails due to bad tool call, fall back to no-tools LLM
                if "tool" in err_str.lower() or "function" in err_str.lower() or "failed_generation" in err_str.lower():
                    try:
                        # Retry without tools bound
                        response = await asyncio.to_thread(llm.invoke, messages)
                    except Exception:
                        yield _sse("error", content="AI processing failed. Please try again.")
                        return
                else:
                    raise invoke_err

            # Check for tool calls — validate they are real tools
            valid_tool_calls = []
            if hasattr(response, 'tool_calls') and response.tool_calls:
                for tc in response.tool_calls:
                    if tc.get("name") in tool_map:
                        valid_tool_calls.append(tc)
                    # Skip invalid/hallucinated tool names silently

            if valid_tool_calls:
                # Reconstruct response with only valid tool calls for message history
                response.tool_calls = valid_tool_calls
                messages.append(response)

                for tc in valid_tool_calls:
                    tool_name = tc["name"]
                    tool_args = tc["args"]

                    # Find tool metadata for display
                    meta = next((m for m in TOOL_METADATA if m["id"] == tool_name), None)
                    display_name = meta["name"] if meta else tool_name
                    icon = meta["icon"] if meta else "🔧"

                    yield _sse("tool_start", tool=tool_name, display_name=display_name, icon=icon, args=tool_args)

                    try:
                        tool_fn = tool_map[tool_name]
                        result = await asyncio.to_thread(tool_fn.invoke, tool_args)
                        result = str(result)
                    except Exception as tool_err:
                        result = f"Tool error: {tool_err}"

                    all_tool_calls.append({"name": tool_name, "args": tool_args})
                    all_tool_results.append({"tool": display_name, "icon": icon, "result": result})

                    yield _sse("tool_result", tool=tool_name, display_name=display_name, icon=icon, result=result)
                    messages.append(ToolMessage(content=result, tool_call_id=tc["id"]))
            else:
                # No (valid) tool calls — emit the response directly
                if response.content:
                    full_response = response.content
                    # Emit in word-chunks for streaming feel
                    words = full_response.split(' ')
                    chunk = ''
                    for i, word in enumerate(words):
                        chunk += (' ' if i > 0 else '') + word
                        if len(chunk) >= 15 or i == len(words) - 1:
                            yield _sse("token", content=chunk)
                            chunk = ''

                    yield _sse("done")
                    return
                else:
                    # Empty response, break to streaming fallback
                    break

        # After tool rounds, stream the final text response
        full_response = ""
        try:
            async for chunk in llm_with_tools.astream(messages):
                if chunk.content:
                    full_response += chunk.content
                    yield _sse("token", content=chunk.content)
        except Exception:
            # Fallback: try without tools
            try:
                async for chunk in llm.astream(messages):
                    if chunk.content:
                        full_response += chunk.content
                        yield _sse("token", content=chunk.content)
            except Exception as stream_err:
                yield _sse("error", content=f"Streaming failed: {stream_err}")
                return

        if not full_response:
            full_response = "I apologize, but I couldn't generate a response. Please try again."
            yield _sse("token", content=full_response)

        yield _sse("done")

    except Exception as e:
        yield _sse("error", content=str(e))
