import json
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from geopy.distance import geodesic
from datetime import datetime
from get_concerts_ticketmaster import query_concert_info_for_one_singer, get_event_price
from api_schema.request_schema import ConcertsRequest, ConcertsBySingerRequest, GetTicketPriceRequest
from scheduler import update_concerts_for_top_global_singers
from redis_client import r
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

CONCERT_UPDATE_FREQUENCY_PER_DAY = 6
router = APIRouter()

@router.post("/get_concerts")
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
            if r.exists(f"most_listened_artists:concert_info:{artist_id}"):
                concert_info = r.get(f"most_listened_artists:concert_info:{artist_id}")
                concert_info = json.loads(concert_info) if concert_info else []
            #if an artist is in top-100, we fetch it directly from cache for faster processing
            elif r.exists(f"top_listened_artists:concert_info:{artist_id}"):
                concert_info = r.get(f"top_listened_artists:concert_info:{artist_id}")
                concert_info = json.loads(concert_info) if concert_info else []
            #otherwise make a request to ticketmaster
            else:
                response_code, concert_info = query_concert_info_for_one_singer(redis_instance=r, artist_id=artist_id, artist_name=item["artist_name"], start_date=request_model.start_date, end_date=request_model.end_date)
                if concert_info != []:
                    if (response_code == 200):
                            expiration_time = int((3600*24/CONCERT_UPDATE_FREQUENCY_PER_DAY) + 100)
                            r.set(f"most_listened_artists:concert_info:{artist_id}", json.dumps(concert_info), ex=expiration_time)
                    else:
                        continue
            #filtering the concerts by provided fields
            #notice that theoretically back-end supports multiple filters (first by country, then by state then by code)
            final_concert_list_with_filters_applied = [item for item in concert_info if 
            concerts_sorting(item, countries=request_model.countries, stateCode=request_model.stateCode, 
            geo_latitude=request_model.geo_latitude, geo_longitude=request_model.geo_longitude, search_radius=request_model.search_area, start_date=request_model.start_date, end_date=request_model.end_date)]
            
            if final_concert_list_with_filters_applied != []:
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
                             geo_latitude=request_model.geo_latitude, geo_longitude=request_model.geo_longitude, search_radius=request_model.search_area, start_date=request_model.start_date, end_date=request_model.end_date)]
            if final_concert_list_with_filters_applied != []:
                final_concert_dict_to_be_used_in_response[artist_id] = final_concert_list_with_filters_applied
    
    return JSONResponse(final_concert_dict_to_be_used_in_response, status_code=200)


@router.get("/get_rankings")
def get_numerical_rankings():
    numerical_rankings = r.hgetall("top_listened_artists:numerical_rankings")      
    return JSONResponse(numerical_rankings, status_code=200)


def concerts_sorting(concert_to_sort_through, countries = [], stateCode = None, geo_latitude = None, geo_longitude = None, search_radius = None, start_date = None, end_date = None):
        #To-do: process more than one venue (if the coordinates/city matches at least one venue)
    try:
        if start_date and end_date:
            date_base = concert_to_sort_through.get("dates", dict()).get("start", None)
            
            actual_concert_start_time = None
            if date_base:
                if date_base.get("dateTime", None):
                    raw_start_time = date_base["dateTime"].replace("Z", "+00:00")
                    actual_concert_start_time = datetime.fromisoformat(raw_start_time)
                    zone_info = concert_to_sort_through.get("dates", dict()).get("timezone", None)
                    if not zone_info:
                        zone_info = "Etc/UTC"
                    raw_start_time = actual_concert_start_time.astimezone(ZoneInfo(zone_info))
                else:
                    if date_base.get("localDate", None):
                        raw_start_time = datetime.fromisoformat(date_base["localDate"])
                        zone_info = concert_to_sort_through.get("dates", dict()).get("timezone", None)
                        if not zone_info:
                            zone_info = "Etc/UTC"
                        actual_concert_start_time = raw_start_time.replace(tzinfo=ZoneInfo(zone_info))
                        date_base["localDate"] = actual_concert_start_time.isoformat(timespec="seconds")
            if actual_concert_start_time:
                if actual_concert_start_time < start_date or actual_concert_start_time > end_date:
                    return False
                
            
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
            
            allowed_distance_threshold_km = search_radius
            if not search_radius:
                allowed_distance_threshold_km = 100
            concert_coords_lat = venue.get("location", dict()).get("latitude", None)
            concert_coords_lng = venue.get("location", dict()).get("longitude", None)
            if concert_coords_lat and concert_coords_lng:
                distance = geodesic((geo_latitude, geo_longitude), (concert_coords_lat, concert_coords_lng)).km
                if distance > allowed_distance_threshold_km:
                    return False
                
            else:
                return False
        
        return True
    except Exception as e:
        return False

    
#save the artist ranks and id's after updating top leaderboard
#separate endpoint and list for storing ranks 
#separate method for retreiving this information
def get_global_artist_rank_by_id(spotify_id = None):
    numerical_rank = r.hget("top_listened_artists:numerical_rankings", spotify_id)
    return numerical_rank

@router.post("/get_concerts_by_singer")
def get_concert_by_singer(request_model: ConcertsBySingerRequest):
    #important!
    #artist_id is artists spotify id
    final_concert_dict_to_be_used_in_response = dict()
    artists_spotify_id = request_model.artist_id
    if r.exists(f"most_listened_artists:concert_info:{artists_spotify_id}"):
            concert_info = r.get(f"most_listened_artists:concert_info:{artists_spotify_id}")
            concert_info = json.loads(concert_info) if concert_info else []
            
            #if an artist is in top-100, we fetch it directly from cache for faster processing
            #otherwise make a request to ticketmaster
    else:
        response_code, concert_info = query_concert_info_for_one_singer(redis_instance=r, artist_id=artists_spotify_id, artist_name=request_model.artists_name, start_date=request_model.start_date, end_date=request_model.end_date)
        if concert_info != [] and concert_info != None and concert_info != {}:
            if (response_code == 200):
                    expiration_time = int((3600*24/CONCERT_UPDATE_FREQUENCY_PER_DAY) + 100)
                    r.set(f"most_listened_artists:concert_info:{artists_spotify_id}", json.dumps(concert_info), ex=expiration_time)
            
            #filtering the concerts by provided fields
            #notice that theoretically back-end supports multiple filters (first by country, then by state then by code)
    final_concert_list_with_filters_applied = [item for item in concert_info if 
    concerts_sorting(item, start_date=request_model.start_date, end_date=request_model.end_date)]
        
    if final_concert_list_with_filters_applied != []:
        final_concert_dict_to_be_used_in_response[artists_spotify_id] = final_concert_list_with_filters_applied
    return JSONResponse(final_concert_dict_to_be_used_in_response, status_code=200)

@router.post("/get_event_ticket_price")
def get_concert_by_singer(request_model: GetTicketPriceRequest):
    #important!
    #artist_id is artists spotify id
    event_id = request_model.event_id
    event_prices = r.hget(f"ticket_prices", event_id)
    info_to_return = {"min_price": "N/A", "max_price": "N/A"}
    if event_prices != 31000000000:
        event_price_retreived = get_event_price(event_id)
        if event_price_retreived:
            info_to_return = event_price_retreived
            r.hset("ticket_prices", event_id, json.dumps(info_to_return))
    else:
        info_to_return = json.loads(event_prices)
    return JSONResponse(info_to_return, 200)
