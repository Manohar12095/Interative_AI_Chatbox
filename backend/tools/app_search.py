import requests
import urllib.parse
from bs4 import BeautifulSoup
from langchain_core.tools import tool

@tool
def search_app_links(app_name: str) -> str:
    """Search for an app and return its official website, App Store, and Google Play Store links."""
    results = []
    
    # 1. Search iTunes API for App Store link
    try:
        encoded_name = urllib.parse.quote(app_name)
        itunes_url = f"https://itunes.apple.com/search?term={encoded_name}&entity=software&limit=1"
        r = requests.get(itunes_url, timeout=5)
        data = r.json()
        if data.get('results') and len(data['results']) > 0:
            app_store_url = data['results'][0].get('trackViewUrl')
            if app_store_url:
                results.append(f"🍎 App Store (iOS): {app_store_url}")
    except Exception:
        pass
        
    # 2. Search Web for Official Site & Play Store
    try:
        ddg_url = "https://html.duckduckgo.com/html/"
        headers = {"User-Agent": "Mozilla/5.0"}
        
        # Search Play Store
        play_query = f"{app_name} app google play store"
        r_play = requests.post(ddg_url, data={"q": play_query}, headers=headers, timeout=5)
        soup_play = BeautifulSoup(r_play.text, "html.parser")
        for a in soup_play.find_all('a', class_='result__url'):
            link = a['href']
            if "play.google.com/store/apps/details" in link:
                results.append(f"🤖 Google Play Store (Android): {link}")
                break
                
        # Search Official Website
        official_query = f"{app_name} official website app"
        r_off = requests.post(ddg_url, data={"q": official_query}, headers=headers, timeout=5)
        soup_off = BeautifulSoup(r_off.text, "html.parser")
        for a in soup_off.find_all('a', class_='result__url'):
            link = a['href']
            if "play.google.com" not in link and "apple.com" not in link and "wikipedia.org" not in link:
                results.append(f"🌐 Official Website (Possible): {link}")
                break
    except Exception:
        pass
        
    if results:
        return f"📱 Links for '{app_name}':\n" + "\n".join(results)
    else:
        return f"Could not find verified links for app: {app_name}"
