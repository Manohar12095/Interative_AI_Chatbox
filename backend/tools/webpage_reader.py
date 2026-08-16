"""
Webpage Reader Tool — fetches and extracts clean text from any URL.
Uses requests + BeautifulSoup to strip tags and return readable content.
"""
import requests
from bs4 import BeautifulSoup
from pydantic import BaseModel, Field
from langchain_core.tools import tool


class WebpageInput(BaseModel):
    url: str = Field(description="The full URL of the webpage to read and extract text from.")


@tool("read_webpage", args_schema=WebpageInput)
def read_webpage(url: str) -> str:
    """
    Fetch and extract readable text content from any webpage URL.
    Use this when the user asks to read, summarize, or analyze a specific URL/link/article.
    Returns the cleaned text content of the page so you can answer questions about it.
    """
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                          "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        }
        resp = requests.get(url, headers=headers, timeout=15)
        resp.raise_for_status()

        soup = BeautifulSoup(resp.text, "html.parser")

        # Remove script, style, nav, footer, ads
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "form", "iframe"]):
            tag.decompose()

        # Try main content areas first
        main = soup.find("main") or soup.find("article") or soup.find(id="content") or soup.find(class_="content")
        target = main if main else soup.body

        if not target:
            return "Could not extract content from the page."

        # Extract text
        lines = [line.strip() for line in target.get_text(separator="\n").splitlines() if line.strip()]
        text = "\n".join(lines)

        # Limit to ~8000 chars to keep tokens manageable
        if len(text) > 8000:
            text = text[:8000] + "\n\n[Content truncated — page is very long]"

        page_title = soup.title.string.strip() if soup.title and soup.title.string else url
        return f"**Page:** {page_title}\n**URL:** {url}\n\n---\n\n{text}"

    except requests.exceptions.Timeout:
        return f"Error: The request to '{url}' timed out. The site may be slow or unreachable."
    except requests.exceptions.HTTPError as e:
        return f"Error: HTTP {e.response.status_code} when accessing '{url}'."
    except Exception as e:
        return f"Error reading webpage: {str(e)}"
