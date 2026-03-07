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

router = APIRouter(prefix="/leads", tags=["Leads"])
genai.configure(api_key=os.environ.get("GEMINI_KEY"))  # Postavi GEMINI_KEY iz .env datoteke


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
        # MAPIRAJ POLJA RUČNO (Sigurnije i izbjegava dupliranje)
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
        print("Saved lead:", new_lead)  # Debug: provjeri koji lead je spremljen
        db.refresh(new_lead)
        return {"status": "success", "id": str(new_lead.id)}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/my-leads")
async def get_my_leads(user_id: str, db: Session = Depends(get_db)):
    # Filtriramo bazu tako da dobijemo samo leadove ovog korisnika
    leads = db.query(SavedLead).filter(SavedLead.user_id == user_id).order_by(SavedLead.created_at.desc()).all()
    
    # Mapiramo nazive polja da odgovaraju onome što LeadCard očekuje (title umjesto business_name)
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
        # 1. Skupljamo info sa web sajta
        found_email, website_context = await scrape_lead_info(request.website_url)

        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # 2. Prompt koji koristi 'website_context'
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