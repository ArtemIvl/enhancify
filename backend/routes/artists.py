from fastapi import APIRouter, Request, HTTPException, Query
import httpx
import time
import json
from redis_client import r

router = APIRouter()

SPOTIFY_API_BASE = "https://api.spotify.com/v1/me/top"

@router.get("/get_top_artists")
def get_top_artists():
    exec_start = time.time()
    last_updated_at = r.get("top_listened_artists:last_updated_at")
    data_raw = r.get("top_listened_artists:content")
    info_on_top_singers = json.loads(data_raw) if data_raw else []
    exec_end = time.time()
    print(exec_end - exec_start)
    return {"Last updated": last_updated_at, "Top 10000": info_on_top_singers}

@router.get("/top-content")
async def get_top_content(
    request: Request,
    type: str = Query(..., regex="^(tracks|artists)$"),
    time_range: str = Query("medium_term")
):
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    url = f"{SPOTIFY_API_BASE}/{type}?limit=50&time_range={time_range}"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={"Authorization": token}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=response.text)
        return response.json()