from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
from webscraping import get_info_on_top_singers
import redis
from datetime import datetime

REDIS_HOST = "localhost"
REDIS_PORT = 6379

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)

scheduler = BackgroundScheduler()
ARTIST_UPDATE_FREQUENCY_PER_DAY = 4

@scheduler.scheduled_job(
        id="update_artist_leaderboard",
        trigger=CronTrigger(hour='*', minute='*', second='*/10', timezone=pytz.UTC, jitter=0))

def update_artist_leaderboard():
    #average execution time - 1.6 - 2 seconds
    info_on_top_singers = get_info_on_top_singers()
    current_date = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    r.json().set("top_listened_artists:content", "$", info_on_top_singers)
    r.set("top_listened_artists:last_updated_at", current_date)
    #to-do: write received information to redis
    #measure the execution time
    # print(info_on_top_singers[1])

#just a temporary solution till we setup the fastapi server
if __name__ == "__main__":
    scheduler.start()
    try:
        # keep main thread alive
        import time;  time.sleep(1e9)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()