from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class MatcherRequest(BaseModel):
    resume_id: Optional[int] = None
    resume_text: Optional[str] = None
    job_description: str

class JobMatchBase(BaseModel):
    pass

class JobMatchCreate(JobMatchBase):
    job_title: Optional[str] = None
    match_score: int
    content_json: str

class JobMatch(JobMatchBase):
    id: int
    owner_id: int
    job_title: Optional[str] = None
    match_score: int
    content_json: str
    created_at: datetime

    class Config:
        from_attributes = True
