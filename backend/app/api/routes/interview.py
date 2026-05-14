import os
import json
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import google.generativeai as genai

from app.api import deps
from app.db.models import User, Resume, Interview
from app.schemas.interview import Interview as InterviewSchema, InterviewMessage, InterviewCreate
from app.core.config import settings

router = APIRouter()

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    # Use flash model for chat to be fast and cost effective
    model = genai.GenerativeModel('gemini-flash-latest')
else:
    model = None

@router.post("/start/{resume_id}", response_model=InterviewSchema)
def start_interview(
    *,
    db: Session = Depends(deps.get_db),
    resume_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Start a new interview session based on a specific resume.
    """
    if not model:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.owner_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    system_prompt = f"""
You are an expert AI Interview Coach conducting a professional job interview.
You have the candidate's resume below. 
1. Start by greeting the candidate by name (if found) or professionally.
2. Ask the very first interview question based on their resume. Keep it engaging. It can be a behavioral question or a technical question related to their stated skills.
3. Keep your response brief, friendly, and strictly act as the interviewer. Do not break character.

Candidate's Resume Text:
{resume.content_text}
"""

    try:
        response = model.generate_content(system_prompt)
        initial_message = response.text
    except Exception as e:
        initial_message = "Hello! I am your AI Interview Coach. I see your resume. Let's start with a simple question: Can you walk me through your background?"

    chat_history = [
        {"role": "model", "content": initial_message}
    ]

    db_obj = Interview(
        resume_id=resume_id,
        owner_id=current_user.id,
        chat_history=json.dumps(chat_history)
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.post("/{interview_id}/message", response_model=InterviewSchema)
def send_message(
    *,
    db: Session = Depends(deps.get_db),
    interview_id: int,
    message_in: InterviewMessage,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Send a message to the AI coach and get a response.
    """
    if not model:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.owner_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    resume = db.query(Resume).filter(Resume.id == interview.resume_id).first()
    
    chat_history = []
    if interview.chat_history:
        chat_history = json.loads(interview.chat_history)

    # Append user message
    chat_history.append({"role": "user", "content": message_in.message})

    # Prepare context for Gemini
    # We use a standard generative model with prompt history
    prompt = f"You are an expert AI Interview Coach conducting an interview based on the following resume:\n\n{resume.content_text}\n\nHere is the interview history so far:\n"
    for msg in chat_history:
        prompt += f"{msg['role'].upper()}: {msg['content']}\n"
    
    prompt += "\nAs the interviewer, provide short feedback on the candidate's last answer, and then ask the next interview question. Stay in character as the interviewer."

    try:
        response = model.generate_content(prompt)
        ai_message = response.text
    except Exception as e:
        ai_message = f"I'm sorry, I encountered an error: {str(e)}"

    # Append AI response
    chat_history.append({"role": "model", "content": ai_message})

    interview.chat_history = json.dumps(chat_history)
    db.add(interview)
    db.commit()
    db.refresh(interview)
    
    return interview

@router.get("/", response_model=List[InterviewSchema])
def read_interviews(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve all interview sessions for the current user.
    """
    interviews = db.query(Interview).filter(Interview.owner_id == current_user.id).order_by(Interview.created_at.desc()).offset(skip).limit(limit).all()
    return interviews

@router.get("/{interview_id}", response_model=InterviewSchema)
def read_interview(
    *,
    db: Session = Depends(deps.get_db),
    interview_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get a specific interview session.
    """
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.owner_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview

@router.delete("/{interview_id}", response_model=InterviewSchema)
def delete_interview(
    *,
    db: Session = Depends(deps.get_db),
    interview_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete an interview session.
    """
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.owner_id == current_user.id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    db.delete(interview)
    db.commit()
    return interview
