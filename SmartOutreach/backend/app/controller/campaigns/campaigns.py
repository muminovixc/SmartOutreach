import base64
import os
from sqlalchemy import func
from email.mime.text import MIMEText
from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from ...db.session import get_db
from ...models.users import User  
from ...models.campaigns import Campaign
import base64
import datetime
from pydantic import BaseModel
from ...services.auth import get_current_user  
from ...schemas.leads import EmailSendRequest  
from ...services.campaign import clean_gmail_body

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])



@router.post("/send")
async def send_email(
    request: EmailSendRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Provjera imamo li tokene u bazi za trenutnog korisnika
    if not current_user.google_access_token or not current_user.google_refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Google Gmail nije povezan. Molimo prijavite se ponovo preko Google-a."
        )

    # 2. Postavljanje Google Credentials-a
    creds = Credentials(
        token=current_user.google_access_token,
        refresh_token=current_user.google_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ.get("GOOGLE_CLIENT_ID"),
        client_secret=os.environ.get("GOOGLE_CLIENT_SECRET")
    ) 

    # 3. Osvježavanje tokena ako je istekao
    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            # Spremi novi access_token u bazu
            current_user.google_access_token = creds.token
            db.commit()
        except Exception as e:
            raise HTTPException(status_code=401, detail="Session expired. Reconnect Gmail.")

    try:
        service = build('gmail', 'v1', credentials=creds)
        
        message = MIMEText(request.content)
        message['to'] = request.target_email
        message['subject'] = request.subject
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        # Slanje
        sent_message = service.users().messages().send(
            userId='me', 
            body={'raw': raw_message}
        ).execute()

        # NOVO: Uzimamo threadId iz odgovora Gmail API-ja
        gmail_thread_id = sent_message.get('threadId')

        new_campaign = Campaign(
            user_id=current_user.id,
            lead_name=request.lead_name,
            target_email=request.target_email,
            subject=request.subject,
            content=request.content,
            status="sent",
            thread_id=gmail_thread_id  # Spremamo thread_id
        )
        
        db.add(new_campaign)
        db.commit()
        db.refresh(new_campaign)

        return {"status": "success", "thread_id": gmail_thread_id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/history")
async def get_campaign_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Dohvaćamo kampanje korisnika sortirane od najnovijih
        campaigns = db.query(Campaign)\
            .filter(Campaign.user_id == current_user.id)\
            .order_by(Campaign.created_at.desc())\
            .all()
        
        return campaigns
    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Could not fetch campaign history")
    

from fastapi import BackgroundTasks

@router.get("/sync-all")
async def sync_all_campaigns(
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    print('Sync proces pokrenut...')
    
    # 1. Uzimamo kampanje koje su poslane i imaju thread_id
    campaigns_to_check = db.query(Campaign).filter(
        Campaign.user_id == current_user.id,
        Campaign.status == "sent",
        Campaign.thread_id.isnot(None)
    ).all()

    if not campaigns_to_check:
        return {"status": "success", "message": "No campaigns to sync."}

    # 2. Funkcija za pozadinsku obradu
    def check_threads():
        creds = Credentials(
            token=current_user.google_access_token,
            refresh_token=current_user.google_refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.environ.get("GOOGLE_CLIENT_ID"),
            client_secret=os.environ.get("GOOGLE_CLIENT_SECRET")
        )
        service = build('gmail', 'v1', credentials=creds)

        for camp in campaigns_to_check:
            print(f"Provjera: {camp.target_email} | Thread: {camp.thread_id}")
            try:
                thread = service.users().threads().get(userId='me', id=camp.thread_id).execute()
                messages = thread.get('messages', [])

                if len(messages) > 1:
                    last_msg = messages[-1]
                    headers = last_msg.get('payload', {}).get('headers', [])
                    
                    # Sigurno izvlačenje From headera
                    sender_header = next((h['value'] for h in headers if h['name'].lower() == 'from'), "").lower()
                    
                    # Provera da li je pošiljalac neko drugi (ne trenutni korisnik)
                    is_not_me = current_user.email.lower() not in sender_header
                    
                    if is_not_me:
                        camp.status = "replied"
                        print(f"DEBUG: Pronađen odgovor od {sender_header}")
                        
                        # Odmah ažuriramo bazu za tu kampanju
                        camp.last_checked = datetime.datetime.utcnow()
                        db.add(camp)
                        db.commit()
                        db.refresh(camp)
                        print(f"✅ Status ažuriran u bazi za: {camp.target_email}")
                    else:
                        # Ako smo mi poslali poruku (follow-up), samo ažuriraj vreme provjere
                        camp.last_checked = datetime.datetime.utcnow()
                        db.commit()
                
            except Exception as e:
                print(f"Greška kod thread-a {camp.thread_id}: {e}")
                db.rollback()
                continue

    # 3. Pokreni pozadinski task
    background_tasks.add_task(check_threads)

    return {"status": "success", "message": f"Syncing {len(campaigns_to_check)} campaigns..."}


@router.get("/{campaign_id}/thread")
async def get_campaign_thread(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Nađi kampanju u bazi
    camp = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.user_id == current_user.id).first()
    if not camp or not camp.thread_id:
        return [] # Vrati prazno ako nema threada

    # 2. Poveži se na Gmail
    creds = Credentials(
        token=current_user.google_access_token,
        refresh_token=current_user.google_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ.get("GOOGLE_CLIENT_ID"),
        client_secret=os.environ.get("GOOGLE_CLIENT_SECRET")
    )
    service = build('gmail', 'v1', credentials=creds)

    try:
        thread = service.users().threads().get(userId='me', id=camp.thread_id).execute()
        messages = thread.get('messages', [])
        
        thread_data = []
        for msg in messages:
            payload = msg.get('payload', {})
            body = ""
            
            # --- DEKODIRANJE BODY-ja (Poboljšano) ---
            if 'parts' in payload:
                for part in payload['parts']:
                    if part['mimeType'] == 'text/plain':
                        data = part['body'].get('data', '')
                        body = base64.urlsafe_b64decode(data).decode('utf-8')
                        break # Uzmi prvi plain text dio i izađi
            else:
                data = payload.get('body', {}).get('data', '')
                if data:
                    body = base64.urlsafe_b64decode(data).decode('utf-8')

            # --- ČIŠĆENJE TEKSTA ---
            body = clean_gmail_body(body)

            # --- IZVLAČENJE VREMENA ---
            # Gmail vraća internalDate u milisekundama
            timestamp = int(msg.get('internalDate', 0)) / 1000
            dt = datetime.datetime.fromtimestamp(timestamp)
            time_str = dt.strftime("%H:%M")
            date_str = dt.strftime("%d.%m.")

            # --- POŠILJALAC ---
            headers = payload.get('headers', [])
            sender_full = next((h['value'] for h in headers if h['name'].lower() == 'from'), "Unknown")
            
            # Provjera da li je poruka od nas
            is_me = current_user.email.lower() in sender_full.lower()

            thread_data.append({
                "sender": sender_full,
                "body": body,
                "is_me": is_me,
                "time": time_str,
                "date": date_str
            })

        return thread_data
    except Exception as e:
        print(f"Error fetching thread: {e}")
        raise HTTPException(status_code=500, detail=str(e))