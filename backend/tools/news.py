from pydantic import BaseModel, Field
import requests
import xml.etree.ElementTree as ET
from langchain_core.tools import tool

class GetNewsSchema(BaseModel):
    topic: str = Field(default="world", description="The topic for the get_news tool")

@tool(args_schema=GetNewsSchema)
def get_news(topic: str = "world") -> str:
    """Fetch latest news headlines for any topic."""
    try:
        url = f"https://news.google.com/rss/search?q={topic}&hl=en-US&gl=US&ceid=US:en"
        response = requests.get(url, timeout=10)
        root = ET.fromstring(response.content)
        results = []
        for item in root.findall('.//item')[:6]:
            title = item.find('title').text
            link = item.find('link').text
            pub_date = item.find('pubDate').text
            results.append(f"📰 {title}\n   Published: {pub_date}\n   Source: {link}")
        return "\n\n".join(results) if results else "No news found."
    except Exception as e:
        return f"News error: {e}"
