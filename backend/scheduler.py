from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import pytz
from datetime import datetime
import json
from redis_client import r
from webscraping import get_info_on_top_singers
from get_concerts_ticketmaster import query_concert_info_for_one_singer

scheduler = AsyncIOScheduler()
scheduler.start()

ARTIST_UPDATE_FREQUENCY_PER_DAY = 4
CONCERT_UPDATE_FREQUENCY_PER_DAY = 6

@scheduler.scheduled_job(
        id="update_concerts_for_top_global_singers",
        trigger=CronTrigger(hour='*', minute='*/30', timezone=pytz.UTC, jitter=0))
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
        if concert_info_list == [] or concert_info_list == {}:
            continue
        
        if response_code == 200:
            #lets say we have 6 concert frequency per day, meaning that we should expire the key in 4 hours.
            #the expiration time = a bit longer than frequency of updates per day, so that we can constantly refresh the keys
            expiration_time = int((3600*24/CONCERT_UPDATE_FREQUENCY_PER_DAY) + 100)
            r.set(f"top_listened_artists:concert_info:{artist_spotify_id}", json.dumps(concert_info_list), ex=expiration_time)
        else:
            print(concert_info_list)
            continue
    print("Finished")

@scheduler.scheduled_job(
    id="update_artist_leaderboard",
    trigger=CronTrigger(hour='*', minute='*', second='*/50', timezone=pytz.UTC, jitter=0)
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
    set_global_artist_ranks_as_separate_keys(top_artist_leaderboard=info_on_top_singers_dicts)

#we need to do sorting by ranks and we need to easily fetch ranks by spotify id's
def set_global_artist_ranks_as_separate_keys(top_artist_leaderboard):
    try:
        for item in top_artist_leaderboard:
            r.hset(f"top_listened_artists:numerical_rankings", item["Spotify ID"], item["Rank"])
        print("It's over")
    except Exception as e:
        print(e)
        
    