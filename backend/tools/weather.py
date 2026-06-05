import requests
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """Get current real-time weather for any city worldwide."""
    try:
        url = f"https://wttr.in/{city}?format=j1"
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            data = r.json()
            current = data.get("current_condition", [{}])[0]
            temp_c = current.get("temp_C", "N/A")
            temp_f = current.get("temp_F", "N/A")
            desc = current.get("weatherDesc", [{}])[0].get("value", "N/A")
            humidity = current.get("humidity", "N/A")
            wind = current.get("windspeedKmph", "N/A")
            feels = current.get("FeelsLikeC", "N/A")
            return (
                f'{{"city":"{city}","temp_c":"{temp_c}","temp_f":"{temp_f}",'
                f'"condition":"{desc}","humidity":"{humidity}%",'
                f'"wind":"{wind} km/h","feels_like":"{feels}°C"}}'
            )
        url2 = f"https://wttr.in/{city}?format=4"
        r2 = requests.get(url2, timeout=10)
        return r2.text if r2.status_code == 200 else f"Could not get weather for {city}"
    except Exception as e:
        return f"Weather error: {e}"
