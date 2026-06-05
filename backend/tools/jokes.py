import requests
from langchain_core.tools import tool

@tool
def get_joke_or_trivia(category: str = "general") -> str:
    """Get a random joke or fun trivia fact. Categories: programming, science, math, general."""
    try:
        r = requests.get("https://official-joke-api.appspot.com/random_joke", timeout=5)
        if r.status_code == 200:
            j = r.json()
            return f"😄 {j['setup']}\n\n👉 {j['punchline']}"
        return "Why do programmers prefer dark mode? Because light attracts bugs! 😄"
    except:
        return "Why did the AI go to school? To improve its learning rate! 🤖"
