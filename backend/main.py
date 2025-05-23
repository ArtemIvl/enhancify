from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import pytz
from webscraping import get_info_on_top_singers
import redis
from datetime import datetime
from fastapi import FastAPI
import time

REDIS_HOST = "localhost"
REDIS_PORT = 6379

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

app = FastAPI()

#make sure to install all requirements from requirements.txt before running the code
#pip install -r requirements.txt

scheduler = AsyncIOScheduler()
ARTIST_UPDATE_FREQUENCY_PER_DAY = 4
scheduler.start()

@scheduler.scheduled_job(
        id="update_artist_leaderboard",
        trigger=CronTrigger(hour='*', minute='*', second='*/10', timezone=pytz.UTC, jitter=0))
def update_artist_leaderboard():
    #average execution time - 1.6 - 2 seconds
    info_on_top_singers = get_info_on_top_singers()
    current_date = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    r.json().set("top_listened_artists:content", "$", info_on_top_singers)
    r.set("top_listened_artists:last_updated_at", current_date)
    
    # print(info_on_top_singers[1])

@app.get("/get_top_artists")
def get_top_artists():
    exec_start = time.time()
    last_updated_at = r.get("top_listened_artists:last_updated_at")
    info_on_top_singers = r.json().get("top_listened_artists:content", "$")
    exec_end = time.time()
    print(exec_end - exec_start)
    return {"Last updated": last_updated_at, "Top 500": info_on_top_singers}

#RUN THE SERVER (COMMAND)
#uvicorn main:app --reload
