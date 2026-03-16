import base64
import os
import datetime
from email.mime.text import MIMEText
from typing import List
from google import genai
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
from ...services.campaign import clean_gmail_body, get_campaign_thread,generate_reply, send_email,_get_google_service, send_reply



router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


@router.post("/send")
async def send_email_task(
    request: EmailSendRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await send_email (request= request, user= current_user)

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

   
    user_id = current_user.id
    campaign_ids = [c.id for c in campaigns_to_check]

    def check_threads_task(u_id: str, c_ids: List[int]):
        
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
async def get_campaign_thread_endpoint(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    camp = db.query(Campaign).filter(Campaign.id == campaign_id, Campaign.user_id == current_user.id).first()
    if not camp:
        print("ERROR: Campaign not found or doesn't belong to user")
        raise HTTPException(status_code=404, detail="Campaign not found")

    # 3. TEST: Google Service
    try:
        service = _get_google_service(current_user, db)
        if not service:
            print("ERROR: _get_google_service returned None")
            raise HTTPException(status_code=401, detail="Google authentication failed")
    except Exception as e:
        print(f"EXCEPT: Google Service Error: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Google Error: {str(e)}")

    print(f"--- DEBUG SUCCESS ---")
    return await get_campaign_thread(campaign_id, db, current_user,service)
    

@router.get("/history")
async def get_campaign_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Campaign).filter(Campaign.user_id == current_user.id).order_by(Campaign.created_at.desc()).all()



@router.post("/{campaign_id}/generate-reply")
async def generate_reply_test(campaign_id: str, request:dict):
    return await generate_reply(campaign_id=campaign_id, request=request)

@router.post("/{campaign_id}/reply")
async def send_reply_endpoint(
    campaign_id: str, 
    request: dict, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await send_reply(campaign_id=campaign_id, request=request, db=db, current_user=current_user)