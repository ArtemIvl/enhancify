from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ConcertsRequest(BaseModel):
    get_top_artist_info: bool
    #example input:
    #[{"artist_id": "a1b2c3", "artist_name": "21 savage"}]
    artists: Optional[List[dict]] = []#manually provide artist ids
    geo_latitude: Optional[float] = None
    geo_longtitude: Optional[float] = None
    stateCode: Optional[str] = None
    countries: Optional[List[str]] = ['US']
