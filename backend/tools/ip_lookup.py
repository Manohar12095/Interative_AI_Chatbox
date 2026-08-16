from pydantic import BaseModel, Field
import requests
from langchain_core.tools import tool

class GetIpInfoSchema(BaseModel):
    ip_address: str = Field(default="", description="The ip_address for the get_ip_info tool")

@tool(args_schema=GetIpInfoSchema)
def get_ip_info(ip_address: str = "") -> str:
    """Get location and ISP info for an IP address (or your own IP if blank)."""
    try:
        url = f"https://ipapi.co/{ip_address}/json/" if ip_address else "https://ipapi.co/json/"
        r = requests.get(url, timeout=8)
        d = r.json()
        return (f"🌐 IP: {d.get('ip')}\n"
                f"Location: {d.get('city')}, {d.get('region')}, {d.get('country_name')}\n"
                f"ISP: {d.get('org')}\n"
                f"Timezone: {d.get('timezone')}")
    except Exception as e:
        return f"IP lookup error: {e}"
