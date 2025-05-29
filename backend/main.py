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
from get_concerts_ticketmaster import query_concert_info_for_one_singer

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
        
    print(info_on_top_singers[1])


@scheduler.scheduled_job(
        id="update_artist_leaderboard",
        trigger=CronTrigger(hour='*', minute='*', second='*/10', timezone=pytz.UTC, jitter=0))
def update_concerts_for_top_global_singers(n = 100):
    #n - how much top artists we want to select from top 500? (narrowing the scope)
    #if 100 - we select top 100
    top_listened_artists = []
    
    global_artists_in_redis = r.exists("top_listened_artists:content")
    
    #not a very good implementation Artem
    #we can't find a field by name
    #better use dict with dicts, not dict with lists
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

    #select first n items
    top_listened_artists = top_listened_artists[:n]
    
    #get top n artists
    #get concert info for them
    #overrides redis keys even if we already have concert info stored
    #generally shouldn't happen - expiration time = update frequency
    for artist in top_listened_artists:
        #if something breaks, this might be a problem
        artist_name = artist[3]
        artist_spotify_id = artist[8]
        #returns all concerts for one singer with specified params
        concert_info_list = query_concert_info_for_one_singer(artist_id=artist_spotify_id, artist_name=artist_name)
        #lets say we have 6 concert frequency per day, meaning that we should expire the key in 4 hours.
        #the expiration time = a bit longer than frequency of updates per day, so that we can constantly refresh the keys
        r.set(f"top_listened_artists:concert_info:{artist_spotify_id}", concert_info_list, ex=(3600*24/CONCERT_UPDATE_FREQUENCY_PER_DAY) + 100)
        
        

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
