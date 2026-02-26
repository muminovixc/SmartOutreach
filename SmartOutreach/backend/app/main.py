import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Importuj bazu i rutere (prilagodi putanje tvojoj strukturi foldera)
from .db.session import engine, Base
from .controller.auth import router as auth_router

# 1. Učitaj enviroment varijable iz .env fajla
load_dotenv()

# 2. Kreiraj tabele u bazi ako ne postoje (automatska migracija)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SmartReach AI API",
    description="Backend za automatizaciju prodajnih emailova",
    version="1.0.0"
)

# 3. Podešavanje CORS-a
# Uzimamo URL frontenda iz .env, npr. http://localhost:3000
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

origins = [
    frontend_url,
    "http://127.0.0.1:3000", # Česta alternativa za localhost
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # Dozvoli pristup tvom Next.js-u
    allow_credentials=True,          # Dozvoli slanje kolačića (bitno za Auth)
    allow_methods=["*"],             # Dozvoli sve HTTP metode (GET, POST, PUT, DELETE)
    allow_headers=["*"],             # Dozvoli sve headere
)


app.include_router(auth_router) 

