import requests
from langchain_core.tools import tool

@tool
def define_word(word: str) -> str:
    """Get the definition, synonyms, and usage of any English word."""
    try:
        r = requests.get(f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}", timeout=8)
        if r.status_code == 200:
            data = r.json()[0]
            meanings = data.get('meanings', [])
            result = [f"📚 {word.upper()}"]
            for m in meanings[:2]:
                result.append(f"\n[{m['partOfSpeech']}]")
                for d in m['definitions'][:2]:
                    result.append(f"  • {d['definition']}")
                    if d.get('example'):
                        result.append(f'    Example: "{d["example"]}"')
            return "\n".join(result)
        return f"Definition not found for '{word}'"
    except Exception as e:
        return f"Dictionary error: {e}"
