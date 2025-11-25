from fastapi import APIRouter, Body
from app.models.cv_profile import CVProfile
from app.services.ai_service import ai_service

router = APIRouter(prefix="/cv", tags=["Smart CV"])

@router.get("/")
async def get_cv_profile():
    # Mock response
    return {"completeness": 85, "skills": ["Python", "React"]}

@router.post("/suggestions")
async def get_ai_suggestions(cv_data: dict = Body(...)):
    return await ai_service.generate_cv_suggestions(cv_data)
