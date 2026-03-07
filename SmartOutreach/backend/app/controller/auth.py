import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from google_auth_oauthlib.flow import Flow
from google.oauth2 import id_token
from google.auth.transport import requests
import requests 

# Importi modula
from ..db.session import get_db
from ..schemas.auth import UserCreate, UserResponse, UserLogin, Token
from ..models.users import User
from ..services.auth import (
    create_user, 
    authenticate_user, 
    create_access_token, 
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# REGISTRACIJA I LOGIN ---

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email već registrovan")
    return create_user(db=db, user_data=user)

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Pogrešan email ili lozinka",
        )
    
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": str(user.id),
        "user_email": user.email,
        "user_name": user.name,
        "user_surname": user.surname
    }

# --- GOOGLE OAUTH SEKCIJA ---

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:8000/auth/google/callback"

SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify"
]

@router.get("/google/login")
async def google_login():
    client_config = {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [REDIRECT_URI]
        }
    }
    
    flow = Flow.from_client_config(client_config, scopes=SCOPES)
    flow.redirect_uri = REDIRECT_URI
    
    # KLJUČNO: Onemogućavamo PKCE (code_challenge) ovdje
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',
        code_challenge=None  # <--- DODAJ OVO
    )
    return RedirectResponse(authorization_url)


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    token_url = "https://oauth2.googleapis.com/token"
    
    # Šaljemo čist zahtjev bez ikakvih skrivenih biblioteka
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    
    response = requests.post(token_url, data=data)
    token_data = response.json()
    
    if "error" in token_data:
        # Ako i dalje baca grešku, ispisat ćemo sve da vidimo šta Google tačno vidi
        print(f"DEBUG GOOGLE RESPONSE: {token_data}")
        raise HTTPException(status_code=400, detail=f"Google Error: {token_data.get('error_description')}")

    # ... ostatak koda za ID token i bazu ...
    access_token = token_data.get("access_token")
    refresh_token = token_data.get("refresh_token")
    
    # Verifikacija ID Tokena
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    id_info = id_token.verify_oauth2_token(token_data.get("id_token"), google_requests.Request(), GOOGLE_CLIENT_ID)
    
    email = id_info.get('email')
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        user = User(email=email, name=id_info.get('given_name', ''), surname=id_info.get('family_name', ''), hashed_password="", is_active=1)
        db.add(user)
        db.flush()

    user.google_access_token = access_token
    if refresh_token:
        user.google_refresh_token = refresh_token
    
    user.google_token_expires_at = datetime.utcnow() + timedelta(seconds=token_data.get("expires_in"))
    db.commit()

    try:
        id_info = id_token.verify_oauth2_token(
        token_data.get("id_token"), 
        google_requests.Request(), 
        GOOGLE_CLIENT_ID,
        clock_skew_in_seconds=10  # Dodajemo 10 sekundi tolerancije
    )
    except Exception as e:
        print(f"ID Token Error: {e}")
        raise HTTPException(status_code=400, detail="Nevalidan Google token")

    my_jwt = create_access_token(data={"sub": str(user.id), "email": user.email})
    return RedirectResponse(url=f"http://localhost:3000/dashboard?token={my_jwt}&user_id={user.id}&user_email={user.email}&user_name={user.name}&user_surname={user.surname}")