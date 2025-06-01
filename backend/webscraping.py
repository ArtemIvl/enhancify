import requests, re, textwrap, difflib
from bs4 import BeautifulSoup
import json

def get_info_on_top_singers():
    #make an initial webscraping request to a website
    URL = "https://chartmasters.org/most-monthly-listeners-on-spotify/"

    #endpoint that website uses to get the information about artists
    AJAX  = ("https://chartmasters.org/wp-admin/admin-ajax.php"
            "?action=get_wdtable&table_id=74")

    #request headers (for cleanliness)
    headers = {"User-Agent": "Mozilla/5.0", "Accept": "text/html"}

    resp = requests.get(URL, headers=headers, timeout=15)
    html = resp.text

    #find nonce using beautifulsoup webscraper
    #nonce is like a safety keyword, generated once every 12 hours
    #we find the nonce by searching the website
    nonce = (BeautifulSoup(html, "lxml")
            .find("input", id="wdtNonceFrontendServerSide_74")["value"])
    
    #mimic the payload of the request that retreives singers
    payload = {
        "draw":"1", "start":"0", "length":"-1",
        "order[0][column]":"4", "order[0][dir]":"desc",
        "wdtNonce": nonce,
        "sRangeSeparator":"|"
    }

    data = requests.post(AJAX, data=payload,
                        timeout=15).json()["data"]
    data = [extract_artist_name(item) for item in data]
    return(data) 

#debugging purposes
# info = get_info_on_top_singers()[1]
# print(info)

#extra script for removing html elements from artists name
def extract_artist_name(item):
    s = item[3]
    if '<a ' in s and '</a>' in s:  # crude HTML check
        try:
            # Try BeautifulSoup first (robust)
            soup = BeautifulSoup(s, "html.parser")
            item[3] = soup.a.text.strip()
        except Exception:
            # fallback to regex if something goes wrong
            match = re.search(r'>(.*?)</a>', s)
            item[3] = match.group(1).strip() if match else s.strip()
    else:
        item[3] = s.strip()
    return item