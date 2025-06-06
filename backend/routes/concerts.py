import json
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from geopy.distance import geodesic

from get_concerts_ticketmaster import query_concert_info_for_one_singer
from api_schema.request_schema import ConcertsRequest
from scheduler import update_concerts_for_top_global_singers
from redis_client import r
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
            #otherwise make a request to ticketmaster
            else:
                response_code, concert_info = query_concert_info_for_one_singer(redis_instance=r, artist_id=artist_id, artist_name=item["artist_name"])
                if concert_info != []:
                    if (response_code == 200):
                            expiration_time = int((3600*24/CONCERT_UPDATE_FREQUENCY_PER_DAY) + 100)
                            r.set(f"most_listened_artists:concert_info:{artist_id}", json.dumps(concert_info), ex=expiration_time)
                    else:
                        return JSONResponse(status_code=400, content="Error when trying to fetch concerts")
            
            #filtering the concerts by provided fields
            #notice that theoretically back-end supports multiple filters (first by country, then by state then by code)
            final_concert_list_with_filters_applied = [item for item in concert_info if 
            concerts_sorting(item, countries=request_model.countries, stateCode=request_model.stateCode, 
            geo_latitude=request_model.geo_latitude, geo_longitude=request_model.geo_longitude)]
            
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

### if we need to flush keys (debug purposes, REMOVE before production)

"""
for key in r.scan_iter("most_listened_artists:concert_info:*"):
    r.delete(key)
    print("Deleted")
"""