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
from google.auth import jwt as google_jwt
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
    
    # 1. Razmjena autorizacijskog koda za tokene
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
        print(f"DEBUG GOOGLE RESPONSE ERROR: {token_data}")
        raise HTTPException(
            status_code=400, 
            detail=f"Google Error: {token_data.get('error_description')}"
        )

    # 2. Dekodiranje ID tokena (Bypass clock error)
    try:
        id_token_raw = token_data.get("id_token")
        # Koristimo verify=False za exp/iat provjeru jer ti sat pravi probleme,
        # ali Google je već potvrdio autentičnost kroz code exchange.
        id_info = google_jwt.decode(id_token_raw, verify=False)
        
        # Sigurnosna provjera: Da li je token namijenjen tvojoj aplikaciji?
        if id_info.get("aud") != GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=400, detail="Audience mismatch.")
            
        email = id_info.get('email')
        if not email:
            raise HTTPException(status_code=400, detail="Email not found in token.")
            
    except Exception as e:
        print(f"Token Decode Error: {e}")
        raise HTTPException(status_code=400, detail="Failed to decode Google identity.")

    # 3. Rad sa bazom podataka (User Check/Create)
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Kreiramo novog korisnika ako ne postoji
        user = User(
            email=email, 
            name=id_info.get('given_name', ''), 
            surname=id_info.get('family_name', ''), 
            hashed_password="", # Google korisnici nemaju lokalni password
            is_active=1
        )
        db.add(user)
        db.flush() # Dobijamo user.id prije commita

    # 4. Ažuriranje Google tokena u bazi
    user.google_access_token = token_data.get("access_token")
    
    # Refresh token dolazi samo prvi put kada se korisnik prijavi (ili ako dodaš prompt=consent)
    refresh_token = token_data.get("refresh_token")
    if refresh_token:
        user.google_refresh_token = refresh_token
    
    # Izračunavanje isteka (opcionalno, ali korisno)
    expires_in = token_data.get("expires_in", 3600)
    user.google_token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
    
    db.commit()

    # 5. Kreiranje tvog internog JWT-a za Frontend
    my_jwt = create_access_token(data={"sub": str(user.id), "email": user.email})
    
    # 6. Redirect na Frontend sa podacima
    # Preporuka: U produkciji šalji samo token, a ostalo dohvati preko /me endpointa
    frontend_url = (
        f"http://localhost:3000/dashboard"
        f"?token={my_jwt}"
        f"&user_id={user.id}"
        f"&user_email={user.email}"
        f"&user_name={user.name}"
        f"&user_surname={user.surname}"
    )
    
    return RedirectResponse(url=frontend_url)