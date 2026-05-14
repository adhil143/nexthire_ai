from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class Message(BaseModel):
    role: str
    content: str

class InterviewBase(BaseModel):
    resume_id: int

class InterviewCreate(InterviewBase):
    pass

class Interview(InterviewBase):
    id: int
    owner_id: int
    chat_history: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class InterviewMessage(BaseModel):
    message: str
