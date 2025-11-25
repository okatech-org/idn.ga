from fastapi import APIRouter, Depends
from app.services.qr_service import qr_service

router = APIRouter(prefix="/card", tags=["Digital ID Card"])

@router.get("/qr")
def get_qr_code(user_id: str = "test-user-id"):
    # Should get user_id from JWT
    qr_data = qr_service.generate_dynamic_qr(user_id)
    return qr_data

@router.post("/verify")
def verify_qr(token: str):
    return qr_service.verify_qr_token(token)
