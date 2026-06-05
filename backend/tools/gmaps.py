import urllib.parse
from langchain_core.tools import tool

@tool
def get_maps_location(address: str) -> str:
    """Get a direct Google Maps URL for any specific address or location."""
    try:
        encoded_address = urllib.parse.quote(address)
        maps_url = f"https://www.google.com/maps/search/?api=1&query={encoded_address}"
        return f"🗺️ Location found for '{address}':\nGoogle Maps Link: {maps_url}"
    except Exception as e:
        return f"Maps error: {e}"
