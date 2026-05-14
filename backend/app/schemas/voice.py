from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

class VoiceSessionStart(BaseModel):
    resume_id: Optional[int] = None

class VoiceEvaluationRequest(BaseModel):
    session_id: int
    transcript: str
    wpm: int
    filler_count: int

class VoiceEvaluationResponse(BaseModel):
    feedback: str
    confidence_score: int
    next_question: str

class VoiceInterviewBase(BaseModel):
    pass

class VoiceInterview(VoiceInterviewBase):
    id: int
    owner_id: int
    resume_id: Optional[int]
    history_json: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
