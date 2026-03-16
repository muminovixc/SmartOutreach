from sqlalchemy import Column, String, Text, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from ..db.session import Base

class Campaign(Base):
    __tablename__ = "campaigns"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id", ondelete="CASCADE"), nullable=False)
    lead_name = Column(String(255))
    target_email = Column(String(255), nullable=False)
    subject = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    
    
    thread_id = Column(String(255), index=True) 
    
  
    status = Column(String(50), default="sent")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_checked = Column(DateTime(timezone=True), onupdate=func.now())