import requests
from langchain_core.tools import tool

@tool
def get_stock_price(symbol: str) -> str:
    """Get current stock price and basic info for any ticker symbol."""
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol.upper()}?range=1d&interval=1d"
        headers = {"User-Agent": "Mozilla/5.0"}
        r = requests.get(url, headers=headers, timeout=10)
        data = r.json()
        meta = data['chart']['result'][0]['meta']
        price = meta.get('regularMarketPrice', 'N/A')
        prev = meta.get('previousClose', 'N/A')
        change = round(float(price) - float(prev), 2) if price != 'N/A' else 'N/A'
        pct = round((change / float(prev)) * 100, 2) if prev != 'N/A' else 'N/A'
        return (f"📈 {symbol.upper()} — ${price}\n"
                f"Change: {change} ({pct}%)\n"
                f"Prev close: ${prev}")
    except Exception as e:
        return f"Stock error: {e}"
