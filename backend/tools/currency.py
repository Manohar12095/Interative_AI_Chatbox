import requests
from langchain_core.tools import tool

@tool
def convert_currency(amount: float, from_currency: str, to_currency: str) -> str:
    """Convert between currencies using live exchange rates."""
    try:
        url = f"https://api.exchangerate-api.com/v4/latest/{from_currency.upper()}"
        r = requests.get(url, timeout=8)
        data = r.json()
        rate = data['rates'].get(to_currency.upper())
        if rate:
            converted = round(amount * rate, 4)
            return f"{amount} {from_currency.upper()} = {converted} {to_currency.upper()}"
        return f"Currency {to_currency} not found."
    except Exception as e:
        return f"Currency error: {e}"
