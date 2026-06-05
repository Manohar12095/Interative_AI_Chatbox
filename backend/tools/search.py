import requests
from bs4 import BeautifulSoup
from langchain_core.tools import tool

@tool
def web_search(query: str) -> str:
    """Search the internet for any topic and return top results."""
    try:
        url = "https://html.duckduckgo.com/html/"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        response = requests.post(url, data={"q": query}, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")
        results = []
        
        for a in soup.find_all('a', class_='result__url')[:5]:
            title = a.text.strip()
            link = a['href']
            snippet_elem = a.find_next('a', class_='result__snippet')
            snippet = snippet_elem.text.strip() if snippet_elem else ""
            results.append(f"• {title}\n  {snippet}\n  URL: {link}")
            
        return "\n\n".join(results) if results else "No results found."
    except Exception as e:
        return f"Search error: {e}"
