import requests, re, textwrap, difflib
import json
import os
from datetime import datetime, timedelta, timezone
from dateutil.relativedelta import relativedelta
import redis
import time
from dotenv import load_dotenv
import unicodedata
# from config import TICKETMASTER_API_KEY


load_dotenv()

#TO-DO implement switching to a backup api key when/if quota is exceeded
TICKETMASTER_API = os.getenv("TICKETMASTER_API_KEY")
TICKETMASTER_SECRET = os.getenv("TICKETMASTER_SECRET")


#it would make sense to start returning concerts a bit more in the future, like in 2 upcoming days. 
# Going to a concert is a big event, it is usually planned in advance
DEFAULT_START_DATE_TIME = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%SZ")

DEFAULT_END_DATE_TIME = (datetime.now(timezone.utc) + relativedelta(years=3)).strftime("%Y-%m-%dT%H:%M:%SZ")

#same logic - what's the point of planning a concert more than 2 years in advance
def query_concert_info_for_one_singer(redis_instance: redis.Redis, artist_id = None, artist_name = None, start_date = None, end_date = None):
    
    #params - request parameters that we want to see in our reuquest
    #in other words query filters
    #artist_id - spotify id of an artist
    
    if id == None or redis_instance == None or artist_name == None:
        return 400, "Invalid request"
    
    request_params = {}
    
    #default values are initialized first, so it's possible to override them with values from a dictionary (params)
    request_params["startDateTime"] = DEFAULT_START_DATE_TIME
    #more relevant events come first
    request_params["sort"] = "relevance,desc"
    request_params["classificationName"] = "music" #self-explanatory
    request_params["size"] = "100"
    request_params["apikey"] = TICKETMASTER_API
    request_params["endDateTime"] = DEFAULT_END_DATE_TIME
    #Every time we loop we search for redis - artists spotidy id is there? we get the attraction id
    #Not? We create a new redis entry
    
    #Think of a fallback mechanism for keyword (a separate query, yes, but how to check if keyword got additional info?)
    #By some unique concert id - compare lists. Is it in previous list? no - add to one big list
    request_params["attractionId"] = look_up_artists_attraction_id(redis=redis_instance, artist_name=artist_name, artist_spotify_id=artist_id)
    if (not request_params["attractionId"]):
        return 401, "Attraction id not found"
        
    start = time.time()
    response = requests.get("https://app.ticketmaster.com/discovery/v2/events.json", params=request_params)
    end = time.time()
    #we can afford one request every 280 ms to avoid errors from ticketmaster API related to spike rate 
    if (end - start) < 0.33:
        time.sleep(0.33 - (end - start))
    
    
    response_filtered = response.json()

    #if there were not concerts
    if response_filtered.get("_embedded", None) == None:
        #return an empty dict
        return response.status_code, {}

    if (response.status_code == 200):
        final_response = response_filtered["_embedded"]["events"]
        indexes_to_erase = []
        #key - concert name
        #value - index
        unique_concert_names = dict()
        for item in final_response:
            
            #Iterate through every concert item
            #Group all items that start and end at the same time
            #Compare this items together - only keep an item with the shortest name in string
            item.pop("seatmap", None)
            item.pop("promoters", None)
            item.pop("promoter", None)
            item.pop("info", None)
            item.pop("ticketing", None)
            item.pop("_links", None)
            item.pop("products", None)
            item.pop("images", None)
            if (get_plain_string(item["name"]) in unique_concert_names.keys()):
                item_to_compare_with = final_response[unique_concert_names[get_plain_string(item["name"])]]
                if ((item_to_compare_with.get("dates", dict()).get("start", dict()).get("dateTime", None) and item.get("dates", dict()).get("start", dict()).get("dateTime", None))
                    and item_to_compare_with.get("dates", dict()).get("start", dict()).get("dateTime", None) == item.get("dates", dict()).get("start", dict()).get("dateTime", None)):
                    length_first = len(item_to_compare_with["dates"]["start"]["dateTime"])
                    length_second = len(item["dates"]["start"]["dateTime"])
                    index_to_erase = unique_concert_names[get_plain_string(item["name"])] if length_first > length_second else final_response.index(item)
                    indexes_to_erase.append(index_to_erase)
                else:
                    item["name"] = item_to_compare_with["name"]
            else:
                unique_concert_names[get_plain_string(item["name"])] = final_response.index(item)
                
        for element in indexes_to_erase:
            del final_response[element]
        return response.status_code, final_response
    else:
        return 401, response["fault"]
    
#this method is a one-time ops - one we have artists attraction id we don't have to update it
def look_up_artists_attraction_id(redis: redis.Redis, artist_name = None, artist_spotify_id = None):
    #to search by artist on ticketmaster, we need to get artists id
    #artists id != spotify id
    attraction_id = redis.hget("attraction_ids_ticketmaster_v4", artist_spotify_id)
    if (attraction_id == None):
        
        request_parameters = {}
        request_parameters["apikey"] = TICKETMASTER_API
        #we search by artists name
        request_parameters["keyword"] = artist_name
        
        request_url = "https://app.ticketmaster.com/discovery/v2/attractions.json"
        time.sleep(0.3)
        response = requests.get(request_url, params=request_parameters)  
        # wait 600ms before next request - ticketmaster api has limits on amount of requests per second
        data = response.json()
        if (data.get("_embedded", None)):
            retreived_people = data["_embedded"]["attractions"]
        else:
            return None
        #search from all matched artists in ticketmaster
        for artist in retreived_people:
            #if the name matches ideally (character by character)
            #then this is our artist
            if (artist["name"]) == artist_name:
                attraction_id = artist["id"]
                redis.hset("attraction_ids_ticketmaster_v3", artist_spotify_id, attraction_id)
                break
            #otherwise we try to find spotify id
            #the spotify id is nested deeply inside the response
            external_links = artist.get("externalLinks", dict())
            spotify_link = external_links.get("spotify", None)
            if spotify_link:
                artist_url_raw = spotify_link[0].get("url", None)
                if artist_url_raw and "/artist/" in artist_url_raw:
                    extracted_id = artist_url_raw.split("/artist/")[1].split("?")[0]
                    #if we find spotify id, we save artists attraction id
                    if (extracted_id == artist_spotify_id):
                        attraction_id = artist["id"]
                        redis.hset("attraction_ids_ticketmaster_v4", artist_spotify_id, attraction_id)
                        break
                
    return attraction_id

def get_plain_string(text: str) -> str:
    """
    Convert text to lowercase, strip diacritics, and remove all characters
    except a–z and 0–9.
    """
    # 1. lowercase
    lower = text.lower()
    # 2. decompose accents and remove combining marks
    decomposed = unicodedata.normalize("NFKD", lower)
    stripped = "".join(ch for ch in decomposed if not unicodedata.combining(ch))
    # 3. keep only alphanumeric characters (a–z, 0–9)
    plain = "".join(ch for ch in stripped if ch.isalnum())
    return plain