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
        trigger=CronTrigger(hour='*', minute='*', second='*/59', timezone=pytz.UTC, jitter=0))
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
        concert_info_list = query_concert_info_for_one_singer(redis_instance=r, artist_id=artist_spotify_id, artist_name=artist_name)
        break
        #lets say we have 6 concert frequency per day, meaning that we should expire the key in 4 hours.
        #the expiration time = a bit longer than frequency of updates per day, so that we can constantly refresh the keys
        expiration_time = int((3600*24/CONCERT_UPDATE_FREQUENCY_PER_DAY) + 100)
        r.set(f"top_listened_artists:concert_info:{artist_spotify_id}", json.dumps(concert_info_list), ex=expiration_time)
        

@app.get("/get_concerts")
def get_concerts(request_model: ConcertsRequest):
    
    retreived_concert_info = []
    #for followed artists
    if not request_model.get_top_artist_info:
        #get artist name and id supplied from frontend
        
        for item in request_model.artists:
            
            concert_info = None
            artist_id = item["artist_id"]
            #if the artist was already queried recently, get from redis directly
            if r.exists(f"top_listened_artists:concert_info:{artist_id}"):
                concert_info = r.get(f"top_listened_artists:concert_info:{artist_id}")
            #otherwise make a request to ticketmaster
            else:
                concert_info = query_concert_info_for_one_singer(artist_id=item["artist_id"], artist_name=item["artist_name"])
                r.set(f"top_listened_artists:concert_info:{artist_id}", concert_info, ex=(3600*24/CONCERT_UPDATE_FREQUENCY_PER_DAY) + 100)

            #filtering the concerts by provided fields
            #notice that theoretically back-end supports multiple filters (first by country, then by state then by code)
            if (request_model.countries != []):
                concert_info = concert_info
            if (request_model.stateCode != None):
                concert_info = concert_info
            if (request_model.geo_latitude != None and request_model.geo_longtitude != None):
                concert_info = concert_info
            retreived_concert_info.append(concert_info)
        
    #for global artists (default setting)
    else:
        
        #check if global artists were updated (there's at least one artist)
        any_keys_exist = any(r.scan_iter("top_listened_artists:concert_info:*"))
        
        #can take a lot of time to execute, avoid this at all cost
        if not any_keys_exist:
            update_concerts_for_top_global_singers(n=100)
        
        #scan through every global artist, get the info
        for concerts_most_popular in r.scan_iter("top_listened_artists:concert_info:*"):
            concert_info_per_artist = r.get(concerts_most_popular)
            if (request_model.countries != []):
                concert_info = concert_info
            if (request_model.stateCode != None):
                concert_info = concert_info
            if (request_model.geo_latitude != None and request_model.geo_longtitude != None):
                concert_info = concert_info
            retreived_concert_info.append(concert_info_per_artist)
    
    return JSONResponse({"concerts": retreived_concert_info, "is_followed": request_model.get_top_artist_info}, status_code=200)
