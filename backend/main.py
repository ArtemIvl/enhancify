from fastapi import FastAPI
import os
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes import auth, profile, artists, concerts

load_dotenv()

ARTIST_UPDATE_FREQUENCY_PER_DAY = 4
CONCERT_UPDATE_FREQUENCY_PER_DAY = 6

app = FastAPI()

SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
SPOTIFY_REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your React dev URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(artists.router)
app.include_router(concerts.router)


#make sure to install all requirements from requirements.txt before running the code
#pip install -r requirements.txt

