import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Učitavanje varijabli iz .env fajla
load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Engine je glavni ulaz u bazu
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal će biti klasa za kreiranje sesija (konekcija)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base klasa od koje će nasljeđivati tvoji modeli (tabele)
Base = declarative_base()

# Helper funkcija koju ćeš koristiti u FastAPI rutama
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

     