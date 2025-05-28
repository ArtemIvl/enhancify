import requests, re, textwrap, difflib
import json
import os
from datetime import datetime, timedelta, timezone
from dateutil.relativedelta import relativedelta
TICKETMASTER_API = os.getenv("TICKETMASTER_API_KEY")
TICKETMASTER_SECRET = os.getenv("TICKETMASTER_SECRET")

print(TICKETMASTER_API)

#it would make sense to start returning concerts a bit more in the future, like in 2 upcoming days. 
# Going to a concert is a big event, it is usually planned in advance
DEFAULT_START_DATE_TIME = (datetime.now(timezone.utc) + timedelta(days=2)).strftime("%Y-%m-%dT%H:%M:%SZ")

#same logic - what's the point of planning a concert more than 2 years in advance
DEFAULT_END_DATE_TIME =  (datetime.now(timezone.utc) + relativedelta(years=2)).strftime("%Y-%m-%dT%H:%M:%SZ")

def query_concert_info_for_one_singer(artist_id = None, params = dict()):
    
    #params - request parameters that we want to see in our reuquest
    #in other words query filters
    #artist_id - spotify id of an artist
    
    if id == None:
        return 400, "Please provide a valid singer ID"
    
    request_params = {}
    
    for k, v in params.items():
        
        #default values are initialized first, so it's possible to override them with values from a dictionary (params)
        request_params["startDateTime"] = DEFAULT_START_DATE_TIME
        request_params["endDateTime"] = DEFAULT_END_DATE_TIME
        #more relevant events come first
        request_params["sort"] = "relevance,desc"
        request_params["classificationName"] = "music" #self-explanatory
        
        #Tomorrow: implement a lookup endpoint for getting attraction id by artists name
        #Every time we loop we search for redis - artists spotidy id is there? we get the attraction id
        #Not? We create a new redis entry
        
        #Think of a fallback mechanism for keyword (a separate query, yes, but how to check if keyword got additional info?)
        #By some unique concert id - compare lists. Is it in previous list? no - add to one big list
        
        
        
        request_params[k] = v

    
    response = requests.get("https://app.ticketmaster.com/discovery/v2/events.json", params=request_params)
    
    if (response.status_code == 200):
        result = []
        return response.status_code, result
    
    else:
        return response.status_code, response.reason
    
    