import os
import uuid
import shutil
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import google.generativeai as genai
import pypdf
import docx

from app.api import deps
from app.db.models import User, Resume as ResumeModel
from app.schemas.resume import Resume, ResumeCreate
from app.core.config import settings

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Initialize Gemini API
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-flash-latest')
else:
    model = None

@router.post("/upload", response_model=Resume)
async def upload_resume(
    *,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload a resume and trigger AI analysis.
    """
    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".txt"]:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are allowed.")

    # Save file locally
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text
    content_text = ""
    try:
        if ext == ".pdf":
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                content_text += page.extract_text() + "\n"
        elif ext == ".docx":
            doc = docx.Document(file_path)
            for para in doc.paragraphs:
                content_text += para.text + "\n"
        elif ext == ".txt":
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content_text = f.read()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")

    if not content_text.strip():
        content_text = "Could not extract any text from the file."

    analysis_result = "{}"
    if model:
        try:
            prompt = f"""
Please analyze the following resume and return a strict JSON object with exactly these keys:
- "ats_score": An integer from 0 to 100 representing the resume's quality and ATS compatibility.
- "skills": A list of strings representing extracted skills.
- "missing_keywords": A list of strings representing suggested missing skills or keywords.
- "improvement_suggestions": A list of strings with actionable suggestions to improve the resume.
- "summary": A brief paragraph summarizing the candidate's profile.

Resume Text:
{content_text}
"""
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json",
                )
            )
            analysis_result = response.text
        except Exception as e:
            import json
            error_str = str(e)
            if "429" in error_str or "Quota" in error_str:
                word_count = len(content_text.split())
                fallback_data = {
                    "ats_score": 0,
                    "skills": ["Gemini API Quota Exceeded"],
                    "missing_keywords": ["Enable billing in Google AI Studio"],
                    "improvement_suggestions": ["Please attach a billing account to your project."],
                    "summary": f"Fallback Local Analysis: Resume successfully parsed! Total Words: {word_count}. Total Characters: {len(content_text)}."
                }
                analysis_result = json.dumps(fallback_data)
            else:
                fallback_data = {
                    "ats_score": 0,
                    "skills": [],
                    "missing_keywords": [],
                    "improvement_suggestions": [],
                    "summary": f"Error during AI analysis: {error_str}"
                }
                analysis_result = json.dumps(fallback_data)
    else:
        import json
        analysis_result = json.dumps({
            "ats_score": 0,
            "skills": [],
            "missing_keywords": [],
            "improvement_suggestions": [],
            "summary": "Gemini API key not configured."
        })

    db_obj = ResumeModel(
        filename=file.filename,
        content_text=content_text,
        analysis_result=analysis_result,
        owner_id=current_user.id
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/", response_model=List[Resume])
def read_resumes(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve resumes.
    """
    resumes = db.query(ResumeModel).filter(ResumeModel.owner_id == current_user.id).offset(skip).limit(limit).all()
    return resumes

@router.delete("/{id}", response_model=Resume)
def delete_resume(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a resume.
    """
    resume = db.query(ResumeModel).filter(ResumeModel.id == id, ResumeModel.owner_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    db.delete(resume)
    db.commit()
    return resume
