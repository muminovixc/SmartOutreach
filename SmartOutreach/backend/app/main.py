import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv


from .db.session import engine, Base
from .controller.auth import router as auth_router
from .controller.dashboard.leads import router as leads_router
from .controller.campaigns.campaigns import router as campaigns_router
 
load_dotenv() 


Base.metadata.create_all(bind=engine)  

app = FastAPI(
    title="SmartReach AI API",
    description="Backend za automatizaciju prodajnih emailova",
    version="1.0.0"
)


frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

origins = [
    frontend_url,
    "http://127.0.0.1:3000", 
]

app.add_middleware( 
    CORSMiddleware,
    allow_origins=origins,           # Dozvoli pristup  Next.js-u
    allow_credentials=True,          # Dozvoli slanje kolačića 
    allow_methods=["*"],             # Dozvoli sve HTTP metode (GET, POST, PUT, DELETE)
    allow_headers=["*"],             # Dozvoli sve headere
)
 

app.include_router(auth_router)  
app.include_router(leads_router) 
app.include_router(campaigns_router)

 