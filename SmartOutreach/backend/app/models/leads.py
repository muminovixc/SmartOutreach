from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from uuid import uuid4
from typing import Optional

import uuid
from ..db.session import Base # Pretpostavljam da ti je Base definisan u session.py

class SavedLead(Base):
    __tablename__ = "saved_leads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # user_id povezujemo sa auth.users tabelom iz Supabase-a
    user_id = Column(UUID(as_uuid=True), nullable=False) 
    business_name = Column(String, nullable=False)
    business_category = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    website = Column(Text, nullable=True)
    email = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    
    # Statusi: 'new', 'contacted', 'interested', 'ignored'
    status = Column(String, default="new")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<SavedLead(name={self.business_name}, status={self.status})>"
    
