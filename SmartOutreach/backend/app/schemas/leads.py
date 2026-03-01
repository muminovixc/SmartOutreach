from pydantic import BaseModel
from typing import Optional

class LeadCreate(BaseModel):
    user_id: str  # Assuming user_id is a string UUID (as in frontend)
    business_name: str
    business_category: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    rating: Optional[float] = None

class LeadResponse(LeadCreate):
    id: str
    status: str