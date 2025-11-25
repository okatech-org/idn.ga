import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum

class AuthMethod(str, enum.Enum):
    PIN = "PIN"
    FACE_ID = "FACE_ID"
    TOUCH_ID = "TOUCH_ID"
    TWO_FACTOR = "2FA"

class AuthLog(Base):
    __tablename__ = "auth_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    auth_method = Column(String, nullable=False) # Store enum as string for flexibility
    service_name = Column(String, default="IDN.GA")
    service_url = Column(String, nullable=True)
    
    ip_address = Column(String, nullable=True) # Hashed/Anonymized if needed
    device_fingerprint = Column(String, nullable=True)
    geolocation = Column(String, nullable=True)
    
    success = Column(Boolean, default=False)
    failure_reason = Column(String, nullable=True)
    
    timestamp = Column(DateTime, default=func.now())
    user_agent = Column(String, nullable=True)
