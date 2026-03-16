import re
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
from ..db.session import get_db
from ..models.users import User
from google import genai
from ..models.campaigns import Campaign
from ..schemas.leads import EmailSendRequest
from ..services.auth import get_current_user  

def _get_google_service(user: User, db: Session):
    """Vraća validan Gmail service i automatski osvježava token."""
    creds = Credentials(
        token=user.google_access_token,
        refresh_token=user.google_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ.get("GOOGLE_CLIENT_ID"),
        client_secret=os.environ.get("GOOGLE_CLIENT_SECRET")
    )


    if not creds or not creds.valid:
        if creds and creds.refresh_token:
            try:
                creds.refresh(Request())
                user.google_access_token = creds.token
                db.commit()
                print("DEBUG: Token uspješno osvježen.")
            except Exception as e:
                print(f"ERROR: Neuspješan refresh tokena: {e}")
                return None
        else:
            print("ERROR: Nema refresh tokena, korisnik se mora ponovo ulogovati.")
            return None

    
    return build('gmail', 'v1', credentials=creds)

def clean_gmail_body(text):
    if not text:
        return ""
    text = re.sub(r'(?i)Dohvati Outlook za (iOS|Android)<https://aka\.ms/.*?>', '', text)
    text = re.sub(r'(?i)Get Outlook for (iOS|Android)<https://aka\.ms/.*?>', '', text)
    text = re.sub(r'(?m)^>.*$', '', text)
    
    marker_patterns = [
        r'________________________________', 
        r'(?i)^Šalje: .*',
        r'(?i)^From: .*',
        
        r'(?i)(.{0,100}(napisao je|wrote|sent|from):.*)', 
        r'(?i)(--+ original message --+)',
        r'(?i)(---------- forwarded message ----------)',
        r'(?m)^From: .*\nSent: .*\nTo: .*'
    ]
    
    for pattern in marker_patterns:
        parts = re.split(pattern, text, flags=re.MULTILINE)
        if parts:
            text = parts[0]
            
   
    return text.strip()


def safe_decode_b64(data: str):
    """Sigurno dekodira Gmail base64 podatke."""
    if not data:
        return ""
    try:
        
        missing_padding = len(data) % 4
        if missing_padding:
            data += '=' * (4 - missing_padding)
        return base64.urlsafe_b64decode(data).decode('utf-8', errors='ignore')
    except Exception:
        return ""

async def get_campaign_thread(campaign_id: str, db: Session, current_user: User, service: any):
    camp = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.user_id == current_user.id).first()
    if not camp or not camp.thread_id:
        return []

    if not service:
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
            
            
            def extract_body(payload_data):
               
                if payload_data.get('mimeType') == 'text/plain':
                    return safe_decode_b64(payload_data.get('body', {}).get('data', ''))
                
               
                if 'parts' in payload_data:
                    for part in payload_data['parts']:
                        res = extract_body(part)
                        if res:
                            return res
                return ""

            body = extract_body(payload)
            
            
            if not body and 'body' in payload:
                body = safe_decode_b64(payload['body'].get('data', ''))

            # Čišćenje i formatiranje
            body =clean_gmail_body(body) 
            
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
        print(f"Gmail Thread Error: {e}") # Lakše za debug
        raise HTTPException(status_code=500, detail="Failed to fetch conversation thread.")


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


async def generate_reply(campaign_id: str, request: dict):
  
    print(f"DEBUG: campaign_id tip: {type(campaign_id)}, vrijednost: {campaign_id}")
    print(f"DEBUG: request tip: {type(request)}, vrijednost: {request}")
    lead_msg = request.get("lead_message", "")
    initial_mail = request.get("initial_content", "")
    
    
    api_key = os.environ.get("GEMINI_KEY") 
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key not configured.")
    
    client = genai.Client(api_key=api_key)
    
    # 3. Čišćenje tekstova
    clean_lead_msg = clean_gmail_body(lead_msg)
    clean_initial = clean_gmail_body(initial_mail)

    # 4. Prompt inženjering
    prompt = f"""
    Initial outreach sent:
    "{clean_initial}"

    Lead's response:
    "{clean_lead_msg}" 

    Task: Write a professional and short follow-up reply. 
    If they are interested, try to book a call. 
    If they asked a question, answer it.
    Language: Same as the lead's response.
    """
    
    try:
            print("DEBUG: Pokrećem Gemini poziv...")
            
           
            api_key = os.environ.get("GEMINI_KEY")
            if not api_key:
                print("ERROR: GEMINI_API_KEY nije učitan!")
                return {"error": "API Key missing"}

            client = genai.Client(api_key=api_key)

            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )

         
            if response and response.text:
                suggestion = response.text.strip()
                print(f"DEBUG: Uspjeh! Odgovor: {suggestion[:20]}...")
                return {"suggestion": suggestion}
            else:
                print("DEBUG: Odgovor je prazan (moguća blokada sadržaja)")
                return {"suggestion": "AI nije mogao generirati odgovor."}

    except Exception as e:
            import traceback
            print("\n" + "="*50)
            print("KRITIČNA GREŠKA U SERVISU:")
            traceback.print_exc() 
            print("="*50 + "\n")
          
            return {"error": str(e)}
    



# PROMJENA: async def, i uklonjeni Depends
async def send_reply(
    campaign_id: str, 
    request: dict, 
    db: Session, 
    current_user: User
):
    print(f"DEBUG: Primljeni podaci: {request}")
    
 
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id, 
        Campaign.user_id == current_user.id
    ).first()

    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

  
    reply_content = request.get("message")  
    
    if not reply_content:
        raise HTTPException(status_code=400, detail="Reply content is missing")

    try:
  
        service = _get_google_service(current_user, db)

        if service is None:
            print("ERROR: Google service is None. User might not be authenticated.")
            raise HTTPException(
                status_code=401, 
                detail="Gmail nalog nije povezan ili je sesija istekla. Ponovo poveži Gmail."
            )
     
        message = MIMEText(reply_content)
        message['to'] = campaign.target_email
        message['subject'] = campaign.subject
        
       
        
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
        
        service.users().messages().send(
            userId='me',
            body={
                'raw': raw_message,
                'threadId': campaign.thread_id 
            }
        ).execute()

        # 5. Ažuriraj status
        campaign.status = "replied"
        db.commit()

        return {"status": "success"}

    except HTTPException:
        raise 
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        # Sve ostale neočekivane greške idu kao 500
        raise HTTPException(status_code=500, detail=f"Neočekivana greška: {str(e)}")