from sqlalchemy.orm import Session
from ..models.users import User
from ..schemas.auth import UserCreate
# pip install passlib[bcrypt]
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from ..db.session import get_db
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(db: Session, user_data: UserCreate):
 
    hashed_password = pwd_context.hash(user_data.password)
    
    db_user = User(
        email=user_data.email,
        name=user_data.name,
        surname=user_data.surname,
        number=user_data.number,
        company_name=user_data.company_name,
        hashed_password=hashed_password 
    )
    
    db.add(db_user) 
    db.commit()
    db.refresh(db_user)
    return db_user


from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from ..models.users import User
import os


SECRET_KEY =os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
       
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        
        
        user_id: str = payload.get("sub")
        
        if user_id is None:
            print("DEBUG: 'sub' polje nije pronađeno u tokenu")
            raise HTTPException(status_code=401, detail="Invalid token payload")

       
        user = db.query(User).filter(User.id == user_id).first()
        
        if user is None:
            print(f"DEBUG: Korisnik sa ID-om {user_id} ne postoji u bazi")
            raise HTTPException(status_code=401, detail="User not found")
            
        return user

    except JWTError as e:
        print(f"DEBUG: JWT Error: {str(e)}")
        raise HTTPException(status_code=401, detail="Token has expired or is invalid")