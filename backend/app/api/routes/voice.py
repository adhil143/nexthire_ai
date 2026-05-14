import json
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import google.generativeai as genai

from app.api import deps
from app.db.models import User, Resume, VoiceInterview as VoiceInterviewModel
from app.schemas.voice import VoiceInterview as VoiceInterviewSchema, VoiceSessionStart, VoiceEvaluationRequest, VoiceEvaluationResponse
from app.core.config import settings

router = APIRouter()

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-flash-latest')
else:
    model = None

@router.post("/start", response_model=VoiceInterviewSchema)
def start_voice_session(
    *,
    db: Session = Depends(deps.get_db),
    session_in: VoiceSessionStart,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Start a new voice interview session.
    """
    resume_context = ""
    if session_in.resume_id:
        resume = db.query(Resume).filter(Resume.id == session_in.resume_id, Resume.owner_id == current_user.id).first()
        if resume:
            resume_context = resume.content_text or ""

    initial_prompt = "You are an expert AI Interviewer. Start the interview by briefly greeting the candidate and asking them to introduce themselves. Return ONLY the spoken text, no formatting."
    
    first_msg = "Hello! I am your AI Interview Coach. Let's get started. Could you please introduce yourself and tell me a bit about your background?"
    if model:
        try:
            if resume_context:
                sys_prompt = f"Candidate Resume context:\n{resume_context}\n\n{initial_prompt}"
                response = model.generate_content(sys_prompt)
            else:
                response = model.generate_content(initial_prompt)
            first_msg = response.text.strip()
        except Exception:
            pass

    history = [
        {"role": "assistant", "content": first_msg}
    ]

    db_obj = VoiceInterviewModel(
        owner_id=current_user.id,
        resume_id=session_in.resume_id,
        history_json=json.dumps(history)
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.post("/evaluate", response_model=VoiceEvaluationResponse)
def evaluate_voice_answer(
    *,
    db: Session = Depends(deps.get_db),
    eval_req: VoiceEvaluationRequest,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Evaluate the spoken answer from the candidate and return feedback + next question.
    """
    if not model:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    session = db.query(VoiceInterviewModel).filter(VoiceInterviewModel.id == eval_req.session_id, VoiceInterviewModel.owner_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    history = []
    if session.history_json:
        history = json.loads(session.history_json)
    
    # We get the last question asked by the assistant
    last_question = ""
    for msg in reversed(history):
        if msg["role"] == "assistant":
            last_question = msg["content"]
            break

    prompt = f"""
You are an expert AI Interview Coach evaluating a candidate's spoken response.

Last Question Asked: "{last_question}"
Candidate's Spoken Answer: "{eval_req.transcript}"
Speaking Metrics:
- Words Per Minute (WPM): {eval_req.wpm} (Ideal is 130-160 WPM)
- Filler Words Count: {eval_req.filler_count}

Evaluate the candidate's answer based on the content and the speaking metrics.
You MUST return the response as a strict JSON object with exactly these keys:
- "feedback": (string) A concise, constructive critique of what they said well and what they can improve (including mentioning their speed or filler words if applicable).
- "confidence_score": (integer) A score from 0 to 100 representing how confident and structured the answer was.
- "next_question": (string) The next interview question you want to ask them verbally.

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
    except Exception as e:
        error_str = str(e)
        if "429" in error_str or "Quota" in error_str:
            parsed_data = {
                "feedback": "API Quota exceeded. Unable to evaluate your answer at this time.",
                "confidence_score": 0,
                "next_question": "Please resolve your API quota to continue the interview."
            }
        else:
            raise HTTPException(status_code=500, detail=f"Failed to evaluate answer: {str(e)}")

    # Update history
    history.append({"role": "user", "content": eval_req.transcript})
    history.append({"role": "assistant", "content": parsed_data["next_question"]})
    session.history_json = json.dumps(history)
    db.commit()

    return VoiceEvaluationResponse(**parsed_data)
