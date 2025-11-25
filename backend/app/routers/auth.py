from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, ProfileType
from app.core.security import get_password_hash, create_access_token, verify_password
from app.services.kyc_service import kyc_service
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])

class UserRegister(BaseModel):
    email: str
    password: str
    profile_type: ProfileType

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        profile_type=user.profile_type
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"user_id": new_user.id, "message": "User created successfully"}

@router.post("/login")
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(status_code=403, detail="Invalid credentials")
    
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=403, detail="Invalid credentials")
    
    access_token = create_access_token(subject=user.id)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/kyc/document")
async def upload_kyc_document(
    file: UploadFile = File(...), 
    document_type: str = Form(...),
    db: Session = Depends(get_db)
):
    # In a real app, save file to temp storage first
    result = await kyc_service.verify_document(file.filename, document_type)
    
    if not result["is_valid"]:
        raise HTTPException(status_code=400, detail="Document verification failed")
        
    return {"status": "verified", "data": result["extracted_data"]}
