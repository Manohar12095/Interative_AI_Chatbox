from pydantic import BaseModel, Field
import urllib.parse
from langchain_core.tools import tool

class GetMapsLocationSchema(BaseModel):
    address: str = Field(..., description="The address for the get_maps_location tool")

@tool(args_schema=GetMapsLocationSchema)
def get_maps_location(address: str) -> str:
    """Get a direct Google Maps URL for any specific address or location."""
    import json
    try:
        encoded_address = urllib.parse.quote(address)
        maps_url = f"https://www.google.com/maps/search/?api=1&query={encoded_address}"
        payload = {
            "type": "location",
            "name": address,
            "map_url": maps_url,
            "text": f"🗺️ Location found for '{address}':\nGoogle Maps Link: {maps_url}"
        }
        return json.dumps(payload)
    except Exception as e:
        return json.dumps({"type": "error", "text": f"Maps error: {e}"})
