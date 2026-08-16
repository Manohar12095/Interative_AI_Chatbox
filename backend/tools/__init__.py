"""
APEX Tools Package
All tools available to the AI agent.
"""
from .weather import get_weather
from .search import web_search, brave_search
from .news import get_news
from .calculator import calculator
from .wikipedia_tool import wikipedia_search
from .currency import convert_currency
from .stocks import get_stock_price
from .qrcode_tool import generate_qr_code
from .datetime_tool import get_datetime
from .translator import translate_text
from .jokes import get_joke_or_trivia
from .code_explainer import explain_code
from .summariser import summarise_text
from .dictionary import define_word
from .ip_lookup import get_ip_info
from .crypto import crypto_price
from .gmaps import get_maps_location
from .app_search import search_app_links
from .pdf_tool import generate_pdf
from .webpage_reader import read_webpage
from .chart_tool import generate_chart
from .youtube_tool import youtube_summarizer
from .memory_tool import memory_manager
from .code_exec import run_python
from .tts_tool import text_to_speech

ALL_TOOLS = [
    get_weather, web_search, brave_search, get_news, calculator, wikipedia_search,
    convert_currency, get_stock_price, generate_qr_code, get_datetime,
    translate_text, get_joke_or_trivia, explain_code, summarise_text,
    define_word, get_ip_info, crypto_price, get_maps_location, search_app_links,
    generate_pdf, read_webpage, generate_chart, youtube_summarizer, memory_manager, run_python, text_to_speech
]

TOOL_METADATA = [
    {"id": "get_weather", "name": "Weather", "icon": "🌦", "description": "Get real-time weather for any city", "category": "info"},
    {"id": "web_search", "name": "Web Search", "icon": "🔍", "description": "Search the internet for any topic", "category": "search"},
    {"id": "brave_search", "name": "Brave Search", "icon": "🦁", "description": "Search the web using Brave Search", "category": "search"},
    {"id": "get_news", "name": "News", "icon": "📰", "description": "Fetch latest news headlines", "category": "search"},
    {"id": "calculator", "name": "Calculator", "icon": "🧮", "description": "Evaluate math, algebra, calculus", "category": "utility"},
    {"id": "wikipedia_search", "name": "Wikipedia", "icon": "🌐", "description": "Get Wikipedia article summaries", "category": "search"},
    {"id": "convert_currency", "name": "Currency", "icon": "💱", "description": "Convert between currencies", "category": "utility"},
    {"id": "get_stock_price", "name": "Stocks", "icon": "📈", "description": "Get real-time stock prices", "category": "info"},
    {"id": "generate_qr_code", "name": "QR Code", "icon": "📌", "description": "Generate QR codes for any data", "category": "utility"},
    {"id": "get_datetime", "name": "DateTime", "icon": "🕐", "description": "Get time in any timezone", "category": "utility"},
    {"id": "translate_text", "name": "Translator", "icon": "🌐", "description": "Translate text to any language", "category": "utility"},
    {"id": "get_joke_or_trivia", "name": "Jokes", "icon": "😄", "description": "Get random jokes and trivia", "category": "fun"},
    {"id": "explain_code", "name": "Code Explainer", "icon": "💻", "description": "Explain code and find bugs", "category": "dev"},
    {"id": "summarise_text", "name": "Summariser", "icon": "📝", "description": "Summarise long text content", "category": "utility"},
    {"id": "define_word", "name": "Dictionary", "icon": "📚", "description": "Get word definitions and synonyms", "category": "info"},
    {"id": "get_ip_info", "name": "IP Lookup", "icon": "🌐", "description": "Get location info for an IP address", "category": "info"},
    {"id": "crypto_price", "name": "Crypto Tracker", "icon": "💰", "description": "Live cryptocurrency prices and stats", "category": "info"},
    {"id": "get_maps_location", "name": "Maps", "icon": "🗺️", "description": "Get direct Google Maps link for addresses", "category": "utility"},
    {"id": "search_app_links", "name": "App Search", "icon": "📱", "description": "Find app store links and official websites", "category": "search"},
    {"id": "generate_pdf", "name": "PDF Generator", "icon": "📄", "description": "Generate downloadable PDF documents", "category": "utility"},
    {"id": "read_webpage", "name": "Webpage Reader", "icon": "🌍", "description": "Read and summarize any URL or article", "category": "search"},
    {"id": "generate_chart", "name": "Chart Generator", "icon": "📊", "description": "Create bar, pie, line, radar charts from data", "category": "utility"},
    {"id": "youtube_summarizer", "name": "YouTube Summarizer", "icon": "📺", "description": "Summarize any YouTube video from its URL", "category": "search"},
    {"id": "memory_manager", "name": "Memory", "icon": "🧠", "description": "Remember and recall facts about you across sessions", "category": "utility"},
    {"id": "run_python", "name": "Python Sandbox", "icon": "🐍", "description": "Execute Python code to solve math, data tasks, and more", "category": "dev"},
    {"id": "text_to_speech", "name": "Text-to-Speech", "icon": "🗣️", "description": "Convert text into a downloadable audio file", "category": "utility"},
]
