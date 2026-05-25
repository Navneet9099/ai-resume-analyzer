from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
import io
import os
import json
from groq import Groq
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.resume import ResumeAnalysis
from app.schemas.resume import AnalysisResult
from app.utils.deps import get_current_user_optional
from app.services.pdf_parser import extract_text_from_pdf
from app.services.ai_analyzer import analyze_resume
from app.services.pdf_report import generate_pdf_report

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

    # 4. Analyze resume via Groq service
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

    # 5. If logged in, persist to database
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
            # Log the error but don't fail the upload
            print(f"Failed to persist resume analysis for user {current_user.email}: {str(db_err)}")

    return analysis_data


@router.post("/download-report")
async def download_report(analysis: AnalysisResult):
    """
    Accepts the current analysis results and returns a dynamically generated
    color-coded ReportLab PDF report stream.
    """
    try:
        pdf_bytes = generate_pdf_report(analysis.model_dump(), "Resume_Analysis_Report.pdf")
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=Resume_Analysis_Report.pdf"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile PDF report: {str(e)}"
        )


@router.post("/compare")
async def compare_resumes(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Parses and reviews two PDFs side-by-side to calculate score gaps and declare a winner.
    """
    for file in [file1, file2]:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only PDF files are supported. Invalid file: {file.filename}"
            )

    # Parse and Analyze Resume A
    try:
        bytes1 = await file1.read()
        text1 = extract_text_from_pdf(bytes1)
        analysis1 = analyze_resume(text1, "")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed parsing {file1.filename}: {str(e)}"
        )

    # Parse and Analyze Resume B
    try:
        bytes2 = await file2.read()
        text2 = extract_text_from_pdf(bytes2)
        analysis2 = analyze_resume(text2, "")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed parsing {file2.filename}: {str(e)}"
        )

    score1 = analysis1.get("ats_score", 0)
    score2 = analysis2.get("ats_score", 0)

    winner = "resume1" if score1 >= score2 else "resume2"
    difference = abs(score1 - score2)

    return {
        "resume1": analysis1,
        "resume2": analysis2,
        "winner": winner,
        "difference": difference
    }


class CoverLetterRequest(BaseModel):
    resume_text: str
    job_description: str
    company_name: str
    job_title: str


@router.post("/cover-letter")
async def generate_cover_letter(req: CoverLetterRequest):
    """
    Prompts Groq Llama-3.3 to construct a highly personalized, 3-paragraph cover letter.
    Supports smart fallback text if API key is not present.
    """
    api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY")
    if not api_key or "placeholder" in api_key.lower():
        # Standard developer fallback response
        cover_letter = (
            f"Dear Hiring Team at {req.company_name},\n\n"
            f"I am writing to express my enthusiastic interest in the {req.job_title} position. "
            f"Based on the provided job description and my technical background, I am confident in my "
            f"ability to contribute high-quality solutions to your engineering team. My experience aligns closely "
            f"with the core competencies required for this role.\n\n"
            f"Throughout my career, I have developed expertise in core software patterns, robust backend architecture, "
            f"and high-efficiency code styling. I am eager to bring these skills to {req.company_name} and collaborate "
            f"on cutting-edge products.\n\n"
            f"Thank you for your time and consideration. I look forward to the opportunity to discuss my qualifications "
            f"in more detail.\n\n"
            f"Sincerely,\n[Your Name]"
        )
        return {"cover_letter": cover_letter}

    prompt = (
        f"You are a professional cover letter writing assistant.\n"
        f"Write a professional, highly personalized cover letter for the following job:\n"
        f"- Target Job Title: {req.job_title}\n"
        f"- Company Name: {req.company_name}\n\n"
        f"Job Description Details:\n{req.job_description}\n\n"
        f"Resume Context Details:\n{req.resume_text}\n\n"
        f"INSTRUCTIONS:\n"
        f"1. Match the tone of the Cover Letter directly to the job description.\n"
        f"2. Reference specific skills and achievements from the resume that directly align with the job requirements.\n"
        f"3. Limit the cover letter strictly to exactly 3 paragraphs.\n"
        f"4. Sound human, conversational, engaging, and professional. Avoid robotic or template-like language.\n"
        f"5. Return ONLY the plain text of the cover letter. Do not add markdown headers, styling, backticks, or introduction messages."
    )

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.7
        )
        cover_letter = response.choices[0].message.content.strip()
        return {"cover_letter": cover_letter}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Groq failed generating cover letter: {str(e)}"
        )


class LinkedInRequest(BaseModel):
    linkedin_text: str
    job_description: Optional[str] = None


@router.post("/analyze-linkedin", response_model=AnalysisResult)
async def analyze_linkedin(
    req: LinkedInRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Analyzes LinkedIn profile text blocks using the identical structure of resume scans.
    """
    if not req.linkedin_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="LinkedIn profile text cannot be empty."
        )

    linkedin_context = (
        f"--- LINKEDIN PROFILE ABOUT/EXPERIENCE SECTION (PLEASE TREAT THIS AS A LINKEDIN PROFILE SCAN) ---\n"
        f"{req.linkedin_text}"
    )

    try:
        analysis_data = analyze_resume(linkedin_context, req.job_description or "")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LinkedIn Profile analysis failed: {str(e)}"
        )

    # Persist scan to database if user is authenticated
    if current_user:
        try:
            db_analysis = ResumeAnalysis(
                user_id=current_user.id,
                filename="LinkedIn_Profile_Scan",
                ats_score=analysis_data.get("ats_score", 0),
                analysis_json=analysis_data
            )
            db.add(db_analysis)
            db.commit()
            db.refresh(db_analysis)
        except Exception as db_err:
            db.rollback()
            print(f"Failed to persist LinkedIn analysis for user {current_user.email}: {str(db_err)}")

    return analysis_data


class SkillRoadmapRequest(BaseModel):
    missing_keywords: List[str]
    job_title: str


@router.post("/skill-roadmap")
async def generate_skill_roadmap(req: SkillRoadmapRequest):
    """
    Returns a customized JSON-structured learning roadmap for missing skills,
    complete with click-to-open URLs and estimated times.
    """
    api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY")
    if not api_key or "placeholder" in api_key.lower():
        # High quality sandbox fallback roadmap
        roadmap = []
        for kw in req.missing_keywords[:5]:
            roadmap.append({
                "skill": kw,
                "why": f"Required skill highly demanded for a {req.job_title} role to build modern backend/frontend features.",
                "resource_name": f"FreeCodeCamp - Learning {kw} Video",
                "resource_url": f"https://www.google.com/search?q=freecodecamp+learning+{kw.lower()}",
                "time": "~2 weeks"
            })
        return {"roadmap": roadmap}

    system_prompt = (
        "You are an expert technical career coach and curriculum developer.\n"
        "Your task is to take a job title and a list of missing technical skills, "
        "and return a highly structured learning roadmap in valid, clean JSON format. Do not wrap in markdown or backticks.\n\n"
        "JSON SCHEMA TO FOLLOW EXACTLY:\n"
        "{\n"
        '  "roadmap": [\n'
        '    {\n'
        '      "skill": "React",\n'
        '      "why": "React is essential for developing highly responsive, component-based user interfaces.",\n'
        '      "resource_name": "Official React Documentation",\n'
        '      "resource_url": "https://react.dev",\n'
        '      "time": "~2 weeks"\n'
        '    }\n'
        '  ]\n'
        "}"
    )

    prompt = (
        f"Target Job Role: {req.job_title}\n"
        f"Missing Keywords/Skills: {', '.join(req.missing_keywords)}\n\n"
        f"Generate a customized learning roadmap for each of the missing skills. "
        f"Keep resource URLs clean, clickable, and pointing to actual, high-quality learning resources."
    )

    try:
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000,
            response_format={"type": "json_object"},
            temperature=0.2
        )
        
        response_text = response.choices[0].message.content.strip()
        data = json.loads(response_text)
        return data
    except Exception as e:
        print(f"Failed to generate AI roadmap: {str(e)}")
        # Dynamic fallback on failure
        roadmap = []
        for kw in req.missing_keywords[:5]:
            roadmap.append({
                "skill": kw,
                "why": f"Required skill highly demanded for a {req.job_title} role.",
                "resource_name": f"FreeCodeCamp - Learning {kw} Video",
                "resource_url": f"https://www.google.com/search?q=freecodecamp+learning+{kw.lower()}",
                "time": "~2 weeks"
            })
        return {"roadmap": roadmap}


@router.post("/extract")
async def extract_pdf_text_endpoint(file: UploadFile = File(...)):
    """
    Utility endpoint to upload a PDF file and return raw extracted text.
    Used by advanced tools like the Cover Letter Generator.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF."
        )
    try:
        contents = await file.read()
        text = extract_text_from_pdf(contents)
        return {"text": text}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse PDF: {str(e)}"
        )

