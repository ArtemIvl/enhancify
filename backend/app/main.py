from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, profile, artists, concerts

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4173",        # for browser on host
        "http://127.0.0.1:4173",        # alternative localhost
        "http://frontend:4173",         # if frontend service name is 'frontend' in Compose
    ],
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

