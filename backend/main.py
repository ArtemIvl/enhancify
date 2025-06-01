from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import pytz
from webscraping import get_info_on_top_singers
import redis
import requests
from datetime import datetime
from fastapi import FastAPI, Request
import time
import json
from fastapi.responses import RedirectResponse, JSONResponse
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from get_concerts_ticketmaster import query_concert_info_for_one_singer, look_up_artists_attraction_id
from api_schema.request_schema import ConcertsRequest
from geopy.distance import geodesic

load_dotenv()

REDIS_HOST = "localhost"
REDIS_PORT = 6379

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

app = FastAPI()

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your React dev URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#make sure to install all requirements from requirements.txt before running the code
#pip install -r requirements.txt

scheduler = AsyncIOScheduler()
ARTIST_UPDATE_FREQUENCY_PER_DAY = 4
CONCERT_UPDATE_FREQUENCY_PER_DAY = 6
scheduler.start()

@scheduler.scheduled_job(
        id="update_artist_leaderboard",
        trigger=CronTrigger(hour='*', minute='*', second='*/10', timezone=pytz.UTC, jitter=0))
def update_artist_leaderboard():
    #average execution time - 1.6 - 2 seconds
    info_on_top_singers = get_info_on_top_singers()

    columns = [
    "Index", "Rank", "Image", "Artist", "Monthly listeners (millions)",
    "Change vs yesterday", "Change vs last month", "Spotify ID",
    "Country", "Genre", "Language", "Group type"
    ]

    info_on_top_singers_dicts = [dict(zip(columns, row)) for row in info_on_top_singers]

    current_date = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    r.set("top_listened_artists:content", json.dumps(info_on_top_singers_dicts))
    r.set("top_listened_artists:last_updated_at", current_date)

@app.get("/login")
def login():
    scopes = "user-read-private user-read-email user-follow-read"
    url = (
        "https://accounts.spotify.com/authorize"
        f"?response_type=code&client_id={SPOTIFY_CLIENT_ID}"
        f"&scope={scopes}&redirect_uri={SPOTIFY_REDIRECT_URI}"
    )
    return RedirectResponse(url)

@app.get("/callback")
def callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        return JSONResponse({"error": "No code provided"}, status_code=400)

    token_url = "https://accounts.spotify.com/api/token"
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "client_id": SPOTIFY_CLIENT_ID,
        "client_secret": SPOTIFY_CLIENT_SECRET,
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    token_res = requests.post(token_url, data=data, headers=headers)
    token_json = token_res.json()
    access_token = token_json.get("access_token")

    if not access_token:
        return JSONResponse({"error": "Failed to get access token"}, status_code=400)

    # Redirect to frontend with token in URL
    return RedirectResponse(f"http://localhost:5173/?token={access_token}")


@app.get("/profile")
def get_me(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    user_res = requests.get("https://api.spotify.com/v1/me", headers=headers)
    if user_res.status_code != 200:
        return JSONResponse({"error": "Failed to fetch user info"}, status_code=400)
    return user_res.json()


@app.get("/followed_artists")
def get_followed_artists(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    url = "https://api.spotify.com/v1/me/following?type=artist&limit=50"
    res = requests.get(url, headers=headers)
    if res.status_code != 200:
        return JSONResponse({"error": "Failed to fetch followed artists"}, status_code=400)
    return res.json()["artists"]["items"]


@app.get("/get_top_artists")
def get_top_artists():
    exec_start = time.time()
    last_updated_at = r.get("top_listened_artists:last_updated_at")
    data_raw = r.get("top_listened_artists:content")
    info_on_top_singers = json.loads(data_raw) if data_raw else []
    exec_end = time.time()
    print(exec_end - exec_start)
    return {"Last updated": last_updated_at, "Top 500": info_on_top_singers}

#RUN THE SERVER (COMMAND)
#uvicorn main:app --reload


##################### CONCERTS
#################################################################

@scheduler.scheduled_job(
        id="update_concerts_for_top_global_singers",
        trigger=CronTrigger(hour='*', minute='*/59', timezone=pytz.UTC, jitter=0))
def update_concerts_for_top_global_singers(n = 100):
    #n - how much top artists we want to select from top 500? (narrowing the scope)
    #if 100 - we select top 100
    top_listened_artists = []
    
    global_artists_in_redis = r.exists("top_listened_artists:content")

    if not global_artists_in_redis:
        columns = [
        "Index", "Rank", "Image", "Artist", "Monthly listeners (millions)",
        "Change vs yesterday", "Change vs last month", "Spotify ID",
        "Country", "Genre", "Language", "Group type"
        ]
        top_listened_artists_raw = get_info_on_top_singers()
        top_listened_artists = [dict(zip(columns, row)) for row in top_listened_artists_raw]
        
    else:
        top_listened_artists = r.get("top_listened_artists:content")
        top_artists_to_list = json.loads(top_listened_artists) if top_listened_artists else []

    #select first n items
    top_artists_to_list = top_artists_to_list[:n]
    #get top n artists
    #get concert info for them
    #overrides redis keys even if we already have concert info stored
    #generally shouldn't happen - expiration time = update frequency
    for artist in top_artists_to_list:
        #artists name needs to be additionally parsed from html, as it comes with an embedded <a></a> element
        artist_name = artist['Artist']
        artist_spotify_id = artist['Spotify ID']
        #returns all concerts for one singer with specified params
        response_code, concert_info_list = query_concert_info_for_one_singer(redis_instance=r, artist_id=artist_spotify_id, artist_name=artist_name)
        #if no concerts for that artist
        if concert_info_list == {}:
            continue
        
            
        if response_code == 200:
            #lets say we have 6 concert frequency per day, meaning that we should expire the key in 4 hours.
            #the expiration time = a bit longer than frequency of updates per day, so that we can constantly refresh the keys
            expiration_time = int((3600*24/CONCERT_UPDATE_FREQUENCY_PER_DAY) + 100)
            r.set(f"top_listened_artists:concert_info:{artist_spotify_id}", json.dumps(concert_info_list), ex=expiration_time)
        else:
            #To-do - log errors to something like graylog
            continue
    print("Finished")
        
@app.get("/")
def goodbye_world():
    return JSONResponse(status_code=200, content={"Hello": "World"})

@app.post("/get_concerts")
def get_concerts(request_model: ConcertsRequest):
    #important!
    #artist_id is artists spotify id
    
    final_concert_dict_to_be_used_in_response = dict()
    #for followed artists
    if not request_model.get_top_artist_info:
        #get artist name and id supplied from frontend
        
        for item in request_model.artists:
            
            concert_info = None
            artist_id = item["artist_id"]
            #if the artist was already queried recently, get from redis directly
            if r.exists(f"top_listened_artists:concert_info:{artist_id}"):
                concert_info = r.get(f"top_listened_artists:concert_info:{artist_id}")
                concert_info = json.loads(concert_info) if concert_info else []
            #otherwise make a request to ticketmaster
            else:
                response_code, concert_info = query_concert_info_for_one_singer(artist_id=artist_id, artist_name=item["artist_name"])
                if (response_code == 200):
                    expiration_time = int((3600*24/CONCERT_UPDATE_FREQUENCY_PER_DAY) + 100)
                    r.set(f"top_listened_artists:concert_info:{artist_id}", json.dumps(concert_info), ex=expiration_time)
                else:
                    return JSONResponse(status_code=400, content="Error when trying to fetch concerts")
            
            #filtering the concerts by provided fields
            #notice that theoretically back-end supports multiple filters (first by country, then by state then by code)
            final_concert_list_with_filters_applied = [item for item in concert_info if 
            concerts_sorting(item, countries=request_model.countries, stateCode=request_model.stateCode, 
            geo_latitude=request_model.geo_latitude, geo_longitude=request_model.geo_longitude)]
            
            final_concert_dict_to_be_used_in_response[artist_id] = final_concert_list_with_filters_applied

        
    #for global artists (default setting)
    else:
        
        #check if global artists were updated (there's at least one artist)
        any_keys_exist = any(r.scan_iter("top_listened_artists:concert_info:*"))
        
        #can take a lot of time to execute, avoid this at all cost
        if not any_keys_exist:
            update_concerts_for_top_global_singers(n=100)
        
        #scan through every global artist, get the info
        for concerts_most_popular in r.scan_iter("top_listened_artists:concert_info:*"):
            artist_id = concerts_most_popular.split("top_listened_artists:concert_info:")[1]
            concert_info_per_artist = r.get(concerts_most_popular)
            concert_info_per_artist = json.loads(concert_info_per_artist) if concert_info_per_artist else []
            final_concert_list_with_filters_applied = [item for item in concert_info_per_artist if 
            concerts_sorting(item, countries=request_model.countries, stateCode=request_model.stateCode, 
                             geo_latitude=request_model.geo_latitude, geo_longitude=request_model.geo_longitude)]
            if final_concert_list_with_filters_applied != []:
                final_concert_dict_to_be_used_in_response[artist_id] = final_concert_list_with_filters_applied

    return JSONResponse(final_concert_dict_to_be_used_in_response, status_code=200)

def concerts_sorting(concert_to_sort_through, countries = [], stateCode = None, geo_latitude = None, geo_longitude = None):
    #To-do: process more than one venue (if the coordinates/city matches at least one venue)
    get_the_venues = concert_to_sort_through.get("_embedded", dict()).get("venues", list())
    venue = None
    if len(get_the_venues) > 0:
        venue = get_the_venues[0]
    else:
        return False
    if (countries != []):
        country_of_concert = venue.get("country", dict()).get("countryCode", None)
        if not country_of_concert in countries:
            return False
    if (stateCode != None):
        state_code_of_concert = venue.get("state", dict()).get("stateCode", None)
        if state_code_of_concert != stateCode:
            return False
    if (geo_latitude != None and geo_longitude != None):
        #the radius in which we search for conerts if coordinates are provided
        allowed_distance_threshold_km = 100
        concert_coords_lat = venue.get("location", dict()).get("latitude", None)
        concert_coords_lng = venue.get("location", dict()).get("longitude", None)
        if concert_coords_lat and concert_coords_lng:
            distance = geodesic((geo_latitude, geo_longitude), (concert_coords_lat, concert_coords_lng)).km
            if distance > allowed_distance_threshold_km:
                return False
            
        else:
            print("not found")
            return False
    
    return True
