from fastapi import APIRouter
import time
import json
from redis_client import r

router = APIRouter()

@router.get("/get_top_artists")
def get_top_artists():
    exec_start = time.time()
    last_updated_at = r.get("top_listened_artists:last_updated_at")
    data_raw = r.get("top_listened_artists:content")
    info_on_top_singers = json.loads(data_raw) if data_raw else []
    exec_end = time.time()
    print(exec_end - exec_start)
    return {"Last updated": last_updated_at, "Top 500": info_on_top_singers}