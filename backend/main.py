from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
from webscraping import get_info_on_top_singers

scheduler = BackgroundScheduler()
ARTIST_UPDATE_FREQUENCY_PER_DAY = 4
@scheduler.scheduled_job(
        id="update_artist_leaderboard",
        trigger=CronTrigger(hour='*', minute='*', second='50', timezone=pytz.UTC, jitter=0))
def update_artist_leaderboard():
    info_on_top_singers = get_info_on_top_singers()
    print(info_on_top_singers[1])

#just a temporary solution till we setup the fastapi server
if __name__ == "__main__":
    scheduler.start()
    try:
        # keep main thread alive
        import time;  time.sleep(1e9)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()