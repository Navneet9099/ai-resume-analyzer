from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class AnalysisResult(BaseModel):
    ats_score: int = Field(..., ge=0, le=100)
    found_keywords: List[str] = Field(default_factory=list)
    missing_keywords: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(..., min_length=3, max_length=5)
    weaknesses: List[str] = Field(..., min_length=3, max_length=5)
    suggestions: List[str] = Field(..., min_length=5, max_length=5)
    summary: str
    jd_match_score: Optional[int] = Field(default=None, ge=0, le=100)
    jd_missing_skills: Optional[List[str]] = Field(default=None)

class ResumeAnalysisResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    filename: str
    ats_score: int
    analysis_json: AnalysisResult
    created_at: datetime

    class Config:
        from_attributes = True
