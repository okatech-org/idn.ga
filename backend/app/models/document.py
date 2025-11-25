import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, func, Enum, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
import enum

class DocumentType(str, enum.Enum):
    CNI = "CNI"
    PASSPORT = "PASSPORT"
    BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE"
    DIPLOMA = "DIPLOMA"
    DRIVING_LICENSE = "DRIVING_LICENSE"
    UTILITY_BILL = "UTILITY_BILL"
    OTHER = "OTHER"

class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    document_type = Column(Enum(DocumentType), nullable=False)
    document_number = Column(String, nullable=True)
    issuing_authority = Column(String, nullable=True)
    
    issue_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    
    storage_path = Column(String, nullable=False) # Path to file (S3 or local)
    
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    
    ai_extracted_metadata = Column(JSONB, nullable=True)
    ai_confidence_score = Column(Float, nullable=True)
    
    file_hash = Column(String, nullable=True) # SHA-256
    encryption_key_id = Column(String, nullable=True) # Reference to HSM key
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
