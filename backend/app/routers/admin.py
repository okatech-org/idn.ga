from fastapi import APIRouter, Depends

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users")
def list_users():
    return [{"id": 1, "email": "user@example.com", "kyc_status": "PENDING"}]

@router.post("/kyc/{user_id}/approve")
def approve_kyc(user_id: str):
    return {"message": f"User {user_id} KYC approved"}
