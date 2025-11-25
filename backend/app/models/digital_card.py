import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, func, Enum
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum

class CardStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    REVOKED = "REVOKED"

class DigitalCard(Base):
    __tablename__ = "digital_cards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    
    card_number = Column(String, unique=True, nullable=False)
    
    qr_code_token = Column(String, nullable=True) # Dynamic token
    qr_code_expires_at = Column(DateTime, nullable=True)
    
    card_status = Column(Enum(CardStatus), default=CardStatus.ACTIVE)
    
    issued_at = Column(DateTime, default=func.now())
    last_accessed_at = Column(DateTime, nullable=True)
