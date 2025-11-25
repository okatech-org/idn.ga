from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    start_date: datetime
    end_date: Optional[datetime] = None
    description: Optional[str] = None

class Experience(BaseModel):
    company: str
    position: str
    location: Optional[str] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    current: bool = False
    description: Optional[str] = None

class Skill(BaseModel):
    name: str
    level: Optional[str] = None # Beginner, Intermediate, Expert

class CVProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    user_id: str # UUID string
    
    completeness_score: float = 0.0
    
    education: List[Education] = []
    experience: List[Experience] = []
    skills: List[Skill] = []
    certifications: List[Dict[str, Any]] = []
    languages: List[Dict[str, Any]] = []
    
    ai_suggestions: Optional[Dict[str, Any]] = None
    
    last_generated_pdf_url: Optional[str] = None
    pdf_generated_at: Optional[datetime] = None
    
    profile_views_count: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
