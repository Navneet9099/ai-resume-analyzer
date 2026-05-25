import json
import re
import os
from groq import Groq
from typing import Optional, Any
from app.config import settings

def analyze_resume(resume_text: str, jd: str = "") -> dict:
    """
    Sends resume text and optional JD to Groq and returns parsed JSON analysis.
    If the API key is a placeholder or invalid, it returns a simulated intelligent analysis.
    """
    # 1. Fallback / Mock Mode if no valid API key is set
    if (
        not settings.GROQ_API_KEY 
        or "placeholder" in settings.GROQ_API_KEY.lower()
    ):
        return get_mock_analysis(resume_text, jd)

    # 2. Prepare Prompt
    system_prompt = (
        "You are an expert ATS (Applicant Tracking System) optimizer and professional resume reviewer.\n"
        "Analyze the provided resume text and optionally the job description.\n"
        "You MUST respond ONLY with a valid, clean JSON object matching the JSON schema below.\n\n"
        "JSON SCHEMA:\n"
        "{\n"
        '  "ats_score": int, // 0-100\n'
        '  "found_keywords": list[str],\n'
        '  "missing_keywords": list[str],\n'
        '  "strengths": list[str], // 3-5 items\n'
        '  "weaknesses": list[str], // 3-5 items\n'
        '  "suggestions": list[str], // exactly 5 specific actionable items\n'
        '  "summary": str, // exactly 2 sentences\n'
        '  "jd_match_score": int, // 0-100 (include ONLY if a Job Description is provided, else omit/null)\n'
        '  "jd_missing_skills": list[str] // (include ONLY if a Job Description is provided, else omit/null)\n'
        "}"
    )

    prompt = f"Resume Content:\n{resume_text}\n\n"
    if jd:
        prompt += f"Job Description:\n{jd}\n"
    else:
        prompt += "No job description provided.\n"

    # 3. Call Groq
    try:
        # Load from config, with environment fallback
        api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY")
        client = Groq(api_key=api_key)
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            response_format={"type": "json_object"},
            temperature=0.2
        )
        
        response_text = response.choices[0].message.content
        return parse_json_response(response_text)
        
    except Exception as e:
        print(f"Groq API Call Failed: {str(e)}")
        # Raise error for the controller router
        raise RuntimeError(f"Groq API analysis failed: {str(e)}")

def parse_json_response(response_text: str) -> dict:
    cleaned = response_text.strip()
    
    # Try parsing directly
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
        
    # Extract between the first { and the last } as fallback
    try:
        match = re.search(r"(\{.*?\})", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group(1))
    except (json.JSONDecodeError, AttributeError):
        pass

    try:
        match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group(1))
    except (json.JSONDecodeError, AttributeError):
        pass

    raise ValueError("Could not parse a valid JSON payload from Groq's response.")

def get_mock_analysis(resume_text: str, jd: str = "") -> dict:
    """
    Helper to run local heuristics analysis if the user has no Claude API key.
    Provides a rich, personalized response based on actual keywords.
    """
    resume_lower = resume_text.lower()
    
    # Simple list of tech keywords to look for
    keywords = [
        "python", "javascript", "typescript", "react", "vue", "angular", "node", "express", 
        "fastapi", "django", "flask", "docker", "kubernetes", "aws", "gcp", "azure", 
        "postgresql", "mongodb", "mysql", "redis", "html", "css", "tailwind", "git", "ci/cd"
    ]
    
    found = [k.capitalize() for k in keywords if k in resume_lower]
    missing = [k.capitalize() for k in keywords if k not in resume_lower][:6]
    
    # Calculate simulated score
    ats_score = min(max(45 + len(found) * 3, 50), 95)
    
    strengths = [
        f"Demonstrated proficiency in {', '.join(found[:3])} based on resume text.",
        "Clear structure and technical experience formatting.",
        "Strong foundation in software engineering concepts."
    ]
    
    weaknesses = [
        f"Missing keywords: {', '.join(missing[:2])} which are standard for modern web stacks.",
        "Could benefit from stronger action verbs and quantifiable metrics.",
        "Limited evidence of deployment, monitoring, or production infrastructure operations."
    ]
    
    suggestions = [
        "Quantify your accomplishments (e.g., 'Reduced load times by 20%' or 'Managed a team of 3 developers').",
        f"Incorporate missing industry terms such as {missing[0]} or {missing[1]} into your experience descriptions.",
        "Include a dedicated, clean technical skills section for automated scanner readability.",
        "Ensure all project entries explain the 'Why' and 'Result', rather than just listing responsibilities.",
        "Add certifications or educational achievements to support your technical expertise."
    ]
    
    summary = (
        "The resume outlines a solid technical candidate with key strengths in software engineering. "
        "Adding metrics and filling standard modern architecture gaps will elevate the profile substantially."
    )
    
    result = {
        "ats_score": ats_score,
        "found_keywords": found,
        "missing_keywords": missing,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "suggestions": suggestions,
        "summary": summary,
        "jd_match_score": None,
        "jd_missing_skills": None
    }
    
    if jd:
        jd_lower = jd.lower()
        # Find which keywords are in JD but missing in Resume
        jd_words = [k.capitalize() for k in keywords if k in jd_lower]
        missing_skills = [skill for skill in jd_words if skill.lower() not in resume_lower]
        
        # Calculate matching score
        if jd_words:
            match_pct = int((len(jd_words) - len(missing_skills)) / len(jd_words) * 100)
            jd_match_score = min(max(match_pct, 10), 100)
        else:
            jd_match_score = 65
            
        result["jd_match_score"] = jd_match_score
        result["jd_missing_skills"] = missing_skills if missing_skills else ["No major missing skills identified!"]
        
    return result
