import uuid
from sqlalchemy import Column, String, Integer, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from ..db.session import Base

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "public"}

    # Primarni ključ: UUID generisan na strani baze ili aplikacije
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4, 
        server_default=text("uuid_generate_v4()")
    )
    
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True) 
    surname = Column(String, nullable=True)
    number = Column(Integer, nullable=True)
    company_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    
    # Automatsko računanje vremena na serveru (UTC)
    created_at = Column(
        DateTime(timezone=True), 
        server_default=text("timezone('utc'::text, now())"),  
        nullable=False
    )
    
    # Veza sa Supabase Auth sistemom (nasumični ID iz auth.users tabele)
    auth_user_id = Column(UUID(as_uuid=True), unique=True, nullable=True)

    def __repr__(self):
        return f"<User(email={self.email}, company={self.company_name})>"