from fastapi import APIRouter, HTTPException, Depends
from app.services.dashboard.lead_services import search_google_maps
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.leads import SavedLead
from app.schemas.leads import LeadCreate


router = APIRouter(prefix="/leads", tags=["Leads"])

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