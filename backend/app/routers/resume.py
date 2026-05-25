from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.resume import ResumeAnalysis
from app.schemas.resume import AnalysisResult
from app.utils.deps import get_current_user_optional
from app.services.pdf_parser import extract_text_from_pdf
from app.services.ai_analyzer import analyze_resume

router = APIRouter(prefix="/resume", tags=["Resumes"])

@router.post("/upload", response_model=AnalysisResult)
async def upload_resume(
    file: UploadFile = File(...),
    job_description: Optional[str] = Form(None),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    # 1. Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF."
        )

    # 2. Read PDF bytes
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not read uploaded file: {str(e)}"
        )

    # 3. Extract text from PDF
    try:
        resume_text = extract_text_from_pdf(contents)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )

    # 4. Analyze resume via Claude service (or local fallback)
    try:
        analysis_data = analyze_resume(resume_text, job_description or "")
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"AI returned invalid structured content: {str(ve)}"
        )
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(re)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during AI analysis: {str(e)}"
        )

    # 5. If logged in, persist to Postgres database
    if current_user:
        try:
            db_analysis = ResumeAnalysis(
                user_id=current_user.id,
                filename=file.filename,
                ats_score=analysis_data.get("ats_score", 0),
                analysis_json=analysis_data
            )
            db.add(db_analysis)
            db.commit()
            db.refresh(db_analysis)
        except Exception as db_err:
            db.rollback()
            # Log the error but don't fail the upload (best effort persistence)
            print(f"Failed to persist resume analysis for user {current_user.email}: {str(db_err)}")

    return analysis_data
