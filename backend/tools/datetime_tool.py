from pydantic import BaseModel, Field
import datetime
from langchain_core.tools import tool

class GetDatetimeSchema(BaseModel):
    timezone: str = Field(default="UTC", description="The timezone for the get_datetime tool")

@tool(args_schema=GetDatetimeSchema)
def get_datetime(timezone: str = "UTC") -> str:
    """Get current date and time for any timezone."""
    try:
        import pytz
        tz = pytz.timezone(timezone)
        now = datetime.datetime.now(tz)
        return (f"🕐 Current time in {timezone}:\n"
                f"{now.strftime('%A, %B %d %Y — %I:%M:%S %p')}")
    except Exception as e:
        now = datetime.datetime.utcnow()
        return f"UTC time: {now.strftime('%A, %B %d %Y — %H:%M:%S')}"
