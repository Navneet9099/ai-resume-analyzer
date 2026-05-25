from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, resume, history

# Important: Import models before calling create_all to ensure SQLAlchemy registers the schemas!
from app.models.user import User
from app.models.resume import ResumeAnalysis

# Automatic DB Table Generation on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Resume Analyzer API",
    description="Full-stack Resume ATS Score & Job Matching Analysis powered by Claude API",
    version="1.0.0"
)

# CORS configurations to support dev & container networks
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router Registrations
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(history.router)

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Resume Analyzer API",
        "version": "1.0.0"
    }
