from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, profile, artists, concerts

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Or your real domain in production
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

