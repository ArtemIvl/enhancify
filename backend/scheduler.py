from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
from datetime import datetime
import json
from redis_client import r
from webscraping import get_info_on_top_singers

scheduler = AsyncIOScheduler()
scheduler.start()

@scheduler.scheduled_job(
    id="update_artist_leaderboard",
    trigger=CronTrigger(hour='*', minute='*', second='*/10', timezone=pytz.UTC, jitter=0)
)
def update_artist_leaderboard():
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