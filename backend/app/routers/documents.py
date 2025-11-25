from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.document import Document, DocumentType
from app.services.encryption_service import encryption_service
from app.services.ai_service import ai_service
import uuid

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: DocumentType = DocumentType.OTHER,
    user_id: str = "test-user-id", # Should come from JWT
    db: Session = Depends(get_db)
):
    content = await file.read()
    
    # 1. Encrypt
    encrypted_data = encryption_service.encrypt_document(content, user_id)
    
    # 2. AI Classification (Mock)
    ai_result = await ai_service.classify_document(content)
    
    # 3. Save Metadata
    new_doc = Document(
        user_id=uuid.UUID(user_id) if user_id != "test-user-id" else uuid.uuid4(), # Mock user ID handling
        document_type=doc_type,
        storage_path=f"s3://bucket/{file.filename}", # Mock path
        encryption_key_id=encrypted_data["key_id"],
        ai_confidence_score=ai_result["confidence"]
    )
    
    # db.add(new_doc)
    # db.commit()
    
    return {"message": "Document uploaded and encrypted", "ai_classification": ai_result}

@router.get("/")
def list_documents(db: Session = Depends(get_db)):
    # return db.query(Document).all()
    return [{"id": "1", "type": "CNI", "status": "VERIFIED"}]
