from fastapi import APIRouter
from fastapi.responses import JSONResponse
import requests

router = APIRouter()

@router.get("/profile")
def get_me(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    user_res = requests.get("https://api.spotify.com/v1/me", headers=headers)
    if user_res.status_code != 200:
        return JSONResponse({"error": "Failed to fetch user info"}, status_code=400)
    return user_res.json()

@router.get("/followed_artists")
def get_followed_artists(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    url = "https://api.spotify.com/v1/me/following?type=artist&limit=50"
    res = requests.get(url, headers=headers)
    if res.status_code != 200:
        return JSONResponse({"error": "Failed to fetch followed artists"}, status_code=400)
    return res.json()["artists"]["items"]