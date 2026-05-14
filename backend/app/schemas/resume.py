from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResumeBase(BaseModel):
    filename: str
    content_text: Optional[str] = None

class ResumeCreate(ResumeBase):
    pass

class ResumeUpdate(ResumeBase):
    analysis_result: Optional[str] = None

class ResumeInDBBase(ResumeBase):
    id: int
    owner_id: int
    analysis_result: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class Resume(ResumeInDBBase):
    pass
