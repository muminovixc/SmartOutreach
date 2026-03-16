from pydantic import BaseModel
from typing import Optional

class LeadCreate(BaseModel):
    user_id: str  
    business_name: str
    business_category: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = None

class LeadResponse(LeadCreate):
    id: str
    status: str

class CompanyRequest(BaseModel):
    company_name: str 
    city: Optional[str] = None

class EmailGenerationRequest(BaseModel):
    website_url: str
    service_offered: str  
    company_name: str
    language: Optional[str] = "English"
    sender_name: Optional[str] = None  
    company_name: Optional[str] = None 


class EmailSendRequest(BaseModel):
    lead_name: str
    target_email: str
    subject: str
    content: str