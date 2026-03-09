import base64
import os
import datetime
from email.mime.text import MIMEText
from typing import List
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from sqlalchemy.orm import Session
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from ...db.session import get_db
from ...models.users import User  
from ...models.campaigns import Campaign
from ...services.auth import get_current_user  
from ...schemas.leads import EmailSendRequest  
from ...services.campaign import clean_gmail_body 

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

# --- POMOĆNA FUNKCIJA ZA GMAIL SERVICE ---
def _get_google_service(user: User, db: Session):
    """Vraća validan Gmail service i automatski osvježava token ako je istekao."""
    creds = Credentials(
        token=user.google_access_token,
        refresh_token=user.google_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ.get("GOOGLE_CLIENT_ID"),
        client_secret=os.environ.get("GOOGLE_CLIENT_SECRET")
    )

    if not creds.valid:
        if creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                user.google_access_token = creds.token
                db.commit()
                db.refresh(user)
            except Exception:
                return None
        else:
            return None
    
    return build('gmail', 'v1', credentials=creds)

@router.post("/send")
async def send_email(
    request: EmailSendRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = _get_google_service(current_user, db)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Google session expired. Please reconnect Gmail."
        )

    try:
        message = MIMEText(request.content)
        message['to'] = request.target_email
        message['subject'] = request.subject
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        sent_message = service.users().messages().send(
            userId='me', 
            body={'raw': raw_message}
        ).execute()

        gmail_thread_id = sent_message.get('threadId')

        new_campaign = Campaign(
            user_id=current_user.id,
            lead_name=request.lead_name,
            target_email=request.target_email,
            subject=request.subject,
            content=request.content,
            status="sent",
            thread_id=gmail_thread_id
        )
        
        db.add(new_campaign)
        db.commit()
        return {"status": "success", "thread_id": gmail_thread_id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gmail API Error: {str(e)}")

@router.get("/sync-all")
async def sync_all_campaigns(
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    campaigns_to_check = db.query(Campaign).filter(
        Campaign.user_id == current_user.id,
        Campaign.status == "sent",
        Campaign.thread_id.isnot(None)
    ).all()

    if not campaigns_to_check:
        return {"status": "success", "message": "No campaigns to sync."}

    # Prosleđujemo user_id i ID-eve kampanja umjesto cijelih objekata da izbjegnemo DetachedInstanceError
    user_id = current_user.id
    campaign_ids = [c.id for c in campaigns_to_check]

    def check_threads_task(u_id: str, c_ids: List[int]):
        # Background task treba svoju sesiju
        new_db = next(get_db())
        user = new_db.query(User).filter(User.id == u_id).first()
        service = _get_google_service(user, new_db)
        
        if not service: return

        for c_id in c_ids:
            camp = new_db.query(Campaign).filter(Campaign.id == c_id).first()
            try:
                thread = service.users().threads().get(userId='me', id=camp.thread_id).execute()
                messages = thread.get('messages', [])

                if len(messages) > 1:
                    last_msg = messages[-1]
                    headers = last_msg.get('payload', {}).get('headers', [])
                    sender_header = next((h['value'] for h in headers if h['name'].lower() == 'from'), "").lower()
                    
                    if user.email.lower() not in sender_header:
                        camp.status = "replied"
                        camp.last_checked = datetime.datetime.utcnow()
                        new_db.commit()
                else:
                    camp.last_checked = datetime.datetime.utcnow()
                    new_db.commit()
            except Exception as e:
                print(f"Error syncing thread {camp.thread_id}: {e}")
                continue
        new_db.close()

    background_tasks.add_task(check_threads_task, user_id, campaign_ids)
    return {"status": "success", "message": f"Syncing {len(campaigns_to_check)} campaigns..."}

@router.get("/{campaign_id}/thread")
async def get_campaign_thread(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    camp = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.user_id == current_user.id).first()
    if not camp or not camp.thread_id:
        return []

    service = _get_google_service(current_user, db)
    if not service:
        raise HTTPException(status_code=401, detail="Gmail session expired.")

    try:
        thread = service.users().threads().get(userId='me', id=camp.thread_id).execute()
        messages = thread.get('messages', [])
        
        thread_data = []
        for msg in messages:
            payload = msg.get('payload', {})
            headers = payload.get('headers', [])
            body = ""
            
            # Poboljšano izvlačenje body-ja (provjerava i nested parts)
            def get_body(parts):
                for part in parts:
                    if part['mimeType'] == 'text/plain':
                        return base64.urlsafe_b64decode(part['body'].get('data', '')).decode('utf-8')
                    if 'parts' in part:
                        res = get_body(part['parts'])
                        if res: return res
                return ""

            if 'parts' in payload:
                body = get_body(payload['parts'])
            else:
                body = base64.urlsafe_b64decode(payload.get('body', {}).get('data', '')).decode('utf-8')

            body = clean_gmail_body(body)
            timestamp = int(msg.get('internalDate', 0)) / 1000
            dt = datetime.datetime.fromtimestamp(timestamp)
            
            sender_full = next((h['value'] for h in headers if h['name'].lower() == 'from'), "Unknown")
            is_me = current_user.email.lower() in sender_full.lower()

            thread_data.append({
                "sender": sender_full,
                "body": body,
                "is_me": is_me,
                "time": dt.strftime("%H:%M"),
                "date": dt.strftime("%d.%m.")
            })
        return thread_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Thread Error: {str(e)}")

@router.get("/history")
async def get_campaign_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Campaign).filter(Campaign.user_id == current_user.id).order_by(Campaign.created_at.desc()).all()