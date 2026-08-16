"""
Persistent Memory Tool — allows the AI to save and recall facts/notes about
the user, their preferences, or projects across sessions.
Data is stored in a local JSON file so it persists without needing a DB call.
"""
import json
import time
from pathlib import Path
from pydantic import BaseModel, Field
from langchain_core.tools import tool
from typing import Optional

try:
    from config import DATA_DIR
    MEMORY_FILE = DATA_DIR / "memory.json"
except Exception:
    MEMORY_FILE = Path(__file__).resolve().parent.parent / "data" / "memory.json"

MEMORY_FILE.parent.mkdir(parents=True, exist_ok=True)


def _load_memory() -> dict:
    if MEMORY_FILE.exists():
        try:
            return json.loads(MEMORY_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}


def _save_memory(data: dict):
    MEMORY_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


class MemoryInput(BaseModel):
    action: str = Field(
        description="Action to perform: 'save' to store a new memory, 'recall' to fetch all memories, 'delete' to remove a specific memory by key."
    )
    key: Optional[str] = Field(
        default=None,
        description="A short identifier/label for the memory (e.g. 'preferred_language', 'project_name'). Required for 'save' and 'delete'."
    )
    value: Optional[str] = Field(
        default=None,
        description="The value/detail to remember (e.g. 'Python', 'Apollo Dashboard'). Required for 'save'."
    )


@tool("memory_manager", args_schema=MemoryInput)
def memory_manager(action: str, key: str = None, value: str = None) -> str:
    """
    Save, recall, or delete persistent memories about the user's preferences, projects, or important facts.
    Use 'save' when the user says 'remember that...', 'note that...', or 'keep in mind...'.
    Use 'recall' when the user asks 'what do you know about me?', 'what do you remember?', or at the start of a conversation to personalize it.
    Use 'delete' when the user says 'forget that...' or 'clear memory about...'.
    """
    try:
        memory = _load_memory()
        action = action.strip().lower()

        if action == "save":
            if not key or not value:
                return "Error: Both 'key' and 'value' are required to save a memory."
            memory[key] = {"value": value, "saved_at": time.strftime("%Y-%m-%d %H:%M")}
            _save_memory(memory)
            return f"✅ Memory saved: **{key}** → {value}"

        elif action == "recall":
            if not memory:
                return "I don't have any memories saved yet. You can ask me to remember things by saying 'Remember that...'"
            lines = ["📝 **Here's what I remember about you:**\n"]
            for k, v in memory.items():
                lines.append(f"- **{k}**: {v['value']} *(saved {v['saved_at']})*")
            return "\n".join(lines)

        elif action == "delete":
            if not key:
                return "Error: Please provide the 'key' of the memory you want to delete."
            if key not in memory:
                return f"No memory found with key: '{key}'"
            del memory[key]
            _save_memory(memory)
            return f"🗑️ Memory deleted: **{key}**"

        else:
            return f"Unknown action: '{action}'. Use 'save', 'recall', or 'delete'."

    except Exception as e:
        return f"Memory error: {str(e)}"
