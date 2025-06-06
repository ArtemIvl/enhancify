import json
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from geopy.distance import geodesic

from get_concerts_ticketmaster import query_concert_info_for_one_singer
from api_schema.request_schema import ConcertsRequest
from scheduler import update_concerts_for_top_global_singers

import redis
r = redis.Redis()

CONCERT_UPDATE_FREQUENCY_PER_DAY = 6
router = APIRouter()

@router.post("/get_concerts")
def get_concerts(request_model: ConcertsRequest):
    final_concert_dict = {}

    if not request_model.get_top_artist_info:
        for item in request_model.artists:
            artist_id = item["artist_id"]
            concert_info = None

            cache_key = f"top_listened_artists:concert_info:{artist_id}"
            if r.exists(cache_key):
                concert_info = json.loads(r.get(cache_key) or "[]")
            else:
                response_code, concert_info = query_concert_info_for_one_singer(
                    artist_id=artist_id, artist_name=item["artist_name"]
                )
                if response_code == 200:
                    expiration_time = int((3600 * 24 / CONCERT_UPDATE_FREQUENCY_PER_DAY) + 100)
                    r.set(cache_key, json.dumps(concert_info), ex=expiration_time)
                else:
                    return JSONResponse(status_code=400, content="Error when trying to fetch concerts")

            filtered = [c for c in concert_info if concerts_sorting(
                c,
                countries=request_model.countries,
                stateCode=request_model.stateCode,
                geo_latitude=request_model.geo_latitude,
                geo_longitude=request_model.geo_longitude
            )]
            final_concert_dict[artist_id] = filtered

    else:
        any_keys_exist = any(r.scan_iter("top_listened_artists:concert_info:*"))
        if not any_keys_exist:
            update_concerts_for_top_global_singers(n=100)

        for key in r.scan_iter("top_listened_artists:concert_info:*"):
            artist_id = key.decode().split(":")[-1]
            concert_info = json.loads(r.get(key) or "[]")
            filtered = [c for c in concert_info if concerts_sorting(
                c,
                countries=request_model.countries,
                stateCode=request_model.stateCode,
                geo_latitude=request_model.geo_latitude,
                geo_longitude=request_model.geo_longitude
            )]
            if filtered:
                final_concert_dict[artist_id] = filtered

    return JSONResponse(final_concert_dict, status_code=200)


def concerts_sorting(concert, countries=[], stateCode=None, geo_latitude=None, geo_longitude=None):
    venues = concert.get("_embedded", {}).get("venues", [])
    if not venues:
        return False

    venue = venues[0]

    if countries:
        if venue.get("country", {}).get("countryCode") not in countries:
            return False

    if stateCode:
        if venue.get("state", {}).get("stateCode") != stateCode:
            return False

    if geo_latitude is not None and geo_longitude is not None:
        lat = venue.get("location", {}).get("latitude")
        lng = venue.get("location", {}).get("longitude")
        if not lat or not lng:
            return False
        dist = geodesic((geo_latitude, geo_longitude), (lat, lng)).km
        if dist > 100:
            return False

    return True