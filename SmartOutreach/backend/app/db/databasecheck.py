from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

# Koristi svoj URL iz .env fajla
db_url = os.getenv("DATABASE_URL")
engine = create_engine(db_url)

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT now()"))
        print("✅ Konekcija uspješna!")
        print(f"Vrijeme na bazi: {result.fetchone()[0]}")
except Exception as e:
    print("❌ Konekcija nije uspjela!")
    print(f"Greška: {e}")