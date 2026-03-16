from fastapi import APIRouter, HTTPException, Depends
from app.services.dashboard.lead_services import search_google_maps
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.leads import SavedLead
from app.schemas.leads import LeadCreate
from app.schemas.leads import CompanyRequest
import google.generativeai as genai
from app.schemas.leads import EmailGenerationRequest
import os
from dotenv import load_dotenv
from app.services.dashboard.lead_services import scrape_lead_info
from app.services.auth import get_current_user
from app.models.users import User
from app.models.campaigns import Campaign

router = APIRouter(prefix="/leads", tags=["Leads"])
genai.configure(api_key=os.environ.get("GEMINI_KEY"))  # Gemini API key


@router.get("/search")
async def get_leads(niche: str, city: str):
    try:
        results = search_google_maps(niche, city)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/save")
async def save_lead(lead_data: LeadCreate, db: Session = Depends(get_db)):
    try:
        
        new_lead = SavedLead(
            user_id=lead_data.user_id,
            business_name=lead_data.business_name,
            business_category=lead_data.business_category,
            address=lead_data.address,
            phone=lead_data.phone,
            website=lead_data.website,
            rating=lead_data.rating
        )
        
        db.add(new_lead)
        db.commit()
        db.refresh(new_lead)
        return {"status": "success", "id": str(new_lead.id)}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/my-leads")
async def get_my_leads(user_id: str, db: Session = Depends(get_db)):
  
    leads = db.query(SavedLead).filter(SavedLead.user_id == user_id).order_by(SavedLead.created_at.desc()).all()
    
   
    formatted_leads = []
    for lead in leads:
        formatted_leads.append({
            "id": str(lead.id),
            "title": lead.business_name,
            "category": lead.business_category,
            "address": lead.address,
            "phone": lead.phone,
            "website": lead.website,
            "rating": lead.rating,
            "status": lead.status
        })
    
    return formatted_leads


@router.delete("/delete/{lead_id}")
async def delete_lead(lead_id: str, db: Session = Depends(get_db)):
    lead = db.query(SavedLead).filter(SavedLead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    db.delete(lead)
    db.commit()
    return {"status": "success", "message": "Lead deleted"}


@router.post("/generate-email")
async def generate_personalized_email(request: EmailGenerationRequest):
    try:
     
        found_email, website_context = await scrape_lead_info(request.website_url)

        model = genai.GenerativeModel("gemini-2.5-flash")
        
    
        prompt = (
            f"You are a world-class sales copywriter.\n"
            f"Using the following context from the company's website, write a highly personalized cold email.\n\n"
            f"COMPANY CONTEXT:\n{website_context}\n\n" 
            f"COMPANY NAME: {request.company_name}\n"
            f"SERVICE I OFFER: {request.service_offered}\n"
            f"SENDER NAME: {request.sender_name}\n"
            f"LANGUAGE: {request.language}\n\n"
            "INSTRUCTIONS:\n"
            "1. Mention a specific detail from the context to prove this isn't a template.\n"
            "2. Keep it under 100 words.\n"
            "3. Focus on how my service helps THEM specifically based on what they do.\n"
            "4. Tone: Professional but human.\n\n"
            "5. do not question lead like are you sure? or something like that"
            "6. do not introduce myself in the email, just jump straight to the point and value proposition\n\n"
            "7. end the email with a question that invites a response, but do not ask if they are interested, ask something more specific related to their business\n\n"
            "Subject: <subject>\n\n"
            "<body>"
        )

        response = model.generate_content(prompt)
        email_text = response.text.strip()
        
        return {
            "status": "success", 
            "email_content": email_text,
            "lead_email": found_email
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.get("/stats")
async def get_campaign_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Ukupan broj kampanja korisnika
    total = db.query(Campaign).filter(Campaign.user_id == current_user.id).count()
    
    # Broj onih koji su odgovorili
    replied = db.query(Campaign).filter(
        Campaign.user_id == current_user.id, 
        Campaign.status == "replied"
    ).count()

    # Izračunaj procenat
    response_rate = (replied / total * 100) if total > 0 else 0

    return {
        "total_outreach": total,
        "replied_count": replied,
        "response_rate": f"{round(response_rate, 2)}%",
        "pending_followups": total - replied
    }


from datetime import datetime

@router.get("/activity")
async def get_recent_activity(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Uzimamo zadnjih 5 kampanja koje su ažurirane
    # Pretpostavljam da imaš 'updated_at' ili sličnu kolonu
    recent_campaigns = db.query(Campaign).filter(
        Campaign.user_id == current_user.id
    ).order_by(Campaign.id.desc()).limit(5).all()

    activity_log = []
    
    for camp in recent_campaigns:
        # Logika za opis akcije na osnovu statusa
        action = "Email Sent"
        status_label = "Initial"
        
        if camp.status == "replied":
            action = "Received Reply"
            status_label = "Interested"
        elif camp.status == "followup":
            action = "Follow-up Sent"
            status_label = "Pending"

        # Formatiranje vremena (npr. "2m ago")
        # Za pravu "ago" funkciju treba ti helper, ovdje šaljemo ISO format
        activity_log.append({
            "id": camp.id,
            "name": camp.target_email.split('@')[0].capitalize(), # Ili camp.company_name ako imaš
            "action": action,
            "time": datetime.utcnow().isoformat(),
            "status": status_label
        })

    return activity_log