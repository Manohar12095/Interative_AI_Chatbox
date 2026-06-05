import requests
from langchain_core.tools import tool

@tool
def crypto_price(coin_name: str) -> str:
    """Get the live price, 24h change, and market cap for any cryptocurrency (e.g. bitcoin, ethereum)."""
    try:
        coin_id = coin_name.lower().replace(" ", "-")
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true"
        r = requests.get(url, timeout=10)
        data = r.json()
        
        if not data or coin_id not in data:
            # Fallback search for ID
            search_url = f"https://api.coingecko.com/api/v3/search?query={coin_id}"
            search_r = requests.get(search_url, timeout=10)
            search_data = search_r.json()
            if search_data.get('coins') and len(search_data['coins']) > 0:
                coin_id = search_data['coins'][0]['id']
                r = requests.get(f"https://api.coingecko.com/api/v3/simple/price?ids={coin_id}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true", timeout=10)
                data = r.json()
            else:
                return f"Could not find live price for cryptocurrency: {coin_name}"
        
        coin_data = data[coin_id]
        price = coin_data.get('usd', 'N/A')
        change = round(coin_data.get('usd_24h_change', 0), 2)
        mcap = coin_data.get('usd_market_cap', 0)
        
        mcap_formatted = f"${mcap:,.0f}" if mcap else "N/A"
        
        if isinstance(price, (int, float)):
            price_str = f"${price:,.2f}"
        else:
            price_str = str(price)
            
        return (f"💰 {coin_id.title()} — {price_str}\n"
                f"24h Change: {change}%\n"
                f"Market Cap: {mcap_formatted}")
    except Exception as e:
        return f"Crypto Tracker error: {e}"
