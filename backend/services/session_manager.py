"""
Session Manager — JSON-file-based session persistence.
"""
import json
import uuid
from pathlib import Path
from datetime import datetime
from config import SESSIONS_DIR


def _session_path(session_id: str) -> Path:
    return SESSIONS_DIR / f"{session_id}.json"


def _default_session(session_id: str, name: str = "New Chat") -> dict:
    now = datetime.utcnow().isoformat() + "Z"
    return {
        "id": session_id,
        "name": name,
        "created_at": now,
        "updated_at": now,
        "messages": [],
        "enabled_tools": [
            "get_weather", "web_search", "get_news", "calculator",
            "wikipedia_search", "convert_currency", "get_stock_price",
            "generate_qr_code", "get_datetime", "translate_text",
            "get_joke_or_trivia", "explain_code", "summarise_text",
            "define_word", "get_ip_info"
        ]
    }


def load_session(session_id: str) -> dict:
    path = _session_path(session_id)
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    session = _default_session(session_id)
    save_session(session)
    return session


def save_session(session: dict):
    session["updated_at"] = datetime.utcnow().isoformat() + "Z"
    path = _session_path(session["id"])
    with open(path, "w", encoding="utf-8") as f:
        json.dump(session, f, indent=2, ensure_ascii=False)


def create_session(name: str = "New Chat") -> dict:
    session_id = str(uuid.uuid4())
    session = _default_session(session_id, name)
    save_session(session)
    return session


def list_sessions() -> list[dict]:
    sessions = []
    for p in SESSIONS_DIR.glob("*.json"):
        try:
            with open(p, "r", encoding="utf-8") as f:
                s = json.load(f)
            sessions.append({
                "id": s["id"],
                "name": s.get("name", "Untitled"),
                "created_at": s.get("created_at", ""),
                "updated_at": s.get("updated_at", ""),
                "message_count": len(s.get("messages", []))
            })
        except:
            pass
    sessions.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
    return sessions


def delete_session(session_id: str) -> bool:
    path = _session_path(session_id)
    if path.exists():
        path.unlink()
        return True
    return False


def rename_session(session_id: str, new_name: str) -> dict | None:
    session = load_session(session_id)
    if session:
        session["name"] = new_name
        save_session(session)
        return session
    return None


def add_message(session_id: str, role: str, content: str,
                tool_calls: list = None, tool_results: list = None):
    session = load_session(session_id)
    session["messages"].append({
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "tool_calls": tool_calls or [],
        "tool_results": tool_results or []
    })
    save_session(session)


def get_messages(session_id: str) -> list[dict]:
    session = load_session(session_id)
    return session.get("messages", [])


def clear_messages(session_id: str):
    session = load_session(session_id)
    session["messages"] = []
    save_session(session)


def export_session(session_id: str, fmt: str = "txt",
                   include_timestamps: bool = True,
                   include_tool_results: bool = True) -> str:
    session = load_session(session_id)
    lines = [f"# {session.get('name', 'Chat Export')}\n"]

    for msg in session.get("messages", []):
        role = "You" if msg["role"] == "user" else "APEX"
        prefix = ""
        if include_timestamps and msg.get("timestamp"):
            prefix = f"[{msg['timestamp'][:19]}] "
        lines.append(f"{prefix}{role}: {msg['content']}\n")

        if include_tool_results and msg.get("tool_results"):
            for tr in msg["tool_results"]:
                lines.append(f"  🔧 {tr.get('tool', 'Tool')}: {tr.get('result', '')}\n")

    if fmt == "md":
        return "\n".join(lines)
    else:
        # Plain text - strip markdown
        text = "\n".join(lines)
        return text
