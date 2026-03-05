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


# Endpoint za generisanje personalizovanog emaila koristeći Gemini-1.5-Flash
@router.post("/generate-email")
async def generate_personalized_email(request: EmailGenerationRequest):
    try:
        # Koristimo najbrži i najnoviji model za tekst
        model = genai.GenerativeModel("gemini-2.5-flash") 
        
        # PROMPT: Direktno, kratko i personalizovano
        prompt = (
            f"Write a short,unique, high-converting cold email to a potential client.\n"
            f"Target Company Website: {request.website_url}\n"
            f"Company Name: {request.company_name}\n"
            "STRICT FORMAT:\n"
            "Subject: [Your Subject Here]\n"
            "Body:\n"
            "[Your Body Here]\n\n"
            f"Service I Offer: {request.service_offered}\n"
            f"Language: {request.language}\n"
            f"Sender Name: {request.sender_name}\n\n"

            "OBJECTIVE:\n"
            "Generate a personalized cold email that feels human, relevant, and concise.\n\n"

            "GUIDELINES:\n"
            "1. Tone: Professional, conversational, confident.\n"
            "2. Start with a specific observation or insight related to their website or industry.\n"
            "3. Clearly connect my service to a likely pain point.\n"
            "4. Focus on relevance and curiosity, not aggressive selling.\n"
            "5. Length: 80-100 words max.\n"
            "6. Use one simple, low-friction CTA at the end.\n"
            "7. Avoid clichés and generic phrases.\n"
            "8. Do not fabricate specific facts about the company.\n"
            "9. Do not include disclaimers or mention AI.\n"
            "10. End only with respect and the sender's name.\n\n"
            "11. dont include something like 'i visited your website' just tell something specific about the company that you can find on their website or google maps listing\n\n"

            "OUTPUT FORMAT:\n"
            "Subject: <subject line>\n\n"
            "<email body>"
                )
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            return {"status": "error", "email_content": "Failed to generate email"}

        email_text = response.text.strip()
        
        # Ovdje možemo razdvojiti Subject i Body ako Gemini formatira sa "Subject:"
        return {
            "status": "success", 
            "email_content": email_text
        }

    except Exception as e:
        print(f"DEBUG: Gemini Error: {e}")
        return {"status": "error", "message": str(e)}