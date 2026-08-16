from pydantic import BaseModel, Field
import requests
from langchain_core.tools import tool

class ConvertCurrencySchema(BaseModel):
    amount: float = Field(..., description="The amount for the convert_currency tool")
    from_currency: str = Field(..., description="The from_currency for the convert_currency tool")
    to_currency: str = Field(..., description="The to_currency for the convert_currency tool")

@tool(args_schema=ConvertCurrencySchema)
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
