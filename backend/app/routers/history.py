from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.resume import ResumeAnalysis
from app.schemas.resume import ResumeAnalysisResponse
from app.utils.deps import get_current_user

router = APIRouter(prefix="/history", tags=["History"])

@router.get("/", response_model=List[ResumeAnalysisResponse])
def get_user_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all past resume analyses for the currently logged-in user.
    """
    analyses = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.user_id == current_user.id)
        .order_by(ResumeAnalysis.created_at.desc())
        .all()
    )
    return analyses
