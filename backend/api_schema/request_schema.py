from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
class ConcertsRequest(BaseModel):
    get_top_artist_info: bool
    #example input:
    #[{"artist_id": "a1b2c3", "artist_name": "21 savage"}]
    artists: Optional[List[dict]] = []#manually provide artist ids
    geo_latitude: Optional[float] = None
    geo_longitude: Optional[float] = None
    stateCode: Optional[str] = None
    countries: Optional[List[str]] = []
    search_area: Optional[int] = 100
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    
class ConcertsBySingerRequest(BaseModel):
    artist_id: str
    artists_name: str = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None 
