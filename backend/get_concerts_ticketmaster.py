import requests
import os
from datetime import datetime, timedelta, timezone
from dateutil.relativedelta import relativedelta
import redis
import time
from dotenv import load_dotenv
import unicodedata
from zoneinfo import ZoneInfo

load_dotenv()

#TO-DO implement switching to a backup api key when/if quota is exceeded
TICKETMASTER_API = os.getenv("TICKETMASTER_API_KEY")


#it would make sense to start returning concerts a bit more in the future, like in 2 upcoming days. 
# Going to a concert is a big event, it is usually planned in advance
DEFAULT_START_DATE_TIME = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%SZ")

#same logic - what's the point of planning a concert more than 3 years in advance
DEFAULT_END_DATE_TIME = (datetime.now(timezone.utc) + relativedelta(years=3)).strftime("%Y-%m-%dT%H:%M:%SZ")

def query_concert_info_for_one_singer(redis_instance: redis.Redis, artist_id = None, artist_name = None, start_date = None, end_date = None):
    
    #params - request parameters that we want to see in our reuquest
    #in other words query filters
    #artist_id - spotify id of an artist
    
    if id == None or redis_instance == None or artist_name == None:
        return 400, "Invalid request"
    
    request_params = {}
    debug_num_files = 1
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
        dict_with_dicts_with_dates_and_names = dict()

        for item in final_response:
            try:
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
                
                iso_date_time = item.get("dates", dict()).get("start", dict()).get("dateTime", None)
                zone_info = item.get("_embedded", dict()).get("venues", [])[0].get("timezone", None)
                if iso_date_time and zone_info:
                    raw_start_time = iso_date_time.replace("Z", "+00:00")
                    actual_concert_start_time = datetime.fromisoformat(raw_start_time)
                    raw_start_time = actual_concert_start_time.astimezone(ZoneInfo(zone_info))   
                    item["dates"]["start"]["dateTime"] = raw_start_time.isoformat();   
                else:
                    local_date = item.get("dates", dict()).get("start", dict()).get("localDate", None)
                    local_time = item.get("dates", dict()).get("start", dict()).get("localTime", None)
                    if local_date:
                        if local_time:
                            dt = datetime.strptime(f"{local_date} {local_time}", "%Y-%m-%d %H:%M:%S")
                            dt = dt.replace(tzinfo=ZoneInfo(zone_info))  # assign the correct timezone
                            item["dates"]["start"]["dateTime"] = dt.isoformat()
                        else:
                            item["dates"]["start"]["dateTime"] = local_date
                            
                #updated working principle:
                #for every concert - look if there's a concert with the matching date
                #if yes, compare the names of that date, keep the longest
                #additionally, normalize all names, so that weird characters will be flattened out
                #goal - remove all apostrophe characters, keep all concerts grouped together as much as possible
                #remove all "vip packages" stuff, where there's just duplicate concerts of the same thing
                #example input: {"0": {"date": "name"}}
                #iterate through every item in this dict and compare two things of an iterable item
                #iterable item's date matches with one of the items? 
                #compare the names, whatever the shortest get's erased
                #names for events under plain_string match? Inherit the name of the element in a dictionary
                
                fresh_item_event_name = item["name"]
                fresh_item_event_time = item["dates"]["start"]["dateTime"]
                new_item_marked_to_deletion = False
                new_item_name_changed = False
                for index, dict_with_items in dict_with_dicts_with_dates_and_names.items():
                    if fresh_item_event_time == dict_with_items["date"]:
                        new_items_length = len(fresh_item_event_name)
                        previous_items_length = len(dict_with_items["name"])
                        if previous_items_length > new_items_length:
                            indexes_to_erase.append(index)
                        else:
                            new_item_marked_to_deletion = True
                            indexes_to_erase.append(final_response.index(item))
                        break
                    else:
                        if get_plain_string(fresh_item_event_name) == get_plain_string(dict_with_items["name"]) and not new_item_name_changed:
                            item["name"] = dict_with_items["name"]
                            new_item_name_changed = True
                            
                if not new_item_marked_to_deletion:
                    dict_with_dicts_with_dates_and_names[final_response.index(item)] = {"name": fresh_item_event_name, "date": fresh_item_event_time} 

            except Exception as e:
                continue
                
        final_response = [x for idx, x in enumerate(final_response) if idx not in indexes_to_erase]
        
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
            if artist["name"] == artist_name:
                attraction_id = artist["id"]
                redis.hset("attraction_ids_ticketmaster_v4", artist_spotify_id, attraction_id)
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

def get_event_price(event_id):
    request_url = f"https://app.ticketmaster.com/discovery/v2/events/{event_id}.json?apikey={TICKETMASTER_API}"
    response = requests.get(request_url)
    response_json = response.json()
    if (response.status_code == 200):
        priceRanges = response_json.get("priceRanges", None)
        min_price = "N/A"
        max_price = "N/A"
        if priceRanges:
            min_price = priceRanges[0].get("min", "N/A")
            max_price = priceRanges[0].get("max", "N/A")
        return {"min_price": min_price, "max_price": max_price}
    else:
        print(response.status_code)
    return None
