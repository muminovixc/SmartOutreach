from fastapi import APIRouter, HTTPException, Depends
from app.services.dashboard.lead_services import search_google_maps
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.leads import SavedLead
from app.schemas.leads import LeadCreate
from app.schemas.leads import CompanyRequest
import google.generativeai as genai
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

# app/controller/dashboard/leads.py
@router.post("/find-linkedin")
async def find_linkedin_link(request: CompanyRequest):
    try:
        # Koristimo stabilniji model name
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        # Ažurirani prompt koji uključuje grad za preciznost
        prompt = (
            f"Find the official LinkedIn company page for the company '{request.company_name}' "
            f"located in {request.city}. "
            "IMPORTANT: It must be the specific branch or the main office in that region. "
            "Return ONLY the direct URL (starting with https://www.linkedin.com/company/). "
            "If you are not 100% sure or cannot find it, return 'no link'."
        )

        response = model.generate_content(prompt)
        
        if not response or not response.text:
            return {"status": "error", "linkedin_url": "no link"}

        url = response.text.strip()
        print(f"DEBUG: Gemini response for '{request.company_name}': {url}")  # Debug: provjeri što Gemini vraća
        
        # Čišćenje URL-a u slučaju da Gemini doda markdown (npr. [link](url))
        clean_url = url.replace("`", "").replace("[", "").replace("]", "")
        if "(" in clean_url and ")" in clean_url:
            clean_url = clean_url.split("(")[-1].split(")")

        if "linkedin.com/company/" in clean_url:
            return {"status": "success", "linkedin_url": clean_url}
        
        return {"status": "error", "linkedin_url": "no link"}

    except Exception as e:
        print(f"DEBUG: Greška kod Gemini-ja: {e}")
        return {"status": "error", "linkedin_url": "no link"}