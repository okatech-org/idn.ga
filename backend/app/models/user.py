import uuid
from sqlalchemy import Column, String, Boolean, Date, Enum, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum

class ProfileType(str, enum.Enum):
    GABONAIS = "GABONAIS"
    RESIDENT = "RESIDENT"
    TOURISTE = "TOURISTE"

class KYCStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nip = Column(String(14), unique=True, index=True, nullable=True) # Nullable for tourists initially
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True) # For PIN or password
    
    profile_type = Column(Enum(ProfileType), default=ProfileType.GABONAIS)
    
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    place_of_birth = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    
    address_line1 = Column(String, nullable=True)
    address_line2 = Column(String, nullable=True)
    city = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.PENDING)
    kyc_verified_at = Column(DateTime, nullable=True)
    
    face_template_hash = Column(String, nullable=True) # SHA-256 of biometric template
    
    is_active = Column(Boolean, default=True)
    is_suspended = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
