import json
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import google.generativeai as genai

from app.api import deps
from app.db.models import User, Resume, JobMatch as JobMatchModel
from app.schemas.matcher import JobMatch as JobMatchSchema, MatcherRequest
from app.core.config import settings

router = APIRouter()

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-flash-latest')
else:
    model = None

@router.post("/analyze", response_model=JobMatchSchema)
def analyze_match(
    *,
    db: Session = Depends(deps.get_db),
    request_in: MatcherRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Compare a resume against a job description.
    """
    if not model:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    resume_text = ""
    if request_in.resume_id:
        resume = db.query(Resume).filter(Resume.id == request_in.resume_id, Resume.owner_id == current_user.id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        resume_text = resume.content_text
    elif request_in.resume_text:
        resume_text = request_in.resume_text
    else:
        raise HTTPException(status_code=400, detail="Must provide either resume_id or resume_text")

    if not request_in.job_description:
        raise HTTPException(status_code=400, detail="Must provide job_description")

    prompt = f"""
You are an expert ATS (Applicant Tracking System) and AI Recruiter.
Analyze the following Resume against the Job Description.

Job Description:
{request_in.job_description}

---

Resume:
{resume_text}

---

You MUST return the response as a strict JSON object with exactly these keys:
- "match_score": (integer) A score from 0 to 100 representing compatibility.
- "job_title": (string) Extracted job title from the job description.
- "missing_skills": (list of strings) Key skills or keywords required by the job that are missing from the resume.
- "improvement_suggestions": (list of strings) Actionable advice to tailor the resume to this specific job.
- "summary": (string) A brief overview of the fit (2-3 sentences).

Return ONLY the JSON object.
"""

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json",
            )
        )
        content_json = response.text
        parsed_data = json.loads(content_json)
        job_title = parsed_data.get("job_title", "Unknown Job")
        match_score = parsed_data.get("match_score", 0)
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "Quota" in error_str:
            fallback_data = {
                "match_score": 0,
                "job_title": "API Quota Exceeded",
                "missing_skills": ["API Key Validation"],
                "improvement_suggestions": ["Please enable billing in Google AI Studio to use the matching engine."],
                "summary": "Quota exhausted."
            }
            content_json = json.dumps(fallback_data)
            job_title = "API Quota Exceeded"
            match_score = 0
        else:
            raise HTTPException(status_code=500, detail=f"Failed to analyze match: {str(e)}")

    db_obj = JobMatchModel(
        owner_id=current_user.id,
        job_title=job_title,
        match_score=match_score,
        content_json=content_json
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/", response_model=List[JobMatchSchema])
def read_job_matches(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve all job matches for the current user.
    """
    matches = db.query(JobMatchModel).filter(JobMatchModel.owner_id == current_user.id).order_by(JobMatchModel.created_at.desc()).offset(skip).limit(limit).all()
    return matches

@router.delete("/{match_id}", response_model=JobMatchSchema)
def delete_job_match(
    *,
    db: Session = Depends(deps.get_db),
    match_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a job match.
    """
    match_obj = db.query(JobMatchModel).filter(JobMatchModel.id == match_id, JobMatchModel.owner_id == current_user.id).first()
    if not match_obj:
        raise HTTPException(status_code=404, detail="Job Match not found")
    db.delete(match_obj)
    db.commit()
    return match_obj
